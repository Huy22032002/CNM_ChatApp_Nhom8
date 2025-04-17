import ConversationModel from "../models/conversation.js";

const ConversationService = {
  async createConversation(data) {
    const { type, participants } = data;

    //kiem tra du lieu dau vao
    if (!type || !participants || participants.length === 0) {
      throw new Error("invalid data create conversation service");
    }
    return await ConversationModel.createConversation(type, participants);
  },
  async getAllConversation(user_id) {
    if (!user_id) {
      throw new Error("invalid user_id getAll Conversation service");
    }
    return await ConversationModel.getAllConversationByUser(user_id);
  },
  async getConversationById(conversation_id) {
    try {
      const conversation = await ConversationModel.getConversationById(
        conversation_id
      );
      return conversation;
    } catch (err) {
      throw new Error("error get conversation by id in service: ", err.message);
    }
  },
  async updateConver(conversation_id, lastMessage) {
    if (!conversation_id || !lastMessage) {
      console.log("update service: invalid data");
      throw new Error("Invalid data for update conversation");
    }
    try {
      return await ConversationModel.updateConversation(
        conversation_id,
        lastMessage
      );
    } catch (err) {
      console.log(`err update conversation sevice ${err}`);
      throw new Error(
        "Error update conversation in conversation service",
        err.message
      );
    }
  },
};

export default ConversationService;
