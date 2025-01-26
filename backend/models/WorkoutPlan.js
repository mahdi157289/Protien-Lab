const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: `Workout Plan ${new Date().toLocaleDateString()}`
  },
  days: [{
    day: {
      type: Number,
      required: true
    },
    muscleGroups: [{
      type: String,
      required: true
    }],
    exercises: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    }]
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);