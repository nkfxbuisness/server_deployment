const express = require('express')
const Router = express.Router()
const {userLogin,userSignup, adminSignup, adminLogin} =require('../controllers/authControllers')
const { generateOTP, verifyOTP, resendOTP, verifyReferralCode } = require('../controllers/authOTPcontrollers')
const otpRequestLimiter = require('../config/otp/otpRequestLimiter ')

// auth routes 
Router.post('/user/login',userLogin)
Router.post('/user/signup',userSignup)
Router.post('/admin/login',adminLogin)
Router.post('/admin/signup',adminSignup)

// auth OTP routes
Router.post('/user/signup/generateOTP',otpRequestLimiter,generateOTP)
Router.post('/user/signup/verifyOTP',verifyOTP)
Router.post('/user/signup/resendOTP',resendOTP)

Router.post('/user/signup/verifyReferralCode',verifyReferralCode)

module.exports = Router