const User = require("../models/userModel");
const generateToken = require("../config/token/generateToken");
const generateReferralCode = require("../config/referral/generateReferralCode");
const Admin = require("../models/adminModel");
const { default: mongoose } = require("mongoose");
const userSchema = require("../config/dataValidation/signupData");

/**
 * Route     /api/auth/user/login
 * Des       login of user
 * Params    none
 * Access    Public
 * Method    POST
 */
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "credentials not provideded !!",
    });
  }
  console.log(password);
  
  try {
    let user = await User.findOne({ email: email });
    // console.log("user", user);

    if (user && (await user.matchPassword(password))) {
      user=user.toObject();
      delete user.password;
      const userWithoutPassword = user;
      console.log(userWithoutPassword);
      return res.status(200).json({
        success: true,
        message: "login successful !",
        user: userWithoutPassword,
        token: generateToken(userWithoutPassword),
      })
    }else{
      return res.json({
        success: false,
        message: "Invalid credentials, please try again",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Route     /api/auth/user/signup
 * Des       user registration
 * Params    none
 * Access    Public
 * Method    POST
 */

const userSignup = async (req, res) => {
  const {
    name,
    email,
    mobileNo,
    DOB,
    address,
    accountNo,
    IFSCcode,
    bank,
    PANno,
    aadhaarNo,
    password,
    confPassword,
    referral,
  } = req.body;
  console.log("body", req.body);

  // Validate input
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.json({
      success: false,
      message: error.details[0].message,
    });
  }

  if (password !== confPassword) {
    return res.json({
      success: false,
      message: "Passwords do not match!",
    });
  }
  const user = await User.findOne({ email: email, mobileNo: mobileNo });
  if (user) {
    return res.json({
      success: false,
      message: "User with this email or mobile number already exists",
    });
  }

  let path = "";

  const parent = await User.findOne({ referralCode: referral }).select(
    "_id path"
  );
  console.log("parent1", parent);

  const isEmpty = (await User.countDocuments()) === 0;
  if (isEmpty) {
    console.log(" adding root user");
  }
  if (parent) {
    path = `${parent.path}`; // initially inherit the parent's path
  } else {
    if (!isEmpty) {
      return res.json({
        success: false,
        message: "invalid referral",
      });
    }
  }

  const referralCode = await generateReferralCode(name.split(" ")[0]);

  const newUser = await new User({
    name,
    email,
    mobileNo,
    DOB,
    address,
    accountNo,
    IFSCcode,
    bank,
    PANno,
    aadhaarNo,
    password,
    referralCode: referralCode,
    parent: parent?._id,
    path: path,
  });
  await newUser.save();
  console.log("path1", newUser.path);

  if (parent) {
    newUser.path = `${parent.path}.${newUser._id}`;
  } else {
    newUser.path = `${newUser._id}`;
  }
  await newUser.save(); // Save again to store the updated path
  console.log("path2", newUser.path);

  if (newUser) {
    res.status(201).json({
      success: true,
      data: newUser,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Failed to craeate user !",
    });
  }
};

/**
 * Route     /api/auth/admin/signup
 * Des       admin creation
 * Params    none
 * Access    Public
 * Method    POST
 */
const adminSignup = async (req, res) => {
  const { name, email, roles, password } = req.body;

  if ((!name, !email, !roles, !password)) {
    return res.status(400).json({
      success: false,
      message: "All fields are required !",
    });
  }

  const admin = await Admin.findOne({ email: email });
  if (admin) {
    return res.status(400).json({
      success: false,
      message: "Admin with this email already exists",
    });
  }

  const newAdmin = await Admin.create({
    name,
    email,
    password,
    roles,
  });
  console.log("newAdmin", newAdmin);

  if (newAdmin) {
    res.status(201).json({
      success: true,
      data: newAdmin,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Failed to craeate user !",
    });
  }
};

/**
 * Route     /api/auth/admin/login
 * Des       admin login
 * Params    none
 * Access    Public
 * Method    POST
 */
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "credentials not provideded !!",
    });
  }

  let admin = await Admin.findOne({ email: email });
  if (admin && (await admin.matchPassword(password))) {
    // Convert the user document to a plain object and remove the password field
    admin = admin.toObject();
    delete admin.password;
    console.log("adminWithoutpassword", admin);

    const newAdmin = admin;
    return res.status(200).json({
      message: "login successful !",
      admin: newAdmin,
      token: generateToken(newAdmin),
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "invalid credentials !!",
    });
  }
};
module.exports = { userLogin, userSignup, adminSignup, adminLogin };
