import {
  createUserDetail as _createUserDetail,
  getAllUserDetails,
  updateUserDetail,
  findUserDetailByUserId,
} from "../services/userDetailService.js";

import { v4 as uuidv4 } from "uuid";
import S3 from "../configs/configS3.js";

const createUserDetail = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    if (!req.body.user_id) {
      console.error("Missing user_id in request body");
      return res.status(400).json({ message: "user_id is required" });
    }

    const userDetailData = {
      user_id: req.body.user_id,
      fullname: req.body.fullname,
      age: req.body.age,
      gender: req.body.gender,
      avatar_url: req.body.avatar_url,
    };

    console.log("Constructed userDetailData:", userDetailData);

    if (!Number.isInteger(userDetailData.age) || userDetailData.age <= 0) {
      console.error("Invalid age: age must be a positive integer");
      return res.status(400).json({ message: "Invalid age: age must be a positive integer" });
    }

    // Gọi service
    const userDetail = await _createUserDetail(userDetailData);

    console.log("Service returned userDetail:", userDetail);

    res.status(200).json({
      message: "create userdetail successfully",
      userDetail: userDetail,
    });
  } catch (err) {
    console.error("Error in createUserDetail controller:", err);
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
const getUserDetailByUserId = async (req, res) => {
  const { id } = req.params;
  console.log("Received user ID:", id);

  if (!id) {
    console.error("User ID is missing in the request parameters.");
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const result = await findUserDetailByUserId(id);

    if (!result) {
      console.error(`No user detail found for ID: ${id}`);
      return res.status(404).json({ message: "User detail not found." });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching user detail by ID:", err);
    res.status(500).json({ message: "Error fetching user detail.", error: err.message });

  }
};
const updateUserDetails = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const userDetailData = req.body;

    if (req.file) {
      const image = req.file.originalname.split(".");
      const fileType = image[image.length - 1];
      const filePath = `${uuidv4()}.${fileType}`;

      const params = {
        Bucket: "chatappnhom8",
        Key: filePath,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadedImg = await S3.upload(params).promise();
      userDetailData.avatar_url = uploadedImg.Location;
    }

    // Gọi service update
    const updatedUserDetail = await updateUserDetail(user_id, userDetailData);

    res.status(200).json({
      message: "Cập nhật người dùng thành công!",
      userDetail: updatedUserDetail,
    });
  } catch (err) {
    console.error("Lỗi cập nhật người dùng:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export default {
  createUserDetail,
  getAllUserDetail,
  updateUserDetails,
  getUserDetailByUserId,
};
