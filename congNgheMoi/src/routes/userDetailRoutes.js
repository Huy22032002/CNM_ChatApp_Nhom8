import { Router } from "express";
import userDetailController from "../controllers/userDetailController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

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
  // authMiddlewareWithoutRefresh,
  upload.single("avatar"),
  userDetailController.updateUserDetails
);
router.get(
  "/",
  authMiddlewareWithoutRefresh,
  userDetailController.getAllUserDetail
);

router.get("/:id", authMiddlewareWithoutRefresh,userDetailController.getUserDetailByUserId);

export default router;
