const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const { sendChatMessage } = require("../controllers/chatController");

router.post("/", verifyToken, sendChatMessage);

module.exports = router;