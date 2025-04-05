import { Router } from "express";
const router = Router();
import homeController from "../controllers/homeController.js";
const { getHome } = homeController;
import {authMiddleware,authMiddlewareWithoutRefresh} from "../middlewares/authMiddleware.js";

// API trang chủ (yêu cầu đăng nhập)
router.get("/", 
    authMiddlewareWithoutRefresh,
    getHome);

export default router;
