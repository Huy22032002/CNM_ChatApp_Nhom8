import messageService from "../services/messageService.js";
import ConversationService from "../services/conversationService.js";
import { updateUser, findUser } from "../services/userService.js";
const SocketControler = {
  async singleChat(io, socket, data) {
    if (!data) return;
    // gan conver_id vao socket de truyen dung data
    socket.join(data.conversation_id);
    io.to(data.conversation_id).emit("join single chat", {
      conversation_id: data.conversation_id,
    });
    console.log(`User ${socket.id} joined to room ${data.conversation_id}`);
  },
  async sendMessage(io, message) {
    if (!message) {
      throw new Error("Required message data");
    }
    //thong bao toi cac user khac trong room
    io.to(message.conversation_id).emit("new message", message);
  },
  async updateMessage(io, message) {
    if (!message) {
      throw new Error("Required message data");
    }
    const { message_id, user_id, conversation_id, content } = message;
    try {
      const updatedMessage = await messageService.updateMessageContent(
        message_id,
        user_id,
        conversation_id,
        content
      );
      if (!updatedMessage) throw new Error("Updated Message failed!");
      //gui su kien den cac user trong room
      io.to(conversation_id).emit("message updated", updatedMessage);
    } catch (err) {
      throw new Error(`Error update message in socket: ${err.message}`);
    }
  },
  async deleteMessage(io, message) {
    if (!message) {
      throw new Error("Requied data to delete message");
    }
    const { message_id, user_id, conversation_id } = message;
    try {
      const result = await messageService.deleteMessage(
        message_id,
        user_id,
        conversation_id
      );
      if (!result) {
        throw new Error(`Delete Message ${message_id} failed`);
      }
      io.to(conversation_id).emit("message deleted", result);
    } catch (err) {
      throw new Error(`Error delete message in socket: ${err.message}`);
    }
  },
  async revokeMessage(io, message) {
    if (!message) {
      throw new Error("Require message data to revoke");
    }
    const { message_id, user_id, conversation_id } = message;
    try {
      const revokedMessage = await messageService.revokeMessage(
        message_id,
        user_id,
        conversation_id
      );
      if (!revokedMessage) {
        throw new Error("Revoke message failed");
      }
      io.to(conversation_id).emit("message revoked", revokedMessage);
    } catch (err) {
      throw new Error(`Error revoke message in socket: ${err.message}`);
    }
  },
  //user
  async onlineUser(io, data) {
    if (!data) {
      throw new Error("require data user");
    }
    console.log(data);

    try {
      io.emit("user status", { user: data });
    } catch (err) {
      throw new Error(`Error get ONLINE for user in socket: ${err.message}`);
    }
  },
  async offlineUser(io, data) {
    if (!data) {
      throw new Error("require user data");
    }
    try {
      const user = await findUser(data);
      if (!user) {
        throw new Error("Get User status failed");
      }
      io.emit("user status", user);
    } catch (err) {
      throw new Error(`Error set OFFLINE for user in socket: ${err.message}`);
    }
  },
};

export default SocketControler;
