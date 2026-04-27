const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
                const isVirtual = typeof item.product === 'string' && item.product.startsWith('offer-');
                let product = null;
                let price = 0;

                if (!isVirtual) {
                    product = await Product.findById(item.product);
                    if (!product) {
                        return res.status(404).json({ 
                            message: `Product not found: ${item.product}` 
                        });
                    }
                    price = product.price;
                    
                    // Update product stock (allowing negative stock if needed, as per user's "no limit")
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.quantity }
                    });
                } else {
                    // Handling virtual offer (e.g. from Nos Pack)
                    // The client should send the price in the item if it's virtual, 
                    // otherwise we'd need to fetch the Photo/Offer but for now we'll trust the request or a default.
                    price = item.price || 0;
                }

                updatedOrderItems.push({
                    product: isVirtual ? null : item.product,
                    quantity: item.quantity,
                    price: price
                });

                totalAmount += price * item.quantity;
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
                .populate('orderItems.product', 'name price images image')
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
            }).populate('orderItems.product', 'name price images image');

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
    },

    createGuestOrder: async (req, res) => {
        try {
            const { orderItems, shippingAddress } = req.body;

            if (!orderItems || orderItems.length === 0) {
                return res.status(400).json({ message: 'No order items' });
            }

            if (!shippingAddress || !shippingAddress.email || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.phoneNumber) {
                return res.status(400).json({ message: 'All shipping information is required' });
            }

            // Calculate total and verify product availability
            let totalAmount = 0;
            const updatedOrderItems = [];

            for (const item of orderItems) {
                const isVirtual = typeof item.product === 'string' && item.product.startsWith('offer-');
                let product = null;
                let price = 0;

                if (!isVirtual) {
                    product = await Product.findById(item.product);
                    if (!product) {
                        return res.status(404).json({ 
                            message: `Product not found: ${item.product}` 
                        });
                    }
                    price = product.price;

                    // Update product stock
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: -item.quantity }
                    });
                } else {
                    price = item.price || 0;
                }

                updatedOrderItems.push({
                    product: isVirtual ? null : item.product,
                    quantity: item.quantity,
                    price: price
                });

                totalAmount += price * item.quantity;
            }

            // Ensure a user account exists for this email
            let user = await User.findOne({ email: shippingAddress.email });
            let createdAccount = false;
            let tempPassword = null;

            if (!user) {
                const [firstNameRaw, ...rest] = shippingAddress.fullName.trim().split(' ');
                const firstName = firstNameRaw || 'Guest';
                const lastName = rest.join(' ') || 'User';
                tempPassword = crypto.randomBytes(6).toString('base64url'); // URL-safe temp password
                
                user = new User({
                    firstName,
                    lastName,
                    email: shippingAddress.email,
                    password: tempPassword,
                    address: shippingAddress.address,
                    number: shippingAddress.phoneNumber
                });
                await user.save();
                createdAccount = true;
            }

            // Create the order and attach user
            const order = new Order({
                user: user?._id || null,
                orderItems: updatedOrderItems,
                shippingAddress: {
                    fullName: shippingAddress.fullName,
                    address: shippingAddress.address,
                    phoneNumber: shippingAddress.phoneNumber,
                    email: shippingAddress.email
                },
                totalAmount,
                paymentMethod: 'Cash on Delivery'
            });

            const createdOrder = await order.save();

            // Build auth payload only when a new account was created
            let auth = null;
            if (createdAccount) {
                if (process.env.JWT_SECRET) {
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
                    auth = {
                        token,
                        user: {
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            address: user.address,
                            number: user.number,
                            gender: user.gender || '',
                            height: user.height || null,
                            weight: user.weight || null,
                            profileImage: user.profileImage || ''
                        }
                    };
                } else {
                    auth = null;
                }
            }

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                order: createdOrder,
                createdAccount,
                existingAccount: !createdAccount,
                credentials: createdAccount ? { email: user.email, tempPassword } : null,
                auth
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = userOrderController;
