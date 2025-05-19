import mongoose,{Schema} from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET); 
console.log("ENV EXPIRY in generateAccessToken:", process.env.ACCESS_TOKEN_EXPIRY); 

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,  
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String, // cloudary url
    },
    mealHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Meal"
        }

    ],
    password:{
        type:String,
        required:[true,'Password is required']
    
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    verificationCode:{
        type:String,
    },
    verificationCodeExpires:{
        type: Date,
    },
    timerSettings: {
        type: Object,
        default: {
            workDuration: 25, // minutes
            breakDuration: 5, // minutes
            longBreakDuration: 15, // minutes
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            notifications: true
        }
    },
    Role:{
        type:String,
        enum:["Manager","user"],
        default:"user",
    },
    RoomNumber:{
        type:String,
        default:"000",
        
    },
    phoneNumber:{
        type:String,
        default:"000123254",
        
    },
    refreshToken:{
        type:String,
    },
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    try {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new Error("ACCESS_TOKEN_SECRET is not defined");
        }
        
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
            }
        );
    } catch (error) {
        console.error("Error generating access token:", error);
        throw new Error("Failed to generate access token");
    }
}

userSchema.methods.generateRefreshToken = function(){
    try {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error("REFRESH_TOKEN_SECRET is not defined");
        }

        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
            }
        );
    } catch (error) {
        console.error("Error generating refresh token:", error);
        throw new Error("Failed to generate refresh token");
    }
}

export const User = mongoose.model("User",userSchema);