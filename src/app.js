import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const allowedOrigins = [
    'http://localhost:5173',
    'https://mealreact.onrender.com/' // replace with your actual frontend URL
];

app.use(cors({
    origin:allowedOrigins,
    credentials: true,
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import 
import userRouter from "./routes/user.routes.js"
import mealPlanRouter from "./routes/mealPlanRoutes.js"
import UserBalance from "./routes/userbalance.route.js"
import Bazarlist  from "./routes/bazarlist.route.js"


//routes declaration
app.get("/", (req, res) => {
    res.send("Welcome to the Meal Project API!");
});
app.use("/api/v1/users", userRouter)
app.use("/api/v1", mealPlanRouter)
app.use("/api/v1", UserBalance)
app.use("/api/v1", Bazarlist)

export {app}