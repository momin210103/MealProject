import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    // console.log('req.body: ', req.body);
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

export { registerUser, };