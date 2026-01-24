const levenshtein = require('fast-levenshtein');

// Skills database from Python parser
const SKILLS_DB = [
  // Programming Languages
  "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Ruby", "Kotlin", "Swift", "PHP", "SQL", "R", "Shell", "Bash",
  // Web Development
  "HTML", "CSS", "React", "Next.js", "Vue.js", "Angular", "Svelte", "Tailwind CSS", "Bootstrap", "jQuery", "Django", "Flask", "FastAPI", "Express.js", "Node.js", "Spring Boot", "ASP.NET",
  // Mobile Development
  "React Native", "Flutter", "SwiftUI", "Xamarin", "Android Development", "iOS Development",
  // Databases
  "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Firebase", "Redis", "Cassandra", "Elasticsearch", "Oracle Database",
  // Data Science & Analytics
  "NumPy", "Pandas", "Matplotlib", "Seaborn", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "OpenCV", "Statsmodels", "Plotly", "Dask",
  // AI & Machine Learning
  "Machine Learning", "Deep Learning", "Computer Vision", "Natural Language Processing", "Transformers", "LangChain", "LLMs", "Prompt Engineering", "Reinforcement Learning",
  // DevOps & Tools
  "Docker", "Kubernetes", "Terraform", "Ansible", "Git", "GitHub", "GitLab", "CI/CD", "Jenkins", "GitHub Actions", "Bitbucket", "SonarQube", "Prometheus", "Grafana", "New Relic",
  // Cloud Platforms
  "AWS", "Amazon S3", "EC2", "Lambda", "CloudFormation", "Azure", "Azure DevOps", "Google Cloud Platform", "GCP", "Firebase", "Heroku", "DigitalOcean", "Netlify", "Vercel",
  // Cybersecurity
  "Penetration Testing", "Kali Linux", "Wireshark", "Metasploit", "Burp Suite", "OWASP", "Nmap", "Cryptography", "Network Security",
  // Testing
  "Unit Testing", "Integration Testing", "Selenium", "JUnit", "Pytest", "TestNG", "Postman", "Cypress", "Load Testing",
  // Backend / API
  "REST API", "GraphQL", "gRPC", "WebSockets", "Microservices", "Monolithic Architecture", "Message Queues", "RabbitMQ", "Kafka",
  // Tools & Platforms
  "VS Code", "IntelliJ", "PyCharm", "Jira", "Slack", "Notion", "Figma", "Trello", "Postman", "Zotero",
  // Soft Skills & Methodologies
  "Agile", "Scrum", "Kanban", "Design Thinking", "System Design", "Requirement Analysis", "Software Architecture", "Technical Writing", "Code Review", "Version Control",
  // Extras
  "Linux", "WSL", "API Integration", "Firebase Auth", "JWT", "OAuth2", "WebRTC", "Multithreading", "Data Structures", "Algorithms", "OOP", "Functional Programming"
];

const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate',
  'b.tech', 'b.e', 'b.sc', 'b.com', 'b.ba', 'b.arch', 'b.des',
  'm.tech', 'm.e', 'm.sc', 'm.com', 'm.ba', 'm.arch', 'm.des',
  'mba', 'ms', 'ma', 'phd', 'doctorate', 'postgraduate', 'graduate',
  'undergraduate', 'associate', 'high school', 'secondary', 'primary'
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'where', 'how', 'what', 'who', 'why',
  'to', 'in', 'of', 'for', 'with', 'on', 'at', 'by', 'from', 'up', 'down', 'over', 'under', 'this', 'that',
  'be', 'have', 'do', 'as', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'must', 'shall'
]);

// String similarity using Levenshtein distance
function calculateStringSimilarity(s1, s2) {
  if (s1.toLowerCase() === s2.toLowerCase()) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshtein.get(s1.toLowerCase(), s2.toLowerCase());
  return 1.0 - (distance / maxLen);
}

// Extract email
function extractEmail(text) {
  // Stricter regex to avoid capturing surrounding text like "linkedin.com" if merged
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/;
  const emails = text.match(emailRegex);
  return emails ? emails[0] : '';
}

