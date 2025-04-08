import UserDetail from "../models/userDetail.js";
import User from "../models/userModel.js";

const createUserDetail = async (userDetailData) => {
  try {
    return await UserDetail.create(userDetailData);
  } catch (err) {
    throw new Error(`Err Creating UserDetail service: ${err}`);
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
