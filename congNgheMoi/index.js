import express from "express";
import homeRoutes from "./src/routes/homeRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import userDetailRoutes from "./src/routes/userDetailRoutes.js";
import conversationRoutes from "./src/routes/conversationRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { ConnectSocket } from "./src/configs/configSocketIO.js";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./src/configs/connectRDS.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
connectDB();

const server = http.createServer(app);
ConnectSocket(server);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*", credentials: true }));

app.use("/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/userDetails", userDetailRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
