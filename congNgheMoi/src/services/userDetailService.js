import UserDetail from "../models/userDetail.js";
import User from "../models/userModel.js";

const createUserDetail = async (userDetailData) => {
  try {
    // Kiểm tra user_id có tồn tại trong bảng User
    console.log("Checking if user_id exists in User table:", userDetailData.user_id);
    const userExists = await User.findByPk(userDetailData.user_id);
    if (!userExists) {
      console.error("User ID không tồn tại trong bảng User:", userDetailData.user_id);
      throw new Error("User ID không tồn tại trong bảng User");
    }

    // Kiểm tra dữ liệu đầu vào
    if (!userDetailData.fullname || typeof userDetailData.fullname !== 'string') {
      throw new Error("Invalid fullname: fullname is required and must be a string");
    }
    if (!Number.isInteger(userDetailData.age) || userDetailData.age <= 0) {
      throw new Error("Invalid age: age must be a positive integer");
    }
    if (typeof userDetailData.gender !== 'boolean') {
      throw new Error("Invalid gender: gender must be a boolean");
    }
    if (userDetailData.avatar_url && typeof userDetailData.avatar_url !== 'string') {
      throw new Error("Invalid avatar_url: avatar_url must be a string");
    }

    console.log("User ID exists. Proceeding to create UserDetail.");
    return await UserDetail.create(userDetailData);
  } catch (err) {
    console.error("Error in createUserDetail service:", err);
    throw new Error(`Err Creating UserDetail service: ${err.message}`);
  }
};
const updateUserDetail = async (user_id, userDetailData) => {
  try {
    const [updated] = await UserDetail.update(userDetailData, {
      where: { user_id },
    });

    if (updated === 0) {
      throw new Error("Không tìm thấy hoặc không có dữ liệu để cập nhật");
    }

    return await UserDetail.findOne({ where: { user_id } });
  } catch (err) {
    console.log(`Error update user detail service ${err}`);
    throw new Error("err update user detail");
  }
};

const getAllUserDetails = async () => {
  try {
    return await UserDetail.findAll();
  } catch (err) {
    throw new Error(`Error get all user details serice ${err}`);
  }
};
const findUserDetailByUserId = async (id) => {
  try {
    return await UserDetail.findByPk(id);
  } catch (err) {
    throw new Error(`Error get user details by id serice ${err}`);
  }
};

export {
  createUserDetail,
  getAllUserDetails,
  updateUserDetail,
  findUserDetailByUserId,
};
