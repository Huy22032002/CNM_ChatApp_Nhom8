import express from "express";
import MessageController from "../controllers/messageController.js";
import {authMiddleware,authMiddlewareWithoutRefresh} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Gửi tin nhắn (yêu cầu đăng nhập)
router.post("/add", 
    authMiddleware, 
    MessageController.createMessage);

// Lấy tin nhắn theo `conversationId` (yêu cầu đăng nhập)
router.get("/:converId", 
    authMiddleware, 
    MessageController.getAllMessageByConversationId);

export default router;
