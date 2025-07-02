import { MealPlan } from "../models/mealplan.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {MealWeightConfig} from "../models/mealweight.model.js"
import { UserMealSelection } from "../models/usermealselection.model.js";

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


const getMealPlanByDateClean = asyncHandler(async (req, res) => {
    const { date } = req.params;
    const userId = req.user._id; 

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
    }

    // Create next date to cover the entire day
    const nextDate = new Date(parsedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Fetch from MealPlan collection
    const mealPlan = await MealPlan.findOne({
        user: userId,
        date: {
            $gte: parsedDate,
            $lt: nextDate
        },
    });
    if (!mealPlan) {
        throw new ApiError(404, "Meal plan not found for the specified date");
    }
    const weightByType = mealPlan.meals.reduce((acc,meal) =>{
        const type = meal.type.toLowerCase();
        acc[type] = (acc[type] || 0) + (meal.weight||0);
        return acc;
    },{});
    const totalWeight = Object.values(weightByType).reduce((sum, weight) => sum + weight, 0);   

    return res.status(200).json(
        new ApiResponse(200, {weightByType,totalWeight}, "Meal plan fetched successfully")
    );
});

const getMealPlanByMonth = asyncHandler(async (req, res) => {
    const {month, year} = req.params;
    const userId = req.user._id;
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS
    const endDate = new Date(year, month, 1); // next month start date
    const mealplans = await UserMealSelection.find({
        userId: userId,
        date: {
            $gte: startDate,
            $lt: endDate
        }
    });
    
    res.status(200).json(
        new ApiResponse(200, mealplans, "Meal plans for the month fetched successfully")
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
    getMealPlanByDateClean,
    getMyMealPlans,
    getAllMealPlans,
    setMealTypeWeight,
    getMealPlanByMonth
}; 