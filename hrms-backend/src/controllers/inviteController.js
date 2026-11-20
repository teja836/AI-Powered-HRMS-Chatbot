
const db = require("../config/db");
const crypto = require("crypto");

// =====================================
// GENERATE EMPLOYEE SIGNUP INVITATION
// =====================================
const createInvitation = async (req, res) => {
  try {
    const { employee_id } = req.body;

    if (!employee_id || !Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid employee ID is required."
      });
    }

    // Check employee in database
    const [employees] = await db.execute(
      `SELECT employee_id, full_name, email, employment_status
       FROM employees
       WHERE employee_id = ?`,
      [Number(employee_id)]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found."
      });
    }

    const employee = employees[0];

    if (employee.employment_status === "Exited") {
      return res.status(403).json({
        success: false,
        message: "Exited employees cannot receive signup invitations."
      });
    }

    // Check if employee already has an account
    const [accounts] = await db.execute(
      `SELECT id FROM auth_users WHERE employee_id = ?`,
      [employee.employee_id]
    );

    if (accounts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This employee already has an account."
      });
    }

    // Generate secure invitation token
    const inviteToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(inviteToken)
      .digest("hex");

    // Invitation expires after 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.execute(
      `INSERT INTO employee_signup_invites
       (employee_id, invite_token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [employee.employee_id, tokenHash, expiresAt]
    );

    return res.status(201).json({
      success: true,
      message: "Employee invitation created successfully.",
      invitation: {
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        invite_token: inviteToken,
        expires_at: expiresAt
      }
    });

  } catch (error) {
    console.error("Invitation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create employee invitation."
    });
  }
};

module.exports = { createInvitation };
