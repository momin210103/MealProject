import mongoose from 'mongoose';

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
  meals: [
    {
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
      },
      name: {
        type: String,
        required: true
      },
      weight:{
        type:Number,
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one entry per user per date
userMealSelectionSchema.index({ userId: 1, date: 1 }, { unique: true });

export const UserMealSelection = mongoose.model('UserMealSelection', userMealSelectionSchema);
