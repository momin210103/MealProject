import mongoose from "mongoose";
const {Schema} = mongoose;
const setTimer = new Schema({
    start: {
        type: String, 
        // required: true,
        default: "12:00 AM"
    },
    end: {
        type: String, 
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isGlobal:{
        type: Boolean,
        default:false
    }
}, { timestamps: true });



export const Timer = mongoose.model("Timer",setTimer);