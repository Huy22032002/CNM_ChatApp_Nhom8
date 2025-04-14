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

import {
  authMiddleware,
  authMiddlewareWithoutRefresh,
} from "./middlewares/authMiddleware.js";

const app = express();
const server = http.createServer(app);
ConnectSocket(server); 

import cors from "cors";



app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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