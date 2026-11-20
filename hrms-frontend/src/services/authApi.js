
const API_URL = "http://localhost:5001/api/auth";

// USER SIGNUP
export const signupUser = async (userData) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

// USER LOGIN
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  // Save token for this development version
  localStorage.setItem("hrms_token", data.token);
  localStorage.setItem("hrms_user", JSON.stringify(data.user));

  return data;
};

// USER LOGOUT
export const logoutUser = () => {
  localStorage.removeItem("hrms_token");
  localStorage.removeItem("hrms_user");
};
