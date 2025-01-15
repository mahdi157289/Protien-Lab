const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                address: user.address,
                mobileNumber: user.number,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                profileImage: user.profileImage
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.email = req.body.email || user.email;
            user.address = req.body.address || user.address;
            user.number = req.body.mobileNumber || user.number;
            user.gender = req.body.gender || user.gender;
            user.height = req.body.height || user.height;
            user.weight = req.body.weight || user.weight;

            const updatedUser = await user.save();

            res.json({
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                address: updatedUser.address,
                mobileNumber: updatedUser.number,
                gender: updatedUser.gender,
                height: updatedUser.height,
                weight: updatedUser.weight,
                profileImage: updatedUser.profileImage
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload profile image
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile image if it exists
        if (user.profileImage) {
            const oldImagePath = path.join(__dirname, '..', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update user with new image path
        user.profileImage = req.file.path.replace(/\\/g, '/');
        await user.save();

        res.json({
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage
        });
    } catch (error) {
        // Delete uploaded file if error occurs
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, updateProfile, uploadImage };