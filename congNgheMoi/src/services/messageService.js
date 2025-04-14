import MessageModel from "../models/message.js";

const MessageService = {
  async createMessage(message) {
    try {
      return await MessageModel.createMessage(message);
    } catch (error) {
      console.error(`Err creating message: ${error.message}`);
      throw new Error(`Err creating message service: ${error.message}`);
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
      throw new Error(`Error fetching messages service: ${error.message}`);
    }
  },
  async updateMessageContent(message_id, user_id, content) {
    try {
      return await MessageModel.updateMessageContent(
        message_id,
        user_id,
        content
      );
    } catch (err) {
      console.error(`Err update message content service ${err.message}`);
      throw new Error(`Err update msg content serivce: ${err.message}`);
    }
  },
  async deleteMessage(message_id, user_id) {
    try {
      await MessageModel.deleteMessage(message_id, user_id);
    } catch (err) {
      console.error(`err delete message in message service: ${err.message}`);
      throw new Error(`err delete message in message service: ${err.message}`);
    }
  },
  async revokeMessage(message_id, user_id) {
    try {
      const revokedMessage = await MessageModel.revokeMessage(
        message_id,
        user_id
      );
      return revokedMessage;
    } catch (err) {
      console.error(`error revoke message in message service: ${err}`);
      throw new Error(
        `Error revok message in message service: ${err.message} `
      );
    }
  },
};

export default MessageService;
