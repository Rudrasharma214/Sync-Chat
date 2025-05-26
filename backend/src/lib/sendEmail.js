import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ya SMTP config
    auth: {
      user: "rudraspam90@gmail.com",
      pass: "fjoncpwapvbyrkcc",
    },
  });

  const mailOptions = {
    from: "rudraspam90@gmail.com",
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
