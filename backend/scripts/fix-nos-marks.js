// One-off migration: rename category 'Nos Marks' -> 'Nos Marque'
// Usage: node backend/scripts/fix-nos-marks.js

const path = require('path');
const mongoose = require('mongoose');

// Load env/db
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const connectDB = require('../config/db');
const Photo = require('../models/Photo');

(async () => {
  try {
    await connectDB();
    const filter = { category: 'Nos Marks' };
    const count = await Photo.countDocuments(filter);
    console.log(`Found ${count} photos with legacy category 'Nos Marks'.`);

    if (count === 0) {
      console.log('No documents to update. Exiting.');
      process.exit(0);
    }

    const result = await Photo.updateMany(filter, { $set: { category: 'Nos Marque' } });
    console.log(`Updated ${result.modifiedCount || result.nModified || 0} documents to 'Nos Marque'.`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
})();



















