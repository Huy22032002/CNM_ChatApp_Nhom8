import { createUser as _createUser, getAllUSer, updateUser as _updateUser, findUser as _findUser } from "../services/userService.js";

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
}

export default { createUser, getAllUser, updateUser };

