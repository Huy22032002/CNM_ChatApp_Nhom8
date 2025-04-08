import express from "express";
import { login, refreshToken,register,logout } from "../controllers/authController.js";
import {authMiddleware,authMiddlewareWithoutRefresh} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Đăng nhập
router.post("/login", login);
//dang ky
router.post("/register", register);
// Đăng xuất
router.post("/logout", logout);
// Lấy token mới
router.post("/refresh", authMiddleware, refreshToken);

export default router;
