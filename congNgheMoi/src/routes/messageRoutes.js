import express from "express";
import MessageController from "../controllers/messageController.js";
import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
const router = express.Router();

router.post(
  "/add",
  authMiddlewareWithoutRefresh,
  MessageController.createMessage
);
router.post(
  "/sendImage",
  upload.single("image"),
  MessageController.sendImageMessage
);
router.get(
  "/:converId",
  authMiddlewareWithoutRefresh,
  MessageController.getAllMessageByConversationId
);
router.put(
  "/:message_id/update",
  authMiddlewareWithoutRefresh,
  MessageController.updateMessage
);
router.delete(
  "/:message_id",
  authMiddlewareWithoutRefresh,
  MessageController.deleteMessage
);
router.put(
  "/:message_id/revoke",
  authMiddlewareWithoutRefresh,
  MessageController.revokeMessage
);

export default router;
