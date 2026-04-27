const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

const photoSchema = new mongoose.Schema({}, { strict: false });
const Photo = mongoose.model('Photo', photoSchema);

async function inspectPhotos() {
  try {
    await mongoose.connect(MONGO_URI);
    const allPhotos = await Photo.find({});
    console.log(`Total Photos: ${allPhotos.length}`);
    
    const withOfferData = allPhotos.filter(p => p.offerData);
    console.log(`Photos with offerData (Packs?): ${withOfferData.length}`);
    
    const withoutOfferData = allPhotos.filter(p => !p.offerData);
    console.log(`Photos without offerData: ${withoutOfferData.length}`);

    if (withoutOfferData.length > 0) {
        console.log('Sample without offerData:', JSON.stringify(withoutOfferData[0], null, 2));
    }
    
    if (withOfferData.length > 0) {
        console.log('Sample with offerData:', JSON.stringify(withOfferData[0].offerData, null, 2));
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

inspectPhotos();
