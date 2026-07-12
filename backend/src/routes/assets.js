const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const verifyToken = require('../middleware/auth');

// Multer memory storage configuration (keeps local filesystem clean)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit files to 10MB
});

// POST /api/assets/upload (Authenticated)
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file payload found in request.' });
  }

  // Create stream to pipeline multer buffer direct to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    { 
      folder: 'connecting_scripts',
      resource_type: 'auto' // handles images, video, pdfs automatically
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Stream Upload Error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Cloudinary upload failure. Verify API credentials inside .env' 
        });
      }

      // Return uploaded asset descriptors
      return res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height
      });
    }
  );

  // Pipe buffer to the stream
  uploadStream.end(req.file.buffer);
});

// POST /api/assets/upload-avatar (Authenticated)
router.post('/upload-avatar', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file payload found in request.' });
  }

  // Create stream to pipeline multer buffer direct to Cloudinary in 'user_avatars' folder
  const uploadStream = cloudinary.uploader.upload_stream(
    { 
      folder: 'user_avatars',
      resource_type: 'auto'
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Avatar Stream Upload Error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Cloudinary upload failure. Verify API credentials inside .env' 
        });
      }

      return res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes
      });
    }
  );

  // Pipe buffer to the stream
  uploadStream.end(req.file.buffer);
});

module.exports = router;
