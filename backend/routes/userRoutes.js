const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const userProductController = require('../controllers/userProductController');
const userOrderController = require('../controllers/userOrderController');
const { createFeedback } = require('../controllers/userFeedbackController');
const { protect } = require('../middlewares/authMiddleware');
const userExerciseController = require('../controllers/userExerciseController');
const { generateWorkoutPlan, getUserWorkoutPlans, deleteWorkoutPlan, getWorkoutPlanById } = require('../controllers/userWorkoutController');

router.post('/signup', signup);
router.post('/login', login);

// Product routes
router.get('/products', userProductController.getAllProducts);
router.get('/products/:id', userProductController.getProductById);

// Order routes (protected)
router.post('/orders', protect, userOrderController.createOrder);
router.get('/orders', protect, userOrderController.getUserOrders);
router.get('/orders/:id', protect, userOrderController.getOrderById);
router.delete('/orders/:id/cancel', protect, userOrderController.cancelOrder);
router.delete('/orders/:id/delete', protect, userOrderController.deleteCancelledOrder);

// Feedback routes (protected)
router.post('/feedback', protect, createFeedback);

// Get Exercises
router.get('/exercises/categories', userExerciseController.getAllCategories);
router.get('/exercises/category/:category', userExerciseController.getExercisesByCategory);
router.get('/exercises/:id', userExerciseController.getExerciseDetails);

// Workout Plan routes (protected)
router.post('/workouts/generate', protect, generateWorkoutPlan);
router.get('/workouts', protect, getUserWorkoutPlans);
router.get('/workouts/:id', protect, getWorkoutPlanById);
router.delete('/workouts/:id', protect, deleteWorkoutPlan);

module.exports = router;