import {
  createUserDetail as _createUserDetail,
  getAllUserDetails,
  updateUserDetail,
} from "../services/userDetailService.js";

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
    const userDetail = await _createUserDetail(userDetailData);

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

const getAllUserDetail = async (req, res) => {
  try {
    const result = await getAllUserDetails();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(`err getAllUserDetail Controller ${err}`);
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const userDetailData = req.body;

    const updatedUserDetail = await updateUserDetail(user_id, userDetailData);

    res.status(200).json({
      message: "User detail updated successfully",
      userDetail: updatedUserDetail,
    });
  } catch (err) {
    res.status(500).json(`err update userdetail controller ${err}`);
  }
};

export default { createUserDetail, getAllUserDetail, updateUserDetails };
