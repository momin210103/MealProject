import mongoose from "mongoose";
const {Schema} = mongoose;
const setTimer = new Schema({
    start: {
        type: String, // "00:00", "22:00"
        required: true,
        default:"00:00",
        validate: {
            validator: v => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid time (HH:mm)`
        }
    },
    end: {
        type: String, // "22:00"
        required: true,
        default:"22:00",
        validate: {
            validator: v => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: props => `${props.value} is not a valid time (HH:mm)`
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Timer = mongoose.model("Timer",setTimer);