import axios from "axios";
import { API_URL } from "./apiConfig";
import { fetchUserDetail } from "./userDetailApi";

export const fetchFriendRequests = async (userId, accessToken) => {
  try {
    const res = await axios.get(`${API_URL}/api/friends/requests/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Fetch details for each friend request
    const detailsPromises = res.data.map(async (request) => {
      const userDetail = await fetchUserDetail(request.friend_id, accessToken);
      return {
        ...request,
        userDetail,
      };
    });

    const details = await Promise.all(detailsPromises);
    return details;
  } catch (err) {
    console.error("Lỗi khi lấy lời mời kết bạn:", err);
    throw err;
  }
};

export const acceptFriendRequest = async (userId, friendId, accessToken) => {
  try {
    await axios.post(
      `${API_URL}/api/friends/accept`,
      {
        user_id: userId,
        friend_id: friendId,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (err) {
    console.error("Lỗi khi chấp nhận kết bạn:", err);
    throw err;
  }
};

export const cancelFriendRequest = async (userId, friendId, accessToken) => {
  try {
    await axios.post(
      `${API_URL}/api/friends/cancel-request`,
      {
        user_id: userId,
        friend_id: friendId,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (err) {
    console.error("Lỗi khi từ chối kết bạn:", err);
    throw err;
  }
};