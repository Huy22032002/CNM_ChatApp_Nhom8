import ConversationModel from "../models/conversation.js";
const { createConversation: _createConversation, getAllConversationBy } = ConversationModel;
const ConversationService = {
  async createConversation(data) {
    const { type, participants } = data;

    //kiem tra du lieu dau vao
    if (!type || !participants) {
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
};

export default ConversationService;
