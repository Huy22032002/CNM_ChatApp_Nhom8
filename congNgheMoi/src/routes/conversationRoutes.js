const express = require("express");
const ConversationController = require("../controllers/conversationController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

// Tạo cuộc trò chuyện mới (yêu cầu đăng nhập)
router.post("/add", authMiddleware, ConversationController.createConversation);

// Lấy danh sách cuộc trò chuyện của user (yêu cầu đăng nhập)
router.get("/:user_id", authMiddleware, ConversationController.getAllConversations);

module.exports = router;
