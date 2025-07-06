import UserBalance from "../models/user.balance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserMealSelection } from "../models/usermealselection.model.js";
import { MonthlySummary } from "../models/monthlysummery.model.js";
import dayjs from "dayjs";
import { getBazarlistSummary } from "../Services/bazalist.service.js";
import { PendingDeposit } from "../models/pendingdeposit.model.js";
import sendEmail from "../utils/sendEmail.js";
import {User} from "../models/user.model.js"
const addBalance = async (req, res) => {
  const month = req.query.month || dayjs().format("YYYY-MM");
  const startOfMonth = dayjs(month).startOf('month').toDate();
  const endOfMonth = dayjs(month).endOf('month').toDate();

  const userId = req.user._id;
  const { amount,date } = req.body;
  // const amountValue = Number(amount) || 0;
  const addedDate = date ? new Date(date) : new Date();
  const amountValue = amount ? Number(amount) : 0;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

    try {
    const pendingDeposit = new PendingDeposit({
      userId,
      amount: amountValue,
      date: addedDate,
      status: 'pending'
    });

    await pendingDeposit.save();

    return res.status(200).json({
      message: "Deposit added as pending. Awaiting manager approval.",
      pendingDeposit
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};


const approvePendingDeposit = async (req, res) => {
  const { depositId } = req.params;

  try {
    const pendingDeposit = await PendingDeposit.findById(depositId);
    if (!pendingDeposit) return res.status(404).json({ message: "Pending deposit not found." });
    if (pendingDeposit.status !== 'pending') return res.status(400).json({ message: "Already processed." });

    pendingDeposit.status = 'approved';
    await pendingDeposit.save();

    const userId = pendingDeposit.userId;
    const amountValue = pendingDeposit.amount;

    // --- Your existing balance calculation logic can be moved here ---
    const month = dayjs(pendingDeposit.date).format("YYYY-MM");
    const startOfMonth = dayjs(month).startOf('month').toDate();
    const endOfMonth = dayjs(month).endOf('month').toDate();

    const { totalAmount, totalBazar } = await getBazarlistSummary(month);

    const MealWeightData = await UserMealSelection.aggregate([
      { $match: { userId: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $unwind: "$meals" },
      { $group: { _id: null, totalMealWeight: { $sum: "$meals.weight" } } }
    ]);

    const MealWeightofMonthAll = await UserMealSelection.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $unwind: "$meals" },
      { $group: { _id: null, totalMealWeightOfMonthAll: { $sum: "$meals.weight" } } }
    ]);

    const totalMealWeightAll = MealWeightofMonthAll[0]?.totalMealWeightOfMonthAll || 0;
    const totalCost = totalAmount;
    const mealRate = totalMealWeightAll > 0 ? Number((totalCost / totalMealWeightAll).toFixed(2)) : 0;
    const totalMealWeight = MealWeightData[0]?.totalMealWeight || 0;
    const monthlyCost = Number(mealRate * totalMealWeight).toFixed(2);

    const userDeposit = await UserBalance.findOne({ userId });
    const prevTotalBalance = userDeposit?.totalBalance || 0;
    const newTotalBalance = prevTotalBalance + Number(amountValue);
    const newCurrentBalance = Number((newTotalBalance - monthlyCost).toFixed(2));

    const userBalance = await UserBalance.findOneAndUpdate(
      { userId },
      {
        $inc: { addBalance: amountValue, totalBalance: amountValue },
        $set: {
          addDate: pendingDeposit.date,
          totalMealWeight: totalMealWeight,
          mealRate: mealRate,
          totalCost: monthlyCost,
          currentBalance: newCurrentBalance
        }
      },
      { new: true, upsert: true }
    );
    const user = await User.findById(userId);


    if (user && user.email) {
  await sendEmail(
    user.email,
    "Deposit Approved",
    `Hello ${user.fullName || user.name},

Your deposit of ৳${amountValue} on ${dayjs(pendingDeposit.date).format("YYYY-MM-DD")} has been approved.

Your updated current balance is now ৳${userBalance.currentBalance}.

Thank you for using Meal Planner.`
  );
}

    return res.status(200).json({
      message: "Deposit approved and balance updated successfully.",
      userBalance
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};



const getPendingDeposits = async (req, res) => {
  try {
    const month = req.query.month || dayjs().format("YYYY-MM");
    const startOfMonth = dayjs(month).startOf('month').toDate();
    const endOfMonth = dayjs(month).endOf('month').toDate();


    // const status = req.query.status; // default to 'pending' if not provided

    // Validate status to prevent invalid queries
    // const allowedStatuses = ['pending', 'approved', 'rejected'];
    // if (!allowedStatuses.includes(status)) {
    //   return res.status(400).json({ message: "Invalid status parameter." });
    // }

    const deposits = await PendingDeposit.find({ date:{$gte:startOfMonth,$lte:endOfMonth} })
      .populate('userId', 'fullName email')
      .sort({ date: -1 });

    return res.status(200).json(deposits);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
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


export { addBalance, getBalance,getAlluserCurrentBalanceCurrentMonth,approvePendingDeposit,getPendingDeposits};
