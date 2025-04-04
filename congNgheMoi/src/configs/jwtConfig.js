import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
import { config } from "dotenv";
config();

// Validate required environment variables
const requiredEnvVars = [
  "JWT_ACCESS_SECRET_KEY",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_SECRET_KEY",
  "JWT_REFRESH_EXPIRES_IN",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not defined.`);
  }
});

// Tạo accessToken và refreshToken
const generateToken = (user) => {
  const payload = { id: user.id, username: user.username, phone: user.phone };

  const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

// Kiểm tra accessToken và refreshToken
const verifyAndRefreshToken = async (accessToken, refreshToken) => {
  try {
    verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY);
    return { valid: true, accessToken, refreshToken };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("AccessToken hết hạn, kiểm tra RefreshToken...");
      try {
        const decodedRefreshToken = verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
        console.log("RefreshToken hợp lệ, tạo accessToken mới...");

        const newAccessToken = sign(
          { id: decodedRefreshToken.id, username: decodedRefreshToken.username, phone: decodedRefreshToken.phone },
          process.env.JWT_ACCESS_SECRET_KEY,
          { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        );

        return { valid: true, accessToken: newAccessToken, refreshToken };
      } catch (refreshError) {
        console.log("RefreshToken hết hạn, yêu cầu đăng nhập lại!");
        return { valid: false };
      }
    } else {
      console.log("AccessToken không hợp lệ!");
      return { valid: false };
    }
  }
};

// Export module as CommonJS module
export { generateToken, verifyAndRefreshToken };
