const rateLimit = require('express-rate-limit');
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 OTP requests per `window` (here, per 10 minutes)
  message:
    "Too many OTP requests from this IP, please try again after 10 minutes.",
  headers: true, // Show rate limit info in response headers
});

module.exports = otpRequestLimiter;
