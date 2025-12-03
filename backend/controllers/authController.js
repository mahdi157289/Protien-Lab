const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured. Please set JWT_SECRET environment variable.');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ 
            message: error.message || 'An error occurred during signup',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                address: user.address,
                number: user.number,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ 
            message: error.message || 'An error occurred during login',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = { signup, login };