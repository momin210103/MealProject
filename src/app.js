import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

app.use(cors({
    origin:'http://localhost:5173',
    credentials: true,
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import 
import userRouter from "./routes/user.routes.js"
import mealPlanRouter from "./routes/mealPlanRoutes.js"

//routes declaration
app.get("/", (req, res) => {
    res.send("Welcome to the Meal Project API!");
});
app.use("/api/v1/users", userRouter)
app.use("/api/v1", mealPlanRouter)

export {app}