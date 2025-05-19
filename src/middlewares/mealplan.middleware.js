import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MealPlan } from '../models/mealplan.model.js';

// Middleware to validate meal plan data
export const validateMealPlanData = asyncHandler(async (req, res, next) => {
    const { date, meals } = req.body;

    if (!date) {
        throw new ApiError(400, "Date is required");
    }

    if (!meals || !Array.isArray(meals)) {
        throw new ApiError(400, "Meals must be an array");
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
    }

    // Validate each meal in the array (only name and type)
    for (const meal of meals) {
        if (!meal.name || !meal.type) {
            throw new ApiError(400, "Each meal must have a name and type");
        }

        const validTypes = ['breakfast', 'lunch', 'dinner'];
        if (!validTypes.includes(meal.type)) {
            throw new ApiError(400, `Invalid meal type: ${meal.type}`);
        }
    }

    next();
});

// Middleware to check if meal plan exists
export const checkMealPlanExists = asyncHandler(async (req, res, next) => {
    const date = req.params.date || req.body.date;
    const userId = req.user._id;

    if (!date) {
        throw new ApiError(400, "Date is required");
    }

    const mealPlan = await MealPlan.findOne({ user: userId, date });
    
    if (!mealPlan) {
        throw new ApiError(404, "Meal plan not found for this date");
    }

    // Attach the meal plan to the request for later use
    req.mealPlan = mealPlan;
    next();
});

// Middleware to check if user has permission to access meal plan
export const checkMealPlanPermission = asyncHandler(async (req, res, next) => {
    const { mealPlanId } = req.params;
    const userId = req.user._id;

    const mealPlan = await MealPlan.findById(mealPlanId);
    
    if (!mealPlan) {
        throw new ApiError(404, "Meal plan not found");
    }

    // Check if the user owns the meal plan
    if (mealPlan.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You don't have permission to access this meal plan");
    }

    req.mealPlan = mealPlan;
    next();
}); 