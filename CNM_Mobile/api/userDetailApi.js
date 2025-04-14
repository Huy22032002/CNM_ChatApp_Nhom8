const USER_DETAIL_API = "http://10.0.2.2:3000/api/userDetails";

export const fetchUserDetail = async (user_id, accessToken) => {
  if (!user_id || !accessToken) {
    throw new Error("Invalid user_id or accessToken");
  }

  try {
    const response = await fetch(`${USER_DETAIL_API}/${user_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Lỗi khi lấy thông tin người dùng");
    }

    return await response.json();
  } catch (err) {
    console.error("Fetch user detail error:", err.message || err);
    throw err;
  }
};
