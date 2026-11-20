const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");
const { createInvitation } = require("../controllers/inviteController");

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public authentication routes
router.post("/signup", signup);
router.post("/login", login);

// Protected profile route
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated!",
    user: req.user,
  });
});

// HR/Admin invitation route
router.post(
  "/invite",
  verifyToken,
  roleMiddleware("hr", "admin"),
  createInvitation,
);

module.exports = router;
