import { UserMealSelection } from "../models/usermealselection.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Meal } from "../models/meal.model.js";

const saveMealSelection = asyncHandler(async (req, res) => {
  const { breakfast, lunch, dinner } = req.body.selection;
  const selectionDate = new Date(req.body.date);
  console.log(req.body.selection);

  try {
    const result = await UserMealSelection.findOneAndUpdate(
      { userId: req.user.id, date: selectionDate },
      { selection: { breakfast: (breakfast ?? false), lunch:(lunch ?? false), dinner:(dinner ?? false) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
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

export {
    saveMealSelection,
    getMealSelection,
    getMealPlan
};
