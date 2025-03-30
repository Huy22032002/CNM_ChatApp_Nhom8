const User = require("../models/userModel");
const UserDetail = require("../models/userDetail");

async function createUser(username, email, pass_hash) {
  try {
    const user = await User.create({ username, email, pass_hash });
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

async function checkPass(password, email) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("user khong ton tai");
      return false;
    }

    const rs = await bcrypt.compare(password, user.pass_hash);
    if (rs) {
      console.log("Password trung khop");
    } else {
      console.log("Password sai");
    }
    return rs;
  } catch (error) {
    console.error(`check pass error: ${error}`);
  }
}

module.exports = { createUser, checkPass, getAllUSer };
