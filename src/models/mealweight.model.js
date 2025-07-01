import mongoose from "mongoose";
const { Schema } = mongoose;

const mealWeightConfigSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner'],
    unique: true
  },
  weight: {
    type: Number,
    required: true,
    default: 1
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

mealWeightConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const MealWeightConfig = mongoose.model('MealWeightConfig', mealWeightConfigSchema);
