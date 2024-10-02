const generateOtp = require("../config/otp/generateOtp ");
const sendOtpEmail = require("../config/otp/sendOtpEmail");
const Otp = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const generateOTP = async (req, res) => {
  const { email } = req.body;

  // Generate OTP
  const otp = generateOtp();
  console.log(otp);

  // Hash the OTP
  const saltRounds = 10;
  const hashedOtp = await bcrypt.hash(otp.toString(), saltRounds);

  const duplicate = await Otp.find({ email: email });
  // Store hashed OTP in the database with the user's email
  console.log(duplicate)
  if (duplicate.length>0) {
    return res.json({
      success: false,
      message: "try after some time",
    });
  }
  await Otp.create({
    email: email,
    otp: hashedOtp,
    createdAt: Date.now(), // You can use this to later expire OTPs
  });

  // Send OTP via email
  sendOtpEmail(email, otp);

  res.status(200).json({ success: true, message: "OTP sent to your email!" });
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp);
  if (!email || !otp) {
    return res.json({
      success: false,
      message: "no email or OTP provided !",
    });
  }
  try {
    // Fetch the stored hashed OTP from the database
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.json({
        success: false,
        message: "invalid OTP : reenter correct OTP.",
      });
    }

    // Compare the provided OTP with the stored hashed OTP
    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);

    if (isMatch) {
      // OTP is valid
      res
        .status(200)
        .json({ success: true, message: "OTP verified successfully." });

      // Optionally, delete the OTP from the database after successful verification
      await Otp.deleteOne({ email });
    } else {
      // OTP is invalid
      res.json({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to verify OTP. Please try again later.",
      });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate new OTP
    const newOtp = generateOtp();

    // Hash the new OTP
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(newOtp.toString(), saltRounds);

    // Check if an OTP already exists for this email
    let otpRecord = await Otp.findOne({ email });

    if (otpRecord) {
      // If an OTP exists, update it with the new hashed OTP
      otpRecord.otp = hashedOtp;
      otpRecord.createdAt = Date.now(); // Reset the creation time
      await otpRecord.save();
    } else {
      // If no OTP exists, create a new record
      await Otp.create({
        email: email,
        otp: hashedOtp,
        createdAt: Date.now(),
      });
    }

    // Send the new OTP via email
    await sendOtpEmail(email, newOtp); // This sends the plain OTP to the user's email

    res.status(200).json({ success:true,message: "OTP resent successfully to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res
      .status(500)
      .json({ message: "Failed to resend OTP. Please try again later." });
  }
};

const verifyReferralCode = async (req, res) => {
  console.log("h");

  const { referralCode } = req.body;
  if (!referralCode) {
    return res.json({
      success: false,
      message: "referralCode not provided!!",
    });
  }
  try {
    const referrer = await User.findOne({ referralCode:referralCode });
    console.log(referrer);
    
    if (!referrer) {
      return res.json({
        success: false,
        message: "invalid referralCode !!",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Valid referral code : issued by ${referrer.name}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to verify referral code" });
  }
};

module.exports = { generateOTP, verifyOTP, resendOTP, verifyReferralCode };
