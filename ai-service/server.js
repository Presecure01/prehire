const express = require('express');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { parseResumeText } = require('./enhancedParser');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file upload (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Resume parsing endpoint
app.post('/api/parse-resume', async (req, res) => {
  try {
    const { fileUrl, userId, jobDescription } = req.body;

    // Extract text from file
    let text = '';
    const filePath = fileUrl.startsWith('http') ? fileUrl : path.join(__dirname, '../backend', fileUrl);

    console.log('Parsing file:', filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found: ' + filePath);
    }

    if (fileUrl.toLowerCase().includes('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (fileUrl.toLowerCase().includes('.doc')) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    }

    // Parse resume data with enhanced parser
    const parsedData = parseResumeText(text, jobDescription);

    // Send parsed data to backend
    const token = req.headers.authorization;
    if (token && userId) {
      try {
        const updateResponse = await fetch('http://localhost:5001/api/candidate/resume-data', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            name: parsedData.name,
            email: parsedData.email,
            phone: parsedData.phone,
            skills: parsedData.skills,
            education: parsedData.education,
            experienceYears: parsedData.experienceYears,
            linkedin: parsedData.linkedin,
            github: parsedData.github,
            languages: parsedData.languages
          })
        });

        if (!updateResponse.ok) {
          const errText = await updateResponse.text();
          console.warn(`Failed to update profile with parsed data. Status: ${updateResponse.status}, Error: ${errText}`);
        }
      } catch (updateError) {
        console.warn('Error updating profile:', updateError.message);
        if (updateError.cause) console.warn('Cause:', updateError.cause);
      }
    }

    res.json({
      message: 'Resume parsed successfully',
      data: parsedData
    });
  } catch (error) {
    res.status(500).json({ message: 'Parsing failed', error: error.message });
  }
});

// New endpoint for direct file upload parsing (for signup)
app.post('/api/parse-resume-file', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let text = '';
    const { jobDescription } = req.body;

    // Extract text from file buffer
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (req.file.mimetype.includes('wordprocessingml') ||
      req.file.originalname.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    } else if (req.file.originalname.toLowerCase().endsWith('.doc')) {
      // For .doc files, mammoth might not work well, try anyway
      try {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
      } catch (err) {
        return res.status(400).json({ message: 'DOC files are not fully supported. Please use PDF or DOCX.' });
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    // Parse resume data with enhanced parser
    const parsedData = parseResumeText(text, jobDescription || '');

    res.json({
      message: 'Resume parsed successfully',
      data: parsedData
    });
  } catch (error) {
    console.error('Parse file error:', error);
    res.status(500).json({ message: 'Parsing failed', error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});