import { Server } from "socket.io";
import messageService from "../services/messageService.js";
// io.on : client tao 1 connection -> Server
// io.emit: Server gui data den All Clients ddang connect
//socket.on: nhan 1 event tu client
//socket.emit: client phat ra 1 event
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

    socket.on("single chat", (data) => {
      if (!data) return;
      socket.join(data.conversation_id);
      console.log(
        `User ${socket.id} joined to chat room ${data.conversation_id}`
      );
    });
    //send message
    socket.on("send message", async (message) => {
      try {
        //save message db
        const savedMessage = await messageService.createMessage(message);
        //tim` va phat tin nhan den cac user trong conversation
        io.to(message.conversation_id).emit("new message", savedMessage);
      } catch (error) {
        console.error("Error processing message: ", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    socket.on("error", (err) => {
      console.error("Socket error: ", err);
    });
  });
};
