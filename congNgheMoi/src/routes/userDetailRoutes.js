const express = require("express");
const router = express.Router();
const userDetailController = require("../controllers/userDetailController");
const { authMiddleware } = require("../middlewares/authMiddleware"); 
// Tạo chi tiết người dùng (yêu cầu đăng nhập)
router.post("/add", authMiddleware, userDetailController.createUserDetail);

module.exports = router;
