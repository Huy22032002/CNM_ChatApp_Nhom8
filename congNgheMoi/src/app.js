import express from "express";
import homeRoutes from "./routes/homeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userDetailRoutes from "./routes/userDetailRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import {authMiddleware,authMiddlewareWithoutRefresh} from "./middlewares/authMiddleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use routes
app.use("/auth", authRoutes);

// Apply authentication middleware for protected routes
app.use(authMiddlewareWithoutRefresh,
    // authMiddleware
);
app.use("/api/home", homeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/userDetails", userDetailRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

export default app;
