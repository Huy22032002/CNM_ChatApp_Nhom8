import { Router } from "express";
const router = Router();
import homeController from "../controllers/homeController.js";
const { getHome } = homeController;
import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "../middlewares/authMiddleware.js";

router.get("/", authMiddlewareWithoutRefresh, getHome);

export default router;
