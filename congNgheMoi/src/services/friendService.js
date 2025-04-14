import friends from "../models/friendsModel.js";
import { getAllUSer } from "./userService.js";
import { findUserDetailByUserId } from "./userDetailService.js";

async function getAllFriends(user_id) {
    return await friends.getAllFriendOfUser(user_id);
}

async function getAllFriendsWithDetails(user_id) {
    const friendsList = await getAllFriends(user_id);
    const userDetails = await findUserDetailByUserId(user_id);
    const users = await getAllUSer();
    const friendDetails = friendsList.map(friend => {
        const detail = userDetails.find(d => d.user_id === friend.friend_id);
        const user = users.find(u => u.id === friend.friend_id);
        return {
            ...(detail || {}),
            ...(user || {}),
        };
    });
    return friendDetails;
}

async function addFriend(user_id, friend_id) {
    return await friends.addFriend(user_id, friend_id);
}

async function getFriendRequests(user_id) {
    return await friends.getPendingRequests(user_id);
}

async function acceptFriendRequest(user_id, friend_id) {
    return await friends.acceptFriendRequest(user_id, friend_id);
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
    isFriend
};
