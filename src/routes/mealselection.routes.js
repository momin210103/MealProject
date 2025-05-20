import express from "express";
import { saveMealSelection } from "../controllers/dailymeal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/dailymeal", verifyJWT, saveMealSelection);
// router.get("/monthly-meal-count", verifyJWT, getMonthlyMealCount);
export default router;
