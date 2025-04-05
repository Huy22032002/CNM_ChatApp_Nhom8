import express from "express";
import homeRoutes from "./routes/homeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userDetailRoutes from "./routes/userDetailRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
<<<<<<< HEAD
import authMiddleware from "./middlewares/authMiddleware.js";
import cors from "cors";
=======
import {authMiddleware,authMiddlewareWithoutRefresh} from "./middlewares/authMiddleware.js";

>>>>>>> 2b3bc19d3670d35bcf3853f60d223e1c8383b946
const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
}));

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