// Extract phone (improved for Indian and international formats)
function extractPhone(text) {
  // Indian phone number patterns (10 digits, may start with +91 or 0)
  const indianPatterns = [
    /\+?91[\s.-]?[6-9]\d{9}/,  // +91 followed by 10 digits starting with 6-9
    /0?[6-9]\d{9}/,             // 10 digits starting with 6-9 (may have leading 0)
    /\+?91\s*[-]?\s*[6-9]\d{4}\s*[-]?\s*\d{5}/  // +91 with formatting
  ];

  // International/US patterns
  const internationalPatterns = [
    /\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}/,
    /\+?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}/
  ];

  // Try Indian patterns first
  for (const pattern of indianPatterns) {
    const matches = text.match(pattern);
    if (matches && matches[0]) {
      let phone = matches[0];
      // Remove country code and formatting
      phone = phone.replace(/\+91/gi, '').replace(/[^\d]/g, '');
      // Remove leading 0 if present
      if (phone.startsWith('0') && phone.length === 11) {
        phone = phone.substring(1);
      }
      // Validate: should be 10 digits and start with 6-9
      if (phone.length === 10 && /^[6-9]/.test(phone)) {
        return phone;
      }
    }
  }

  // Try international patterns
  for (const pattern of internationalPatterns) {
    const matches = text.match(pattern);
    if (matches && matches[0]) {
      let phone = matches[0];
      if (phone.startsWith('1 ') || phone.startsWith('+1')) {
        phone = phone.replace(/^\+?1\s*/, '');
      }
      phone = phone.replace(/[^\d]/g, '');
      // Should have at least 10 digits
      if (phone.length >= 10 && phone.length <= 15) {
        return phone;
      }
    }
  }

  return '';
}

// Extract name (simplified version of Python logic)
function extractName(text) {
  const sectionHeaders = [
    'education', 'experience', 'skills', 'projects', 'summary', 'profile', 'contact', 'address',
    'phone', 'email', 'curriculum', 'vitae', 'resume', 'student', 'btech', 'mtech', 'msc'
  ];

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const nameLines = [];

  for (const line of lines.slice(0, 5)) {
    if (sectionHeaders.some(header => line.toLowerCase().includes(header))) {
      break;
    }
    nameLines.push(line);
  }

  // Try to find name in first few lines
  for (const line of nameLines) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      // Check if most words start with uppercase
      const upperCount = words.filter(w => w[0] && w[0] === w[0].toUpperCase()).length;
      if (upperCount >= 2) {
        return line.trim();
      }
    }
  }

  // Fallback to email name
  const email = extractEmail(text);
  if (email) {
    let emailName = email.split('@')[0];
    emailName = emailName.replace(/[0-9]+$/, '').replace(/[._-]/g, ' ');
    emailName = emailName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return emailName.trim();
  }

  return '';
}

// Extract skills with fuzzy matching
function extractSkills(text) {
  const foundSkills = new Set();
  const textLower = text.toLowerCase();

  // Exact match first
  for (const skill of SKILLS_DB) {
    const skillLower = skill.toLowerCase();
    if (textLower.includes(skillLower)) {
      foundSkills.add(skill);
    }
  }

  // Fuzzy matching for similar skills
  const words = text.split(/\s+/).map(w => w.trim()).filter(w => w.length > 2);
  for (const skill of SKILLS_DB) {
    if (foundSkills.has(skill)) continue;

    const skillLower = skill.toLowerCase();

    // Check fuzzy match with entire skill
    for (const word of words) {
      const wordLower = word.toLowerCase();
      const similarity1 = calculateStringSimilarity(skillLower, wordLower);
      const similarity2 = calculateStringSimilarity(skillLower, textLower);

      if (similarity1 >= 0.85 || similarity2 >= 0.85) {
        foundSkills.add(skill);
        break;
      }
    }
  }

  // Clean skills (remove stop words)
  const cleanSkills = Array.from(foundSkills).filter(skill =>
    !STOP_WORDS.has(skill.toLowerCase()) && skill.length > 1
  );

  return cleanSkills;
}

