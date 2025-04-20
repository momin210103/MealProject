import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findByIdAndUpdate(userId)
        // console.log("Fetched User:", user);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: false}) // corrected 'validdateBeforeSave' to 'validateBeforeSave'
        return {accessToken, refreshToken}

    }catch (error) {
        throw new ApiError(500,"Error while generating access and refresh token")   
    }
}

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
    console.log('req.body: ', req.body);
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
            password

        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken ")

        if(!createdUser){
            throw new ApiError(500,"Some thing went wrong while creating register")
        }

        return res.status(201).json(
            new ApiResponse(200,createdUser,"User Register successfully")
        )

})

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
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    console.log("accessToken: ",accessToken);
    
    const loggedInUser = await User.findByIdAndUpdate(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser
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
    if(incomingRefreshToken){
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

export { 
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
};