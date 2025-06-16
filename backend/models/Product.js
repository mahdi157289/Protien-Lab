const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    descriptionShort: {
        type: String,
        required: true
    },
    descriptionFull: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: { // Changed from "image" to "images"
        type: [String], // Array of image paths
        required: true,
        validate: [arr => arr.length === 2, 'Exactly two images are required']
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);