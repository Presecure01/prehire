const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const fs = require('fs');

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      const allowedTypes = ['.jpeg', '.jpg', '.png', '.gif'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for photos'));
      }
    } else {
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOC files are allowed for resumes'));
      }
    }
  }
});

// Configure AWS S3 (optional - falls back to local storage)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Photo upload endpoint
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    let photoUrl;
    
    if (process.env.USE_S3 === 'true') {
      // Upload to S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `photos/${req.user.userId}-${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      
      const result = await s3.upload(params).promise();
      photoUrl = result.Location;
    } else {
      // Local storage fallback
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filename = `photo-${req.user.userId}-${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      photoUrl = `/uploads/${filename}`;
    }

    res.json({
      message: 'Photo uploaded successfully',
      photoUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Photo upload failed', error: error.message });
  }
});

// Resume upload endpoint
router.post('/resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let fileUrl;
    
    if (process.env.USE_S3 === 'true') {
      // Upload to S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `resumes/${req.user.userId}-${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      
      const result = await s3.upload(params).promise();
      fileUrl = result.Location;
    } else {
      // Local storage fallback
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filename = `${req.user.userId}-${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      fileUrl = `/uploads/${filename}`;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (process.env.USE_S3 !== 'true' && user.resumeUrl) {
      const previousPath = path.join(__dirname, '../../..', user.resumeUrl);
      fs.unlink(previousPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.warn('Failed to remove previous resume:', err.message);
        }
      });
    }

    user.resumeUrl = fileUrl;
    await user.save();

    let parseStatus = 'skipped';
    const fetchFn = typeof globalThis.fetch === 'function' ? globalThis.fetch : null;
    if (fetchFn) {
      try {
        const parseResponse = await fetchFn('http://localhost:3001/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl, userId: req.user.userId })
        });
        parseStatus = parseResponse.ok ? 'initiated' : 'failed';
      } catch (err) {
        console.warn('Resume parse service unavailable:', err.message);
      }
    }

    res.json({
      message: 'Resume uploaded successfully',
      fileUrl,
      parseStatus,
      resumeUrl: user.resumeUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
