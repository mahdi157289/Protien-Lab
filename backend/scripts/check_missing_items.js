const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB URI
const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

// Product Schema
const productSchema = new mongoose.Schema({
  name: String
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

// Photo Schema (for Packs)
const photoSchema = new mongoose.Schema({
  offerData: {
      name: String
  }
}, { strict: false });
const Photo = mongoose.model('Photo', photoSchema);

async function checkMissingItems() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB.');

    // 1. Check Products
    const productsFile = path.join(__dirname, '../uploads/db_import_products.json');
    if (fs.existsSync(productsFile)) {
        const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        const productNames = products.map(p => p.name);
        
        const existingProducts = await Product.find({ name: { $in: productNames } }).select('name');
        const existingNames = new Set(existingProducts.map(p => p.name));
        
        const missingProducts = products.filter(p => !existingNames.has(p.name));
        
        console.log(`\n--- Products Check ---`);
        console.log(`Total in JSON: ${products.length}`);
        console.log(`Found in DB: ${existingNames.size}`);
        console.log(`Missing: ${missingProducts.length}`);
        
        if (missingProducts.length > 0) {
            console.log('Missing Product Names:', missingProducts.map(p => p.name));
            // Create a file with missing products to import
            fs.writeFileSync(
                path.join(__dirname, '../uploads/missing_products.json'), 
                JSON.stringify(missingProducts, null, 2)
            );
            console.log('📝 Created missing_products.json');
        }
    }

    // 2. Check Packs
    const packsFile = path.join(__dirname, '../uploads/db_import_packs.json');
    if (fs.existsSync(packsFile)) {
        const packs = JSON.parse(fs.readFileSync(packsFile, 'utf8'));
        const packNames = packs.map(p => p.offerData.name);
        
        const existingPacks = await Photo.find({ 'offerData.name': { $in: packNames } }).select('offerData.name');
        const existingPackNames = new Set(existingPacks.map(p => p.offerData?.name));
        
        const missingPacks = packs.filter(p => !existingPackNames.has(p.offerData.name));
        
        console.log(`\n--- Packs Check ---`);
        console.log(`Total in JSON: ${packs.length}`);
        console.log(`Found in DB: ${existingPackNames.size}`);
        console.log(`Missing: ${missingPacks.length}`);
        
        if (missingPacks.length > 0) {
             console.log('Missing Pack Names:', missingPacks.map(p => p.offerData.name));
        }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkMissingItems();
