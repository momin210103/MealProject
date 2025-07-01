import mongoose from "mongoose";
const { Schema } = mongoose;

// Individual meal item schema
const mealItemSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
    maxlength: 100
  },
  
  type: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['breakfast', 'lunch', 'dinner']
  },
  weight:{
    type:Number,
    default:1
  }
}, { _id: false });

// Main meal plan schema
const mealPlanSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Meal plan must belong to a user']
  },
  date: {
    type: Date,
    required: [true, 'Please specify a date for the meal plan'],
    default: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    },
    index: true,
    validate: {
      validator: function(date) {
        return date >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Meal plan date cannot be in the past'
    }
  },
  meals: {
    type: [mealItemSchema],
    required: true,
    validate: {
      validator: function(meals) {
        return meals.length > 0;
      },
      message: 'Please provide at least one meal'
    }
  },
  
  startTime:{
    type:String,
    //default:"12:00"
  },
  endTime:{
    type:String,
   // default:"10:00"
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` before save
mealPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure one meal plan per user per date
mealPlanSchema.index({ user: 1, date: 1 }, { unique: true });

// Populate user on queries
mealPlanSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  });
  next();
});

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
