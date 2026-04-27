const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

const photoSchema = new mongoose.Schema({}, { strict: false });
const Photo = mongoose.model('Photo', photoSchema);

async function checkBrands() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB.');

    const brands = await Photo.find({ category: 'Nos Marque' });
    console.log(`🏷️ Found ${brands.length} "Nos Marque" (Brand) photos.`);
    
    brands.forEach(b => {
        console.log(`  - ID: ${b._id}, Filename: ${b.filename}, BrandName: ${b.brandName || 'N/A'}`);
    });

    const allPhotos = await Photo.find({});
    console.log(`📸 Total photos in DB: ${allPhotos.length}`);
    allPhotos.forEach(p => {
        console.log(`  - ID: ${p._id}, Category: ${p.category}, BrandName: ${p.brandName || 'N/A'}, OfferData: ${!!p.offerData}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkBrands();
