const User = require("../models/userModel");

async function createUser(username, email, pass_hash, phone) {
  try {
    const user = await User.create({ username, email, pass_hash, phone });
    return user;
  } catch (error) {
    throw new Error("Lỗi khi tạo user: " + error.message);
  }
}

async function getAllUSer() {
  try {
    return await User.findAll();
  } catch (err) {
    throw new Error(`Erre get all users service: ${err}`);
  }
}

async function updateUser(id, user_data) {
  try {
    const [updated] = await User.update(user_data, {
      where: { id },
    });
    if (updated === 0) {
      throw new Error("fail to update user in userService");
    }
    return await User.findByPk(id);
  } catch (error) {
    console.log(`Error update user service ${error}`);
  }
}

module.exports = { createUser, updateUser, getAllUSer };
