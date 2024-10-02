const User = require("../models/userModel");
const Admin = require("../models/adminModel");

const test1 = (req, res) => {
    res.send('User');
}
const test2 = (req, res) => {
    res.send('Admin');
}

module.exports = {test1,test2}