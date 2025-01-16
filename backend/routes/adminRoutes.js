const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
} = require('../controllers/adminController');
const adminAuth = require('../middlewares/adminAuth');

// Register Admin
router.post('/register', registerAdmin);

// Login Admin
router.post('/login', loginAdmin);

// Get Admin Profile
router.get('/profile', adminAuth, getAdminProfile);

// Update Admin Profile
router.put('/profile', adminAuth, updateAdminProfile);

module.exports = router;