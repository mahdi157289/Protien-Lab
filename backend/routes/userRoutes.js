const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const userProductController = require('../controllers/userProductController');
const userOrderController = require('../controllers/userOrderController');
const { protect } = require('../middlewares/authMiddleware');

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

module.exports = router;