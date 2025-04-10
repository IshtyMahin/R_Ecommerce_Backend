import nodemailer from "nodemailer";
import config from "../config";

const sendMail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.email_user,
      pass: config.email_password,
    },
  });

  await transporter.sendMail({
    from: "website name 😎", 
    to, 
    subject, 
    text: "Hello world?", 
    html,
  });
};

export default sendMail;