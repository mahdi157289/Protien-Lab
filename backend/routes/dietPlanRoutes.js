const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getDietPlanForUser,
    getUserCurrentDietPlan,
    deleteDietPlan
} = require('../controllers/dietPlanController');

router.post('/generate', protect, getDietPlanForUser);
router.get('/current', protect, getUserCurrentDietPlan);
router.delete('/:dietPlanId', protect, deleteDietPlan);

module.exports = router;