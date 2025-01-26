const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'Abs Exercises', 
      'Chest Exercises', 
      'Biceps Exercises', 
      'Forearm Exercises', 
      'Triceps Exercises', 
      'Calf Exercises', 
      'Glute Exercises', 
      'Hamstring Exercises', 
      'Quad Exercises', 
      'Lats Exercises', 
      'Lower Back Exercises', 
      'Upper Back Exercises'
    ]
  },
  description: {
    type: String,
    trim: true
  },
  image: { 
    type: String, 
    required: true 
  },
  categoryImage: { 
    type: String, 
    required: true 
  },
  youtubeLink: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Exercise', exerciseSchema);