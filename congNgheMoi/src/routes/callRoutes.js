import express from "express";
import * as callController from "../controllers/callController.js";
import { authMiddlewareWithoutRefresh } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tạo bản ghi cuộc gọi mới
router.post("/create", authMiddlewareWithoutRefresh, callController.createCallRecord);

// Cập nhật bản ghi cuộc gọi
router.put("/:callId/update", authMiddlewareWithoutRefresh, callController.updateCallRecord);

// Lấy lịch sử cuộc gọi của người dùng
router.get("/history/:userId", authMiddlewareWithoutRefresh, callController.getCallHistory);

// Xóa bản ghi cuộc gọi
router.delete("/:callId", authMiddlewareWithoutRefresh, callController.deleteCallRecord);

export default router;