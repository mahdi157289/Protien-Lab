const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getDietPlanForUser,
    getAllUserDietPlans,
    getDietPlanById,
    deleteDietPlan
} = require('../controllers/dietPlanController');

// Diet plan routes
router.post('/generate', protect, getDietPlanForUser);
router.get('/all', protect, getAllUserDietPlans);
router.get('/:planId', protect, getDietPlanById);
router.delete('/:dietPlanId', protect, deleteDietPlan);

module.exports = router;