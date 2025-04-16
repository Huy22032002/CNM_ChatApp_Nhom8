import path from "path";

export const checkFileType = (file, cb) => {
  const fileTypes = /jpeg|png|gif|jpg|pdf|docx|txt/; // Added support for pdf, docx, and txt files
  // Check file extension
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check file mimetype
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  return cb("Err: Unsupported file type");
};
