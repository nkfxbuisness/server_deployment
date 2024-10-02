const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  referral:Joi.string().required(),
  mobileNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(), // Assuming a 10-digit mobile number
  DOB: Joi.date()
  .min(new Date(new Date().setFullYear(new Date().getFullYear() - 100))) // Max age 100
  .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18))) // Min age 18
  .required(),
  address: Joi.string().required(),
  accountNo: Joi.string().pattern(/^[0-9]+$/).min(11).max(17).required(), // Account number as a string to accommodate varying lengths
  IFSCcode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(), // IFSC code pattern for Indian banks
  bank: Joi.string().required(),
  PANno: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(), // PAN number pattern for India
  aadhaarNo: Joi.string().length(12).pattern(/^[0-9]+$/).required(), // Assuming a 12-digit Aadhaar number
  password: Joi.string()
  // .min(5)
  // .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9]).{5,}$'))
  .required()
  // .messages({
  //   'string.min': 'Password should have a minimum of 5 characters',
  //   'string.pattern.base': 'Password should contain at least 1 uppercase letter and 1 number',
  //   'any.required': 'Password is required'
  // }),
  ,
  confPassword: Joi.any().valid(Joi.ref('password')).required().messages({'any.only': 'Passwords must match'}), // Confirm password field
  // copyProportion: Joi.number().required().default(1),
  // referral: Joi.string().required(),
});

module.exports = userSchema