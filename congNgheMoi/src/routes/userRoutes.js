import { Router } from "express";
const router = Router();
import userController from "../controllers/userController.js";
const { createUser, getAllUser, updateUser, findUser } = userController;
import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "../middlewares/authMiddleware.js";

router.post("/add", createUser);

router.get("/", authMiddlewareWithoutRefresh, getAllUser);

router.get("/:id", authMiddlewareWithoutRefresh, findUser);

export default router;
