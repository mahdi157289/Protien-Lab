const mongoose = require('mongoose');

// MongoDB URI
const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

const photoSchema = new mongoose.Schema({}, { strict: false });
const Photo = mongoose.model('Photo', photoSchema);

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function clearDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB.');

    // 1. Delete all Products
    const productResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${productResult.deletedCount} products.`);

    // 2. Delete Packs (Photos with offerData)
    // We strictly target those with offerData to avoid deleting "Nos Marque" or other static assets if they exist.
    const packResult = await Photo.deleteMany({ offerData: { $exists: true } });
    console.log(`✅ Deleted ${packResult.deletedCount} packs (photos with offerData).`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

clearDatabase();
