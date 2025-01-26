const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');

const muscleGroupPairings = [
  ['Chest Exercises', 'Triceps Exercises'],
  ['Biceps Exercises', 'Lats Exercises'],
  ['Abs Exercises', 'Lower Back Exercises'],
  ['Quad Exercises', 'Glute Exercises'],
  ['Hamstring Exercises', 'Calf Exercises'],
  ['Upper Back Exercises', 'Forearm Exercises']
];

// Generate Workout Plan
const generateWorkoutPlan = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { name } = req.body;

    const workoutPlanDays = [];

    // Generate 6 days of workouts
    for (let i = 0; i < 6; i++) {
      const [primaryGroup, secondaryGroup] = muscleGroupPairings[i];

      // Find 5 exercises for primary group
      const primaryExercises = await Exercise.aggregate([
        { $match: { category: primaryGroup } },
        { $sample: { size: 5 } }
      ]);

      // Find 5 exercises for secondary group
      const secondaryExercises = await Exercise.aggregate([
        { $match: { category: secondaryGroup } },
        { $sample: { size: 5 } }
      ]);

      workoutPlanDays.push({
        day: i + 1,
        muscleGroups: [primaryGroup, secondaryGroup],
        exercises: [...primaryExercises.map(e => e._id), ...secondaryExercises.map(e => e._id)]
      });
    }

    // Create workout plan
    const workoutPlan = await WorkoutPlan.create({
      user: userId,
      name: name || `Workout Plan ${new Date().toLocaleDateString()}`,
      days: workoutPlanDays
    });

    res.status(201).json(workoutPlan);
  } catch (error) {
    console.error('Workout Plan Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate workout plan' });
  }
};

// Get User's Workout Plans
const getUserWorkoutPlans = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const workoutPlans = await WorkoutPlan.find({ user: userId })
      .populate({
        path: 'days.exercises',
        select: 'name category description image'
      });
    
    res.status(200).json(workoutPlans);
  } catch (error) {
    console.error('Get Workout Plans Error:', error);
    res.status(500).json({ message: 'Failed to retrieve workout plans' });
  }
};

// Get Specific Workout Plan
const getWorkoutPlanById = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate({
        path: 'days.exercises',
        select: 'name category description image'
      });

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    res.status(200).json(plan);
  } catch (error) {
    console.error('Get Workout Plan Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Specific Workout Plan
const deleteWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;

    const workoutPlan = await WorkoutPlan.findOneAndDelete({ 
      _id: id, 
      user: userId 
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.status(200).json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Delete Workout Plan Error:', error);
    res.status(500).json({ message: 'Failed to delete workout plan' });
  }
};

module.exports = { 
  generateWorkoutPlan, 
  getUserWorkoutPlans, 
  deleteWorkoutPlan,
  getWorkoutPlanById 
};