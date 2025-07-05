import { MonthlySummary } from "../models/monthlysummery.model.js";
import Bazarlist from "../models/bazarlist.model.js";
import { MealPlan } from './../models/mealplan.model.js';
import dayjs from "dayjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import UserBalance from './../models/user.balance.model.js';
import  {UserMealSelection}  from './../models/usermealselection.model.js';

const generateMonthlySummery = asyncHandler(async(req,res)=>{
    
    try {
    const month = req.query.month || dayjs().format("YYYY-MM");
    const startOfMonth = dayjs(month).startOf("month").toDate();
    const endOfMonth = dayjs(month).endOf('month').toDate();

    const costData = await Bazarlist.aggregate([
        {
            $match:{
                date:{ $gte:startOfMonth, $lte:endOfMonth }
            }
        },
        {
            $group:{
                _id:null,
                totalCost:{ $sum: "$amount"}
            }
        }
    ]);

    const totalCost = costData[0]?.totalCost || 0;


    const balanceData = await UserBalance.aggregate([
        {
            $match:{addDate:
                {$gte:startOfMonth,$lte:endOfMonth}}
        },
        {
            $group:{
                _id: null,
                totalDeposit:{$sum:"$addBalance"}

            }
        }

    ]);
    const totalDeposit = balanceData[0]?.totalDeposit || 0;
    const currentAmount = totalDeposit - totalCost;

    //Calculate totalMealWeight

    const MealData = await UserMealSelection.aggregate([
        {
            $match:{date:{$gte:startOfMonth,$lte:endOfMonth}}
        },
        {
            $unwind:"$meals"
        },
        {
            $group:{
                _id:null,
                totalMealWeight:{$sum:"$meals.weight"}

        }}
    ]);
    const totalMealWeight = MealData[0]?.totalMealWeight
    const mealRate = (totalCost/totalMealWeight).toFixed(2)
    // console.log(totalMealWeight);


    const summery = await MonthlySummary.findOneAndUpdate(
        {month},
        {
            totalCost,
            totalDeposit,
            currentBalance:currentAmount,
            totalMealWeight,
            mealRate
            
        },
        {
            upsert: true,new: true,setDefaultsOnInsert:true
        }
    );
    return res.status(200).json({totalCost,totalDeposit,currentAmount,summery,totalMealWeight,mealRate
    });

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message:"Error data summery",
            error:message.error,
            stack:error.stack
        });
    }
});
export {generateMonthlySummery}
