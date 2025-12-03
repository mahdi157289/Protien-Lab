const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAdminProfile, updateAdminProfile } = require('../controllers/adminController');
const {createDietPlan, getAllDietPlans, getDietPlan, updateDietPlan, deleteDietPlan } = require('../controllers/adminDietPlanController');
const { getAllPosts, getPostAnalytics, deletePost, getPostDetails } = require('../controllers/adminPostController');
const productController = require('../controllers/adminProductController');
const orderController = require('../controllers/adminOrderController');
const upload = require('../config/uploadProduct');
const adminAuth = require('../middlewares/adminAuth');
const adminUserController = require('../controllers/adminUserController');
const { getAllFeedbacks } = require('../controllers/adminFeedbackController');
const exerciseController = require('../controllers/adminExerciseController');
const photoController = require('../controllers/adminPhotoController');
const photoUpload = require('../config/photoUpload');

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

// Admin routes for Victory Wall management
router.get('/posts', adminAuth, getAllPosts);
router.get('/posts/analytics', adminAuth, getPostAnalytics);
router.get('/posts/:id', adminAuth, getPostDetails);
router.delete('/posts/:id', adminAuth, deletePost);

// Product routes
router.post('/products', adminAuth, upload.array('images', 6), productController.createProduct);
router.get('/products', adminAuth, productController.getAllProducts);
router.put('/products/:id', adminAuth, upload.array('images', 6), productController.updateProduct);
router.delete('/products/:id', adminAuth, productController.deleteProduct);

// Order routes
router.get('/orders', adminAuth, orderController.getAllOrders);
router.put('/orders/:id/status', adminAuth, orderController.updateOrderStatus);
router.put('/orders/:id/cancel', adminAuth, orderController.cancelOrder);
router.delete('/orders/:id/delete', adminAuth, orderController.deleteCancelledOrder);

// User routes
router.get('/users', adminAuth, adminUserController.getAllUsers);
router.get('/users/:id', adminAuth, adminUserController.getUserById);
router.put('/users/:id', adminAuth, adminUserController.updateUserById);
router.delete('/users/:id', adminAuth, adminUserController.deleteUserById);
router.get('/users/search', adminAuth, adminUserController.searchUsers);

// Feedback routes
router.get('/feedback', adminAuth, getAllFeedbacks);

// Exercise routes
router.post('/exercises', adminAuth, ...exerciseController.createExercise);
router.get('/exercises', exerciseController.getAllExercises);
router.get('/exercises/category/:category', exerciseController.getExercisesByCategory);
router.put('/exercises/:id', adminAuth, ...exerciseController.updateExercise);
router.delete('/exercises/:id', adminAuth, exerciseController.deleteExercise);

// Photo routes
router.get('/photos/test', adminAuth, (req, res) => {
    console.log('🧪 Photo test endpoint hit');
    res.json({ message: 'Photo routes are working!', admin: req.admin ? 'Authenticated' : 'Not authenticated' });
});
router.post('/photos', adminAuth, photoUpload.array('photos', 10), photoController.uploadPhotos);
router.get('/photos', adminAuth, photoController.getAllPhotos);
router.get('/photos/stats', adminAuth, photoController.getPhotoStats);
router.get('/photos/:id', adminAuth, photoController.getPhotoById);
router.put('/photos/:id', adminAuth, photoController.updatePhoto);
router.delete('/photos/:id', adminAuth, photoController.deletePhoto);

module.exports = router;