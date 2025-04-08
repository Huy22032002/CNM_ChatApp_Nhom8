import { Router } from "express";
import userDetailController from "../controllers/userDetailController.js";

const router = Router();

import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "../middlewares/authMiddleware.js";

router.post(
  "/add",
  authMiddlewareWithoutRefresh,
  userDetailController.createUserDetail
);
router.put(
  "/update/:user_id",
  authMiddlewareWithoutRefresh,
  userDetailController.updateUserDetails
);
router.get(
  "/",
  authMiddlewareWithoutRefresh,
  userDetailController.getAllUserDetail
);

export default router;
