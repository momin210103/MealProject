import { MealPlan } from "../models/mealplan.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {MealWeightConfig} from "../models/mealweight.model.js"

const createOrUpdateMealPlan = asyncHandler(async (req, res) => {
    const { date, meals, startTime, endTime, weights: clientWeights } = req.body;
    const userId = req.user._id;

    if (req.user.Role !== 'Manager') {
        throw new ApiError(403, "Only managers can create or update meal plans.");
    }

    // যদি client side থেকে weights না আসে তাহলে DB থেকে MealWeightConfig পড়ে নাও
    let weights = clientWeights;

    if (!weights || typeof weights !== 'object') {
        const configs = await MealWeightConfig.find({});
        weights = {};
        configs.forEach(config => {
            weights[config.type] = config.weight;
        });
    }

    // এখন meal গুলাতে weight বসাও
    const updatedMeals = meals.map(meal => ({
        ...meal,
        weight: weights[meal.type] || 1  // fallback weight = 1
    }));
    let mealDate;

if (date) {
    mealDate = new Date(date);
} else {
    mealDate = new Date();
    mealDate.setDate(mealDate.getDate() );
}

mealDate.setHours(0, 0, 0, 0); // 🔐 টাইম অংশ 00:00:00 করে দিন


    // পুরনো meal plan আছে কি না দেখে নেয়া
    let mealPlan = await MealPlan.findOne({ user: userId, date: mealDate });

    if (mealPlan) {
        mealPlan.meals = updatedMeals;
        mealPlan.isGlobal = true;
        await mealPlan.save();
        return res.status(200).json(
            new ApiResponse(200, mealPlan, "Meal plan updated successfully")
        );
    } else {
        mealPlan = await MealPlan.create({
            user: userId,
            date: mealDate,
            meals: updatedMeals,
            isGlobal: true,
            startTime,
            endTime
        });
        return res.status(201).json(
            new ApiResponse(201, mealPlan, "Meal plan created successfully")
        );
    }
});

const setMealTypeWeight = asyncHandler(async (req, res) => {
    const { type, weight } = req.body;
  
    if (!['breakfast', 'lunch', 'dinner'].includes(type)) {
      throw new ApiError(400, "Invalid meal type");
    }
  
    const config = await MealWeightConfig.findOneAndUpdate(
      { type },
      { weight, updatedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  
    return res.status(200).json(
      new ApiResponse(200, config, `Weight for ${type} updated`)
    );
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
    getAllMealPlans,
    setMealTypeWeight
}; 