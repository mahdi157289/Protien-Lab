const fs = require('fs');
const path = require('path');

const shouldUseCloudinary = () =>
  process.env.USE_CLOUDINARY === 'true' || process.env.NODE_ENV === 'production';

const ensureUploadDir = (relativePath) => {
  const absolutePath = path.join(__dirname, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
  return absolutePath;
};

module.exports = {
  shouldUseCloudinary,
  ensureUploadDir,
};






