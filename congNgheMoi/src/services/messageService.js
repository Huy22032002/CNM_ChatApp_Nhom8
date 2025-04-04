import MessageModel from "../models/message.js";

const MessageService = {
  async createMessage(message) {
    return await MessageModel.createMessage(message);
  },

  async getAllMessageByConversationId(conversation_id) {
    if (!conversation_id) throw new Error("Invalid conversation_id in service");
    return await MessageModel.getAllMessageByConversationId(conversation_id);
  },
};

export default MessageService;
