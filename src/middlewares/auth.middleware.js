import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized access - No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken?._id) {
            throw new ApiError(401, "Invalid token structure");
        }

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "User not found - Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle expired tokens and refresh logic
        if (error.name === "TokenExpiredError") {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                throw new ApiError(401, "Access token expired, please log in again");
            }

            // Verify refresh token and issue a new access token
            try {
                const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findById(decodedRefreshToken._id).select("-password -refreshToken");

                if (!user) {
                    throw new ApiError(401, "Invalid refresh token");
                }

                // Issue a new access token and send it as a cookie
                const newAccessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

                // Attach new user data
                req.user = user;
                next();
            } catch (refreshError) {
                throw new ApiError(401, "Invalid refresh token, please log in again");
            }
        } else {
            console.error("JWT verification error:", error);
            throw new ApiError(401, "Authentication failed - Please login again");
        }
    }
});
