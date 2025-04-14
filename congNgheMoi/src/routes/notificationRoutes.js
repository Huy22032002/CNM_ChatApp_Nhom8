import express from "express";
import * as controller from "../controllers/notificationController.js";
import { authMiddlewareWithoutRefresh } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",authMiddlewareWithoutRefresh, controller.createNotification);
// router.post("/friend-request", controller.createFriendRequest);
router.post("/message",authMiddlewareWithoutRefresh, controller.createMessage);

router.get("/:user_id", authMiddlewareWithoutRefresh,controller.getNotifications);
router.get("/unread-count/:user_id",authMiddlewareWithoutRefresh, controller.getUnreadCount);

router.put("/:id/status",authMiddlewareWithoutRefresh, controller.updateStatus);
router.put("/mark-read/:user_id",authMiddlewareWithoutRefresh, controller.markAllAsRead);

router.delete("/:id",authMiddlewareWithoutRefresh, controller.deleteNotification);

export default router;
