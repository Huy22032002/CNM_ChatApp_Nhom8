import path from "path";

export const checkFileType = (file, cb) => {
  const fileTypes = /jpeg|png|gif|jpg/;
  //kiem tra file co duoi khop nhu yeu cau
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  //kiem tra loai file thong qua myimetype
  const mimitype = fileTypes.test(file.mimetype);

  if (extname && mimitype) {
    return cb(null, true);
  }
  return cb("Err: Image only");
};
