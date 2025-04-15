import {
    getAllFriends,
    getAllFriendsWithDetails,
    addFriend,
    getFriendRequests,
    acceptFriendRequest,
    blockUser,
    unblockUser,
    isFriend
} from "../services/friendService.js";

export async function getFriends(req, res) {
    try {
        const friends = await getAllFriends(req.params.userId);
        res.status(200).json(friends);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách bạn bè", detail: err.message });
    }
}
export async function addSampleData(req, res) {
    const { user_id } = req.body;
    try {
        const result = await friendsModel.createUserFriend(user_id);
        res.status(201).json({ message: "Sample data added successfully", data: result });
    } catch (err) {
        res.status(500).json({ error: "Error adding sample data", detail: err.message });
    }
}
export async function getFriendsWithDetails(req, res) {
    try {
        const details = await getAllFriendsWithDetails(req.params.userId);
        res.status(200).json(details);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy thông tin chi tiết bạn bè", detail: err.message });
    }
}

export async function sendFriendRequest(req, res) {
    const { user_id, friend_id } = req.body;
    try {
        const result = await addFriend(user_id, friend_id);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi gửi lời mời kết bạn", detail: err.message });
    }
}

export async function acceptRequest(req, res) {
    const { user_id, friend_id } = req.body;
    try {
        const result = await acceptFriendRequest(user_id, friend_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi chấp nhận lời mời", detail: err.message });
    }
}

export async function getRequests(req, res) {
    try {
        const requests = await getFriendRequests(req.params.userId);
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy lời mời kết bạn", detail: err.message });
    }
}

export async function block(req, res) {
    const { user_id, friend_id } = req.body;
    try {
        const result = await blockUser(user_id, friend_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi chặn người dùng", detail: err.message });
    }
}

export async function unblock(req, res) {
    const { user_id, friend_id } = req.body;
    try {
        const result = await unblockUser(user_id, friend_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi bỏ chặn người dùng", detail: err.message });
    }
}

export async function checkFriendStatus(req, res) {
    const { user_id, friend_id } = req.query;
    try {
        const result = await isFriend(user_id, friend_id);
        res.status(200).json({ isFriend: result });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi kiểm tra trạng thái bạn bè", detail: err.message });
    }
}
