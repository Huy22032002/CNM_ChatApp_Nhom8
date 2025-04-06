import UserDetail from "../models/userDetail.js";

const createUserDetail = async (userDetailData) => {
  try {
    return await UserDetail.create(userDetailData);
  } catch (err) {
    throw new Error(`Err Creating UserDetail service: ${err}`);
  }
};

export { createUserDetail };
