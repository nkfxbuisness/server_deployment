const crypto = require('crypto');
// Import your User model
const User = require('../../models/userModel'); 

// Function to generate a random 6-character alphanumeric string
const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length).replace(/[^a-zA-Z0-9]/g, '');
};

// Function to generate Referral code 
const generateReferralCode = async (firstName) => {
  console.log(firstName)
  let code;
  let unique = false;

  while (!unique) {
    // Create a new referral code starting with the first name and followed by a 6-character string
    const randomString = generateRandomString(6).toUpperCase();
    code = `${firstName.toUpperCase()}${randomString}`;

    // Check if the code already exists in the database
    const existingUser = await User.findOne({ referralCode: code });

    if (!existingUser) {
      unique = true;
    }
  }

  return code;
};

module.exports = generateReferralCode ;