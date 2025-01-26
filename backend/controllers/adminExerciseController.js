const Exercise = require('../models/Exercise');
const exerciseUpload = require('../config/exerciseUpload');
const fs = require('fs');
const path = require('path');

// Create new exercise
exports.createExercise = [
  exerciseUpload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'categoryImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, category, youtubeLink } = req.body;
      
      if (!req.files || !req.files.image || !req.files.categoryImage) {
        return res.status(400).json({ message: 'Both exercise and category images are required' });
      }

      const exercise = new Exercise({
        name,
        category,
        image: req.files.image[0].filename,
        categoryImage: req.files.categoryImage[0].filename,
        youtubeLink
      });

      await exercise.save();
      res.status(201).json(exercise);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

// Get all exercises
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exercises by category
exports.getExercisesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const exercises = await Exercise.find({ category });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update exercise
exports.updateExercise = [
  exerciseUpload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'categoryImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, youtubeLink } = req.body;

      const existingExercise = await Exercise.findById(id);
      if (!existingExercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      const updateData = { name, category, youtubeLink };

      if (req.files) {
        if (req.files.image) {
          // Remove old image if exists
          if (existingExercise.image) {
            const oldImagePath = path.join(__dirname, '../uploads/exercises', existingExercise.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          updateData.image = req.files.image[0].filename;
        }

        if (req.files.categoryImage) {
          // Remove old category image if exists
          if (existingExercise.categoryImage) {
            const oldCategoryImagePath = path.join(__dirname, '../uploads/exercises', existingExercise.categoryImage);
            if (fs.existsSync(oldCategoryImagePath)) {
              fs.unlinkSync(oldCategoryImagePath);
            }
          }
          updateData.categoryImage = req.files.categoryImage[0].filename;
        }
      }

      const exercise = await Exercise.findByIdAndUpdate(id, updateData, { new: true });
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

// Delete exercise
exports.deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findByIdAndDelete(id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Remove associated images
    if (exercise.image) {
      const imagePath = path.join(__dirname, '../uploads/exercises', exercise.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (exercise.categoryImage) {
      const categoryImagePath = path.join(__dirname, '../uploads/exercises', exercise.categoryImage);
      if (fs.existsSync(categoryImagePath)) {
        fs.unlinkSync(categoryImagePath);
      }
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};