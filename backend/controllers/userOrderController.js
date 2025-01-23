const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const userOrderController = {
    createOrder: async (req, res) => {
        try {
            const { orderItems, shippingAddress } = req.body;

            if (!orderItems || orderItems.length === 0) {
                return res.status(400).json({ message: 'No order items' });
            }

            // Calculate total and verify product availability
            let totalAmount = 0;
            const updatedOrderItems = [];

            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (!product) {
                    return res.status(404).json({ 
                        message: `Product not found: ${item.product}` 
                    });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for ${product.name}` 
                    });
                }

                // Add price to the order item
                updatedOrderItems.push({
                    product: item.product,
                    quantity: item.quantity,
                    price: product.price // Include the price from the product
                });

                totalAmount += product.price * item.quantity;

                // Update product stock
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }

            const order = new Order({
                user: req.user._id,
                orderItems: updatedOrderItems, // Use the updated order items with price
                shippingAddress: {
                    ...shippingAddress,
                    fullName: `${req.user.firstName} ${req.user.lastName}`,
                    email: req.user.email
                },
                totalAmount,
                paymentMethod: 'Cash on Delivery'
            });

            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getUserOrders: async (req, res) => {
        try {
            const orders = await Order.find({ user: req.user._id })
                .populate('orderItems.product', 'name price image')
                .sort({ createdAt: -1 });

            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getOrderById: async (req, res) => {
        try {
            const order = await Order.findOne({
                _id: req.params.id,
                user: req.user._id
            }).populate('orderItems.product', 'name price image');

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const order = await Order.findOne({
                _id: req.params.id,
                user: req.user._id // Ensure the order belongs to the logged-in user
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Check if the order can be cancelled
            if (order.status !== 'Pending' && order.status !== 'Processing') {
                return res.status(400).json({ 
                    message: 'Order cannot be cancelled at this stage' 
                });
            }

            // Update the order status to "Cancelled"
            order.status = 'Cancelled';
            await order.save();

            // Restore product stock (optional)
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }

            res.json({ message: 'Order cancelled successfully', order });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    deleteCancelledOrder: async (req, res) => {
        try {
            const order = await Order.findOne({
                _id: req.params.id,
                user: req.user._id // Ensure the order belongs to the logged-in user
            });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Check if the order is cancelled
            if (order.status !== 'Cancelled') {
                return res.status(400).json({ 
                    message: 'Only cancelled orders can be deleted' 
                });
            }

            // Delete the order
            await Order.findByIdAndDelete(req.params.id);

            res.json({ message: 'Cancelled order deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userOrderController;