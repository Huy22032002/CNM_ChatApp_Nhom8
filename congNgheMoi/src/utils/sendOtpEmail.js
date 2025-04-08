import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // dùng app password nếu là Gmail
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Mã OTP của bạn là: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendOtpEmail;
