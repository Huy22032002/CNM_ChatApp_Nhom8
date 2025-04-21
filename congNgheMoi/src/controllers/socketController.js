import messageService from "../services/messageService.js";
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
    console.log("Received message socket: ", message);
    //thong bao toi cac user khac trong room
    io.to(message.conversation_id).emit("new message", message);
  },
  async updateMessage(io, message) {
    if (!message) {
      throw new Error("Required message data");
    }
    //gui su kien den cac user trong room
    io.to(message.conversation_id).emit("message updated", message);
  },
  async deleteMessage(io, data) {
    if (!data) {
      throw new Error("Requied data to delete message");
    }
    const { message_id, conversation_id } = data;
    console.log("message id delete: ", message_id);

    io.to(conversation_id).emit("message deleted", message_id);
  },
  async revokeMessage(io, data) {
    if (!data) {
      throw new Error("Require message data to revoke");
    }
    io.to(data.conversation_id).emit("message revoked", data);
  },
  //user
  async onlineUser(io, data) {
    if (!data) {
      throw new Error("require data user");
    }
    console.log(data);

    try {
      io.emit("user status", data);
    } catch (err) {
      throw new Error(`Error get ONLINE for user in socket: ${err.message}`);
    }
  },
  async offlineUser(io, data) {
    if (!data) {
      throw new Error("require user data");
    }
    try {
      io.emit("user status", { user: data });
    } catch (err) {
      throw new Error(`Error set OFFLINE for user in socket: ${err.message}`);
    }
  },
};

export default SocketControler;
