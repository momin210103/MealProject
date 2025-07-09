import express from 'express';
import { createOrUpdateMealPlan, getMealPlanByDateClean, getTotalMealWeights, getSetMeals, setMealTypeWeight,getMealPlanByMonth, getTotalMealsOfMonth, } from '../controllers/mealplan.controller.js';
import { validateMealPlanData } from '../middlewares/mealplan.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isManager } from '../middlewares/manager.middleware.js';
import { saveMealSelection,getMonthlyMealCount } from '../controllers/dailymeal.controller.js';
import { createTimer, getTimeDifference } from '../controllers/settimer.controller.js';

const router = express.Router();

// Apply verifyJWT middleware to all routes
router.use(verifyJWT);

// Meal plan routes
router.post('/mealplan', validateMealPlanData, isManager, createOrUpdateMealPlan);
router.get('/mealplan/latest', getSetMeals);
// router.get('/mealplan/saved', getMyMealPlans);

router.get('/mealplan/monthly-meal-count', verifyJWT,getMonthlyMealCount);

router.post('/dailymeal', verifyJWT,saveMealSelection);
router.post('/mealplan/weight', isManager,setMealTypeWeight);



router.get('/selectedmeals/:date', verifyJWT, getMealPlanByDateClean);
router.get('/selectedmeals/:year/:month',verifyJWT, getMealPlanByMonth);
router.get('/totalweights/:date',getTotalMealWeights)
router.get('/totalmealsofmonth/:month',getTotalMealsOfMonth);

//! create timer

router.post('/createtimer',isManager,createTimer)
router.get('/timedifference/:id',isManager,getTimeDifference)

export default router;
