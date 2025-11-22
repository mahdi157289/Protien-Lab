const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true,
        enum: ['Welcome', 'Nos Marque', 'Best Offers', 'Media'],
        trim: true
    },
    brandName: {
        type: String,
        trim: true,
        // Required only if category is 'Nos Marque'
        required: function() {
            return this.category === 'Nos Marque';
        }
    },
    mediaSlot: {
        type: Number,
        enum: [1, 2],
        required: function() {
            return this.category === 'Media';
        }
    },
    slides: {
        type: [{
            filename: {
                type: String,
                trim: true
            },
            url: {
                type: String,
                trim: true
            }
        }],
        validate: [{
            validator: function(slides) {
                if (this.category !== 'Media') return true;
                return Array.isArray(slides) && slides.length === 2;
            },
            message: 'Media entries require exactly 2 slides'
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Best Offers specific fields
    offerData: {
        name: {
            type: String,
            trim: true
        },
        oldPrice: {
            type: Number,
            min: 0
        },
        newPrice: {
            type: Number,
            min: 0
        },
        brand: {
            type: String,
            trim: true
        },
        reference: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        bigDescription: {
            type: String,
            trim: true
        },
        // Link to store product to enable ordering
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        // Controls where this offer appears on client
        displaySection: {
            type: String,
            enum: ['Best Offers', 'Nos Pack'],
            default: 'Best Offers'
        },
        additionalPhotos: [{
            filename: String,
            url: String
        }]
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
photoSchema.index({ category: 1 });
photoSchema.index({ category: 1, mediaSlot: 1 });
photoSchema.index({ uploadDate: -1 });
photoSchema.index({ isActive: 1 });

module.exports = mongoose.model('Photo', photoSchema);

