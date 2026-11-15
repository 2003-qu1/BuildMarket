const multer = require('multer');

/**
 * Multer memory storage configuration for direct cloud uploads (ImageKit).
 * Files are held in memory as buffers (req.file.buffer) and streamed to ImageKit,
 * preventing ephemeral disk loss on server restarts.
 */
const storage = multer.memoryStorage();

// Allowed image MIME types
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF, and AVIF images are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) // 5MB default limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
