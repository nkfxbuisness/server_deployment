const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const WithdrawalRequest = require("../models/withdrawalRequestModel");
const Variable = require("../models/variableModel");
const { default: mongoose } = require("mongoose");

/**
 * Route     /api/user/getDashboardDetails/:userId
 * Des       get all dashboard details
 * Params    userId
 * Access    Public
 * Method    get
 */

const getDashboardDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) }, // Start from the given user
      },
      {
        $graphLookup: {
          from: "users", // The collection to search
          startWith: "$_id", // Start from the current user’s ID
          connectFromField: "_id", // Use the user’s _id to connect from
          connectToField: "parent", // Connect to the parent field of children
          as: "descendants", // Output field for the results
          maxDepth: 20, // Limit the search to 20 levels deep
          depthField: "level", // Include the depth level in the results
        },
      },
      {
        $unwind: "$descendants", // Flatten the descendants array
      },
      {
        $match: {
          "descendants._id": { $ne: new mongoose.Types.ObjectId(userId) }, // Exclude the given user
          "descendants.activationStatus.active": true, // Filter out inactive users
          "descendants.activationStatus.suspended": false, // Filter out suspended users
        },
      },
      {
        $group: {
          _id: "$_id", // Group by the user
          totalChildren: { $sum: 1 }, // Count all descendants
          firstLevelChildren: {
            $sum: {
              $cond: [{ $eq: ["$descendants.level", 0] }, 1, 0], // Count only direct children (level 0)
            },
          },
          totalCopyProportion: { $sum: "$descendants.copyProportion" }, // Sum the copyProportion field
        },
      },
      {
        $project: {
          _id: 0, // Omit the _id field from the result
          totalChildren: 1,
          firstLevelChildren: 1,
          totalCopyProportion: 1,
        },
      },
    ]);

    // If result exists, return the calculated data
    if (result.length > 0) {
      const { totalChildren, firstLevelChildren, totalCopyProportion } =
        result[0];
      return res.status(200).json({
        success: true,
        totalChildren,
        firstLevelChildren,
        totalCopyProportion,
      });
    } else {
      // If no descendants match the criteria
      return res.status(200).json({
        success: true,
        totalChildren: 0,
        firstLevelChildren: 0,
        totalCopyProportion: 0,
      });
    }
  } catch (error) {
    console.error("Error calculating children stats:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Route     /api/user/activateAccount/:id
 * Des       login of user
 * Params    none
 * Access    Public
 * Method    POST
 */
const activateAccount = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  const { initialDepositDetails, copyProportion } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Set activationRequestSubmitted to true
    user.activationStatus.activationRequestSubmitted = true;

    // Set registration fee details from req.body
    user.initialDepositDetails = initialDepositDetails;
    user.copyProportion = copyProportion;

    // Calculate depositAmount based on copyProportion
    const depositAmount = 100 * copyProportion;

    // Set deposit data
    const depositData = {
      depositAmount: depositAmount,
      octaDepositReqNo: initialDepositDetails.octaDepositReqNo,
      depositDate: new Date(), // Current date in YYYY-MM-DD format
    };

    // Add the deposit data to the depositData array
    user.depositData.push(depositData);

    // Save the updated user document
    await user.save();
    res.status(200).json({
      success: false,
      data: user, // Include the updated user details in the response
      message:
        "User activation request submitted and deposit data updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Route     /api/user/reactivateAccount/:id
 * Des       activate account once activation request rejected
 * Params    none
 * Access    Public
 * Method    put
 */
const reActiveAccount = async (req, res) => {
  const { id } = req.params; // Get user ID from the URL parameter
  const { initialDepositDetails, copyProportion } = req.body; // Get fields from request body

  try {
    // Update the user document with new field values
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          initialDepositDetails: initialDepositDetails,
          copyProportion: copyProportion,
          "activationStatus.requestRejected": false,
          "activationStatus.rejectionRemarks": "",
          "activationStatus.activationRequestSubmitted": true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Successfully updated
    res.status(200).json({
      success: true,
      message: "User fields updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Route     /api/user/getWalletPageData/:id
 * Des       get wallet balance and all transactions
 * Params    id
 * Access    Protected
 * Method    get
 */
// const getCurrentBalance = async (req, res) => {
//   try {
//     // Get user's initial invested amount (assuming it's stored in the user model)
//     const initialInvestedAmount = user.initialInvestedAmount;

//     // Get the current date and month
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth(); // 0-based index (0 = January, 11 = December)

//     // Get accumulated monthly profit from all previous years up to the month before the current month
//     const monthlyProfit = await MonthlyProfit.aggregate([
//       {
//         $match: {
//           year: { $lt: currentYear } // For all previous years
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$totalProfit" } // Sum up the total profit for all previous years
//         }
//       }
//     ]);

//     // Include profits from the current year up to the month before the current month
//     const currentMonthlyProfit = await MonthlyProfit.aggregate([
//       {
//         $match: {
//           year: currentYear,
//           month: { $lt: currentMonth } // For the months before the current month
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$totalProfit" }
//         }
//       }
//     ]);

//     // Get daily profits from the current month (up to today)
//     const dailyProfit = await Profit.aggregate([
//       {
//         $match: {
//           date: {
//             $gte: new Date(currentYear, currentMonth, 1), // Start from the 1st of the current month
//             $lt: new Date(currentYear, currentMonth, currentDate.getDate() + 1) // Up to today
//           }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$masterProfit" } // Sum the daily profits
//         }
//       }
//     ]);

//     // Calculate the total monthly and daily profit
//     const totalMonthlyProfit = (monthlyProfit[0]?.total || 0) + (currentMonthlyProfit[0]?.total || 0); // Accumulated monthly profit
//     const totalDailyProfit = dailyProfit[0]?.total || 0; // Daily profits up to today

//     // Calculate the current balance
//     const currentBalance = initialInvestedAmount + totalMonthlyProfit + totalDailyProfit;

//     return res.status(200).json({ currentBalance });
//   } catch (error) {
//     console.error("Error calculating current balance:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

/**
 * Route     /api/user/getWalletPageData/:id
 * Des       get wallet balance and all transactions
 * Params    id
 * Access    Protected
 * Method    get
 */

const getWalletPageData = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({ success: false, message: "ID not provided" });
  }

  try {
    const user = await User.findById(id)
      .select("walletBalance withdrawalRequests")
      .populate({
        path: "withdrawalRequests",
        model: "WithdrawalRequest",
      });

    if (!user) {
      return res.json({
        success: false,
        message: "User with this ID not found",
      });
    }

    // Add `debit: true` field to each withdrawal request
    const modifiedWithdrawalRequests = user.withdrawalRequests.map(
      (request) => ({
        ...request.toObject(), // Convert to plain JS object
        debit: true, // Add the debit field
      })
    );

    // Respond with wallet data
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved wallet data",
      walletBalance: user.walletBalance,
      withdrawalRequests: modifiedWithdrawalRequests,
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Route     /api/user/getWithdrawlPageData/:id
 * Des       get all details before posting withdrawal request
 * Params    id
 * Access    Protected
 * Method    get
 */
const getWithdrawlPageData = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({ success: false, message: "id not provided" });
  }
  try {
    const user = await User.findById(id).select(
      "_id name withdrawalRequestSubmitted walletBalance"
    );
    if (!user) {
      return res.json({
        success: false,
        message: "user with this id not found",
      });
    }

    const acceptingWithdrawalRequest = await Variable.findOne({
      key: "acceptingWithdrawalRequests",
    }).select("value");
    return res.status(200).json({
      succcess: true,
      message: "successfully got withdrawl page data",
      acceptingWithdrawalRequests: acceptingWithdrawalRequest.value,
      withdrawalRequestSubmitted: user.withdrawalRequestSubmitted,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Error submitting withdrawal request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
/**
 * Route     /api/user/withdrawalRequest/:id
 * Des       send a new withdrawl request
 * Params    id
 * Access    Protected
 * Method    post
 */
const postWithdrawalRequest = async (req, res) => {
  const { amount } = req.body;
  const { id } = req.params;

  if (!amount || !id) {
    return res.json({
      success: false,
      message: "User ID or amount not provided",
      data: {},
    });
  }

  try {
    const acceptingWithdrawalRequest = await Variable.findOne({
      key: "acceptingWithdrawalRequests",
    }).select("value");
    console.log(acceptingWithdrawalRequest.value);

    if (!acceptingWithdrawalRequest.value) {
      return res.json({
        success: false,
        message: "Admin is not accepting withdrawal requests now",
        data: {},
      });
    }
    const user = await User.findById(id).select(
      "_id name withdrawalRequestSubmitted walletBalance withdrawalRequests"
    );
    if (!user) {
      return res.json({
        success: false,
        message: "User with this ID not found!",
        data: {},
      });
    }

    // Check if a withdrawal request is already submitted
    if (user.withdrawalRequestSubmitted) {
      return res.json({
        success: false,
        message: "Withdrawal request already submitted!",
        data: {},
      });
    }
    if (amount > user.walletBalance) {
      return res.json({
        success: false,
        message: "Entered amount exceeded wallet balance",
        data: {},
      });
    }

    // Create withdrawal request
    const withdrawalRequest = await WithdrawalRequest.create({
      user: id,
      amount: amount,
      date: Date.now(),
    });
    let temp = user.walletBalance;
    user.withdrawalRequestSubmitted = true;
    user.walletBalance = temp - amount;
    user.withdrawalRequests.push(withdrawalRequest._id);
    const updateResult = await user.save();
    console.log(updateResult);

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully!",
      data: withdrawalRequest,
    });
  } catch (error) {
    console.error("Error submitting withdrawal request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Route     /api/user/getImmidiateChildren/:id
 * Des       get immidiate children for referral page
 * Params    id
 * Access    Protected
 * Method    get
 */

const getImmidiateChildren = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.json({ success: false, message: "ID not provided" });
  }
  try {
    const children = await User.find({
      parent: id,
      "activationStatus.active": true,
      "activationStatus.suspended": false,
    }).select("name email activationStatus.activeOn"); // Get direct children with name and email only
    return res.json({ success: true, data: children });
  } catch (error) {
    console.error("Error fetching immidiate children:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Route     /api/user/changePassword/:id
 * Des       change user password
 * Params    none
 * Access    Public
 * Method    POST
 */
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Find the authenticated user
  // const user = await User.findById(req.user._id);
  const user = await User.findById(id);

  // if (user && (await user.matchPassword(currentPassword))) {
  //   // Check if the new password is different from the current password
  //   if (await bcrypt.compare(newPassword, user.password)) {
  //     return res.status(400).json({
  //       message: "New password cannot be the same as the current password.",
  //     });
  //   }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Save the updated user
  await user.save();

  res.json({ message: "Password updated successfully" });
  // } else {
  return res.status(401).json({ message: "Current password incorrect" });
  // }
};

const getChildrenLevelWise = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }, // Match the starting user by ID
      },
      {
        $graphLookup: {
          from: "users", // Collection name
          startWith: "$_id", // Start with the current user's ID
          connectFromField: "_id", // Connect from user ID
          connectToField: "parent", // Connect to parent field
          as: "descendants", // Output array field
          depthField: "level", // Field to store depth level
          maxDepth: 20, // Restrict traversal to 20 levels
          restrictSearchWithMatch: {
            "activationStatus.active": true, // Only active users
            "activationStatus.suspended": { $ne: true }, // Exclude suspended users
          },
        },
      },
      {
        $unwind: "$descendants", // Unwind the descendants array
      },
      {
        $sort: { "descendants.level": 1 }, // Sort by level
      },
      {
        $group: {
          _id: "$descendants.level", // Group by level
          users: {
            $push: {
              name: "$descendants.name", // Include name
              activeOn: "$descendants.activationStatus.activeOn", // Access activeOn from activationStatus
              copyProportion: "$descendants.copyProportion", // Include copyProportion
            },
          },
        },
      },
      {
        $sort: { _id: 1 }, // Sort the groups by level (ascending order)
      },
    ]);

    res.json({ success: true, data: results }); // Send the results as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getTeamDetails = async (req, res) => {
  const { id } = req.params; // id from route params
  try {
    const results = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id), // Match the starting user by ID
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "parent",
          as: "immediateChildren",
        },
      },
      {
        $unwind: "$immediateChildren",
      },
      {
        $match: {
          "immediateChildren.activationStatus.active": true, // Only active immediate children
        },
      },
      {
        $graphLookup: {
          from: "users",
          startWith: "$immediateChildren._id",
          connectFromField: "_id",
          connectToField: "parent",
          as: "descendants",
          depthField: "depth", // Adds a field for the depth of the descendants
          maxDepth: 20, // Limit traversal to 20 levels
          restrictSearchWithMatch: {
            "activationStatus.active": true, // Only active users
            "activationStatus.suspended": { $ne: true }, // Exclude suspended users
          },
        },
      },
      {
        $addFields: {
          "immediateChildren.totalChildren": { $size: "$descendants" }, // Total number of descendants
          "immediateChildren.totalBusiness": {
            $sum: {
              $map: {
                input: "$descendants",
                as: "descendant",
                in: { $multiply: ["$$descendant.copyProportion", 100] }, // Calculate total business
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Hide the top-level _id
          "immediateChildren._id": 1,
          "immediateChildren.name": 1,
          "immediateChildren.mobileNo": 1, // Include contact field
          "immediateChildren.totalChildren": 1,
          "immediateChildren.totalBusiness": 1,
        },
      },
      {
        $group: {
          _id: "$_id", // Group the results for the parent
          immediateChildren: { $push: "$immediateChildren" }, // Collect immediate children info into an array
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: results,
      message: "Team details retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  activateAccount,
  reActiveAccount,
  getDashboardDetails,
  getWalletPageData,
  postWithdrawalRequest,
  getImmidiateChildren,
  changePassword,
  getWithdrawlPageData,
  getChildrenLevelWise,
  getTeamDetails,
};
