const Photo = require('../models/Photo');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const {
    buildFileUrl,
    cleanupUploadedFiles,
    deleteUploadedFile,
} = require('../utils/uploadHelpers');
const { shouldUseCloudinary } = require('../config/storageUtils');
const fs = require('fs');
const path = require('path');

const normalizeProductImagePath = (url = '') => (url.startsWith('http') ? url : url.replace(/^\//, ''));

const adminPhotoController = {
    // Upload single or multiple photos
    uploadPhotos: async (req, res) => {
        console.log('📤 Photo upload request received');
        console.log('📁 Files:', req.files ? req.files.length : 'No files');
        console.log('📋 Body:', req.body);
        console.log('📋 Category from body:', req.body.category);
        console.log('📋 BrandName from body:', req.body.brandName);
        console.log('🔑 Admin:', req.admin ? 'Authenticated' : 'Not authenticated');
        
        try {
            if (!req.files || req.files.length === 0) {
                console.log('❌ No files uploaded');
                return res.status(400).json({ 
                    success: false,
                    message: 'No files uploaded' 
                });
            }

            const { category, brandName, offerData, mediaSlot, transitionEffect } = req.body;
            console.log('✅ Extracted category:', category);
            console.log('✅ Extracted brandName:', brandName);
            const validEffects = ['fade', 'blur', 'fadeOut'];
            const normalizedEffect = validEffects.includes(transitionEffect) ? transitionEffect : 'fade';
            
            if (!category) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Category is required' 
                });
            }

            const validCategories = ['Welcome', 'Nos Marque', 'Best Offers', 'Media'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid category' 
                });
            }

            // Validate brandName for Nos Marque category
            if (category === 'Nos Marque' && !brandName) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Brand name is required for Nos Marque category' 
                });
            }

            // Validate Media category requires slot and exactly 2 photos
            let parsedMediaSlot = null;
            if (category === 'Media') {
                parsedMediaSlot = parseInt(mediaSlot, 10);
                if (![1, 2].includes(parsedMediaSlot)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Media category requires mediaSlot value of 1 or 2'
                    });
                }

                if (!req.files || req.files.length !== 2) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Media category requires exactly 2 photos' 
                    });
                }
            }

            // Validate Best Offers data if category is Best Offers
            if (category === 'Best Offers') {
                const parsedOfferData = offerData ? JSON.parse(offerData) : {};
                const { name, oldPrice, newPrice, brand, reference, description, displaySection } = parsedOfferData;
                
                if (!name || !oldPrice || !newPrice || !brand || !reference || !description) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Best Offers require: name, oldPrice, newPrice, brand, reference, and description' 
                    });
                }

                if (parseFloat(oldPrice) <= parseFloat(newPrice)) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Old price must be greater than new price for Best Offers' 
                    });
                }
            }

            const uploadedPhotos = [];
            const useCloudinary = shouldUseCloudinary();

            // Upload files to Cloudinary if enabled (bypasses signature issues)
            if (useCloudinary && req.files && req.files.length > 0) {
                console.log('☁️ Uploading files to Cloudinary using preset...');
                for (const file of req.files) {
                    try {
                        const filePath = file.path;
                        const uploadResult = await cloudinary.uploader.upload(filePath, {
                            upload_preset: 'protienlab_photos',
                            resource_type: 'image',
                        });
                        
                        // Update file object with Cloudinary info
                        file.filename = uploadResult.public_id;
                        file.path = uploadResult.secure_url;
                        file.url = uploadResult.secure_url;
                        
                        // Delete local file after successful upload
                        fs.unlink(filePath, (err) => {
                            if (err) console.error(`Error deleting local file ${filePath}:`, err);
                        });
                        
                        console.log(`✅ Uploaded to Cloudinary: ${uploadResult.secure_url}`);
                    } catch (uploadError) {
                        console.error(`❌ Error uploading ${file.filename} to Cloudinary:`, uploadError);
                        // Continue with local file if Cloudinary upload fails
                    }
                }
            }

            // For Best Offers, we expect exactly 2 photos (main + additional)
            if (category === 'Best Offers') {
                if (!req.files || req.files.length !== 2) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Best Offers require exactly 2 photos' 
                    });
                }

                // Best Offers: Process as single entry with 2 photos
                const mainFile = req.files[0];
                const photoData = {
                    filename: mainFile.filename,
                    url: buildFileUrl('photos', mainFile),
                    category: category
                };

                const parsedOfferData = JSON.parse(offerData);
                photoData.offerData = {
                    name: parsedOfferData.name,
                    oldPrice: parseFloat(parsedOfferData.oldPrice),
                    newPrice: parseFloat(parsedOfferData.newPrice),
                    brand: parsedOfferData.brand,
                    reference: parsedOfferData.reference,
                    description: parsedOfferData.description,
                    bigDescription: parsedOfferData.bigDescription || '',
                    displaySection: parsedOfferData.displaySection === 'Nos Pack' ? 'Nos Pack' : 'Best Offers',
                    additionalPhotos: []
                };

                // Add additional photos if they exist
                if (req.files.length > 1) {
                    for (let i = 1; i < req.files.length; i++) {
                        const additionalFile = req.files[i];
                        photoData.offerData.additionalPhotos.push({
                            filename: additionalFile.filename,
                            url: buildFileUrl('photos', additionalFile)
                        });
                    }
                }

                // Create or update linked Product when Best Offers
                const mainImgUrl = normalizeProductImagePath(photoData.url);
                const additionalImgs = photoData.offerData.additionalPhotos.map(p => normalizeProductImagePath(p.url));
                const images = [mainImgUrl, additionalImgs[0]].filter(Boolean);

                const upsertData = {
                    name: photoData.offerData.name,
                    descriptionShort: photoData.offerData.description,
                    descriptionFull: photoData.offerData.bigDescription || photoData.offerData.description,
                    price: photoData.offerData.newPrice,
                    images,
                    stock: Number(parsedOfferData.stock ?? 0),
                    isActive: true
                };

                let productIdToLink = null;
                if (parsedOfferData.productId) {
                    const updated = await Product.findByIdAndUpdate(parsedOfferData.productId, upsertData, { new: true });
                    productIdToLink = updated?._id || null;
                } else {
                    const created = await Product.create(upsertData);
                    productIdToLink = created._id;
                }

                photoData.offerData.productId = productIdToLink;

                const photo = new Photo(photoData);
                await photo.save();
                uploadedPhotos.push(photo);
            } else if (category === 'Media') {
                const slides = req.files.map(file => ({
                    filename: file.filename,
                    url: buildFileUrl('photos', file)
                }));

                const slotData = {
                    filename: slides[0].filename,
                    url: slides[0].url,
                    category,
                    mediaSlot: parsedMediaSlot,
                    slides,
                    transitionEffect: normalizedEffect,
                    isActive: true
                };

                const photo = await Photo.findOneAndUpdate(
                    { category: 'Media', mediaSlot: parsedMediaSlot },
                    slotData,
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );

                uploadedPhotos.push(photo);
            } else {
                // For Welcome and Nos Marque, create one Photo entry per file
                for (const file of req.files) {
                    const photoData = {
                        filename: file.filename,
                        url: buildFileUrl('photos', file),
                        category: category,
                        transitionEffect: normalizedEffect
                    };
                    
                    // Add brandName if category is Nos Marque
                    if (category === 'Nos Marque') {
                        photoData.brandName = brandName;
                    }
                    
                    const photo = new Photo(photoData);
                    await photo.save();
                    uploadedPhotos.push(photo);
                }
            }

            res.status(201).json({
                success: true,
                message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
                data: uploadedPhotos
            });

        } catch (error) {
            console.error('❌ Upload error:', error);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Error details:', {
                message: error.message,
                name: error.name,
                code: error.code
            });
            
            // Clean up uploaded files if database save fails
            try {
                if (req.files && req.files.length > 0) {
                    await cleanupUploadedFiles(req.files, 'photos');
                }
            } catch (cleanupError) {
                console.error('❌ Error during cleanup:', cleanupError);
            }
            
            // Determine appropriate status code
            const statusCode = error.status || (error.name === 'ValidationError' ? 400 : 500);
            
            res.status(statusCode).json({ 
                success: false,
                message: error.message || 'Failed to upload photos',
                ...(process.env.NODE_ENV === 'development' && { 
                    error: error.name,
                    stack: error.stack 
                })
            });
        }
    },

    // Get all photos with pagination and filtering
    getAllPhotos: async (req, res) => {
        console.log('📥 Get all photos request received');
        console.log('🔑 Admin:', req.admin ? 'Authenticated' : 'Not authenticated');
        console.log('📋 Query:', req.query);
        
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const { category, isActive } = req.query;

            const filter = {};
            if (category) filter.category = category;
            if (isActive !== undefined) filter.isActive = isActive === 'true';

            const photos = await Photo.find(filter)
                .sort({ uploadDate: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Photo.countDocuments(filter);

            res.json({
                success: true,
                data: photos,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalPhotos: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    },

    // Get photos by category (for public display)
    getPhotosByCategory: async (req, res) => {
        console.log('📥 Get photos by category request received');
        console.log('🏷️ Category:', req.params.category);
        console.log('🔗 Full URL:', req.originalUrl);
        
        try {
            const { category } = req.params;
            console.log('🔍 Searching for category:', category);
            
            // Handle special cases for Best Offers and Nos Pack
            if (category === 'Best Offers' || category === 'Nos Pack') {
                console.log('📦 Special category - searching by offerData.displaySection');
                console.log('🔍 Looking for displaySection:', category);
                
                // Search for photos with matching displaySection in offerData
                // Also ensure category is NOT 'Nos Marque' and has no brandName to exclude brand photos
                const photos = await Photo.find({ 
                    'offerData.displaySection': category,
                    category: { $ne: 'Nos Marque' }, // Explicitly exclude brand photos
                    brandName: { $exists: false }, // Brand photos always have brandName
                    isActive: true,
                    'offerData': { $exists: true }, // Ensure offerData exists
                    'offerData.oldPrice': { $exists: true, $gt: 0 }, // Must have valid oldPrice
                    'offerData.newPrice': { $exists: true, $gt: 0 } // Must have valid newPrice
                }).sort({ uploadDate: -1 });
                
                console.log('📸 Found photos:', photos.length);
                if (photos.length > 0) {
                    console.log('📋 Sample photo:', {
                        id: photos[0]._id,
                        category: photos[0].category,
                        displaySection: photos[0].offerData?.displaySection,
                        name: photos[0].offerData?.name
                    });
                } else {
                    console.log('⚠️ No photos found. Checking all Best Offers photos...');
                    const allOffers = await Photo.find({ 
                        category: 'Best Offers',
                        isActive: true 
                    });
                    console.log('📊 Total Best Offers photos:', allOffers.length);
                    allOffers.forEach((p, i) => {
                        console.log(`  Photo ${i + 1}: displaySection = ${p.offerData?.displaySection || 'undefined'}`);
                    });
                }
                
                return res.json({
                    success: true,
                    data: photos,
                    category: category,
                    count: photos.length
                });
            }
            
            const validCategories = ['Welcome', 'Nos Marque', 'Best Offers', 'Media'];
            if (!validCategories.includes(category) && category !== 'Nos Pack') {
                console.log('❌ Invalid category:', category);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid category' 
                });
            }

            console.log('✅ Category is valid, searching database...');
            // For Nos Marque, return all active photos with brandName (matching admin behavior)
            // Don't filter by offerData to match what admin shows in brand filter
            let filter;
            if (category === 'Nos Marque') {
                filter = {
                    category: 'Nos Marque',
                    isActive: true,
                    brandName: { $exists: true, $ne: '', $ne: null } // Only return photos with brandName
                };
            } else if (category === 'Media') {
                // For Media, return only active photos grouped by slot
                filter = {
                    category: 'Media',
                    isActive: true,
                    mediaSlot: { $in: [1, 2] }
                };
            } else {
                filter = {
                    category: category,
                    isActive: true
                };
            }
            // Note: Best Offers is handled in the special case above
            
            let query = Photo.find(filter);
            if (category === 'Media') {
                query = query.sort({ mediaSlot: 1, updatedAt: -1 }).limit(2);
            } else {
                query = query.sort({ uploadDate: -1 });
            }

            const photos = await query;

            console.log('📸 Found photos:', photos.length);
            
            // Log brand names for debugging
            if (category === 'Nos Marque') {
                console.log('🏷️ Brand names in photos:');
                photos.forEach((photo, idx) => {
                    console.log(`  Photo ${idx + 1}: brandName = "${photo.brandName || 'MISSING'}", isActive = ${photo.isActive}`);
                });
            }

            res.json({
                success: true,
                data: photos,
                category: category,
                count: photos.length
            });

        } catch (error) {
            console.error('❌ Error in getPhotosByCategory:', error);
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    },

    // Get all active photos (for public display)
    getActivePhotos: async (req, res) => {
        try {
            const photos = await Photo.find({ isActive: true })
                .sort({ category: 1, uploadDate: -1 });

            // Group photos by category
            const groupedPhotos = photos.reduce((acc, photo) => {
                if (!acc[photo.category]) {
                    acc[photo.category] = [];
                }
                acc[photo.category].push(photo);
                return acc;
            }, {});

            res.json({
                success: true,
                data: groupedPhotos,
                categories: Object.keys(groupedPhotos),
                totalPhotos: photos.length
            });

        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    },

    // Get single photo
    getPhotoById: async (req, res) => {
        try {
            const photo = await Photo.findById(req.params.id);
            
            if (!photo) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Photo not found' 
                });
            }

            res.json({
                success: true,
                data: photo
            });

        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    },

    // Update photo
    updatePhoto: async (req, res) => {
        try {
            const { category, brandName, isActive, offerData, transitionEffect } = req.body;
            const photo = await Photo.findById(req.params.id);

            if (!photo) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Photo not found' 
                });
            }

            // Validate category
            if (category) {
                const validCategories = ['Welcome', 'Nos Marque', 'Best Offers', 'Media'];
                if (!validCategories.includes(category)) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Invalid category' 
                    });
                }
            }

            // Validate brandName for Nos Marque
            const finalCategory = category || photo.category;
            if (finalCategory === 'Nos Marque' && !brandName && !photo.brandName) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Brand name is required for Nos Marque category' 
                });
            }

            const updateData = {};
            if (category) updateData.category = category;
            if (brandName) updateData.brandName = brandName;
            if (isActive !== undefined) updateData.isActive = isActive;
            
            let finalOfferData = photo.offerData;
            if (offerData) {
                finalOfferData = JSON.parse(offerData);
                updateData.offerData = finalOfferData;
            }
            
            if (transitionEffect) {
                const validEffects = ['fade', 'blur', 'fadeOut'];
                if (validEffects.includes(transitionEffect)) {
                    updateData.transitionEffect = transitionEffect;
                }
            }

            // Sync with Product collection if it's an offer
            if (finalCategory === 'Best Offers' && finalOfferData) {
                const upsertData = {
                    name: finalOfferData.name,
                    descriptionShort: finalOfferData.description,
                    descriptionFull: finalOfferData.bigDescription || finalOfferData.description,
                    price: finalOfferData.newPrice,
                    brand: finalOfferData.brand,
                    reference: finalOfferData.reference,
                    // If image is updated below, it will be handled. Otherwise use existing.
                    stock: 9999, // Set high stock as per "no limit" requirement
                    isActive: true
                };

                let productIdToLink = finalOfferData.productId;
                if (productIdToLink) {
                    await Product.findByIdAndUpdate(productIdToLink, upsertData);
                } else {
                    const created = await Product.create(upsertData);
                    productIdToLink = created._id;
                }
                
                if (updateData.offerData) {
                    updateData.offerData.productId = productIdToLink;
                } else {
                    updateData['offerData.productId'] = productIdToLink;
                }
            }

            // Handle file upload if new photo provided
            if (req.files && req.files.length > 0) {
                const file = req.files[0];
                const useCloudinary = shouldUseCloudinary();
                
                // Delete old file
                await deleteUploadedFile({ filename: photo.filename, path: photo.url }, 'photos');

                if (useCloudinary) {
                    try {
                        const uploadResult = await cloudinary.uploader.upload(file.path, {
                            upload_preset: 'protienlab_photos',
                            resource_type: 'image',
                        });
                        
                        updateData.filename = uploadResult.public_id;
                        updateData.url = uploadResult.secure_url;
                        
                        // Clean up local temp file
                        fs.unlink(file.path, (err) => {
                            if (err) console.error(`Error deleting local file ${file.path}:`, err);
                        });
                    } catch (uploadError) {
                        console.error(`❌ Error uploading to Cloudinary:`, uploadError);
                        // Fallback or error handling
                    }
                } else {
                    updateData.filename = file.filename;
                    updateData.url = buildFileUrl('photos', file);
                }
            }

            const updatedPhoto = await Photo.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                message: 'Photo updated successfully',
                data: updatedPhoto
            });

        } catch (error) {
            console.error('Update error:', error);
            res.status(400).json({ 
                success: false,
                message: error.message 
            });
        }
    },

    // Delete photo
    deletePhoto: async (req, res) => {
        try {
            const photo = await Photo.findById(req.params.id);

            if (!photo) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Photo not found' 
                });
            }

            await deleteUploadedFile({ filename: photo.filename, path: photo.url }, 'photos');

            // Delete from database
            await Photo.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Photo deleted successfully'
            });

        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    },

    // Get photo statistics
    getPhotoStats: async (req, res) => {
        try {
            const stats = await Photo.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        activeCount: {
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                        }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            const totalPhotos = await Photo.countDocuments();
            const activePhotos = await Photo.countDocuments({ isActive: true });

            res.json({
                success: true,
                data: {
                    totalPhotos,
                    activePhotos,
                    categoryStats: stats
                }
            });

        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: error.message 
            });
        }
    }
};

module.exports = adminPhotoController;
