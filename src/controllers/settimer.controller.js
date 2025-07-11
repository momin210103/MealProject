import { Timer } from "../models/settimer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import dayjs from "dayjs";

// POST /api/v1/createtimer
const createOrUpdateGlobalTimer = asyncHandler(async (req, res) => {
  const { end } = req.body;
  const userId = req.user?._id;

  if (!end) {
    res.status(400);
    throw new Error('End time are required');
  }

  const start = "00:00";

  // Find and update existing global timer or create if it doesn't exist
  const timer = await Timer.findOneAndUpdate(
    { isGlobal: true },
    {
      start,
      end,
      isGlobal: true,
      user: userId, // manager who set it
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    success: true,
    data: timer,
    message: 'Global timer created/updated successfully ✅',
  });
});

const getGlobalTimer = asyncHandler (async (req,res)=>{
  const timer = await Timer.findOne({isGlobal:true});
  if (!timer){
    res.status(404);
    throw new Error("No global timer found");
  }

  res.json({
    success:true,
    data:{
      start:timer.start,
      end:timer.end
    }
  })

});



export {
    createOrUpdateGlobalTimer,
    getGlobalTimer

}