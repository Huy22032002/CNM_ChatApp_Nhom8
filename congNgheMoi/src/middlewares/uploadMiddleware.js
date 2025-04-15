import multer from "multer"; //midlleware chp viec upload anh, pdf
import { checkFileType } from "../utils/fileUtils.js";

//tao bộ nhớ (lưu tạm vào RAM)
const storage = multer.memoryStorage({
  //dùng để lưu vào local, nhưng vì lưu ở S3 nên callback null
  destination(req, file, callback) {
    callback(null, "");
  },
});

//tạo middlewware
export const upload = multer({
  storage,
  limits: { fileSize: 20000000 }, //20MB
  //filter để check trước khi upload
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});
