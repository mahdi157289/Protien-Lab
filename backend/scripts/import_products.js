const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Product = require('../models/Product');

const IMPORT_FILE = path.join(__dirname, '../uploads/db_import_products.json');

const validCategories = [
    'Whey', 'Mass Gainer', 'Isolate Whey', 'Vitamines & Minerals', 'Creatine', 
    'Acide Amine', 'Pre-Workout', 'Fat Burner', 'Testobooster', 'Join-Flex', 
    'Fish oil', 'Carbs', 'Snacks', 'Shakers', 'Accesoires'
];

async function importProducts() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        if (!fs.existsSync(IMPORT_FILE)) {
            throw new Error(`Import file not found at ${IMPORT_FILE}`);
        }

        const rawData = fs.readFileSync(IMPORT_FILE, 'utf8');
        const products = JSON.parse(rawData);

        console.log(`Found ${products.length} products to import.`);

        let successCount = 0;
        let errorCount = 0;

        for (const productData of products) {
            try {
                // Validate categories
                const validProductCategories = productData.categories.filter(c => validCategories.includes(c));
                if (validProductCategories.length !== productData.categories.length) {
                    console.warn(`⚠️ Warning: Product "${productData.name}" has invalid categories. filtered: ${validProductCategories}`);
                }
                productData.categories = validProductCategories;

                // Check for duplicates (by name)
                const existing = await Product.findOne({ name: productData.name });
                if (existing) {
                    console.log(`Skipping duplicate: ${productData.name}`);
                    continue;
                }

                const product = new Product(productData);
                await product.save();
                console.log(`✅ Imported: ${productData.name}`);
                successCount++;
            } catch (err) {
                console.error(`❌ Error importing "${productData.name}":`, err.message);
                errorCount++;
            }
        }

        console.log('\nImport Summary:');
        console.log(`Success: ${successCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log(`Skipped: ${products.length - successCount - errorCount}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

importProducts();
