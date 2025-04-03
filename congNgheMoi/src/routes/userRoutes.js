const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware"); 
// Tạo người dùng (không cần xác thực)
router.post("/add", userController.createUser);

// Lấy danh sách tất cả người dùng (yêu cầu đăng nhập)
router.get("/", authMiddleware, userController.getAllUser);

// Cập nhật thông tin người dùng (yêu cầu đăng nhập)
router.post("/update/:id", authMiddleware, userController.updateUser);

module.exports = router;
