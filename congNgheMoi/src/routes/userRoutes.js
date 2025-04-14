import { Router } from "express";
const router = Router();
import userController from "../controllers/userController.js";
const { createUser, getAllUser, updateUser, findUser,checkMatchPassword,updatePassword} = userController;
import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "../middlewares/authMiddleware.js";

router.post("/add", createUser);

router.get("/", authMiddlewareWithoutRefresh, getAllUser);

router.get("/:id", authMiddlewareWithoutRefresh, findUser);
router.post("/checkMatchPassword", authMiddlewareWithoutRefresh, checkMatchPassword);
router.post("/updatePassword", authMiddlewareWithoutRefresh, updatePassword);


export default router;
