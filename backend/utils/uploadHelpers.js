const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const isRemoteUrl = (value = '') => /^https?:\/\//i.test(value);

const isRemoteFile = (file) =>
  Boolean(file?.path && isRemoteUrl(file.path));

const extractPublicIdFromUrl = (url = '') => {
  if (!isRemoteUrl(url)) return null;
  const uploadSegment = '/upload/';
  const uploadIndex = url.indexOf(uploadSegment);
  if (uploadIndex === -1) return null;
  let publicId = url.substring(uploadIndex + uploadSegment.length);
  publicId = publicId.replace(/^v\d+\//, '');
  publicId = publicId.replace(/\.[a-z0-9]+$/i, '');
  return publicId;
};

const buildFileUrl = (folder, file) => {
  if (!file) return '';
  if (isRemoteFile(file)) {
    return file.path;
  }
  return `/uploads/${folder}/${file.filename}`;
};

const deleteUploadedFile = async (file, folder) => {
  if (!file) return;

  try {
    if (isRemoteFile(file) && file.filename) {
      await cloudinary.uploader.destroy(file.filename);
    } else if (file.path) {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error deleting file ${file.path}:`, err);
      });
    } else if (folder && file.filename) {
      const fallbackPath = path.join(__dirname, '..', 'uploads', folder, file.filename);
      fs.unlink(fallbackPath, (err) => {
        if (err) console.error(`Error deleting fallback file ${fallbackPath}:`, err);
      });
    }
  } catch (error) {
    console.error('Error deleting uploaded file:', error);
  }
};

const cleanupUploadedFiles = async (files = [], folder) => {
  await Promise.all(files.map((file) => deleteUploadedFile(file, folder)));
};

const deleteStoredPath = async (value, folder) => {
  if (!value) return;
  try {
    if (isRemoteUrl(value)) {
      const publicId = extractPublicIdFromUrl(value);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } else {
      const normalized = value.replace(/^\/+/, '');
      const absolutePath = path.resolve(__dirname, '..', normalized);
      fs.unlink(absolutePath, (err) => {
        if (err) console.error(`Error deleting stored file ${absolutePath}:`, err);
      });
    }
  } catch (error) {
    console.error('Error deleting stored path:', error);
  }
};

module.exports = {
  buildFileUrl,
  deleteUploadedFile,
  cleanupUploadedFiles,
  isRemoteFile,
  isRemoteUrl,
  deleteStoredPath,
  extractPublicIdFromUrl,
};