// Extract education as normalized degree categories (no institution names)
function extractEducation(text) {
  const lines = text.split('\n');
  let educationSection = '';
  let inEducation = false;

  // Find education section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase().trim();

    // Check if this line starts education section
    if (['education', 'academic', 'qualification', 'educational background'].some(kw =>
      lineLower === kw || lineLower.startsWith(kw + ':') || lineLower.startsWith(kw + ' ')
    )) {
      inEducation = true;
      continue;
    }

    // Stop at next major section
    if (inEducation && ['experience', 'work', 'employment', 'skills', 'projects', 'certification'].some(kw =>
      lineLower === kw || lineLower.startsWith(kw + ':') || lineLower.startsWith(kw + ' ')
    )) {
      break;
    }

    if (inEducation && line.trim().length > 0) {
      educationSection += line.trim() + ' ';
    }
  }

  // If no explicit education section found, use the upper half of the resume as a fallback area
  if (!educationSection) {
    const firstHalf = text.split('\n').slice(0, Math.floor(lines.length / 2)).join(' ');
    educationSection = firstHalf;
  }

  const educationSectionLower = educationSection.toLowerCase();
  const categories = new Set();

  // Bachelor's level
  if (/\b(bachelor|b\.\s*e\.?|b\s*e\b|be\b|b\.\s*tech\.?|b\s*tech\b|btech\b|b\.\s*sc\.?|b\s*sc\b|bsc\b|b\.\s*com\.?|b\s*com\b|bcom\b)\b/i
    .test(educationSectionLower)) {
    categories.add("Bachelor's Degree");
  }

  // Master's level
  if (/\b(master|m\.\s*e\.?|m\s*e\b|me\b|m\.\s*tech\.?|m\s*tech\b|mtech\b|m\.\s*sc\.?|m\s*sc\b|msc\b|mba|m\.b\.a\.)\b/i
    .test(educationSectionLower)) {
    categories.add("Master's Degree");
  }

  // PhD / Doctorate
  if (/\b(phd|ph\.d\.|doctorate|doctor\s+of\s+philosophy)\b/i.test(educationSectionLower)) {
    categories.add('PhD');
  }

  // Diploma
  if (/\b(diploma)\b/i.test(educationSectionLower)) {
    categories.add('Diploma');
  }

  // Certification
  if (/\b(certificate|certification)\b/i.test(educationSectionLower)) {
    categories.add('Certification');
  }

  // High school / secondary
  if (/\b(high\s*school|secondary\s+school|12th|10th)\b/i.test(educationSectionLower)) {
    categories.add('High School');
  }

  return Array.from(categories).join(', ');
}

