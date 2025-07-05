import mongoose from 'mongoose';

const userBalanceSchema = new mongoose.Schema({
  userId: 
  { type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
    addBalance: { type: Number, default: 0 },
    addDate: { type: Date, default: Date.now },
    totalBalance: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    totalMealWeight:{type:Number,default:0},
    mealRate:{type:Number,default:0},
    createdAt: { type: Date, default: Date.now },

  
});

const UserBalance = mongoose.model('UserBalance', userBalanceSchema);

export default UserBalance;
