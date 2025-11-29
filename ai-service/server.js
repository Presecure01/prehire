const express = require('express');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

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

    // Parse resume data with advanced scoring
    const parsedData = parseResumeText(text, jobDescription);
    
    // Send parsed data to backend
    const token = req.headers.authorization;
    if (token) {
      await fetch('http://localhost:5001/api/candidate/resume-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          ...parsedData,
          userId
        })
      });
    }

    res.json({
      message: 'Resume parsed successfully',
      data: parsedData
    });
  } catch (error) {
    res.status(500).json({ message: 'Parsing failed', error: error.message });
  }
});

function parseResumeText(text, jobDescription = '') {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Enhanced skills extraction
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript', 'Angular',
    'Vue.js', 'Express', 'Django', 'Flask', 'Spring', 'MySQL', 'PostgreSQL',
    'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Kubernetes'
  ];
  
  const skills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );

  // Calculate experience years
  const experienceYears = calculateExperienceYears(text);
  
  // Extract experience entries
  const experience = extractExperience(lines);
  const education = extractEducation(lines);
  
  // Advanced scoring
  const scoring = calculateAdvancedScore({
    text,
    skills,
    experienceYears,
    experience,
    education,
    email,
    phone,
    jobDescription
  });
  
  return {
    email,
    phone,
    skills,
    experience: experience.slice(0, 3),
    education: education.slice(0, 2),
    experienceYears,
    resumeScore: scoring.totalScore,
    scoreBreakdown: scoring.breakdown
  };
}

function calculateExperienceYears(text) {
  const yearRegex = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
  const matches = text.match(yearRegex) || [];
  
  let totalYears = 0;
  const currentYear = new Date().getFullYear();
  
  matches.forEach(match => {
    const parts = match.split(/[-–—]/);
    const startYear = parseInt(parts[0].trim());
    const endPart = parts[1].trim().toLowerCase();
    const endYear = endPart.includes('present') || endPart.includes('current') 
      ? currentYear 
      : parseInt(endPart);
    
    if (startYear && endYear && endYear >= startYear) {
      totalYears += (endYear - startYear);
    }
  });
  
  return Math.max(totalYears, 0);
}

function extractExperience(lines) {
  const experience = [];
  const experienceKeywords = ['experience', 'work history', 'employment', 'professional'];
  let inExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection && (line.includes('education') || line.includes('skills'))) {
      break;
    }
    
    if (inExperienceSection && lines[i].length > 10) {
      experience.push({
        company: lines[i],
        position: lines[i + 1] || '',
        duration: lines[i + 2] || '',
        description: lines[i + 3] || ''
      });
      i += 3;
    }
  }
  
  return experience;
}

function extractEducation(lines) {
  const education = [];
  const educationKeywords = ['education', 'academic', 'university', 'college', 'degree'];
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      inEducationSection = true;
      continue;
    }
    
    if (inEducationSection && lines[i].length > 5) {
      education.push({
        institution: lines[i],
        degree: lines[i + 1] || '',
        year: lines[i + 2] || ''
      });
      i += 2;
    }
  }
  
  return education;
}

function calculateAdvancedScore({ text, skills, experienceYears, experience, education, email, phone, jobDescription }) {
  const breakdown = {
    skillsScore: 0,
    experienceScore: 0,
    grammarScore: 0,
    completenessScore: 0,
    skillMatchPercentage: 0
  };
  
  // Skills scoring (30%)
  breakdown.skillsScore = Math.min(skills.length * 5, 30);
  
  // Experience scoring (25%)
  if (experienceYears >= 5) breakdown.experienceScore = 25;
  else if (experienceYears >= 3) breakdown.experienceScore = 20;
  else if (experienceYears >= 1) breakdown.experienceScore = 15;
  else breakdown.experienceScore = 5;
  
  // Grammar and clarity scoring (20%)
  breakdown.grammarScore = calculateGrammarScore(text);
  
  // Completeness scoring (25%)
  let completeness = 0;
  if (email) completeness += 5;
  if (phone) completeness += 5;
  if (skills.length > 0) completeness += 5;
  if (experience.length > 0) completeness += 5;
  if (education.length > 0) completeness += 5;
  breakdown.completenessScore = completeness;
  
  // Skill matching with job description
  if (jobDescription) {
    const jobSkills = extractSkillsFromJob(jobDescription);
    const matchedSkills = skills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    breakdown.skillMatchPercentage = jobSkills.length > 0 
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : 0;
  }
  
  const totalScore = Math.min(
    breakdown.skillsScore + 
    breakdown.experienceScore + 
    breakdown.grammarScore + 
    breakdown.completenessScore,
    100
  );
  
  return { totalScore, breakdown };
}

function calculateGrammarScore(text) {
  let score = 20;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length < 3);
  score -= shortSentences.length * 2;
  
  const wordFreq = {};
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length > 3) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });
  
  const overusedWords = Object.values(wordFreq).filter(count => count > 5).length;
  score -= overusedWords * 1;
  
  const properNouns = text.match(/\b[A-Z][a-z]+/g) || [];
  if (properNouns.length < 3) score -= 3;
  
  return Math.max(score, 0);
}

function extractSkillsFromJob(jobDescription) {
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript', 'Angular',
    'Vue.js', 'Express', 'Django', 'Flask', 'Spring', 'MySQL', 'PostgreSQL'
  ];
  
  return skillKeywords.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});