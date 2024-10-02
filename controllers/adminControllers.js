const {
  compareDates,
  hasDateExceededToday,
} = require("../config/dates/compareDates");
const fs = require("fs");
const moment = require("moment");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const Admin = require("../models/adminModel");
const Profit = require("../models/profitModel");
const User = require("../models/userModel");
const WithdrawalRequest = require("../models/withdrawalRequestModel");
const Variable = require("../models/variableModel");

// Utility function to format the date
function getFormattedDate(date) {
  return moment(date).format("YYYY-MM-DD"); // Format as desired
}

/**
 * Route     /api/admin/accountActivation
 * Des       get list of non active users
 * Params    none
 * Access    Public
 * Method    get
 */
const accountActivation = async (req, res) => {
  try {
    const users = await User.find({
      'activationStatus.active': false,                
      'activationStatus.activationRequestSubmitted': true  
    });

    return res.status(200).json({
      success: true,
      message: "Users with pending activation requests",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Route     /api/admin/accountActivation/:id
 * Des       activate a user by id
 * Params    none
 * Access    Public
 * Method    put
 */
const accountActivationById = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          'activationStatus.active': true,           
          'activationStatus.activeOn': new Date()    
        } 
      },
      { new: true, runValidators: true }  
    );
    if (!updatedUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User activated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * Route     /api/admin/activationRequestReject/:id
 * Des       activation request reject
 * Params    none
 * Access    Public
 * Method    put
 */
const activationRequestRejectById = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          'activationStatus.requestRejected': true,
          'activationStatus.rejectionRemarks': remarks,
        },
      },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: `rejected activation request for ${updatedUser.name}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Route     /api/admin/createAdmin/
 * Des       add a admin with specefic accessablity
 * Params    none
 * Access    private
 * Method    post
 */

const createAdmin = async (req, res) => {
  const { name, password, mobileNo, email, roles } = req.body;
  if (!name || !password || !roles || !email) {
    return res.status(400).json({
      success: false,
      message: "mandatory fields not provided !!",
    });
  }

  try {
    const newAdmin = new Admin({
      name,
      password,
      mobileNo,
      email,
      roles,
      isSuperAdmin: roles.includes("superAdmin"),
    });

    // Saving the new admin to the database
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Error creating admin", error });
  }
};

/**
 * Route     /api/admin/getAllAdmins/
 * Des       get all existing admins
 * Params    none
 * Access    private
 * Method    get
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ isSuperAdmin: false });
    return res.status(200).json({
      success: true,
      message: "all admins except superadmin",
      data: admins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Route     /api/admin/changeAccessablity/:id
 * Des       change accessiblity for an admin
 * Params    none
 * Access    private
 * Method    put
 */

const changeAccessablity = async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { $set: { roles: roles } },
      { new: true, runValidators: true }
    );
    if (!updatedAdmin) {
      return res.status(400).json({
        success: false,
        message: "Failed to update admin accessiblity",
      });
    }
    return res.status(200).json({
      success: true,
      message: `accessiblity updated for ${updatedAdmin.name}`,
      data: updatedAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Route     /api/admin/deleteAdmin/:id
 * Des       delete an an admin
 * Params    none
 * Access    private
 * Method    delete
 */

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: `Admin ${deleteAdmin.name} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Route     /api/admin/getLastProfitEntry
 * Des       get the last profit entry
 * Params    none
 * Access    private
 * Method    get
 */

