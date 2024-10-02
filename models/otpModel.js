const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Expires in 5 minutes
  isVerified: { type: Boolean, default: false },
});

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;