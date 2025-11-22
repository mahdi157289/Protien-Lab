const express = require('express');
const router = express.Router();
const photoController = require('../controllers/adminPhotoController');

// Public photo routes (no authentication required)
router.get('/', photoController.getActivePhotos);
router.get('/category/:category', photoController.getPhotosByCategory);
router.get('/test', async (req, res) => {
    console.log('🧪 Photo test endpoint hit');
    try {
        const Photo = require('../models/Photo');
        const allPhotos = await Photo.find({});
        const activePhotos = await Photo.find({ isActive: true });
        const nosMarquePhotos = await Photo.find({ 
            category: 'Nos Marque',
            isActive: true,
            offerData: { $exists: false }
        });
        const brandNames = await Photo.distinct('brandName', { 
            category: 'Nos Marque',
            isActive: true,
            offerData: { $exists: false },
            brandName: { $exists: true, $ne: '' }
        });
        
        res.json({
            message: 'Photo test endpoint working',
            totalPhotos: allPhotos.length,
            activePhotos: activePhotos.length,
            nosMarquePhotos: nosMarquePhotos.length,
            brandCount: brandNames.length,
            brandNames: brandNames
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

