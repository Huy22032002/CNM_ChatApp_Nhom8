import { Router } from 'express';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; 
const router = Router();
import { findUser, authenticate } from '../services/userService.js'; 
import { generateToken, verifyAndRefreshToken } from "../configs/jwtConfig.js";

const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await findUser(username);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully' });
        return res.redirect('/login'); 
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authenticate(username, password);

        if (!user) {
            return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
        }

        const tokens = generateToken(user);
        res.json(tokens);
    } catch (error) {
        res.status(500).json({ message: "Lỗi đăng nhập" });
    }
};

const refreshToken = async (req, res) => {
    const { accessToken, refreshToken } = req.body;

    const tokenStatus = await verifyAndRefreshToken(accessToken, refreshToken);

    if (!tokenStatus.valid) {
        return res.status(401).json({ message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" });
    }

    res.json({ accessToken: tokenStatus.accessToken, refreshToken: tokenStatus.refreshToken });
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });  
    return res.redirect('/login'); 
};

export {
    register,
    login,
    refreshToken,
    logout
};
