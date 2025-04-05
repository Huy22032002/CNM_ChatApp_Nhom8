import { Router } from "express";
const router = Router();
import userDetailController from "../controllers/userDetailController.js";
const { createUserDetail, getAllUserDetail, updateUserDetail } = userDetailController;
import {authMiddleware,authMiddlewareWithoutRefresh} from "../middlewares/authMiddleware.js"; 
// Tạo chi tiết người dùng (yêu cầu đăng nhập)
router.post("/add", 
    authMiddleware, 
    createUserDetail);

export default router;
