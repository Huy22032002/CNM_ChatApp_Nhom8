import express from "express";
import ConversationController from "../controllers/conversationController.js";
import {authMiddlewareWithoutRefresh,authMiddleware} from "../middlewares/authMiddleware.js"; // Uncomment if authentication is required
const router = express.Router();

// Tạo cuộc trò chuyện mới (yêu cầu đăng nhập)
router.post("/add", 
    // authMiddleware, 
    // Uncomment authMiddleware if authentication is required
    authMiddlewareWithoutRefresh,
    (req, res) => {
        res.send("Add conversation endpoint");
    }
);

// Lấy danh sách cuộc trò chuyện của user (yêu cầu đăng nhập)
router.get("/:user_id", 
    authMiddlewareWithoutRefresh, 
    ConversationController.getAllConversations);

export default router;
