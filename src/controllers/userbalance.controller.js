import UserBalance from "../models/user.balance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserMealSelection } from "../models/usermealselection.model.js";
import { MonthlySummary } from "../models/monthlysummery.model.js";
import dayjs from "dayjs";
import { getBazarlistSummary } from "../Services/bazalist.service.js";
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
    // const month = req.query.month || dayjs().format("YYYY-MM");
    const {totalAmount,totalBazar} =  await getBazarlistSummary(month);
    // console.log(totalAmount);
    

      //total meal weight find of a user
    const MealWeightData = await UserMealSelection.aggregate([
      {
        $match:{
          userId:userId,
          date:{$gte:startOfMonth,$lte:endOfMonth}}
      },
      {
        $unwind:"$meals"
      },
      {
        $group:{
          _id:null,
          totalMealWeight:{$sum:"$meals.weight"}
        }
      }
    ]);
    //total mealweight of all users
        const MealWeightofMonthAll = await UserMealSelection.aggregate([
      {
        $match:{
          // userId:userId,
          date:{$gte:startOfMonth,$lte:endOfMonth}}
      },
      {
        $unwind:"$meals"
      },
      {
        $group:{
          _id:null,
          totalMealWeightOfMonthAll:{$sum:"$meals.weight"}
        }
      }
    ]);
    const totalMealWeightAll = MealWeightofMonthAll[0]?.totalMealWeightOfMonthAll;
    // console.log(totalMealWeightOfMonth);
    const totalCost = totalAmount;  //! -> ## totalBazarcost ## <-
    const mealRate = Number((totalCost/totalMealWeightAll).toFixed(2));


    //Total mealweight of a Month of a user
    const totalMealWeight = MealWeightData[0]?.totalMealWeight;

    //! total cost of a user in one month
    const monthlyCost = Number(mealRate * totalMealWeight).toFixed(2);

    //! totalBalance is the totalDeposit of a month
    const userDeposit = await UserBalance.findOne({ userId });
    const prevTotalBalance = userDeposit?.totalBalance || 0;
    const newTotalBalance = prevTotalBalance + Number(amountValue);
    const newCurrentBalance = Number((newTotalBalance - monthlyCost).toFixed(2));
     const userBalance = await UserBalance.findOneAndUpdate(
      {
        userId,
      },
      {
        $inc: {
          addBalance: amountValue,
          totalBalance: amountValue,

        },
        $set:{
          addDate: addedDate,
          totalMealWeight:totalMealWeight,
          mealRate:mealRate,
          totalCost:monthlyCost,
          currentBalance:newCurrentBalance

        }
        
      },
      {
        new: true,
        upsert: true,
      }
    );
    const responseBalance = userBalance.toObject();
    responseBalance.addBalance = amount;

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
