import UserBalance from "../models/user.balance.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const addBalance = async (req, res) => {
    const userId = req.user._id
    const {amount,date,cost} = req.body;
    const addedDate = date ? new Date(date) : new Date();
    const costValue = cost ? Number(cost) : 0;
    const amountValue = amount ? Number(amount) : 0;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userBalance = await UserBalance.findOneAndUpdate(
      { 
        userId 
      },
      { $inc: 
          { 
          addBalance: amount,  
          totalBalance: amountValue,
          totalCost: costValue,
          currentBalance: amountValue-costValue, 
          },
          addDate: addedDate 
      },
      { 
        new: true, 
        upsert: true 
      }
    );
    const responseBalance = userBalance.toObject();
        responseBalance.addBalance = amountValue;

    return res.status(200).json({
      message: "Funds added successfully",
      userBalance: responseBalance
    });
  } catch (error) {
    console.error("Error adding funds:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
const getBalance = asyncHandler( async (req,res) => {
  const userId = req.user._id
  const userAmount = await UserBalance.find({
    userId:userId,
  });
  return res.status(200).json(
    new ApiResponse(200,userAmount,"Balanace fetched successuly")
  );
});
export { addBalance,getBalance };