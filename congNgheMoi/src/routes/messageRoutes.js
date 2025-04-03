const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/messageController");
const { authMiddleware } = require("../middlewares/authMiddleware"); 

// Gửi tin nhắn (yêu cầu đăng nhập)
router.post("/add", authMiddleware, MessageController.createMessage);

// Lấy tin nhắn theo `conversationId` (yêu cầu đăng nhập)
router.get("/:converId", authMiddleware, MessageController.getAllMessageByConversationId);

module.exports = router;
