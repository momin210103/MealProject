// require("dotenv").config({path:".env"});
// server.js

import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

// Load environment variables
dotenv.config({
    path: "./.env"
});

// Port setup
const port = process.env.PORT || 8000; //Port

// Connect to DB first, then start server
connectDB()
    .then(() => {
        app.listen(port, () => { 
            console.log(`🔥 Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
    });












//!Connection Database First Approach
/*import express from "express";

const app = express();

( async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("ERROR",error);
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
       })


    } catch (error) {
        console.error("Error",error);
        throw err
    }
    
})()*/