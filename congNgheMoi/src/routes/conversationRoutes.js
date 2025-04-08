import express from "express";
import ConversationController from "../controllers/conversationController.js";
import {
  authMiddlewareWithoutRefresh,
  authMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  authMiddlewareWithoutRefresh,
  ConversationController.createConversation
);

router.get(
  "/:user_id",
  authMiddlewareWithoutRefresh,
  ConversationController.getAllConversations
);
router.put(
  "/update/:conversation_id",
  ConversationController.updateConversation
);

export default router;
