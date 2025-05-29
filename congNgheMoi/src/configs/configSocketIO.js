import { Server } from "socket.io";


import messageService from "../services/messageService.js";
import conversationService from "../services/conversationService.js";
import SocketControler from "../controllers/socketController.js";

const userSocketMap = new Map(); // Lưu trữ userId -> socketId
const socketUserMap = new Map();
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

    // Xác thực người dùng khi kết nối
    socket.on("authenticate", (data) => {
      const { userId } = data;

      if (userId) {
        // Lưu thông tin mapping
        userSocketMap.set(userId, socket.id);
        socketUserMap.set(socket.id, userId);

        console.log(`User ${userId} authenticated with socket ${socket.id}`);
        socket.emit("authenticated", { userId });

        // Thông báo trạng thái online cho bạn bè
        socket.broadcast.emit("user status", {
          user_id: userId,
          status: "online",
          updatedAt: new Date(),
        });
      }
    });

    socket.on("make-call", (data) => {
      const { callerId, receiverId, callType, callId } = data;

      // Lấy socketId của người nhận
      const receiverSocketId = userSocketMap.get(receiverId.toString());

      if (receiverSocketId) {
        console.log(
          `Sending call notification to ${receiverId} via ${receiverSocketId}`
        );
        io.to(receiverSocketId).emit("incoming-call", data);
      } else {
        // Người nhận không online
        socket.emit("call-missed", {
          callId,
          reason: "RECEIVER_OFFLINE",
        });
      }
    });

    socket.on("accept-call", (data) => {
      const { callId, callerId } = data;
      const callerSocketId = userSocketMap.get(callerId.toString());

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-accepted", data);
      }
    });

    socket.on("reject-call", (data) => {
      const { callId, callerId } = data;
      const callerSocketId = userSocketMap.get(callerId.toString());

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-rejected", data);
      }
    });

    socket.on("end-call", (data) => {
      const { callId, callerId, receiverId } = data;
      const otherPartyId =
        socket.id === userSocketMap.get(callerId.toString())
          ? receiverId.toString()
          : callerId.toString();

      const otherPartySocketId = userSocketMap.get(otherPartyId);

      if (otherPartySocketId) {
        io.to(otherPartySocketId).emit("call-ended", data);
      }
    });

    // WebRTC signaling
    socket.on("webrtc-offer", (data) => {
      const { callId, userId } = data;
      const receiverId = getCallReceiverId(userId, callId);
      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("webrtc-offer", data);
      }
    });

    socket.on("webrtc-answer", (data) => {
      const { callId, userId } = data;
      const callerId = getCallCallerId(userId, callId);
      const callerSocketId = userSocketMap.get(callerId);

      if (callerSocketId) {
        io.to(callerSocketId).emit("webrtc-answer", data);
      }
    });

    socket.on("webrtc-ice-candidate", (data) => {
      const { callId, userId } = data;
      const otherUserId = getCallOtherPartyId(userId, callId);
      const otherUserSocketId = userSocketMap.get(otherUserId);

      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("webrtc-ice-candidate", data);
      }
    });

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

      const userId = socketUserMap.get(socket.id);

      if (userId) {
        // Xóa mapping
        socketUserMap.delete(socket.id);
        userSocketMap.delete(userId);

        // Thông báo trạng thái offline
        socket.broadcast.emit("user status", {
          user_id: userId,
          status: "offline",
          updatedAt: new Date(),
        });
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error: ", err);
    });
  });


  function getCallReceiverId(userId, callId) {
    // Lấy receiverId từ callId và userId
    // Đây chỉ là mock, cần thực hiện bằng truy vấn database thực tế
    const receiverId = "receiverId"; // Thay thế bằng logic thực tế
    const callerId = "callerId"; // Thay thế bằng logic thực tế
    const otherPartyId = userId === callerId ? receiverId : callerId;
    if (userId === callerId) {
      return receiverId;
    }
    if (userId === otherPartyId) {
      return callerId;
    }
    // Nếu không tìm thấy, trả về null hoặc throw error
    if (!receiverId) {
      throw new Error("Receiver not found for the given callId and userId");
    }
    if (!callerId) {
      throw new Error("Caller not found for the given callId and userId");
    }
    if (!otherPartyId) {
      throw new Error("Other party not found for the given callId and userId");
    }
    return receiverId;
  }

  function getCallCallerId(userId, callId) {
    // Lấy callerId từ callId và userId
    // Đây chỉ là mock, cần thực hiện bằng truy vấn database thực tế
    const callerId = "callerId"; // Thay thế bằng logic thực tế
    const receiverId = "receiverId"; // Thay thế bằng logic thực tế
    const otherPartyId = userId === callerId ? receiverId : callerId;
    if (userId === callerId) {
      return callerId;
    }
    if (userId === otherPartyId) {
      return receiverId;
    }
    // Nếu không tìm thấy, trả về null hoặc throw error
    if (!callerId) {
      throw new Error("Caller not found for the given callId and userId");
    }
    if (!receiverId) {
      throw new Error("Receiver not found for the given callId and userId");
    }
    if (!otherPartyId) {
      throw new Error("Other party not found for the given callId and userId");
    }

    return callerId;
  }

  function getCallOtherPartyId(userId, callId) {
    // Lấy otherPartyId từ callId và userId
    // Đây chỉ là mock, cần thực hiện bằng truy vấn database thực tế
    const callerId = "callerId"; // Thay thế bằng logic thực tế
    const receiverId = "receiverId"; // Thay thế bằng logic thực tế
    const otherPartyId = userId === callerId ? receiverId : callerId;
    if (userId === callerId) {
      return receiverId;
    }
    if (userId === otherPartyId) {
      return callerId;
    }
    // Nếu không tìm thấy, trả về null hoặc throw error
    if (!callerId) {
      throw new Error("Caller not found for the given callId and userId");
    }
    if (!receiverId) {
      throw new Error("Receiver not found for the given callId and userId");
    }
    if (!otherPartyId) {
      throw new Error("Other party not found for the given callId and userId");
    }
    
    return otherPartyId;
  }
};
