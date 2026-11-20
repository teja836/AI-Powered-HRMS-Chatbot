
const API_URL = "http://localhost:5001/api";

export const sendMessageToAI = async (userQuery, sessionId) => {
  try {
    const token = localStorage.getItem("hrms_token");

    if (!token) {
      throw new Error("Please log in to use the HRMS chatbot.");
    }

    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_query: userQuery,
        session_id: sessionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Server error: ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};
