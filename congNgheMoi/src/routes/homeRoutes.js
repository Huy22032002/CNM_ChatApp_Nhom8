import { Router } from "express";
const router = Router();
import homeController from "../controllers/homeController.js";
const { getHome } = homeController;
import authMiddleware from "../middlewares/authMiddleware.js";

// API trang chủ (yêu cầu đăng nhập)
router.get("/", 
    authMiddleware,
    getHome);

export default router;
