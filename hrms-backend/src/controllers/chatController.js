const db = require("../config/db");

// =====================================
// SEND AUTHENTICATED MESSAGE TO N8N
// =====================================
const sendChatMessage = async (req, res) => {
  try {
    const { user_query, session_id } = req.body;

    if (!user_query || !user_query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required.",
      });
    }

    // Get the latest account information from MySQL
    const [users] = await db.execute(
      `SELECT id, employee_id, email, role, is_active
       FROM auth_users
       WHERE id = ?`,
      [req.user.userId],
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: "Your account is inactive or unavailable.",
      });
    }

    const user = users[0];

    // Check n8n webhook configuration
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is not configured.");
    }

    // Forward verified identity and user query to n8n
    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HRMS-Gateway-Key": process.env.N8N_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        user_query: user_query.trim(),
        session_id,
        user_id: String(user.id),
        employee_id: user.employee_id,
        role: user.role,
      }),
    });

    const responseData = await n8nResponse.json();

    if (!n8nResponse.ok) {
      return res.status(502).json({
        success: false,
        message: "The HRMS AI service is currently unavailable.",
      });
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Chat controller error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process your message.",
    });
  }
};

module.exports = { sendChatMessage };
