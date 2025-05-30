//tạo 1 page hello.js để test localhost:3000
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({ message: "Hello, world!" });
    }
);  