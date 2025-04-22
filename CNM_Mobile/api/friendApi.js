import axios from "axios";
import { API_URL } from "./apiConfig";  


const getFriends = async (userId, accessToken) => {
  try {
    const response = await axios.get(`${API_URL}/api/friends/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
};
export default {
  getFriends,
};
