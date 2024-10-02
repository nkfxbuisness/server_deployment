const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  moblieNo: { type: Number, required: false },
  email: { type: String, required: true },
  roles: {
    type: [String], // Array of strings
    enum: ["accountActivation","withdrawRequest","profitUpdate","updateDiposite","ComissionDistribution","createAdmin","superAdmin"], // Allowed values
    required: true,
  },
  isSuperAdmin: { type: Boolean, required: false },
},{timestamps:true});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
