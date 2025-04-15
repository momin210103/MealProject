// require("dotenv").config({path:".env"});
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
    path:".env"
});
connectDB();










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