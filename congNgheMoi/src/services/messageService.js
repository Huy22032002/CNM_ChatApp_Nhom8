import MessageModel from "../models/message.js";

const MessageService = {
  async createMessage(message) {
    try {
      return await MessageModel.createMessage(message);
    } catch (error) {
      console.error(`Err creating message: ${error.message}`);
      throw new Error("Err creating message service");
    }
  },

  async getAllMessageByConversationId(conversation_id) {
    if (!conversation_id) {
      throw new Error("Invalid conversation_id in service");
    }
    try {
      return await MessageModel.getAllMessageByConversationId(conversation_id);
    } catch (error) {
      console.error(`Error fetching messages: ${error.message}`);
      throw new Error("Error fetching messages service");
    }
  },
};

export default MessageService;
