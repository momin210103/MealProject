import express from "express";
import { saveMealSelection } from "../controllers/dailymeal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/dailymeal", verifyJWT, saveMealSelection);

export default router;
