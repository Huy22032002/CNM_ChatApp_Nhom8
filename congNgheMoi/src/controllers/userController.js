const userService = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const user = req.body;

    const newUser = await userService.createUser(
      user.username,
      user.email,
<<<<<<< HEAD
      user.pass_hash,
      user.phone
=======
      user.pass_hash
>>>>>>> HoangBranch
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

const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log(id);

    const data = req.body;
    console.log(data);

    const updateUser = await userService.updateUser(id, data);
    res.status(200).json(updateUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: "error updating user controller", error: err.message });
  }
};

module.exports = { createUser, getAllUser, updateUser };