const getLastProfitEntry = async (req, res) => {
  try {
    const lastEntry = await Profit.findOne().sort({ createdAt: -1 });
    // console.log(lastEntry);
    if (!lastEntry) {
      return res.status(400).json({
        success: false,
        message: "last entry not found",
        data: {},
      });
    }
    return res.status(200).json({
      success: true,
      message: `the last entry is on ${lastEntry.date}`,
      data: lastEntry,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Route     /api/admin/profitUpdate
 * Des       update daily profit
 * Params    none
 * Access    private
 * Method    post
 */

const profitUpdate = async (req, res) => {
  const { date, profit } = req.body;
  console.log(date);

  if (!date || !profit) {
    return res.status(400).json({
      success: false,
      message: "Date and profit are required.",
      data: {},
    });
  }
  if (hasDateExceededToday(date)) {
    return res.json({
      success: false,
      message: "profit cannot be updated for day after today   !",
    });
  }
  try {
    const lastEntry = await Profit.findOne().sort({ createdAt: -1 });
    // console.log(lastEntry);

    if (!lastEntry) {
      const todaysProfit = await Profit.create({
        masterProfit: profit,
        date: date,
      });
      console.log(todaysProfit);

      return res.status(200).json({
        success: true,
        message: `profit updated for ${date}`,
        data: todaysProfit,
      });
    } else if (!compareDates(date, lastEntry.date)) {
      const todaysProfit = await Profit.create({
        masterProfit: profit,
        date: date,
      });
      console.log(todaysProfit);

      return res.status(200).json({
        success: true,
        message: `profit updated for ${date}`,
        data: todaysProfit,
      });
    } else if (compareDates(date, lastEntry.date)) {
      console.log("case 3");

      return res.status(200).json({
        success: false,
        message: `profit already been updated for ${date}`,
        data: {},
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Route     /api/admin/getAllWithdrawalRequests
 * Des       get All Withdrawal Requests that are not paid yet
 * Params    none
 * Access    private
 * Method    get
 */

const getAllWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({ paid: false }).populate(
      "user",
      "name mobileNo accountNo IFSCcode bank activationStatus"
    );

    // Filter out requests where the user is suspended
    const filteredRequests = requests.filter(
      (request) => request.user && !request.user.activationStatus.suspended
    );

    return res.status(200).json({
      success: true,
      message: "withdrawal requests featched successfully",
      data: filteredRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Route     /api/admin/download-pending-requests
 * Des       download all pending requests in CSV format
 * Params    none
 * Access    private
 * Method    post
 */

const downloadInCSVformat = async (req, res) => {
  try {
    // Get pendingRequests data from the request body
    const { pendingRequests } = req.body;

    if (!pendingRequests || !pendingRequests.length) {
      return res.json({
        success: false,
        message: "No pending requests provided",
      });
    }

    // Define the path and filename for the CSV
    const filePath = "pending_requests.csv";

    // Prepare data for CSV
    const csvData = pendingRequests.map((request, index) => ({
      No: index + 1,
      Name: request.user.name,
      "Account Number": `="${request.user.accountNo}"`, // Format account number to avoid scientific notation
      "IFSC Code": request.user.IFSCcode,
      Bank: request.user.bank,
      Date: getFormattedDate(request.date),
      Amount: request.amount,
    }));

    // Define the structure of the CSV
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: "No", title: "No." },
        { id: "Name", title: "Name" },
        { id: "Account Number", title: "Account Number" },
        { id: "IFSC Code", title: "IFSC Code" },
        { id: "Bank", title: "Bank" },
        { id: "Date", title: "Date" },
        { id: "Amount", title: "Amount" },
      ],
      alwaysQuote: false, // Ensure fields are not always quoted
    });

    // Write data to CSV
    await csvWriter.writeRecords(csvData);

    // Set headers for the response to prompt a download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filePath}"`);

    // Stream the file to the response
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Error generating CSV file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Route     /api/admin/update-paid-status
 * Des       update as paid to all pending requests
 * Params    none
 * Access    private
 * Method    put
 */

const updatePaidStatus = async (req, res) => {
  const { ids } = req.body; // Array of withdrawal request IDs

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No IDs provided or invalid data format",
    });
  }

  try {
    // First, find all the withdrawal requests to get their associated users
    const requests = await WithdrawalRequest.find({ _id: { $in: ids } })
      .select("user")
      .lean(); // Use .lean() to return plain JavaScript objects for performance

    const userIds = [...new Set(requests.map((req) => req.user.toString()))]; // Get unique user IDs

    // Create bulk operations for withdrawal requests
    const bulkWithdrawals = ids.map((id) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { paid: true, paidOn: new Date() } },
      },
    }));

    // Create bulk operations for user updates
    const bulkUsers = userIds.map((userId) => ({
      updateOne: {
        filter: { _id: userId },
        update: { $set: { withdrawalRequestSubmitted: false } },
      },
    }));

    // Perform bulk write for both withdrawal requests and users
    const [withdrawalResult, userResult] = await Promise.all([
      WithdrawalRequest.bulkWrite(bulkWithdrawals),
      User.bulkWrite(bulkUsers),
    ]);

    res.status(200).json({
      success: true,
      message: `Successfully updated ${withdrawalResult.modifiedCount} withdrawal requests and ${userResult.modifiedCount} users.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating records",
      error: error.message,
    });
  }
};

module.exports = {
  accountActivation,
  accountActivationById,
  activationRequestRejectById,
  createAdmin,
  getAllAdmins,
  changeAccessablity,
  deleteAdmin,
  getLastProfitEntry,
  profitUpdate,
  getAllWithdrawalRequests,
  downloadInCSVformat,
  updatePaidStatus,
};
