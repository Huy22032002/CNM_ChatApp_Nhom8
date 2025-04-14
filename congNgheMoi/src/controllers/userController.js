import {
  createUser as _createUser,
  getAllUSer,
  updateUser as _updateUser,
  findUser as _findUser,
  authenticate,
} from "../services/userService.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

const createUser = async (req, res) => {
  try {
    const user = req.body;

    const newUser = await _createUser(
      user.username,
      user.email,
      user.pass_hash,
      user.phone
    );

    res.status(201).json({
      message: "User created successfully!",
      user: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};
const getAllUser = async (req, res) => {
  try {
    const users = await getAllUSer();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).body(err.message);
  }
};
const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log(id);

    const data = req.body;
    console.log(data);

    const updateUser = await _updateUser(id, data);
    res.status(200).json(updateUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: "error updating user controller", error: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id, password } = req.body;
    console.log("req.body:", req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await _updateUser(id, { pass_hash: hashedPassword });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};

const findUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await _findUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding user", error: error.message });
  }
};

const searchUser = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
        ],
      },
      attributes: { exclude: ["password"] },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkMatchPassword = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authenticate(username, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid Old Pass" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error authenticating user", error });
  }
};

export default { createUser, getAllUser, updateUser, findUser,checkMatchPassword ,updatePassword,searchUser};
