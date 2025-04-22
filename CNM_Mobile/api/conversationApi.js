import axios from "axios";
import { API_URL } from "../api/apiConfig";
const CONVERSATIONS_API = `${API_URL}/api/conversations`;

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
  async addParticipants(conversation_id, user_id, accessToken) {
    if (!conversation_id || !user_id || !accessToken) {
      throw new Error("Invalid conversation_id, data or accessToken");
    }
    try {
      const response = await axios.put(
        `${CONVERSATIONS_API}/addParticipant/${conversation_id}`,
        { user_id },
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
  async leaveConversation(conversation_id, user_id, accessToken) {
    if (!conversation_id || !user_id || !accessToken) {
      throw new Error("Missing data for leaveConversation");
    }
    try {
      const response = await axios.put(
        `${CONVERSATIONS_API}/leave/${conversation_id}`,
        { user_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      throw new Error(
        err?.response?.data?.message || "Error leaving conversation"
      );
    }
  },

  async removeParticipants(conversation_id, data, accessToken) {
    if (!conversation_id || !data || !accessToken) {
      throw new Error("Invalid conversation_id, data or accessToken");
    }
    try {
      const response = await axios.put(
        `${CONVERSATIONS_API}/removeParticipant/${conversation_id}`,
        data,
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

  async updateGroupConversation(conversation_id, formData, accessToken) {
    if (!conversation_id || !formData || !accessToken) {
      throw new Error("Invalid conversation_id, formData or accessToken");
    }

    console.log("FormData content:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const response = await axios.put(
        `${CONVERSATIONS_API}/updateGroup/${conversation_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response && response.data) {
        return response.data.groupDetail;
      }
      return null;
    } catch (err) {
      console.error(
        "Error in updateGroupConversation:",
        err.response?.data || err.message
      );
      throw err;
    }
  },

  async updateConversationAvatar(conversation_id, formData, accessToken) {
    if (!conversation_id || !formData || !accessToken) {
      throw new Error("Invalid conversation_id, data or accessToken");
    }
    try {
      const response = await axios.put(
        `${CONVERSATIONS_API}/updateAvatar/${conversation_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
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

  async updateGroupName(conversation_id, data, accessToken) {
    if (!conversation_id || !data || !accessToken) {
      throw new Error("Invalid conversation_id, data or accessToken");
    }
    try {
      const response = await axios.put(
        `${CONVERSATIONS_API}/updateGroup/${conversation_id}`,
        data,
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
