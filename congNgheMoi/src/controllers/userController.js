const userService = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const user = req.body;

    const newUser = await userService.createUser(
      user.username,
      user.email,
      user.pass_hash
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
    const users = await userService.getAllUSer();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).body(err.message);
  }
};

module.exports = { createUser, getAllUser };
