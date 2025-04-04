const UserDetailService = require("../services/userDetailService");

const createUserDetail = async (req, res) => {
  try {
    const userDetailData = {
      user_id: req.body.user_id,
      fullname: req.body.fullname,
      age: req.body.age,
      gender: req.body.gender,
      avatar_url: req.body.avatar_url,
    };
    //goi service
    const userDetail = await UserDetailService.createUserDetail(userDetailData);

    res.status(200).json({
      message: "create userdetail successfully",
      userDetail: userDetail,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "error creating user detail", error: `${err.message}` });
  }
};

module.exports = { createUserDetail };
