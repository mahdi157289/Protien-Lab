require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { isRemoteUrl } = require('../utils/uploadHelpers');
const Photo = require('../models/Photo');

const resolveLocalPath = (storedValue) => {
  if (!storedValue) return null;
  if (isRemoteUrl(storedValue)) return null;

  if (storedValue.startsWith('/uploads/')) {
    return path.join(__dirname, '..', storedValue.replace(/^\/+/, ''));
  }
  
  if (storedValue.startsWith('uploads/')) {
    return path.join(__dirname, '..', storedValue);
  }

  return path.join(__dirname, '..', 'uploads/photos', storedValue);
};

const checkPhotos = async () => {
  await connectDB();
  console.log('🔍 Checking for missing photo files...\n');

  const photos = await Photo.find({});
  let missingCount = 0;
  let cloudinaryCount = 0;
  let foundCount = 0;

  for (const photo of photos) {
    // Check main URL
    if (photo.url && !isRemoteUrl(photo.url)) {
      const localPath = resolveLocalPath(photo.url);
      if (localPath && !fs.existsSync(localPath)) {
        console.log(`❌ Missing: ${photo.url}`);
        console.log(`   Expected at: ${localPath}`);
        console.log(`   Photo ID: ${photo._id}, Category: ${photo.category}\n`);
        missingCount++;
      } else if (localPath && fs.existsSync(localPath)) {
        foundCount++;
      }
    } else if (photo.url && isRemoteUrl(photo.url)) {
      cloudinaryCount++;
    }

    // Check slides
    if (Array.isArray(photo.slides)) {
      for (const slide of photo.slides) {
        if (slide.url && !isRemoteUrl(slide.url)) {
          const localPath = resolveLocalPath(slide.url);
          if (localPath && !fs.existsSync(localPath)) {
            console.log(`❌ Missing slide: ${slide.url}`);
            missingCount++;
          } else if (localPath && fs.existsSync(localPath)) {
            foundCount++;
          }
        }
      }
    }

    // Check additional photos
    if (photo.offerData?.additionalPhotos) {
      for (const additional of photo.offerData.additionalPhotos) {
        if (additional.url && !isRemoteUrl(additional.url)) {
          const localPath = resolveLocalPath(additional.url);
          if (localPath && !fs.existsSync(localPath)) {
            console.log(`❌ Missing additional photo: ${additional.url}`);
            missingCount++;
          } else if (localPath && fs.existsSync(localPath)) {
            foundCount++;
          }
        }
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Found locally: ${foundCount}`);
  console.log(`   ☁️  Already on Cloudinary: ${cloudinaryCount}`);
  console.log(`   ❌ Missing files: ${missingCount}`);
  
  if (missingCount > 0) {
    console.log('\n⚠️  Some images are missing from the server.');
    console.log('   These images cannot be migrated automatically.');
    console.log('   Options:');
    console.log('   1. Re-upload them through the admin interface');
    console.log('   2. Copy the files to backend/uploads/photos/ and run migration again');
  } else {
    console.log('\n✅ All local images found! Ready to migrate.');
  }

  await mongoose.disconnect();
};

checkPhotos().catch((err) => {
  console.error('❌ Check failed:', err);
  mongoose.disconnect();
  process.exit(1);
});






