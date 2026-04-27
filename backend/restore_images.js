const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product'); // Assuming this is the path

async function restoreImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/omrani_shop');
    console.log('Connected to MongoDB');

    const backupDataPath = path.join(__dirname, 'uploads', 'repaired_products_complete copy.json');
    const backupData = JSON.parse(fs.readFileSync(backupDataPath, 'utf-8'));
    
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const backupProduct of backupData.products) {
      // Find the product by its title or productUrl or other unique identifier
      // Let's try title first
      let product = await Product.findOne({ name: backupProduct.title });
      
      if (!product) {
          product = await Product.findOne({ title: backupProduct.title });
      }
      
      if (!product && backupProduct.productUrl) {
          // Attempt fuzzy match or ID match if available, wait, we have slug?
          // just basic search
      }

      if (product) {
        // Update images
        // The user wants to revert to the old photos.
        // Let's check what images the backup has
        if (backupProduct.images && backupProduct.images.length > 0) {
            product.images = backupProduct.images;
            await product.save();
            updatedCount++;
            console.log(`Updated images for: ${product.name || product.title}`);
        } else if (backupProduct.primaryImage) {
            product.images = [backupProduct.primaryImage];
            await product.save();
            updatedCount++;
            console.log(`Updated primary image for: ${product.name || product.title}`);
        }
      } else {
        notFoundCount++;
      }
    }

    console.log(`\nRestore complete.`);
    console.log(`Products updated: ${updatedCount}`);
    console.log(`Products not found in DB: ${notFoundCount}`);

  } catch (error) {
    console.error('Error during restore:', error);
  } finally {
    mongoose.disconnect();
  }
}

restoreImages();
