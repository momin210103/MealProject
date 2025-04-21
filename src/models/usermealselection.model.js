import mongoose,{Schema} from "mongoose";



const userMealSelectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  selection: {
    breakfast: {
      type: Boolean,
      default: false
    },
    lunch: {
      type: Boolean,
      default: false
    },
    dinner: {
      type: Boolean,
      default: false
    },
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optional: Ensure one entry per user per date
userMealSelectionSchema.index({ userId: 1, date: 1 }, { unique: true });

export const UserMealSelection = mongoose.model('UserMealSelection', userMealSelectionSchema);

