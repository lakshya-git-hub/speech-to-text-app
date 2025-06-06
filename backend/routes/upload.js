// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const router = express.Router();

// // Set up storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // timestamp + file extension
//   }
// });

// // Set upload limits and file type filter
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
//   fileFilter: function (req, file, cb) {
//     const filetypes = /mp3|wav|m4a|ogg/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (extname) return cb(null, true);
//     cb("Error: Only audio files are allowed!");
//   }
// });

// router.post('/', upload.single('audio'), (req, res) => {
//   try {
//     res.json({
//       message: "Audio uploaded successfully",
//       filePath: `/uploads/${req.file.filename}`
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Upload failed', details: error });
//   }
// });

// module.exports = router;

// server/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname); // example: 1715872323423.wav
    cb(null, uniqueName);
  }
});

// File Upload Constraints
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /mp3|wav|m4a|ogg/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extName) {
      return cb(null, true);
    }
    cb(new Error('Only audio files are allowed (mp3, wav, m4a, ogg)'));
  }
});

// POST /api/upload
router.post('/', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: '✅ Audio uploaded successfully',
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: '❌ Upload failed', details: error.message });
  }
});

module.exports = router;
