
// Generate numeric OTP using otp-generator
const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  return otp.toString(); // Returns the OTP as a string
};

module.exports = generateOtp ;