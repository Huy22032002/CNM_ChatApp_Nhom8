import multer from "multer";
import path from "path";
import { checkFileType } from "../utils/fileUtils.js";

const storage = multer.memoryStorage({
  destination(req, file, callback) {
    callback(null, "");
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});
