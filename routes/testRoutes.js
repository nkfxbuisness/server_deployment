const express = require('express');
const router = express.Router();
const { authenticate ,authorizeRoles } = require('../middleware/accessablityMidddleWare');
const {test1,test2}=require("../controllers/testControllers")

// Route accessible by users only
router.get('/test1', authenticate, authorizeRoles(['user']), test1);

// Route accessible by admins only
router.get('/test2', authenticate, authorizeRoles(["superAdmin","accountActivation"]), test2);

// // Route accessible by superadmins only
// router.get('/test3', authenticate, authorizeRoles(['superadmin']), (req, res) => {
//   res.send('Welcome to the superadmin dashboard!');
// })

module.exports = router