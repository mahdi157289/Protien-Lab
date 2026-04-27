const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const PhotoSchema = new mongoose.Schema({
    filename: String,
    url: String,
    category: String,
    brandName: String,
    isActive: Boolean,
    uploadDate: Date
});

const Photo = mongoose.model('Photo', PhotoSchema);

async function checkBrands() {
    try {
        console.log('Starting script...');
        const uri = process.env.MONGO_URI;
        console.log('URI loaded:', uri ? uri.substring(0, 20) + '...' : 'undefined');

        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');

        const brands = await Photo.find({ category: 'Nos Marque' });
        console.log(`Found ${brands.length} brands in the database.`);
        
        const withName = brands.filter(b => b.brandName);
        console.log(`Brands with brandName: ${withName.length}`);
        
        console.log('--- Current Brands in DB ---');
        withName.forEach(b => console.log(b.brandName));
        console.log('----------------------------');

        if (withName.length > 0) {
             console.log('Sample valid brand:', JSON.stringify(withName[0], null, 2));
        } else {
             console.log('No brands have brandName set!');
             if (brands.length > 0) {
                 console.log('Sample invalid brand:', JSON.stringify(brands[0], null, 2));
             }
        }

    } catch (error) {
        console.error('Error checking brands:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

checkBrands();
