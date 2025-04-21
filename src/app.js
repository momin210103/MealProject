import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

//routes declaration
app.get("/", (req, res) => {
    res.send("Welcome to the Meal Project API!");
});
app.use("/api/v1/users", userRouter)



// http://localhost:8000/api/v1/users/register
export {app}