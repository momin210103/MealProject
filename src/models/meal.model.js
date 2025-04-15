import mongoose,{Schema} from "mongoose";

const mealSchema = new Schema({
    mealName:{
        type:String,
        required:true,
        trim:true,
    },
    mealType:{
        type:String,
        enum:["breakfast","lunch","dinner","Feast"],
        required:true,
    },
    mealDescription:{
        type:String,
        required:true,
        trim:true,
    }

},{timestamps:true});

export const Meal = mongoose.model("Meal",mealSchema);