import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken,getCurrentUser,verifyEmail,saveTimerSettings, setManager, deleteUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js"; // Import User model
import { saveMealSelection,getMealSelection,getMealPlan } from "../controllers/dailymeal.controller.js";
import { isManager } from "../middlewares/manager.middleware.js";
const userRouter = Router();

// POST /register route
userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
    ]),
    registerUser
);

// GET / route to fetch all users
userRouter.route("/register").get(async (req, res) => {
    try {
        const users = await User.find().select("-password -refreshToken");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
});

// POST /login route
userRouter.route("/login").post(loginUser);
userRouter.route("/verify-email").post(verifyEmail);
userRouter.route("/dailymeal").post(verifyJWT, saveMealSelection)
userRouter.route("/dailymeal").get(verifyJWT, getMealSelection);

userRouter.route("/timer-settings").post(verifyJWT, saveTimerSettings);

userRouter.route("/me").get(verifyJWT, getCurrentUser);






// Secure routes
userRouter.route("/logoutUser").post(verifyJWT, logoutUser);
userRouter.route("/refreshToken").post(refreshAccessToken);

export default userRouter;