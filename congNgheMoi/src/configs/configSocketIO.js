import { Server } from "socket.io";
import messageService from "../services/messageService.js";
import conversationService from "../services/conversationService.js";
import SocketControler from "../controllers/socketController.js";
// io.on : client tao 1 connection -> Server
// io.emit: Server gui data den All Clients ddang connect
//socket.on: client nhan event
//socket.emit: client goi event ma server da tao
export const ConnectSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
  });
  console.log(`connect Socket.io`);

  io.on("connection", (socket) => {
    console.log("client connected: ", socket.id);

    socket.on("single chat", (data) =>
      SocketControler.singleChat(io, socket, data)
    );
    socket.on("group chat", (data) => {
      SocketControler.groupChat(io, socket, data);
    });
    //send message
    socket.on("send message", async (message) =>
      SocketControler.sendMessage(io, message)
    );
    //update Conver
    socket.on("update conversation", async (conversation) =>
      SocketControler.updateLastMessage(io, conversation)
    );
    //update message
    socket.on("update message", async (message) =>
      SocketControler.updateMessage(io, message)
    );
    //delete message < 5mins
    socket.on("delete message", async (data) =>
      SocketControler.deleteMessage(io, data)
    );
    //revoke message
    socket.on("revoke message", async (data) =>
      SocketControler.revokeMessage(io, data)
    );
    //user online
    socket.on("online", async (data) => SocketControler.onlineUser(io, data));
    //user offline
    socket.on("offline", async (data) => SocketControler.offlineUser(io, data));
    socket.on("disconnect", () => {
      socket.leaveAll();
      console.log(`Client disconnected: ${socket.id}`);
    });

    socket.on("error", (err) => {
      console.error("Socket error: ", err);
    });
  });
};
