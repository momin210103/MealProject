import express from 'express';
import { createOrUpdateMealPlan, getMealPlanByDateClean, getMyMealPlans, getAllMealPlans, setMealTypeWeight,getMealPlanByMonth } from '../controllers/mealplan.controller.js';
import { validateMealPlanData } from '../middlewares/mealplan.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isManager } from '../middlewares/manager.middleware.js';
import { saveMealSelection,getMonthlyMealCount } from '../controllers/dailymeal.controller.js';

const router = express.Router();

// Apply verifyJWT middleware to all routes
router.use(verifyJWT);

// Meal plan routes
router.post('/mealplan', validateMealPlanData, isManager, createOrUpdateMealPlan);
router.get('/mealplan/global', getAllMealPlans);
// router.get('/mealplan/saved', getMyMealPlans);

router.get('/mealplan/monthly-meal-count', verifyJWT,getMonthlyMealCount);

router.post('/dailymeal', verifyJWT,saveMealSelection);
router.post('/mealplan/weight', isManager,setMealTypeWeight);



router.get('/selectedmeals/:date', verifyJWT, getMealPlanByDateClean);
router.get('/selectedmeals/:year/:month',verifyJWT, getMealPlanByMonth);

export default router;