// Extract experience years (improved - only count work experience, not education dates)
function extractExperienceYears(text) {
  const textLower = text.toLowerCase();

  // Pattern 1: Direct keyword + number (highest priority)
  const directPatterns = [
    /(\d+(?:\.\d+)?)\s*\+?\s*years?\s*(?:of\s+)?experience/i,
    /experience[:\s]+(\d+)\s*years?/i,
    /(\d+)\s*years?\s*(?:in\s+)?(?:the\s+)?field/i,
    /(\d+)\s*years?\s*(?:of\s+)?work/i
  ];

  for (const pattern of directPatterns) {
    const match = textLower.match(pattern);
    if (match) {
      const years = parseFloat(match[1]);
      if (!isNaN(years) && years >= 0 && years <= 50) {
        return Math.round(years);
      }
    }
  }

  // Pattern 2: Date ranges - ONLY from experience/work section, not education
  const lines = text.split('\n');
  let inExperienceSection = false;
  let experienceText = '';

  // Find experience section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();

    // Check if this line starts experience section
    if (['experience', 'work experience', 'employment', 'work history', 'professional experience'].some(kw =>
      line === kw || line.startsWith(kw + ':') || line.startsWith(kw + ' '))) {
      inExperienceSection = true;
      continue;
    }

    // Stop at education or other sections
    if (inExperienceSection && ['education', 'academic', 'skills', 'projects', 'certification'].some(kw =>
      line.includes(kw) && (line === kw || line.startsWith(kw + ':') || line.startsWith(kw + ' ')))) {
      break;
    }

    if (inExperienceSection) {
      experienceText += lines[i] + ' ';
    }
  }

  // If no experience section found, use entire text but be more careful
  if (!experienceText) {
    experienceText = text;
  }

  // Extract date ranges from experience section only
  const dateRangePattern = /(\d{4})\s*[-–to]+\s*(present|now|current|\d{4})/gi;
  const matches = Array.from(experienceText.matchAll(dateRangePattern));

  if (matches.length > 0) {
    const dateRanges = [];
    const currentYear = new Date().getFullYear();

    for (const match of matches) {
      const startYear = parseInt(match[1]);
      const endPart = match[2].toLowerCase();
      const endYear = (endPart === 'present' || endPart === 'now' || endPart === 'current')
        ? currentYear
        : parseInt(endPart);

      if (!isNaN(startYear) && !isNaN(endYear) &&
        endYear >= startYear &&
        startYear >= 1990 &&
        endYear <= currentYear + 1) {
        const years = endYear - startYear;
        if (years >= 0 && years <= 50) {
          dateRanges.push({ start: startYear, end: endYear, years });
        }
      }
    }

    // If we have date ranges, calculate total (handling overlaps)
    if (dateRanges.length > 0) {
      // Sort by start year
      dateRanges.sort((a, b) => a.start - b.start);

      // Merge overlapping ranges
      const mergedRanges = [];
      for (const range of dateRanges) {
        if (mergedRanges.length === 0) {
          mergedRanges.push(range);
        } else {
          const last = mergedRanges[mergedRanges.length - 1];
          // If ranges overlap or are adjacent, merge them
          if (range.start <= last.end) {
            last.end = Math.max(last.end, range.end);
            last.years = last.end - last.start;
          } else {
            mergedRanges.push(range);
          }
        }
      }

      // Calculate total years from merged ranges
      let totalYears = 0;
      for (const range of mergedRanges) {
        totalYears += range.years;
      }

      if (totalYears > 0) {
        return Math.min(Math.round(totalYears), 50);
      }
    }
  }

  // Fallback logic - be more conservative
  if (textLower.includes('fresher') || textLower.includes('fresh graduate') ||
    (textLower.includes('student') && !textLower.includes('experience'))) {
    return 0;
  }
  if (textLower.includes('internship') || textLower.includes('intern')) {
    return 1;
  }

  // If we can't determine, return 0 instead of guessing
  return 0;
}

// Extract LinkedIn
function extractLinkedIn(text) {
  const pattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_/]+/;
  const match = text.match(pattern);
  return match ? match[0] : '';
}

// Extract GitHub
function extractGitHub(text) {
  const pattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9\-_/]+/;
  const match = text.match(pattern);
  return match ? match[0] : '';
}

// Extract languages
function extractLanguages(text) {
  const languageKeywords = [
    'english', 'hindi', 'french', 'german', 'spanish', 'mandarin', 'tamil', 'telugu',
    'marathi', 'kannada', 'bengali', 'gujarati', 'punjabi', 'urdu', 'japanese',
    'korean', 'russian', 'italian', 'portuguese'
  ];
  const found = [];

  for (const lang of languageKeywords) {
    const pattern = new RegExp(`\\b${lang}\\b`, 'i');
    if (pattern.test(text)) {
      found.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  }

  return found;
}

// Main parsing function
function parseResumeText(text, jobDescription = '') {
  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const skills = extractSkills(text);
  const education = extractEducation(text);
  const experienceYears = extractExperienceYears(text);
  const linkedin = extractLinkedIn(text);
  const github = extractGitHub(text);
  const languages = extractLanguages(text);

  return {
    name,
    email,
    phone,
    skills,
    education,
    experienceYears: experienceYears || 0,
    linkedin,
    github,
    languages
  };
}

module.exports = {
  parseResumeText,
  SKILLS_DB,
  extractSkills,
  extractExperienceYears,
  calculateStringSimilarity
};
