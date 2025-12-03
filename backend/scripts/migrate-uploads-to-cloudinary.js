require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const connectDB = require('../config/db');
const { isRemoteFile, isRemoteUrl } = require('../utils/uploadHelpers');
const Photo = require('../models/Photo');
const Product = require('../models/Product');
const Exercise = require('../models/Exercise');
const Post = require('../models/Post');
const User = require('../models/User');

const resolveLocalPath = (storedValue, fallbackDir) => {
  if (!storedValue) return null;
  if (isRemoteUrl(storedValue)) return null;

  // Handle paths like /uploads/photos/photo-xxx.jpg
  if (storedValue.startsWith('/uploads/')) {
    return path.join(__dirname, '..', storedValue.replace(/^\/+/, ''));
  }
  
  // Handle paths like uploads/photos/photo-xxx.jpg (no leading slash)
  if (storedValue.startsWith('uploads/')) {
    return path.join(__dirname, '..', storedValue);
  }

  // Handle just filename (fallback to directory)
  if (storedValue.includes('/')) {
    return path.join(__dirname, '..', storedValue);
  }

  return path.join(__dirname, '..', fallbackDir, storedValue);
};

const uploadLocalAsset = async (storedValue, options) => {
  const localPath = resolveLocalPath(storedValue, options.localDir);
  if (!localPath || !fs.existsSync(localPath)) {
    console.warn(`⚠️  Skipping missing file: ${storedValue}`);
    return null;
  }

  const folder = options.folder.startsWith('protienlab/')
    ? options.folder
    : `protienlab/${options.folder}`;

  const uploadResult = await cloudinary.uploader.upload(localPath, {
    folder,
    resource_type: 'image',
    transformation: options.transformation || undefined,
  });

  return uploadResult;
};

const migratePhoto = async (photo) => {
  let updated = false;

  if (photo.url && !isRemoteUrl(photo.url)) {
    const upload = await uploadLocalAsset(photo.url, {
      localDir: 'uploads/photos',
      folder: 'photos',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto' },
      ],
    });

    if (upload) {
      photo.url = upload.secure_url;
      photo.filename = upload.public_id;
      updated = true;
    }
  }

  if (Array.isArray(photo.slides)) {
    for (const slide of photo.slides) {
      if (slide.url && !isRemoteUrl(slide.url)) {
        const upload = await uploadLocalAsset(slide.url, {
          localDir: 'uploads/photos',
          folder: 'photos/media',
        });
        if (upload) {
          slide.url = upload.secure_url;
          slide.filename = upload.public_id;
          updated = true;
        }
      }
    }
  }

  if (photo.offerData?.additionalPhotos) {
    for (const additional of photo.offerData.additionalPhotos) {
      if (additional.url && !isRemoteUrl(additional.url)) {
        const upload = await uploadLocalAsset(additional.url, {
          localDir: 'uploads/photos',
          folder: 'photos/additional',
        });
        if (upload) {
          additional.url = upload.secure_url;
          additional.filename = upload.public_id;
          updated = true;
        }
      }
    }
  }

  if (updated) {
    await photo.save();
  }

  return updated;
};

const migrateProduct = async (product) => {
  if (!Array.isArray(product.images)) return false;
  let updated = false;

  const migratedImages = [];
  for (const image of product.images) {
    if (!image || isRemoteUrl(image)) {
      migratedImages.push(image);
      continue;
    }

    const upload = await uploadLocalAsset(image, {
      localDir: 'uploads/products',
      folder: 'products',
      transformation: [
        { width: 1600, height: 1600, crop: 'limit' },
        { quality: 'auto' },
      ],
    });

    if (upload) {
      migratedImages.push(upload.secure_url);
      updated = true;
    } else {
      migratedImages.push(image);
    }
  }

  if (updated) {
    product.images = migratedImages;
    await product.save();
  }

  return updated;
};

const migrateExercise = async (exercise) => {
  let updated = false;

  if (exercise.image && !isRemoteUrl(exercise.image)) {
    const upload = await uploadLocalAsset(exercise.image, {
      localDir: 'uploads/exercises',
      folder: 'exercises/images',
    });
    if (upload) {
      exercise.image = upload.secure_url;
      updated = true;
    }
  }

  if (exercise.categoryImage && !isRemoteUrl(exercise.categoryImage)) {
    const upload = await uploadLocalAsset(exercise.categoryImage, {
      localDir: 'uploads/exercises',
      folder: 'exercises/categories',
    });
    if (upload) {
      exercise.categoryImage = upload.secure_url;
      updated = true;
    }
  }

  if (updated) {
    await exercise.save();
  }

  return updated;
};

const migratePost = async (post) => {
  if (!post.image || isRemoteUrl(post.image)) return false;

  const upload = await uploadLocalAsset(post.image, {
    localDir: 'uploads/posts',
    folder: 'posts',
  });

  if (upload) {
    post.image = upload.secure_url;
    await post.save();
    return true;
  }
  return false;
};

const migrateProfile = async (user) => {
  if (!user.profileImage || isRemoteUrl(user.profileImage)) return false;

  const upload = await uploadLocalAsset(user.profileImage, {
    localDir: 'uploads/profiles',
    folder: 'profiles',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' },
    ],
  });

  if (upload) {
    user.profileImage = upload.secure_url;
    await user.save();
    return true;
  }
  return false;
};

const runMigration = async () => {
  await connectDB();
  const summary = {
    photos: 0,
    products: 0,
    exercises: 0,
    posts: 0,
    profiles: 0,
  };

  const photos = await Photo.find({});
  for (const photo of photos) {
    if (await migratePhoto(photo)) summary.photos += 1;
  }
  console.log(`✅ Migrated ${summary.photos} photos`);

  const products = await Product.find({});
  for (const product of products) {
    if (await migrateProduct(product)) summary.products += 1;
  }
  console.log(`✅ Migrated ${summary.products} products`);

  const exercises = await Exercise.find({});
  for (const exercise of exercises) {
    if (await migrateExercise(exercise)) summary.exercises += 1;
  }
  console.log(`✅ Migrated ${summary.exercises} exercises`);

  const posts = await Post.find({});
  for (const post of posts) {
    if (await migratePost(post)) summary.posts += 1;
  }
  console.log(`✅ Migrated ${summary.posts} posts`);

  const users = await User.find({});
  for (const user of users) {
    if (await migrateProfile(user)) summary.profiles += 1;
  }
  console.log(`✅ Migrated ${summary.profiles} profile images`);

  await mongoose.disconnect();
  console.log('🎉 Migration complete');
};

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  mongoose.disconnect();
  process.exit(1);
});

