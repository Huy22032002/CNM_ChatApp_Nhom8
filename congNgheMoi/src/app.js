import express from "express";
import homeRoutes from "./routes/homeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userDetailRoutes from "./routes/userDetailRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import { ConnectSocket } from "./configs/configSocketIO.js";
import http from "http";
import cors from "cors";

import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "./middlewares/authMiddleware.js";

const app = express();
const server = http.createServer(app);
ConnectSocket(server); 

// Cấu hình CORS để xử lý preflight requests
app.use(cors({
  origin: "http://localhost:5173", // Chỉ định origin cụ thể
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Tăng giới hạn kích thước payload để tránh lỗi 'Payload Too Large'
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use("/auth", authRoutes);

// app.use(
//   authMiddlewareWithoutRefresh
//   // authMiddleware 
// );
app.use(authMiddlewareWithoutRefresh);

app.use("/api/home", homeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/userDetails", userDetailRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);


export default app;