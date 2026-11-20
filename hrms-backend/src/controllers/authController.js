
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// =====================================
// EMPLOYEE SIGNUP USING INVITATION TOKEN
// =====================================
const signup = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const { username, password, inviteToken } = req.body;

    // Validate required fields
    if (!username || !password || !inviteToken) {
      return res.status(400).json({
        success: false,
        message: "Username, password and invitation token are required."
      });
    }

    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must contain at least 3 characters."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    // Hash the invitation token before database lookup
    const tokenHash = crypto
      .createHash("sha256")
      .update(inviteToken)
      .digest("hex");

    connection = await db.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Validate invitation and retrieve employee details
    const [invites] = await connection.execute(
      `SELECT
          i.id AS invite_id,
          i.employee_id,
          e.full_name,
          e.email,
          e.employment_status
       FROM employee_signup_invites i
       INNER JOIN employees e
          ON e.employee_id = i.employee_id
       WHERE i.invite_token_hash = ?
         AND i.is_used = FALSE
         AND i.expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );

    if (invites.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "Invalid or expired invitation."
      });
    }

    const employee = invites[0];

    // Reject exited employees
    if (employee.employment_status === "Exited") {
      await connection.rollback();
      transactionStarted = false;

      return res.status(403).json({
        success: false,
        message: "This employee is not eligible for registration."
      });
    }

    // Check whether employee already has an account
    const [existingUsers] = await connection.execute(
      `SELECT id
       FROM auth_users
       WHERE employee_id = ?
          OR email = ?
          OR username = ?`,
      [
        employee.employee_id,
        employee.email,
        normalizedUsername
      ]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "An account already exists for this employee, email or username."
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create employee account
    await connection.execute(
      `INSERT INTO auth_users
       (employee_id, username, full_name, email,
        password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'employee', TRUE)`,
      [
        employee.employee_id,
        normalizedUsername,
        employee.full_name,
        employee.email,
        passwordHash
      ]
    );

    // Mark invitation as used
    await connection.execute(
      `UPDATE employee_signup_invites
       SET is_used = TRUE
       WHERE id = ?`,
      [employee.invite_id]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Employee account created successfully. Please log in."
    });

  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }

    console.error("Signup error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create account."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// =====================================
// USER LOGIN + JWT GENERATION
// =====================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const [users] = await db.execute(
      `SELECT
          id,
          employee_id,
          username,
          full_name,
          email,
          password_hash,
          role,
          is_active
       FROM auth_users
       WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = users[0];

    // Check account status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive."
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        employeeId: user.employee_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in."
    });
  }
};


// =====================================
// EXPORT CONTROLLERS
// =====================================
module.exports = {
  signup,
  login
};
