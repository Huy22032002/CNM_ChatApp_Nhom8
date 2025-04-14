import { Router } from "express";
import express from "express";
import { getFriends,cancelRequest, getFriendsWithDetails, sendFriendRequest, acceptRequest, getRequests, block, unblock, checkFriendStatus } from "../controllers/friendsController.js";

import { authMiddlewareWithoutRefresh } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:userId", authMiddlewareWithoutRefresh, getFriends);
router.get("/:userId/details", authMiddlewareWithoutRefresh, getFriendsWithDetails);
router.post("/add", authMiddlewareWithoutRefresh, sendFriendRequest);
router.post("/accept", authMiddlewareWithoutRefresh, acceptRequest);
router.get("/requests/:userId", authMiddlewareWithoutRefresh, getRequests);
router.post("/block", authMiddlewareWithoutRefresh, block);
router.post("/unblock", authMiddlewareWithoutRefresh, unblock);
router.get("/isFriend", authMiddlewareWithoutRefresh, checkFriendStatus);
router.post("/cancel-request", authMiddlewareWithoutRefresh, cancelRequest);
export default router;
