const mongoose = require('mongoose');

const userDietPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dietPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DietPlan',
        required: true
    },
    userDetails: {
        age: { type: Number, required: true },
        gender: { type: String, required: true },
        height: { type: Number, required: true },
        weight: { type: Number, required: true },
        goal: { type: String, required: true },
        activityLevel: { type: String, required: true }
    },
    calculatedCalories: { type: Number, required: true },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.models.UserDietPlan || mongoose.model('UserDietPlan', userDietPlanSchema);