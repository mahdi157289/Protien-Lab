require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { isRemoteUrl } = require('../utils/uploadHelpers');
const Photo = require('../models/Photo');
const Product = require('../models/Product');
const Exercise = require('../models/Exercise');
const Post = require('../models/Post');
const User = require('../models/User');

const countLocal = (values) =>
  values.filter((value) => value && !isRemoteUrl(value)).length;

const inspect = async () => {
  await connectDB();

  const summary = {};

  const photos = await Photo.find({});
  const photoMain = countLocal(photos.map((p) => p.url));
  const photoSlides = countLocal(
    photos.flatMap((p) => (p.slides || []).map((s) => s.url))
  );
  const photoOffers = countLocal(
    photos.flatMap((p) => (p.offerData?.additionalPhotos || []).map((s) => s.url))
  );
  summary.photos = photoMain + photoSlides + photoOffers;

  const products = await Product.find({});
  summary.products = countLocal(products.flatMap((p) => p.images || []));

  const exercises = await Exercise.find({});
  summary.exercises =
    countLocal(exercises.map((e) => e.image)) +
    countLocal(exercises.map((e) => e.categoryImage));

  const posts = await Post.find({});
  summary.posts = countLocal(posts.map((p) => p.image));

  const users = await User.find({});
  summary.profiles = countLocal(users.map((u) => u.profileImage));

  console.table(summary);

  const totalPending = Object.values(summary).reduce((acc, val) => acc + val, 0);
  console.log(
    totalPending === 0
      ? '✅ All database references point to Cloudinary.'
      : '⚠️ Some records still reference local files. Run the migration script again.'
  );

  await mongoose.disconnect();
};

inspect().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});






