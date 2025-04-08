import express from "express";
import { login, refreshToken,register,logout,verifyOtp,createNewUser } from "../controllers/authController.js";
import {authMiddleware,authMiddlewareWithoutRefresh} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Đăng nhập
router.post("/login", login);
//dang ky
router.post("/register", register);
// Xác thực OTP
router.post("/verifyOtp", verifyOtp);
// Đăng xuất
router.post("/logout", logout);
// Lấy token mới
router.post("/refresh", authMiddleware, refreshToken);
// Tạo người dùng mới (không cần xác thực)
router.post("/createNewUser", createNewUser);

export default router;
