import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import UserDetail from "../models/userDetail.js";
const router = Router();
import {
  findUser,
  authenticate,
  updateUser,
  createUser,
} from "../services/userService.js";
import { generateToken, verifyAndRefreshToken } from "../configs/jwtConfig.js";
import sendOtpEmail from "../utils/sendOtpEmail.js";
import otpCache from "../middlewares/otpCache.js";

const register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    const existingUser = await findUser(username);
    if (existingUser == null) {
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpCache.set(email, otp); // lưu vào cache

      // Gửi email OTP
      await sendOtpEmail(email, otp);

      // const hashedPassword = await bcrypt.hash(password, 10);//for testing
      // const newUser = new User({
      //   username,
      //   pass_hash: hashedPassword,
      //   email,
      //   phone,
      // });
      // await newUser.save();//for testing

      // Chưa lưu user vào DB ngay — đợi xác thực OTP
      res.status(200).json({ message: "OTP sent to email", email, otp });
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
    status: "OFFLINE",
  });
  await newUser.save();
  const userId = newUser.id;
  // Create user detail
  const userDetail = new UserDetail({
    user_id: userId,
    fullname: null,
    age: null,
    gender: null,
    avatar_url: null,
  });
  await userDetail.save();

  otpCache.delete(email);

  res.status(201).json({ message: "Đăng ký thành công" });
};

const createNewUser = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    console.log(username, password, email, phone);
    const existingUser = await findUser(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      pass_hash: hashedPassword,
      email,
      phone,
      status: "OFFLINE",
    });
    await newUser.save();
    //get the user id of the new user
    const userId = newUser.id;
    console.log("New uid:" + userId);
    // Create user detail
    const userDetail = new UserDetail({
      user_id: userId,
      fullname: null,
      age: null,
      gender: null,
      avatar_url: null,
    });
    await userDetail.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
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
      // httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
    }); // 7 days

    //update user ONLINE
    console.log(user);
    console.log(tokens.accessToken);
    await updateUser(user.id, { status: "ONLINE" });
    ({ message: "Login successful", accessToken: tokens.accessToken });
    res.status(200).json({
      message: "Login successful",
      accessToken: tokens.accessToken,
      user,
    });
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
  //chuyen status qua OFFLINE
  const { id } = req.body;
  updateUser(id, { status: "OFFLINE" });

  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

export { register, login, refreshToken, logout, verifyOtp, createNewUser };
