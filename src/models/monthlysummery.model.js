import mongoose from "mongoose";
const {Schema} = mongoose;

const monthlySummarySchema = new Schema({
    month:{
        type:String,
        required:true,
        unique:true
    },
    totalMealWeight: {
        type: Number,
        default: 0
    },
    mealBreakdown: {
        breakfast: { type: Number, default: 0 },
        lunch: { type: Number, default: 0 },
        dinner: { type: Number, default: 0 },
    },
    totalDeposit: {
        type: Number,
        default: 0
    },
    totalCost: {
        type: Number,
        default: 0
    },
    currentBalance:{
        type:Number,
        default: 0
    },
    mealRate: {
        type: Number,
        default: 0
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }

});
export const MonthlySummary = mongoose.model("MonthlySummary",monthlySummarySchema);