const ConversationModel = require("../models/conversation");

const ConversationService = {
  async createConversation(data) {
    const { type, participants } = data;

    //kiem tra du lieu dau vao
    if (!type || !participants) {
      throw new Error("invalid data create conversation service");
    }
    return await ConversationModel.createConversation(type, participants);
  },

  async getAllConversation(user_id) {
    if (!user_id) {
      throw new Error("invalid user_id getAll Conversation service");
    }
    return await ConversationModel.getAllConversationBy(user_id);
  },
};

module.exports = ConversationService;
