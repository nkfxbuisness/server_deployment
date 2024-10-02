const express = require("express");
const {
  accountActivation,
  accountActivationById,
  activationRequestRejectById,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  changeAccessablity,
  profitUpdate,
  getLastProfitEntry,
  getAllWithdrawalRequests,
  downloadInCSVformat,
  updatePaidStatus,
} = require("../controllers/adminControllers");
const { authenticate, authorizeRoles } = require("../middleware/accessablityMidddleWare");
const { addVariable, getVariable, updateVariable } = require("../controllers/variableControllers");
const Router = express.Router();

Router.get("/accountActivation",authenticate, authorizeRoles(['superAdmin','accountActivation']), accountActivation);
Router.put("/accountActivation/:id",authenticate, authorizeRoles(['superAdmin']), accountActivationById);
Router.put("/activationRequestReject/:id",authenticate, authorizeRoles(['superAdmin']), activationRequestRejectById);
Router.get("/getAllAdmins",authenticate, authorizeRoles(['superAdmin']),  getAllAdmins);
Router.post("/createAdmin",authenticate, authorizeRoles(['superAdmin']),  createAdmin);
Router.put("/changeAccessablity/:id",authenticate, authorizeRoles(['superAdmin']),  changeAccessablity);
Router.delete("/deleteAdmin/:id",authenticate, authorizeRoles(['superAdmin']),  deleteAdmin);
Router.get("/getLastProfitEntry",authenticate, authorizeRoles(['superAdmin']),  getLastProfitEntry);
Router.post("/profitUpdate",authenticate, authorizeRoles(['superAdmin']),  profitUpdate);
Router.get("/getAllWithdrawalRequests",authenticate, authorizeRoles(['superAdmin']),getAllWithdrawalRequests  );
Router.post("/download-pending-requests",authenticate, authorizeRoles(['superAdmin']),downloadInCSVformat  );
Router.put("/update-paid-status",authenticate, authorizeRoles(['superAdmin']),updatePaidStatus  );
Router.post("/addVariable",addVariable  );
Router.get("/getVariable/:key",getVariable  );
Router.put("/updateVariable/:key",updateVariable  );


module.exports = Router;
