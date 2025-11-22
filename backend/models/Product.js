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
    images: {
        type: [String],
        required: true,
        validate: [arr => arr.length >= 2 && arr.length <= 6, 'Between 2 and 6 images are required']
    },
    categories: {
        type: [String],
        enum: ['Whey', 'Mass Gainer', 'Isolate Whey', 'Vitamines & Minerals', 'Creatine', 'Acide Amine', 'Pre-Workout', 'Fat Burner', 'Testobooster', 'Join-Flex', 'Fish oil', 'Carbs', 'Snacks', 'Shakers', 'Accesoires'],
        default: []
    },
    isBestSeller: {
        type: Boolean,
        default: false
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
    },
    flavors: {
        type: [String],
        default: []
    },
    weights: {
        type: [String],
        default: []
    },
    benefits: {
        type: [String],
        default: []
    },
    isNew: {
        type: Boolean,
        default: false
    },
    fastDelivery: {
        type: Boolean,
        default: false
    },
    limitedStockNotice: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);