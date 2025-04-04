import { verifyAndRefreshToken } from "../configs/jwtConfig.js";


const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies?.refreshToken; // Lấy refresh token từ cookie

    if (!accessToken || !refreshToken) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const tokenStatus = await verifyAndRefreshToken(accessToken, refreshToken);

    if (!tokenStatus.valid) {
      return res.status(401).json({ message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" });
    }

    // Nếu accessToken được làm mới, gửi lại token mới cho client
    if (tokenStatus.accessToken) {
      res.setHeader("Authorization", `Bearer ${tokenStatus.accessToken}`);
    }

    req.user = tokenStatus.user;
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export default authMiddleware;
