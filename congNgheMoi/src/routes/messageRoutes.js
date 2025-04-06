import express from "express";
import MessageController from "../controllers/messageController.js";
import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/add",
  authMiddlewareWithoutRefresh,
  MessageController.createMessage
);

router.get(
  "/:converId",
  authMiddlewareWithoutRefresh,
  MessageController.getAllMessageByConversationId
);

export default router;
