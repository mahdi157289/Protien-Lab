const Exercise = require('../models/Exercise');
const exerciseUpload = require('../config/exerciseUpload');
const cloudinary = require('../config/cloudinary');
const { shouldUseCloudinary } = require('../config/storageUtils');
const fs = require('fs');
const {
  buildFileUrl,
  cleanupUploadedFiles,
  deleteStoredPath,
} = require('../utils/uploadHelpers');

// Create new exercise
exports.createExercise = [
  exerciseUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'categoryImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, category, youtubeLink } = req.body;
      
      if (!req.files || !req.files.image || !req.files.categoryImage) {
        return res.status(400).json({ message: 'Both exercise and category images are required' });
      }

      const useCloudinary = shouldUseCloudinary();

      // Upload files to Cloudinary if enabled (bypasses signature issues)
      if (useCloudinary) {
        console.log('☁️ Uploading exercise files to Cloudinary using preset...');
        
        // Upload image
        if (req.files.image && req.files.image[0]) {
          try {
            const imageFile = req.files.image[0];
            const imagePath = imageFile.path;
            const uploadResult = await cloudinary.uploader.upload(imagePath, {
              upload_preset: 'protienlab_photos',
              resource_type: 'image',
              folder: 'protienlab/exercises/images',
            });
            
            // Update file object with Cloudinary info
            imageFile.filename = uploadResult.public_id;
            imageFile.path = uploadResult.secure_url;
            imageFile.url = uploadResult.secure_url;
            
            // Delete local file after successful upload
            fs.unlink(imagePath, (err) => {
              if (err) console.error(`Error deleting local file ${imagePath}:`, err);
            });
            
            console.log(`✅ Uploaded exercise image to Cloudinary: ${uploadResult.secure_url}`);
          } catch (uploadError) {
            console.error(`❌ Error uploading exercise image to Cloudinary:`, uploadError);
            throw new Error(`Cloudinary upload failed for exercise image: ${uploadError.message}`);
          }
        }

        // Upload categoryImage
        if (req.files.categoryImage && req.files.categoryImage[0]) {
          try {
            const categoryFile = req.files.categoryImage[0];
            const categoryPath = categoryFile.path;
            const uploadResult = await cloudinary.uploader.upload(categoryPath, {
              upload_preset: 'protienlab_photos',
              resource_type: 'image',
              folder: 'protienlab/exercises/categories',
            });
            
            // Update file object with Cloudinary info
            categoryFile.filename = uploadResult.public_id;
            categoryFile.path = uploadResult.secure_url;
            categoryFile.url = uploadResult.secure_url;
            
            // Delete local file after successful upload
            fs.unlink(categoryPath, (err) => {
              if (err) console.error(`Error deleting local file ${categoryPath}:`, err);
            });
            
            console.log(`✅ Uploaded exercise category image to Cloudinary: ${uploadResult.secure_url}`);
          } catch (uploadError) {
            console.error(`❌ Error uploading exercise category image to Cloudinary:`, uploadError);
            throw new Error(`Cloudinary upload failed for category image: ${uploadError.message}`);
          }
        }
      }

      const exercise = new Exercise({
        name,
        category,
        image: buildFileUrl('exercises', req.files.image[0]),
        categoryImage: buildFileUrl('exercises', req.files.categoryImage[0]),
        youtubeLink
      });

      await exercise.save();
      res.status(201).json(exercise);
    } catch (error) {
      console.error('❌ Error creating exercise:', error);
      const newFiles = [
        ...(req.files?.image || []),
        ...(req.files?.categoryImage || []),
      ];
      await cleanupUploadedFiles(newFiles, 'exercises');
      
      // Return 500 for server errors, 400 for validation errors
      const statusCode = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
];

// Get all exercises
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get exercises by category
exports.getExercisesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const exercises = await Exercise.find({ category });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update exercise
exports.updateExercise = [
  exerciseUpload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'categoryImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, youtubeLink } = req.body;

      const existingExercise = await Exercise.findById(id);
      if (!existingExercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      const updateData = { name, category, youtubeLink };
      const useCloudinary = shouldUseCloudinary();

      if (req.files) {
        // Upload image to Cloudinary if enabled
        if (req.files.image) {
          if (existingExercise.image) {
            await deleteStoredPath(existingExercise.image, 'exercises');
          }

          if (useCloudinary) {
            try {
              const imageFile = req.files.image[0];
              const imagePath = imageFile.path;
              const uploadResult = await cloudinary.uploader.upload(imagePath, {
                upload_preset: 'protienlab_photos',
                resource_type: 'image',
                folder: 'protienlab/exercises/images',
              });
              
              imageFile.filename = uploadResult.public_id;
              imageFile.path = uploadResult.secure_url;
              imageFile.url = uploadResult.secure_url;
              
              fs.unlink(imagePath, (err) => {
                if (err) console.error(`Error deleting local file ${imagePath}:`, err);
              });
              
              console.log(`✅ Uploaded exercise image to Cloudinary: ${uploadResult.secure_url}`);
            } catch (uploadError) {
              console.error(`❌ Error uploading exercise image to Cloudinary:`, uploadError);
              throw new Error(`Cloudinary upload failed for exercise image: ${uploadError.message}`);
            }
          }

          updateData.image = buildFileUrl('exercises', req.files.image[0]);
        }

        // Upload categoryImage to Cloudinary if enabled
        if (req.files.categoryImage) {
          if (existingExercise.categoryImage) {
            await deleteStoredPath(existingExercise.categoryImage, 'exercises');
          }

          if (useCloudinary) {
            try {
              const categoryFile = req.files.categoryImage[0];
              const categoryPath = categoryFile.path;
              const uploadResult = await cloudinary.uploader.upload(categoryPath, {
                upload_preset: 'protienlab_photos',
                resource_type: 'image',
                folder: 'protienlab/exercises/categories',
              });
              
              categoryFile.filename = uploadResult.public_id;
              categoryFile.path = uploadResult.secure_url;
              categoryFile.url = uploadResult.secure_url;
              
              fs.unlink(categoryPath, (err) => {
                if (err) console.error(`Error deleting local file ${categoryPath}:`, err);
              });
              
              console.log(`✅ Uploaded exercise category image to Cloudinary: ${uploadResult.secure_url}`);
            } catch (uploadError) {
              console.error(`❌ Error uploading exercise category image to Cloudinary:`, uploadError);
              throw new Error(`Cloudinary upload failed for category image: ${uploadError.message}`);
            }
          }

          updateData.categoryImage = buildFileUrl('exercises', req.files.categoryImage[0]);
        }
      }

      const exercise = await Exercise.findByIdAndUpdate(id, updateData, { new: true });
      res.json(exercise);
    } catch (error) {
      console.error('❌ Error updating exercise:', error);
      const newFiles = [
        ...(req.files?.image || []),
        ...(req.files?.categoryImage || []),
      ];
      await cleanupUploadedFiles(newFiles, 'exercises');
      
      // Return 500 for server errors, 400 for validation errors
      const statusCode = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
];

// Delete exercise
exports.deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findByIdAndDelete(id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Remove associated images
    if (exercise.image) {
      await deleteStoredPath(exercise.image, 'exercises');
    }

    if (exercise.categoryImage) {
      await deleteStoredPath(exercise.categoryImage, 'exercises');
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};