const UserDetail = require("../models/userDetail");

const createUserDetail = async (userDetailData) => {
  try {
    return await UserDetail.create(userDetailData);
  } catch (err) {
    throw new Error(`Err Creating UserDetail service: ${err}`);
  }
};

module.exports = { createUserDetail };
