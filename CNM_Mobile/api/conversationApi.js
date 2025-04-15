import axios from "axios";
const CONVERSATIONS_API = "http://10.0.2.2:3000/api/conversations";

const ConversationApi = {
  async fetchConversationsByUserId(userId, accessToken) {
    if (!userId || !accessToken) {
      throw new Error("Invalid user_id or accessToken");
    }
    try {
      const response = await axios.get(`${CONVERSATIONS_API}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response) {
        const conversations = response.data;
        return conversations;
      }
    } catch (err) {
      throw new Error(err);
    }
  },
  async fetchConversationsByConverId(conversation_id, accessToken) {
    if (!conversation_id || !accessToken) {
      throw new Error("Invalid user_id or accessToken");
    }
    try {
      const response = await axios.get(
        `${CONVERSATIONS_API}/${conversation_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response) {
        const conversation = response.data;
        return conversation;
      }
    } catch (err) {
      throw new Error(err);
    }
  },
};
export default ConversationApi;
