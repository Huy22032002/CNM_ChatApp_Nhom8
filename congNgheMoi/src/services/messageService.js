import MessageModel from "../models/message.js";
import ConversationModel from "../models/conversation.js";
const MessageService = {
  async createMessage(message) {
    try {
      const newMessage = await MessageModel.createMessage(message);

      return newMessage;
    } catch (error) {
      console.error(`Err creating message in service: ${error.message}`);
      throw new Error(
        `Err creating message in message service: ${error.message}`
      );
    }
  },
  async getAllMessageByConversationId(conversation_id) {
    if (!conversation_id) {
      throw new Error("Require conversation_id in service");
    }
    try {
      return await MessageModel.getAllMessageByConversationId(conversation_id);
    } catch (error) {
      console.error(`Error fetching messages: ${error.message}`);
      throw new Error(
        `Error get all messages in message service: ${error.message}`
      );
    }
  },
  async updateMessageContent(message_id, user_id, conversation_id, content) {
    try {
      return await MessageModel.updateMessageContent(
        message_id,
        user_id,
        conversation_id,
        content
      );
    } catch (err) {
      throw new Error(
        `Err update message content in message serivce: ${err.message}`
      );
    }
  },
  async deleteMessage(message_id, user_id, conversation_id) {
    try {
      await MessageModel.deleteMessage(message_id, user_id, conversation_id);
      return true;
    } catch (err) {
      throw new Error(`err delete message in message service: ${err.message}`);
    }
  },
  async revokeMessage(message_id, user_id, conversation_id) {
    try {
      const revokedMessage = await MessageModel.revokeMessage(
        message_id,
        user_id,
        conversation_id
      );
      console.log("revoke message: ", revokedMessage);
      return revokedMessage;
    } catch (err) {
      console.error(`error revoke message in message service: ${err}`);
      throw new Error(
        `Error revoke message in message service: ${err.message} `
      );
    }
  },
};

export default MessageService;
