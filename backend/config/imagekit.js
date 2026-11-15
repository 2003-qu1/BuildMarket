const ImageKit = require('imagekit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

let imagekitInstance = null;

/**
 * Returns an initialized ImageKit client instance.
 * Fails safely if credentials are not configured yet.
 */
function getImageKit() {
  if (imagekitInstance) {
    return imagekitInstance;
  }

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/buildmarket';

  if (!publicKey || !privateKey) {
    return null;
  }

  imagekitInstance = new ImageKit({
    publicKey: publicKey.trim(),
    privateKey: privateKey.trim(),
    urlEndpoint: urlEndpoint.trim()
  });

  return imagekitInstance;
}

/**
 * Helper to check whether ImageKit is properly configured
 */
function isImageKitConfigured() {
  return Boolean(process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY);
}

module.exports = {
  getImageKit,
  isImageKitConfigured
};
