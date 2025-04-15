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


    const existMail = await User.findOne({ where: { email } });
    if (existMail) {
      return res.status(401).json({ message: "Email already exists" });
    }

    const existPhone = await User.findOne({ where: { phone } });
    if (existPhone) {
      return res.status(402).json({ message: "Phone already exists" });
    }

    const existUsername = await User.findOne({ where: { username } });
    if (existUsername) {
      return res.status(403).json({ message: "Username already exists" });
    }

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
  try {
    const { email, username, password, phone, otp } = req.body;
    console.log("Received data:", { email, username, otp });

    const storedOtp = otpCache.get(email);
    console.log("Stored OTP:", storedOtp);

    if (storedOtp !== otp) {
      console.warn("OTP mismatch for email:", email);
      return res.status(400).json({ message: "OTP không chính xác" });
    }

    const existingUser = await User.findOne({ where: { username } });
    console.log("Existing user check:", existingUser);

    if (existingUser) {
      console.warn("Username already exists:", username);
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const newUser = new User({
    //   username,
    //   pass_hash: hashedPassword,
    //   email,
    //   phone,
    //   status: "OFFLINE",
    // });
    // await newUser.save();
    // const userId = newUser.id;
    // // Create user detail
    // const userDetail = new UserDetail({
    //   user_id: userId,
    //   fullname: null,
    //   age: null,
    //   gender: null,
    //   avatar_url: null,
    // });
    // await userDetail.save();
    await createUser(username, email, hashedPassword, phone);

  otpCache.delete(email);

  res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
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

    // const newUser = new User({
    //   username,
    //   pass_hash: hashedPassword,
    //   email,
    //   phone,
    //   status: "OFFLINE",
    // });
    // await newUser.save();
    // //get the user id of the new user
    // const userId = newUser.id;
    // console.log("New uid:"+userId);
    // // Create user detail
    // const userDetail = new UserDetail({
    //   user_id: userId,
    //   fullname: null,
    //   age: null,
    //   gender: null,
    //   avatar_url: null,
    // });
    // await userDetail.save();
    
    await createUser(username, email, hashedPassword, phone);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

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
      sameSite: "strict",// prevent CSRF attacks
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
