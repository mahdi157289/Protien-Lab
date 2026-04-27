const mongoose = require('mongoose');

// MongoDB URI
const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

const photoSchema = new mongoose.Schema({
  offerData: {
      name: String,
      description: String,
      bigDescription: String,
      displaySection: String
  }
}, { strict: false });
const Photo = mongoose.model('Photo', photoSchema);

async function checkPackContent() {
  try {
    await mongoose.connect(MONGO_URI);
    const packs = await Photo.find({ 'offerData.displaySection': 'Nos Pack' });
    
    console.log(`Found ${packs.length} packs.`);
    packs.forEach(p => {
        console.log(`\nName: ${p.offerData.name}`);
        console.log(`Description: ${p.offerData.description}`);
        console.log(`Big Description Length: ${p.offerData.bigDescription?.length}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPackContent();
