const DietPlan = require('../models/dietPlan');
const UserDietPlan = require('../models/userDietPlan');

/**
 * Calculate daily calorie needs based on user metrics
 */
const calculateCalorieNeeds = (weight, height, age, gender, activityLevel) => {
    // BMR calculation using Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender.toLowerCase() === 'male' ? bmr + 5 : bmr - 161;

    // Activity multipliers
    const multipliers = {
        'sedentary': 1.2,
        'moderate': 1.55,
        'active': 1.725
    };

    return Math.round(bmr * multipliers[activityLevel.toLowerCase()]);
};

/**
 * Find the closest matching diet plan based on calories and goals
 */
const findClosestPlan = async (targetCalories, goal, activityLevel) => {
    // Find all plans matching goal and activity level
    const allMatchingPlans = await DietPlan.find({
        type: { $regex: new RegExp(goal, 'i') },
        activityLevel: { $regex: new RegExp(activityLevel, 'i') },
        isActive: true
    });

    if (!allMatchingPlans.length) {
        return null;
    }

    // Calculate average calories for each plan and find closest match
    return allMatchingPlans.reduce((closest, plan) => {
        const planAvgCalories = (plan.calorieRange.min + plan.calorieRange.max) / 2;
        const planDiff = Math.abs(planAvgCalories - targetCalories);
        const closestDiff = closest ? Math.abs((closest.calorieRange.min + closest.calorieRange.max) / 2 - targetCalories) : Infinity;

        return planDiff < closestDiff ? plan : closest;
    }, null);
};

/**
 * Generate a new diet plan for user
 */
const getDietPlanForUser = async (req, res) => {
    try {
        const { age, gender, height, weight, goal, activityLevel } = req.body;
        const userId = req.user._id;

        // Input validation
        if (!age || !gender || !height || !weight || !goal || !activityLevel) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        console.log('User input:', { age, gender, height, weight, goal, activityLevel });

        // Calculate daily calorie needs
        const maintenanceCalories = calculateCalorieNeeds(weight, height, age, gender, activityLevel);
        console.log('Maintenance calories:', maintenanceCalories);

        // Adjust calories based on goal
        let targetCalories;
        switch(goal.toLowerCase()) {
            case 'weight loss':
                targetCalories = maintenanceCalories - 500;
                break;
            case 'weight gain':
                targetCalories = maintenanceCalories + 500;
                break;
            default:
                targetCalories = maintenanceCalories;
        }
        console.log('Target calories:', targetCalories);

        // Find matching plan
        let matchingPlan = await DietPlan.findOne({
            type: { $regex: new RegExp(goal, 'i') },
            activityLevel: { $regex: new RegExp(activityLevel, 'i') },
            'calorieRange.min': { $lte: targetCalories },
            'calorieRange.max': { $gte: targetCalories },
            isActive: true
        });

        // If no exact match, find closest plan
        if (!matchingPlan) {
            console.log('No exact match found, searching for closest plan...');
            matchingPlan = await findClosestPlan(targetCalories, goal, activityLevel);
        }

        if (!matchingPlan) {
            return res.status(404).json({ 
                success: false,
                message: 'No suitable diet plan found. Please contact support for a custom plan.' 
            });
        }

        // Create new user diet plan
        const userDietPlan = await UserDietPlan.create({
            userId,
            dietPlanId: matchingPlan._id,
            userDetails: { age, gender, height, weight, goal, activityLevel },
            calculatedCalories: targetCalories,
            active: true,
            createdAt: new Date()
        });

        await userDietPlan.populate('dietPlanId');

        res.status(200).json({
            success: true,
            data: userDietPlan,
            message: matchingPlan.calorieRange.min <= targetCalories && 
                    matchingPlan.calorieRange.max >= targetCalories ? 
                    'Exact match found' : 'Closest matching plan found'
        });

    } catch (error) {
        console.error('Error in getDietPlanForUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating diet plan',
            error: error.message
        });
    }
};

/**
 * Get all diet plans for a user with pagination
 */
const getAllUserDietPlans = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const plans = await UserDietPlan.find({ userId })
            .populate('dietPlanId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPlans = await UserDietPlan.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: {
                plans,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalPlans / limit),
                    totalPlans,
                    hasMore: skip + plans.length < totalPlans
                }
            }
        });

    } catch (error) {
        console.error('Error in getAllUserDietPlans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching diet plans',
            error: error.message
        });
    }
};

/**
 * Get a specific diet plan by ID
 */
const getDietPlanById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { planId } = req.params;

        const plan = await UserDietPlan.findOne({
            _id: planId,
            userId
        }).populate('dietPlanId');

        if (!plan) {
            return res.status(404).json({ 
                success: false,
                message: 'Diet plan not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: plan
        });

    } catch (error) {
        console.error('Error in getDietPlanById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching diet plan',
            error: error.message
        });
    }
};

/**
 * Delete a specific diet plan
 */
const deleteDietPlan = async (req, res) => {
    try {
        const userId = req.user._id;
        const { dietPlanId } = req.params;

        // Check if the plan exists and belongs to the user
        const plan = await UserDietPlan.findOne({
            _id: dietPlanId,
            userId
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Diet plan not found or does not belong to the user'
            });
        }

        // Delete the plan
        await UserDietPlan.deleteOne({ _id: dietPlanId });

        res.status(200).json({
            success: true,
            message: 'Diet plan deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteDietPlan:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting diet plan',
            error: error.message
        });
    }
};

module.exports = {
    getDietPlanForUser,
    getAllUserDietPlans,
    getDietPlanById,
    deleteDietPlan
};