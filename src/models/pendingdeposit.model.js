import mongoose from "mongoose";
const PendingDepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved',], default: 'pending' }
});

export const PendingDeposit = mongoose.model("PendingDeposit", PendingDepositSchema);
