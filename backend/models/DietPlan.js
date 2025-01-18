const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true }
});

const mealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [mealItemSchema]
});

const nutritionSchema = new mongoose.Schema({
  calories: { type: String, required: true },
  protein: { type: String, required: true },
  carbs: { type: String, required: true },
  fats: { type: String, required: true }
});

const dietPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // Weight Loss, Weight Gain, Maintenance
  calorieRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  activityLevel: { type: String, required: true }, // Active, Moderate, Sedentary
  meals: {
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema
  },
  nutritionSummary: nutritionSchema,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.DietPlan || mongoose.model('DietPlan', dietPlanSchema);