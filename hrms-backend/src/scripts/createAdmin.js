
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
  try {
    const [admins] = await db.execute(
      "SELECT id FROM auth_users WHERE role = 'admin' LIMIT 1"
    );

    if (admins.length > 0) {
      console.log("An Admin account already exists.");
      return;
    }

    const username = await ask("Admin username: ");
    const fullName = await ask("Admin full name: ");
    const email = (await ask("Admin email: ")).trim().toLowerCase();
    const password = await ask("Admin password: ");

    if (!username.trim() || !fullName.trim() || !email || password.length < 8) {
      throw new Error("Enter valid details. Password must have at least 8 characters.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.execute(
      `INSERT INTO auth_users
       (employee_id, username, full_name, email, password_hash, role, is_active)
       VALUES (NULL, ?, ?, ?, ?, 'admin', TRUE)`,
      [username.trim(), fullName.trim(), email, passwordHash]
    );

    console.log("Initial Admin account created successfully!");

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
    await db.end();
  }
}

createAdmin();
