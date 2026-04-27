const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Product.updateMany({}, { $set: { stock: 100 } });

    const matched = result.matchedCount !== undefined ? result.matchedCount : result.n;
    const modified = result.modifiedCount !== undefined ? result.modifiedCount : result.nModified;

    console.log('Matched', matched, 'documents');
    console.log('Modified', modified, 'documents');
  } catch (error) {
    console.error('Error updating product stock:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();

