import axios from "axios";
import { API_URL } from "./apiConfig";

const USER_DETAIL_API = `${API_URL}/api/userDetails`;

export const fetchUserDetail = async (user_id, accessToken) => {
  if (!user_id || !accessToken) {
    throw new Error("Invalid user_id or accessToken");
  }

  try {
    const response = await axios.get(`${USER_DETAIL_API}/${user_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    // Kiểm tra nếu lỗi là từ phía server
    if (err.response) {
      const message =
        err.response.data?.message || "Lỗi khi lấy thông tin người dùng";

      if (err.response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
      console.error("Axios error:", message);
      throw new Error(message);
    } else {
      console.error("Network error:", err.message);
      throw new Error("Lỗi mạng hoặc máy chủ không phản hồi");
    }
  }
};
export const updateUserDetail = async (user_id, accessToken, formData) => {
  try {
    const response = await axios.put(
      `${USER_DETAIL_API}/update/${user_id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response) return response.data;
    else return null;
  } catch (err) {
    if (err.response) {
      const message =
        err.response.data?.message || "Lỗi khi cập nhật người dùng";
      console.error("Lỗi cập nhật:", message);
      throw new Error(message);
    } else {
      console.error("Lỗi mạng:", err.message);
      throw new Error("Lỗi mạng hoặc máy chủ không phản hồi");
    }
  }
};
