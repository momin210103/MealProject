import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import nodemailer from "nodemailer"; 

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            throw new ApiError(500, "Server configuration error - Token secrets not defined");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token Generation Error:", error);
        throw new ApiError(500, "Error while generating access and refresh token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // Validation  -not empty
    // check if user already exists : username ,email
    // Check for image check for avatar
    // upload them to cloudinary, avatar
    // create user object -create entry in db
    // remove password from refresh token from resposne
    // check for user creation
    // return response
    //console.log('req.body: ', req.body);
    // console.log('req.files: ', req.files);

    //? Logic system

    const {fullName,email,username,password}=req.body
    // console.log("email: ",email);
    if([fullName,email,username,password].some((field)=>
        field?.trim() === "" )
    ) {
        throw new ApiError(400,"All fields are required")

    }
    
    /*Logic Another system
    if(fullName === ""){
        throw new ApiError(400,"Full name is required");
    }
    if(email === ""){
        throw new ApiError(400,"Email is required");
    }
    if(username === ""){
        throw new ApiError(400,"Username is required");
    }
    if(password === ""){
        throw new ApiError(400,"Password is required");
    }*/

        //! check user already exits
       const existendUser =  await User.findOne({
            $or:[{ email }]
        })
        if(existendUser){
            throw new ApiError(409,"Email already exists")
        }
        //verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now


        //! image and check image
    //    const avatarLocalPath = req.files?.avatar[0]?.path 

    //    if(!avatarLocalPath){
    //         throw new ApiError(400,"Image is required")
    //     }


        //! upload cloudinary
        //console.log("avatarLocalPath: ",avatarLocalPath);

        // const avatar = await uploadOnCloudinary(avatarLocalPath)
        //console.log("avatar: ",avatar);

        // if(!avatar){
        //     throw new ApiError(400,"Avatar file is required")
        // }

       const user = await User.create({
            fullName,
            // avatar: avatar.url,
            email,
            username: username.toLowerCase(),
            password,
            verificationCode,
            verificationCodeExpires,

        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken ")

        const transporter = nodemailer.createTransport({
           service:"Gmail",
           auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
           }
        })
        const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
        const verificationLink = `${CLIENT_URL}/verify-email?email=${email}&code=${verificationCode}`

       await transporter.sendMail({
        from:'"MealPlaner"<momincse13@gmail.com>',
        to: email,
        subject: "Email Verification",
        html: `<p>Hello ${fullName},</p>
               <p>Your verification code is: <b>${verificationCode}</b></p>
               <p">Click Here for Verify<a href="${verificationLink}">here</a> to verify your email.</p>`,
    
    });
            

        if(!createdUser){
            throw new ApiError(500,"Some thing went wrong while creating register")
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Register successfully")
        )

})

const verifyEmail = asyncHandler(async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            throw new ApiError(400, "Email or verification code missing");
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (!user.verificationCode) {
            throw new ApiError(400, "No verification code found for this user");
        }

        if (user.verificationCode !== code) {
            throw new ApiError(400, "Invalid verification code");
        }

        if (user.verificationCodeExpires < new Date()) {
            throw new ApiError(400, "Verification code has expired. Please request a new one.");
        }

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        res.status(200).json(new ApiResponse(200, null, "Email verified successfully!"));
    } catch (error) {
        console.error("Email verification error:", error);
        throw error;
    }
});


const loginUser = asyncHandler(async (req, res) => {
    // get user details from body
    // Username and email
    // find the user in db
    // password check
    // access and refresh token generation
    // send cookies
    // console.log("req.body: ", req.body);
    // console.log("Request body:", req.body);
    console.log("Email:", req.body.email);
    console.log("Password:", req.body.password);

    const {email,password}=req.body
    if(!email){
        throw new ApiError(400,"email is required")
    }

    const user = await User.findOne({
        $or:[{email}]
    })
    if(!user){
        throw new ApiError(404,"User not found")
    }
    if(!user.isVerified){
        throw new ApiError(401,"Please verify your email first")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    console.log("accessToken: ",accessToken);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure: true,
        sameSite:"None",
        maxAge:7* 24 * 60 * 60  * 1000
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser,
    
            },
            "User Login successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };


  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.query.refreshToken 
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        const options = {
            httpOnly:true,
            secure:true,
        }
        const{accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newRefreshToken
    
                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,"error?.message" || "invalid refresh token")

        
    }
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    if(!req.user){
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    )

})

const saveTimerSettings = asyncHandler(async (req, res) => {
    try {
        const { timerSettings } = req.body;
        
        if (!req.user) {
            throw new ApiError(401, "User not authenticated");
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { timerSettings } },
            { new: true }
        ).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, user, "Timer settings saved successfully")
        );
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Error saving timer settings");
    }
});

const setManager = asyncHandler(async(req,res) =>{
    try {
        const {userId} = req.params;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {Role:"Manager"},
            {new:true}
        );
        if(!updatedUser){
            return res.status(404).json({message:"User not found"});

        }
        res.json({message:"User promoted to manager.", User:updatedUser})
    } catch (error) {
        console.error("Error setting manager:", error);
        res.status(500).json({ message: "Server error." });
        
    }
});

const removeManager = asyncHandler( async (req,res) =>{
    try {
        const {userId} = req.params;
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {Role:"User"},
        {new:true}
    );
    if(!updatedUser){
        return res.status(404).json({message:"User not found"});
    }
    res.status(200).json({
        message:"Remove Manager",
        User:updatedUser
    });
    } catch (error) {
        console.error("Error setting manager:", error);
        res.status(500).json({ message: "Server error." });
    }

});

const deleteUser = asyncHandler( async (req,res) =>{
    try {
        const {userId} = req.params;
        
        const deleteUser  = await User.findByIdAndDelete(userId);
        if(!deleteUser) {
            return res.status(404).json({message:"User not found"});
        }
        res.json({message:"User deleted succesfully"});
        
    } catch (error) {
        console.error("Error deleting user",error);
        res.status(500).json({message:"Server Error"});
    }
});

export { 
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    verifyEmail,
    saveTimerSettings,
    setManager,
    removeManager,
    deleteUser
};