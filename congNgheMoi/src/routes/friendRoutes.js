import { Router } from "express";
import {
    getFriends,
    getFriendsWithDetails,
    sendFriendRequest,
    acceptRequest,
    getRequests,
    block,
    unblock,
    checkFriendStatus
} from "../controllers/FriendController.js";
import { authMiddlewareWithoutRefresh } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/:userId", authMiddlewareWithoutRefresh, getFriends);
router.get("/:userId/details", authMiddlewareWithoutRefresh, getFriendsWithDetails);
router.post("/add", authMiddlewareWithoutRefresh, sendFriendRequest);
router.post("/accept", authMiddlewareWithoutRefresh, acceptRequest);
router.get("/:userId/requests", authMiddlewareWithoutRefresh, getRequests);
router.post("/block", authMiddlewareWithoutRefresh, block);
router.post("/unblock", authMiddlewareWithoutRefresh, unblock);
router.get("/isFriend", authMiddlewareWithoutRefresh, checkFriendStatus);

export default router;
