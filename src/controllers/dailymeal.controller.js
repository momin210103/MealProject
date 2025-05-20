import { UserMealSelection } from "../models/usermealselection.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Meal } from "../models/meal.model.js";
import mongoose from "mongoose";

const saveMealSelection = asyncHandler(async (req, res) => {
  const { meals, date } = req.body;

  if (!meals || !Array.isArray(meals) || meals.length === 0) {
    throw new ApiError(400, "No meals provided");
  }

  const selectionDate = new Date(date);

  try {
    const result = await UserMealSelection.findOneAndUpdate(
      { userId: req.user.id, date: selectionDate },
      {
        userId: req.user.id,
        date: selectionDate,
        meals: meals.map(meal => ({
          type: meal.type.toLowerCase(),
          name: meal.name
        }))
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json(
      new ApiResponse(200, result, "Meal selection saved successfully")
    );
  } catch (err) {
    throw new ApiError(500, err.message || "Failed to save selection");
  }
});


const getMealSelection = asyncHandler(async (req, res) => {
  try {
    const meals = await UserMealSelection.find({ userId: req.user.id });
    return res.status(200).json(
      new ApiResponse(200, meals, "Meal selections fetched successfully")
    );
  } catch (err) {
    throw new ApiError(500, err.message || "Failed to fetch meal selections");
  }
});

const getMealPlan = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "User not authenticated");
        }

        const user = await User.findById(req.user._id)
            .populate('mealHistory')
            .select("-password -refreshToken");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, user.mealHistory, "Meal plan fetched successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Error fetching meal plan");
    }
});

const getMonthlyMealCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { year, month } = req.query; // year=2025, month=5  (May)

  if (!year || !month) {
    throw new ApiError(400, "Year and month query params required");
  }

  // মাস এবং বছর থেকে মাসের শুরু ও শেষ দিন তৈরি করো
  const startDate = new Date(`${year}-${month.toString().padStart(2, '0')}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const result = await UserMealSelection.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $unwind: "$meals"
    },
    {
      $group: {
        _id: "$userId",
        totalMealsSelected: { $sum: 1 }
      }
    }
  ]);

  return res.status(200).json(new ApiResponse(200, result, "Monthly meal count fetched successfully"));
});



export {
    saveMealSelection,
    getMealSelection,
    getMealPlan,
    getMonthlyMealCount
};
