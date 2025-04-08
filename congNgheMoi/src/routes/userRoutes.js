import { Router } from "express";
const router = Router();
import userController from "../controllers/userController.js";
const { createUser, getAllUser, updateUser, findUser } = userController;
import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "../middlewares/authMiddleware.js";
// Tạo người dùng (không cần xác thực)
router.post("/add", createUser);


router.get("/", authMiddlewareWithoutRefresh, getAllUser);

router.post("/update/:id", authMiddlewareWithoutRefresh, updateUser);
router.get("/:id", authMiddlewareWithoutRefresh, findUser);


export default router;
