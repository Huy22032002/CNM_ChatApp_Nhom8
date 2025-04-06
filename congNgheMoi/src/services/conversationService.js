import ConversationModel from "../models/conversation.js";
const {
  createConversation: _createConversation,
  getAllConversationBy,
  updateConversation,
  getConversationById,
} = ConversationModel;

const ConversationService = {
  async createConversation(data) {
    const { type, participants } = data;

    //kiem tra du lieu dau vao
    if (!type || !participants || participants.length === 0) {
      throw new Error("invalid data create conversation service");
    }
    return await _createConversation(type, participants);
  },
  async getAllConversation(user_id) {
    if (!user_id) {
      throw new Error("invalid user_id getAll Conversation service");
    }
    return await getAllConversationBy(user_id);
  },
  async updateConver(conversation_id, lastMessage) {
    if (!conversation_id || !lastMessage) {
      console.log("update service: invalid data");
      throw new Error("Invalid data for update conversation");
    }
    try {
      return await updateConversation(conversation_id, lastMessage);
    } catch (err) {
      console.log(`err update conversation sevice ${err}`);
      throw new Error("Error updating conversation service");
    }
  },
};

export default ConversationService;
