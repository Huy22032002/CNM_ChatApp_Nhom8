import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Friends from "../models/friendsModel.js";

import UserDetail from "../models/userDetail.js";
import {
  createUserDetail,
  getAllUserDetails,
  updateUserDetail,
  findUserDetailByUserId,
} from "./userDetailService.js";

async function createUser(username, email, pass_hash, phone) {
  try {
    const user = await User.create({ username, email, pass_hash, phone });
    // Tạo userDetail cho user mới tạo
    await createUserDetail({ user_id: user.id });
    // tao userFriend cho user mới tạo
    console.log("user id", user.id);
    await Friends.createUserFriend(user.id);

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
      console.warn(
        `Không tìm thấy user với ID: ${id} hoặc không có gì thay đổi`
      );
      return null;
    }

    const updatedUser = await User.findByPk(id);
    return updatedUser;
  } catch (error) {
    console.error(`Lỗi khi cập nhật user [ID: ${id}]:`, error.message);
    throw new Error("Đã xảy ra lỗi khi cập nhật người dùng");
  }
}

async function findUser(id) {
  console.log("user id: ", id, typeof id);

  try {
    const user = await User.findByPk(id, {
      include: [{ model: UserDetail }],
    });
    if (user) {
      return user;
    } else {
      console.log("User not found in userService");
      return null;
    }
  } catch (error) {
    console.log(`Error find user service ${error}`);
    return null;
  }
}
async function authenticate(username, password) {
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error("User not found in userService");
    }

    const isValidPassword = await bcrypt.compare(password, user.pass_hash);
    // const isValidPassword = await bcrypt.compare(hashedPassword, user.pass_hash);;
    if (!isValidPassword) {
      throw new Error("Invalid password in userService");
    }
    return user;
  } catch (error) {
    console.log(`Error authenticate user service ${error}`);
    return null;
  }
}

async function addFriend(userId, friendId) {
  try {
    const friend = await Friends.addFriend({
      user_id: userId,
      friend_id: friendId,
    });
    return friend;
  } catch (error) {
    throw new Error("Lỗi khi thêm bạn bè: " + error.message);
  }
}

export { createUser, updateUser, getAllUSer, findUser, authenticate };
