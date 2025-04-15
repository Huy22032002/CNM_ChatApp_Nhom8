import friends from "../models/friendsModel.js";
import { getAllUSer } from "./userService.js";
import { findUserDetailByUserId } from "./userDetailService.js";
import { Op } from "sequelize";
import {createFriendRequestNotification} from "./notificationService.js";
import User from "../models/userModel.js";
import Notification from "../models/notification.js";

async function getAllFriends(user_id) {
    return await friends.getAllFriendOfUser(user_id);
}

async function getAllFriendsWithDetails(user_id) {
    const friendsList = await getAllFriends(user_id);
    const users = await getAllUSer();
    const friendDetails = await Promise.all(
        friendsList.map(async (friend) => {
            const detail = await findUserDetailByUserId(friend.friend_id);
            const user = users.find(u => u.id === friend.friend_id);
            return {
                ...(detail || {}),
                ...(user || {}),
            };
        })
    );
    return friendDetails;
}

async function addFriend(user_id, friend_id) {
    // Check if the user already exists in the database
    const user = await getAllUSer();
    const friend = user.find(u => u.id === friend_id);
    if (!friend) {
        return { error: "Người dùng không tồn tại" };
    }
    // Check if the user already has a friend list
    const friendList = await friends.getAllFriendOfUser(user_id);
    const existingFriend = friendList.find(f => f.friend_id === friend_id);
    if (existingFriend) {
        return { error: "Người dùng đã là bạn bè" };
    }

    // Check if the user is already a friend
    const friendRequest = await friends.getPendingRequests(user_id);
    const isFriendRequestSent = friendRequest.some(f => f.friend_id === friend_id);
    if (isFriendRequestSent) {
        return { error: "Lời mời kết bạn đã được gửi" };
    }
    //send notification to the friend
    await createFriendRequestNotification(user_id, friend_id);
    return await friends.addFriend(user_id, friend_id);
}

async function getFriendRequests(user_id) {
    return await friends.getPendingRequests(user_id);
}

async function acceptFriendRequest(user_id, friend_id) {
    return await friends.acceptFriendRequest(user_id, friend_id);
}

async function cancelFriendRequest(user_id, friend_id) {
    return await friends.cancelFriendRequest(user_id, friend_id);
}

async function blockUser(user_id, friend_id) {
    return await friends.blockUser(user_id, friend_id);
}

async function unblockUser(user_id, friend_id) {
    return await friends.unblockUser(user_id, friend_id);
}

async function isFriend(user_id, friend_id) {
    return await friends.isFriend(user_id, friend_id);
}

export {
    getAllFriends,
    getAllFriendsWithDetails,
    addFriend,
    getFriendRequests,
    acceptFriendRequest,
    blockUser,
    unblockUser,
    isFriend,
    cancelFriendRequest,
};
