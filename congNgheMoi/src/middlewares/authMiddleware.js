import { verifyAndRefreshToken } from "../configs/jwtConfig.js";

export const authMiddleware = async (req, res, next) => {
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
    if (tokenStatus.newAccessToken) {
      res.setHeader("Authorization", `Bearer ${tokenStatus.newAccessToken}`);
    }

    req.user = tokenStatus.user;
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
