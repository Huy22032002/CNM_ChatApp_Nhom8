import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
const router = Router();
import { findUser, authenticate, updateUser } from "../services/userService.js";
import { generateToken, verifyAndRefreshToken } from "../configs/jwtConfig.js";
import sendOtpEmail from "../utils/sendOtpEmail.js";
import otpCache from "../middlewares/otpCache.js";

const register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    const existingUser = await findUser(username);
    if (existingUser == null) {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpCache.set(email, otp); // lưu vào cache

      // Gửi email OTP
      await sendOtpEmail(email, otp);

      // Chưa lưu user vào DB ngay — đợi xác thực OTP
      res.status(200).json({ message: "OTP sent to email", email });
    } else {
      return res.status(400).json({ message: "Username already exists" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const verifyOtp = async (req, res) => {
    const { email, username, password, phone, otp } = req.body;
    const storedOtp = otpCache.get(email);
  
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "OTP không chính xác" });
    }
  
    // Tạo user sau khi xác thực
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      pass_hash: hashedPassword,
      email,
      phone,
    });
    await newUser.save();
    otpCache.delete(email);
  
    res.status(201).json({ message: "Đăng ký thành công" });
};

// const register = async (req, res) => {
//   try {
//     const { username, password, email, phone } = req.body;


//         // Check if user already exists
//         const existingUser = await findUser(username);
//         if (existingUser==null) {
//             const hashedPassword = await bcrypt.hash(password,10);
//         // console.log(hashedPassword);

//       // Create a new user
//       const newUser = new User({
//         username,
//         pass_hash: hashedPassword,
//         email,
//         phone,
//       });
//       await newUser.save();

//       res.status(201).json({ message: "User registered successfully" });
//     } else {
//       return res.status(400).json({ message: "Username already exists" });
//     }
//     // Hash the password
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

const login = async (req, res) => {

  try {
    const { username, password } = req.body;
    const user = await authenticate(username, password);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }

    const tokens = generateToken(user);
    //luu token vao cookie
    //accessToken: tokens.accessToken, refreshToken: tokens.refreshToken
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
    }); // 15 minutes

    res.cookie("token", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 days

    //update user ONLINE
    console.log(user);
    await updateUser(user.id, { status: "ONLINE" });

    res
      .status(200)
      .json({ message: "Login successful", accessToken: tokens.accessToken });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng nhập" });
    console.log(error);
  }

};


const refreshToken = async (req, res) => {
  const { accessToken, refreshToken } = req.body;

  const tokenStatus = await verifyAndRefreshToken(accessToken, refreshToken);

  if (!tokenStatus.valid) {
    return res
      .status(401)
      .json({ message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" });
  }

  res.json({
    accessToken: tokenStatus.accessToken,
    refreshToken: tokenStatus.refreshToken,
  });
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

export { register, login, refreshToken, logout ,verifyOtp};
