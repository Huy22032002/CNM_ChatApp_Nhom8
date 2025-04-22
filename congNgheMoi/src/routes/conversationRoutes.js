import express from "express";
import ConversationController from "../controllers/conversationController.js";
import {
  authMiddlewareWithoutRefresh,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();
// router.get(
//   "/",
//   authMiddlewareWithoutRefresh, // Middleware xác thực
//   ConversationController.getAllConversations // Controller xử lý
// );

router.post(
  "/add",
  authMiddlewareWithoutRefresh,
  ConversationController.createConversation
);
router.post(
  "/add_group",
  authMiddlewareWithoutRefresh,
  ConversationController.createGroupConversation
);
router.get(
  "/:conversation_id",
  authMiddlewareWithoutRefresh,
  ConversationController.getConversationById
);
router.get(
  "/user/:user_id",
  authMiddlewareWithoutRefresh,
  ConversationController.getAllConversations
);
router.put(
  "/update/:conversation_id",
  authMiddlewareWithoutRefresh,
  ConversationController.updateConversation
);
router.put(
  "/updateGroup/:conversation_id",
  authMiddlewareWithoutRefresh,
  upload.single("group_avatar"),
  ConversationController.updateGroupConversation
);
router.put(
  "/addParticipant/:conversation_id",
  authMiddlewareWithoutRefresh,
  ConversationController.addNewParticipant
);
router.put(
  "/leave/:conversation_id",
  authMiddlewareWithoutRefresh,
  ConversationController.leaveConversation
);

router.put(
  "/removeParticipant/:conversation_id",
  authMiddlewareWithoutRefresh,
  ConversationController.removeParticipant
);
router.put(
  "/updateLastMessage/:conversation_id",
  authMiddlewareWithoutRefresh,
  ConversationController.updateConversation
);
router.delete(
  "/delete/:conversation_id",
  authMiddlewareWithoutRefresh,
  ConversationController.deleteConversation
);
router.get(
  "/type/:type",
  authMiddlewareWithoutRefresh,
  ConversationController.getAllConversationsByType
);
// addNewParticipant,
router.post(
  "/addParticipant",
  authMiddlewareWithoutRefresh,
  ConversationController.addNewParticipant
);
router.delete(
  "/removeParticipant",
  authMiddlewareWithoutRefresh,
  ConversationController.removeParticipant
);

export default router;
