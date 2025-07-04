import UserBalance from "../models/user.balance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dayjs from "dayjs";
const addBalance = async (req, res) => {
  const userId = req.user._id;
  const { amount, date, cost } = req.body;
  const addedDate = date ? new Date(date) : new Date();
  const costValue = cost ? Number(cost) : 0;
  const amountValue = amount ? Number(amount) : 0;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userBalance = await UserBalance.findOneAndUpdate(
      {
        userId,
      },
      {
        $inc: {
          addBalance: amount,
          totalBalance: amountValue,
          totalCost: costValue,
          currentBalance: amountValue - costValue,
        },
        addDate: addedDate,
      },
      {
        new: true,
        upsert: true,
      }
    );
    const responseBalance = userBalance.toObject();
    responseBalance.addBalance = amountValue;

    return res.status(200).json({
      message: "Funds added successfully",
      userBalance: responseBalance,
    });
  } catch (error) {
    console.error("Error adding funds:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getBalance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userAmount = await UserBalance.find({
    userId: userId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, userAmount, "Balanace fetched successuly"));
});
const getAlluserCurrentBalanceCurrentMonth = asyncHandler(async (req, res) => {
  try {
    const month = req.query.month || dayjs().format("YYYY-MM");
    const startOfMonth = dayjs(month).startOf("month").toDate();
    const endOfMonth = dayjs(month).endOf("month").toDate();
    const currentBalance = await UserBalance.aggregate([
      {
        $match: {
          addDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group:{
          _id:null,
          totalCurrentBalance: { $sum: "$currentBalance" },
        }
      },
    ]);
    const totalCurrentBalance = currentBalance[0]?.totalCurrentBalance || 0;
    return res.status(200).json({ totalCurrentBalance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error Balance Data",
      error: error.message,
      stack: error.stack,
    });
  }
});
export { addBalance, getBalance,getAlluserCurrentBalanceCurrentMonth };
