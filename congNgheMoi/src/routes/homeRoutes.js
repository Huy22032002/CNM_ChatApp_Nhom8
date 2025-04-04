const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// API trang chủ (yêu cầu đăng nhập)
router.get("/", authMiddleware, homeController.getHome);

module.exports = router;
