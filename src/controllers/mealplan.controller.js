import { MealPlan } from "../models/mealplan.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createOrUpdateMealPlan = asyncHandler(async (req, res) => {
    const { date, meals,startTime,endTime } = req.body;
    const userId = req.user._id;

    // Check if user is a manager
    if (req.user.Role !== 'Manager') {
        throw new ApiError(403, "Only managers can create or update meal plans. Please contact your manager for assistance.");
    }

    // Check if meal plan already exists for this date
    let mealPlan = await MealPlan.findOne({ user: userId, date });

    if (mealPlan) {
        // Update existing meal plan
        mealPlan.meals = meals;
        mealPlan.isGlobal = true;
        await mealPlan.save();
        return res.status(200).json(
            new ApiResponse(200, mealPlan, "Meal plan updated successfully")
        );
    } else {
        // Create new meal plan
        mealPlan = await MealPlan.create({
            user: userId,
            date,
            meals,
            isGlobal: true,
            startTime,
            endTime
        });
        return res.status(201).json(
            new ApiResponse(201, mealPlan, "Meal plan created successfully")
        );
    }
});

const getMealPlansByDate = asyncHandler(async (req, res) => {
    const { date } = req.params;
    const userId = req.user._id;

    // Validate date string
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
    }

    const mealPlan = await MealPlan.findOne({ user: userId, date: parsedDate });

    if (!mealPlan) {
        throw new ApiError(404, "No meal plan found for this date");
    }

    return res.status(200).json(
        new ApiResponse(200, mealPlan, "Meal plan fetched successfully")
    );
});


const getMyMealPlans = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const mealPlans = await MealPlan.find({ user: userId })
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, mealPlans, "Your meal plans fetched successfully")
    );
});

const getAllMealPlans = asyncHandler(async (req, res) => {
    const mealPlans = await MealPlan.find({ isGlobal: true })
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, mealPlans, "All global meal plans fetched successfully")
    );
});

export {
    createOrUpdateMealPlan,
    getMealPlansByDate,
    getMyMealPlans,
    getAllMealPlans
}; 