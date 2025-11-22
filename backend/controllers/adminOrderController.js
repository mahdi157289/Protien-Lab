const Order = require('../models/Order');
const Product = require('../models/Product');

const adminOrderController = {
    getAllOrders: async (req, res) => {
        try {
            const { status, startDate, endDate, userId, productId, minAmount, maxAmount, search } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const filter = {};

            // Filter by status
            if (status) {
                filter.status = status;
            }

            // Filter by date range
            if (startDate && endDate) {
                filter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            // Filter by user ID
            if (userId) {
                filter.user = userId;
            }

            // Filter by product ID
            if (productId) {
                filter['orderItems.product'] = productId;
            }

            // Filter by total amount range
            if (minAmount || maxAmount) {
                filter.totalAmount = {};
                if (minAmount) filter.totalAmount.$gte = parseFloat(minAmount);
                if (maxAmount) filter.totalAmount.$lte = parseFloat(maxAmount);
            }

            // Search by user name, email, or order ID
            if (search) {
                const users = await User.find({
                    $or: [
                        { firstName: { $regex: search, $options: 'i' } },
                        { lastName: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }).select('_id');

                filter.$or = [
                    { _id: mongoose.Types.ObjectId.isValid(search) ? search : null },
                    { user: { $in: users.map(user => user._id) } }
                ];
            }

            const orders = await Order.find(filter)
                .populate({
                    path: 'user',
                    select: 'firstName lastName email',
                    options: { strictPopulate: false }  // Allow null users for guest orders
                })
                .populate('orderItems.product', 'name price')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Order.countDocuments(filter);

            res.json({
                orders,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Prevent status change if the order is cancelled
            if (order.status === 'Cancelled') {
                return res.status(400).json({ 
                    message: 'Cannot change the status of a cancelled order' 
                });
            }

            // Update the order status
            order.status = status;
            await order.save();

            res.json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    cancelOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Check if the order can be cancelled
            if (order.status === 'Shipped' || order.status === 'Delivered') {
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
            const order = await Order.findById(req.params.id);

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

module.exports = adminOrderController;