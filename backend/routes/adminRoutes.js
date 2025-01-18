const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
} = require('../controllers/adminController');
const {
  createDietPlan,
  getAllDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan
} = require('../controllers/adminDietPlanController');
const adminAuth = require('../middlewares/adminAuth');

// Admin Authentication Routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', adminAuth, getAdminProfile);
router.put('/profile', adminAuth, updateAdminProfile);

// Admin Diet Plan Routes
router.post('/diet-plans', adminAuth, createDietPlan);
router.get('/diet-plans', adminAuth, getAllDietPlans);
router.get('/diet-plans/:id', adminAuth, getDietPlan);
router.put('/diet-plans/:id', adminAuth, updateDietPlan);
router.delete('/diet-plans/:id', adminAuth, deleteDietPlan);

module.exports = router;