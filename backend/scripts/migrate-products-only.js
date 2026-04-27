/**
 * migrate-products-only.js
 * Uploads product images from local /uploads/products to Cloudinary
 * and updates MongoDB image URLs in one shot.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const isRemoteUrl = (v = '') => /^https?:\/\//i.test(v);

const resolveLocalPath = (storedValue) => {
  if (!storedValue || isRemoteUrl(storedValue)) return null;
  // Handle /uploads/products/file.jpg  OR  uploads/products/file.jpg
  const clean = storedValue.replace(/^\/+/, '');
  return path.join(__dirname, '..', clean);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const uploadImage = async (localPath, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder: 'protienlab/products',
        resource_type: 'image',
        transformation: [
          { width: 1600, height: 1600, crop: 'limit' },
          { quality: 'auto' },
        ],
      });
      return result.secure_url;
    } catch (err) {
      console.warn(`  ⚠️  Upload attempt ${i + 1} failed for ${localPath}: ${err.message}`);
      if (i < retries - 1) await sleep(2000);
    }
  }
  return null;
};

const run = async () => {
  await connectDB();

  // Only get products whose images still have local paths
  const products = await Product.find({
    images: { $elemMatch: { $not: /^https?:\/\//i } },
  });

  console.log(`\n📦 Found ${products.length} products with local images to migrate...\n`);

  let migratedCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    let changed = false;
    const newImages = [];

    for (const img of product.images) {
      if (isRemoteUrl(img)) {
        newImages.push(img);
        continue;
      }

      const localPath = resolveLocalPath(img);
      if (!localPath || !fs.existsSync(localPath)) {
        console.warn(`  ⚠️  File not found, keeping old path: ${img}`);
        newImages.push(img);
        failCount++;
        continue;
      }

      const cloudUrl = await uploadImage(localPath);
      if (cloudUrl) {
        newImages.push(cloudUrl);
        changed = true;
      } else {
        console.error(`  ❌ FAILED to upload: ${img}`);
        newImages.push(img);
        failCount++;
      }
    }

    if (changed) {
      product.images = newImages;
      await product.save();
      migratedCount++;
      console.log(`  ✅ [${i + 1}/${products.length}] ${product.name}`);
    }

    // Small throttle to avoid Cloudinary rate limits
    if ((i + 1) % 10 === 0) {
      console.log(`  💤 Processed ${i + 1}/${products.length}, pausing briefly...`);
      await sleep(1000);
    }
  }

  console.log(`\n🎉 Done! Migrated: ${migratedCount} products | Failures: ${failCount}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
