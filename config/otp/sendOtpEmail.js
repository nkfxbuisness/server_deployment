const nodemailer = require('nodemailer');

// Function to send email
const sendOtpEmail = (email, otp) => {
  console.log("email",email);
  console.log("OTP",otp);
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like SendGrid, etc.
    auth: {
      user: 'nkfxbuisness@gmail.com',
      pass: process.env.app_password,
    },
  });

  const mailOptions = {
    from: 'nkfxbuisness@gmail.com',
    to: email,
    subject: 'OTP for Email Verification || Revenue Distribution',
    text: `Your OTP code is: ${otp}. Please use this code to verify your email.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
module.exports = sendOtpEmail;