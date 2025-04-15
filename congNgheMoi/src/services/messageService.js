import MessageModel from "../models/message.js";
import ConversationModel from "../models/conversation.js";
const MessageService = {
  async createMessage(message) {
    try {
      const newMessage = await MessageModel.createMessage(message);
      //update conversation
      const lastMessage = {
        content: newMessage.content,
        updated_at: newMessage.created_at,
      };
      const updatedConversation = await ConversationModel.updateConversation(
        newMessage.conversation_id,
        lastMessage
      );
      console.log(
        "update conversation after create new message: ",
        updatedConversation
      );
      return newMessage;
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
  async updateMessageContent(message_id, user_id, conversation_id, content) {
    try {
      return await MessageModel.updateMessageContent(
        message_id,
        user_id,
        conversation_id,
        content
      );
    } catch (err) {
      throw new Error(`Err update message content serivce: ${err.message}`);
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
        `Error revok message in message service: ${err.message} `
      );
    }
  },
};

export default MessageService;
