const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/db');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { shouldUseCloudinary, ensureUploadDir } = require('../config/storageUtils');

const JSON_PATH = path.join(__dirname, '../uploads/repaired_products_complete copy.json');
const LOCAL_DIR = ensureUploadDir('../uploads/products');
const USE_CLOUD = shouldUseCloudinary();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'product';
}

async function fetchImageBuffer(url) {
  try {
    const resp = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        Referer: 'https://www.housenutrition.tn/',
      },
      timeout: 15000,
      maxRedirects: 3,
    });
    const contentType = (resp.headers['content-type'] || '').toLowerCase();
    if (!contentType.startsWith('image/')) {
      return null;
    }
    return Buffer.from(resp.data);
  } catch (e) {
    return null;
  }
}

async function saveAsJpg(buffer, filenameBase) {
  const filename = `${filenameBase}.jpg`;
  const outPath = path.join(LOCAL_DIR, filename);
  const jpg = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
  await fs.promises.writeFile(outPath, jpg);
  return { filename, outPath };
}

async function uploadToCloudinary(localPath) {
  const upload = await cloudinary.uploader.upload(localPath, {
    folder: 'protienlab/products/imports',
    resource_type: 'image',
    transformation: [
      { width: 1600, height: 1600, crop: 'limit' },
      { quality: 'auto' },
    ],
  });
  return upload.secure_url;
}

function buildLocalUrl(filename) {
  return `/uploads/products/${filename}`;
}

function pickImages(source) {
  const urls = [];
  if (Array.isArray(source.images)) {
    for (const u of source.images) {
      if (typeof u === 'string' && u.startsWith('http')) {
        urls.push(u);
      }
    }
  }
  if (typeof source.primaryImage === 'string' && source.primaryImage.startsWith('http')) {
    urls.unshift(source.primaryImage);
  }
  const dedup = Array.from(new Set(urls));
  return dedup.slice(0, 6);
}

function ensureMinImages(images, fallbackUrl) {
  if (images.length >= 2) return images;
  if (images.length === 1) {
    return [images[0], fallbackUrl || images[0]];
  }
  return fallbackUrl ? [fallbackUrl, fallbackUrl] : [];
}

function mapToProductDoc(item, imagePaths) {
  const short = item.description ? String(item.description).slice(0, 200) : '';
  const full = item.description || '';
  const price = typeof item.newPrice === 'number' ? item.newPrice : 0;
  const brand = item.brandCanonical || item.brand || '';
  const category = item.category ? [item.category] : [];
  const weightsFromArray = Array.isArray(item.weights) ? item.weights.filter((w) => typeof w === 'string' && w.trim().length > 0) : [];
  const weightsFromPackage = item.packageSize?.value ? [String(item.packageSize.value) + (item.packageSize.unit || '')] : [];
  const weights = weightsFromArray.length > 0 ? weightsFromArray : weightsFromPackage;
  const benefits = Array.isArray(item.benefits) ? item.benefits.filter((b) => typeof b === 'string' && b.trim().length > 0) : [];
  return {
    name: item.title || 'Product',
    descriptionShort: short,
    descriptionFull: full,
    price,
    stock: 0,
    images: imagePaths,
    categories: category,
    isBestSeller: false,
    flavors: [],
    weights,
    benefits,
    isNewProduct: false,
    fastDelivery: false,
    limitedStockNotice: '',
    brand,
    isActive: true,
  };
}

async function processOneProduct(item, idx) {
  const nameSlug = slugify(item.title || `product-${idx}`);
  let urls = pickImages(item);
  urls = ensureMinImages(urls, item.primaryImage);
  if (urls.length < 2) {
    return null;
  }

  const storedPaths = [];
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    const buf = await fetchImageBuffer(u);
    if (!buf) continue;
    const base = `${nameSlug}-${Date.now()}-${i}`;
    const saved = await saveAsJpg(buf, base);
    if (USE_CLOUD) {
      try {
        const remote = await uploadToCloudinary(saved.outPath);
        storedPaths.push(remote);
        fs.unlink(saved.outPath, () => {});
      } catch {
        storedPaths.push(buildLocalUrl(saved.filename));
      }
    } else {
      storedPaths.push(buildLocalUrl(saved.filename));
    }
    await sleep(150);
  }

  if (storedPaths.length < 2) {
    return null;
  }
  return mapToProductDoc(item, storedPaths.slice(0, 6));
}

async function upsertProduct(doc) {
  const existing = await Product.findOne({ name: doc.name });
  if (existing) {
    existing.set(doc);
    await existing.save();
    return { action: 'updated', id: existing._id };
  } else {
    const created = await Product.create(doc);
    return { action: 'created', id: created._id };
  }
}

async function run() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('JSON file not found:', JSON_PATH);
    process.exit(1);
  }
  await connectDB();
  const raw = await fs.promises.readFile(JSON_PATH, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse JSON:', e.message);
    process.exit(1);
  }
  const items = Array.isArray(parsed.products) ? parsed.products : parsed;
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const doc = await processOneProduct(item, i);
      if (!doc) {
        skipped++;
        continue;
      }
      const res = await upsertProduct(doc);
      if (res.action === 'created') created++;
      else updated++;
    } catch (err) {
      skipped++;
    }
  }

  console.log(`Summary: created=${created}, updated=${updated}, skipped=${skipped}`);
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error('Import failed:', e);
  await mongoose.disconnect();
  process.exit(1);
});
