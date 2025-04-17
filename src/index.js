// require("dotenv").config({path:".env"});
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import {app} from './app.js'

dotenv.config({
    path:"./.env"
});
const port = process.env.PORT || 8000

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server is Running on http://localhost:${port}`)

    })
})
.catch((error)=>{
    console.log("MONGO db conenction failed !!!",error);

})











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