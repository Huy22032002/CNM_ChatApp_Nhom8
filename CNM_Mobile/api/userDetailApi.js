const USER_DETAIL_API = "http://10.0.2.2:3000/api/userDetails";

export const fetchUserDetail = async (user_id, accessToken) => {
  try {
    const response = await fetch(`${USER_DETAIL_API}/${user_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Lỗi khi lấy thông tin người dùng");
    }
    return data;
  } catch (err) {
    console.error("Fetch user detail error:", err);
    throw err;
  }
};
