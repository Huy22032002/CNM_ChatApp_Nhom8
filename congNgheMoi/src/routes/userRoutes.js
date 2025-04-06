import { Router } from "express";
const router = Router();
import userController from "../controllers/userController.js";
const { createUser, getAllUser, updateUser } = userController;
import {authMiddleware,authMiddlewareWithoutRefresh} from "../middlewares/authMiddleware.js"; 
// Tạo người dùng (không cần xác thực)
router.post("/add", createUser);

// Lấy danh sách tất cả người dùng (yêu cầu đăng nhập)
router.get("/", 
    authMiddlewareWithoutRefresh, 
    getAllUser);

// Cập nhật thông tin người dùng (yêu cầu đăng nhập)
router.post("/update/:id", 
    authMiddlewareWithoutRefresh, 
    updateUser);

export default router;
