const Exercise = require('../models/Exercise');

// Get all exercise categories
exports.getAllCategories = async (req, res) => {
    try {
      const categories = [
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
      ];
  
      const categoriesWithImages = await Promise.all(categories.map(async (category) => {
        const exercise = await Exercise.findOne({ category }).select('categoryImage');
        return {
          name: category,
          image: exercise ? exercise.categoryImage : null
        };
      }));
  
      res.json(categoriesWithImages);
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

// Get single exercise details
exports.getExerciseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};