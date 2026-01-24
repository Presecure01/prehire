const levenshtein = require('fast-levenshtein');

// Technology synonyms and variations (from Java service)
const TECH_SYNONYMS = {
  javascript: new Set(['js', 'ecmascript', 'node', 'nodejs', 'react', 'angular', 'vue']),
  python: new Set(['py', 'django', 'flask', 'pandas', 'numpy', 'scipy']),
  java: new Set(['jvm', 'spring', 'springboot', 'hibernate', 'maven', 'gradle']),
  database: new Set(['db', 'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'rdbms']),
  cloud: new Set(['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'devops']),
  frontend: new Set(['front-end', 'ui', 'ux', 'html', 'css', 'sass', 'less']),
  backend: new Set(['back-end', 'server', 'api', 'rest', 'graphql', 'microservices']),
  testing: new Set(['qa', 'junit', 'selenium', 'cypress', 'jest', 'mocha', 'tdd', 'bdd']),
  agile: new Set(['scrum', 'kanban', 'sprint', 'jira', 'confluence']),
  machinelearning: new Set(['ml', 'ai', 'deeplearning', 'tensorflow', 'pytorch', 'sklearn'])
};

// Enhanced stopwords
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'where', 'how', 'what', 'who', 'why',
  'to', 'in', 'of', 'for', 'with', 'on', 'at', 'by', 'from', 'up', 'down', 'over', 'under', 'this', 'that',
  'be', 'have', 'do', 'as', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'will', 'would', 'could', 'should',
  'can', 'may', 'might', 'must', 'shall', 'need', 'want', 'like', 'get', 'go', 'come', 'see', 'know', 'think',
  'take', 'make', 'give', 'use', 'work', 'find', 'become', 'feel', 'seem', 'look', 'try', 'ask', 'turn', 'move'
]);

// Configuration
const KEYWORDS_WEIGHT = 0.4;
const SKILLS_WEIGHT = 0.3;
const EXPERIENCE_WEIGHT = 0.2;
const EDUCATION_WEIGHT = 0.1;

class ATSScoringService {
  /**
   * Calculate ATS score for a candidate profile against job description
   */
  calculateATSScore(profile, jobDescription) {
    const detailed = this.calculateDetailedATSScore(profile, jobDescription);
    return detailed.score;
  }

  /**
   * Calculate detailed ATS score with breakdown
   */
  calculateDetailedATSScore(profile, jobDescription) {
    if (!profile || !jobDescription || !jobDescription.trim()) {
      return {
        score: 0,
        message: 'Invalid input data',
        breakdown: {
          keywordScore: 0,
          skillsScore: 0,
          experienceScore: 0,
          educationScore: 0,
          matchedKeywords: 0,
          totalKeywords: 0,
          skillsCount: profile?.skills?.length || 0,
          experienceYears: profile?.experienceYears || 0,
          hasEducation: !!(profile?.education && profile.education.trim())
        }
      };
    }

    // Extract keywords from job description and resume
    const jobKeywords = this.extractAdvancedKeywords(jobDescription);
    const resumeContent = this.buildResumeContent(profile);
    const resumeKeywords = this.extractAdvancedKeywords(resumeContent.join(' '));

    // Calculate component scores
    const keywordResult = this.scoreAdvancedKeywordMatches(resumeKeywords, jobKeywords, resumeContent, jobDescription);
    const keywordScore = keywordResult.score;

    const skillsScore = this.calculateSkillsScore(profile, jobDescription);
    const experienceScore = this.calculateExperienceScore(profile, jobDescription);
    const educationScore = this.calculateEducationScore(profile, jobDescription);

    // Calculate weighted total score
    const totalScore = Math.min(Math.max(
      keywordScore * KEYWORDS_WEIGHT +
      skillsScore * SKILLS_WEIGHT +
      experienceScore * EXPERIENCE_WEIGHT +
      educationScore * EDUCATION_WEIGHT,
      0
    ), 100);

    return {
      score: Math.round(totalScore * 100) / 100,
      message: 'ATS score calculated successfully',
      breakdown: {
        keywordScore: Math.round(keywordScore * 100) / 100,
        skillsScore: Math.round(skillsScore * 100) / 100,
        experienceScore: Math.round(experienceScore * 100) / 100,
        educationScore: Math.round(educationScore * 100) / 100,
        matchedKeywords: keywordResult.matchedCount,
        totalKeywords: jobKeywords.length,
        skillsCount: profile.skills?.length || 0,
        experienceYears: profile.experienceYears || 0,
        hasEducation: !!(profile.education && profile.education.trim())
      }
    };
  }

  /**
   * Build resume content from profile
   */
  buildResumeContent(profile) {
    const content = [];
    if (profile.name) content.push(profile.name);
    if (profile.email) content.push(profile.email);
    if (profile.education) content.push(profile.education);
    if (profile.skills) content.push(...profile.skills);
    if (profile.summary) content.push(profile.summary);
    if (profile.experience) content.push(profile.experience);
    if (profile.currentRole) content.push(profile.currentRole);
    if (profile.rawResumeText) content.push(profile.rawResumeText);
    return content;
  }

  /**
   * Extract advanced keywords from text
   */
  extractAdvancedKeywords(text) {
    if (!text || !text.trim()) return [];

    // Normalize text
    let normalized = text.toLowerCase()
      .replace(/[^a-z0-9\s+#.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = normalized.split(' ').filter(w => w.length > 0);
    const keywords = new Set();

    for (let i = 0; i < words.length; i++) {
      const word = words[i].trim();

      // Skip short words and stopwords
      if (word.length < 2 || STOPWORDS.has(word)) continue;

      // Add single word (with basic stemming)
      const stemmed = this.applyStemming(word);
      if (stemmed.length >= 2) {
        keywords.add(stemmed);
      }

      // Check for multi-word terms (2-3 words)
      if (i < words.length - 1) {
        const nextWord = words[i + 1].trim();
        if (nextWord && !STOPWORDS.has(nextWord)) {
          const bigram = word + ' ' + nextWord;
          if (this.isImportantTerm(bigram) || this.isTechnicalTerm(bigram)) {
            keywords.add(bigram);
          }

          // Check for trigrams
          if (i < words.length - 2) {
            const thirdWord = words[i + 2].trim();
            if (thirdWord && !STOPWORDS.has(thirdWord)) {
              const trigram = bigram + ' ' + thirdWord;
              if (this.isImportantTerm(trigram) || this.isTechnicalTerm(trigram)) {
                keywords.add(trigram);
              }
            }
          }
        }
      }
    }

    return Array.from(keywords);
  }

  /**
   * Apply basic stemming
   */
  applyStemming(word) {
    if (this.isTechnicalTerm(word)) return word;
    return word.replace(/(ing|ed|er|est|ly|tion|sion|ness|ment|able|ible|ful|less|ous|ive|al|ic|ical)$/, '')
      .replace(/(ies|ied)$/, 'y')
      .replace(/(s)$/, '');
  }

  /**
   * Check if term is important
   */
  isImportantTerm(term) {
    const lowerTerm = term.toLowerCase();
    const technicalTerms = new Set([
      'machine learning', 'artificial intelligence', 'data science', 'deep learning',
      'software engineering', 'cloud computing', 'agile methodology', 'devops',
      'test driven development', 'behavior driven development', 'continuous integration',
      'continuous deployment', 'rest api', 'graphql api', 'microservices architecture',
      'object oriented programming', 'functional programming', 'design patterns'
    ]);
    return technicalTerms.has(lowerTerm) || this.isTechnicalTerm(lowerTerm);
  }

  /**
   * Check if term is technical
   */
  isTechnicalTerm(term) {
    const lowerTerm = term.toLowerCase().replace(/[^a-z0-9+#.-]/g, '');
    const techTerms = new Set([
      'java', 'python', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift',
      'react', 'angular', 'vue', 'nodejs', 'express', 'spring', 'springboot', 'django', 'flask', 'laravel',
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'oracle', 'sqlserver',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket'
    ]);
    return techTerms.has(lowerTerm) || 
      Object.values(TECH_SYNONYMS).some(synonyms => synonyms.has(lowerTerm));
  }

  /**
   * Score advanced keyword matches
   */
  scoreAdvancedKeywordMatches(resumeKeywords, jobKeywords, resumeContent, jobDescription) {
    if (jobKeywords.length === 0) {
      return { score: 45, matchedCount: 0 };
    }

    const resumeTextSet = new Set(resumeKeywords);
    const fullResumeText = resumeContent.join(' ').toLowerCase();
    const fullJobText = jobDescription.toLowerCase();

    let totalScore = 0;
    let matchedCount = 0;

    for (const jobKeyword of jobKeywords) {
      let keywordScore = 0;
      let matched = false;

      // 1. Exact match
      if (resumeTextSet.has(jobKeyword) || fullResumeText.includes(jobKeyword)) {
        keywordScore = 10;
        matched = true;
      } else {
        // 2. Fuzzy matching
        for (const resumeKeyword of resumeKeywords) {
          const similarity = this.calculateStringSimilarity(jobKeyword, resumeKeyword);
          if (similarity > 0.85) {
            keywordScore = Math.max(keywordScore, 9);
            matched = true;
          } else if (similarity > 0.7) {
            keywordScore = Math.max(keywordScore, 6);
            matched = true;
          } else if (jobKeyword.includes(resumeKeyword) || resumeKeyword.includes(jobKeyword)) {
            if (Math.min(jobKeyword.length, resumeKeyword.length) >= 4) {
              keywordScore = Math.max(keywordScore, 5);
              matched = true;
            }
          }
        }
      }

      // 3. Check synonyms
      if (!matched) {
        const synonymScore = this.checkSynonymMatch(jobKeyword, resumeKeywords, fullResumeText);
        if (synonymScore > 0) {
          keywordScore = synonymScore;
          matched = true;
        }
      }

      // 4. Partial matches
      if (!matched && jobKeyword.length > 2) {
        for (const resumeKeyword of resumeKeywords) {
          if (resumeKeyword.length > 2) {
            const minLength = Math.min(3, Math.min(jobKeyword.length, resumeKeyword.length));
            if (jobKeyword.toLowerCase().includes(resumeKeyword.toLowerCase().substring(0, minLength)) ||
              resumeKeyword.toLowerCase().includes(jobKeyword.toLowerCase().substring(0, minLength))) {
              keywordScore = Math.max(keywordScore, 4);
            }
          }
        }
      }

      // 5. Minimum score for any keyword
      if (keywordScore === 0) keywordScore = 2;

      if (matched || keywordScore > 0) matchedCount++;
      totalScore += keywordScore;
    }

    // Normalize score
    const maxPossibleScore = jobKeywords.length * 10;
    let normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 85;

    // Apply match percentage bonuses
    const matchPercentage = jobKeywords.length > 0 ? matchedCount / jobKeywords.length : 0;

    if (matchPercentage > 0.8) {
      normalizedScore = Math.min(normalizedScore * 1.6, 100);
    } else if (matchPercentage > 0.6) {
      normalizedScore = Math.min(normalizedScore * 1.4, 100);
    } else if (matchPercentage > 0.4) {
      normalizedScore = Math.min(normalizedScore * 1.2, 100);
    } else if (matchPercentage > 0.2) {
      normalizedScore = Math.min(normalizedScore * 1.1, 100);
    }

    // Additional bonuses for high match counts
    if (matchedCount >= 10 && matchPercentage > 0.5) {
      normalizedScore = Math.min(normalizedScore * 1.2, 100);
    }
    if (matchedCount >= 20 && matchPercentage > 0.4) {
      normalizedScore = Math.min(normalizedScore * 1.15, 100);
    }

    // Ensure good matches get high scores
    if (matchPercentage > 0.7 && matchedCount >= 8) {
      normalizedScore = Math.max(normalizedScore, 85);
    } else if (matchPercentage > 0.5 && matchedCount >= 5) {
      normalizedScore = Math.max(normalizedScore, 75);
    }

    return { score: Math.min(normalizedScore, 100), matchedCount };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateStringSimilarity(s1, s2) {
    if (s1.toLowerCase() === s2.toLowerCase()) return 1.0;
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    const distance = levenshtein.get(s1.toLowerCase(), s2.toLowerCase());
    return 1.0 - (distance / maxLen);
  }

  /**
   * Check for synonym matches
   */
  checkSynonymMatch(jobKeyword, resumeKeywords, fullResumeText) {
    const normalizedJobKeyword = jobKeyword.replace(/[^a-z0-9]/g, '');

    for (const [mainTerm, synonyms] of Object.entries(TECH_SYNONYMS)) {
      if (mainTerm === normalizedJobKeyword || synonyms.has(normalizedJobKeyword)) {
        if (fullResumeText.includes(mainTerm)) return 7;
        for (const synonym of synonyms) {
          if (fullResumeText.includes(synonym)) return 7;
        }
        for (const resumeKeyword of resumeKeywords) {
          const normalizedResumeKeyword = resumeKeyword.replace(/[^a-z0-9]/g, '');
          if (mainTerm === normalizedResumeKeyword || synonyms.has(normalizedResumeKeyword)) {
            return 7;
          }
        }
      }
    }

    return 0;
  }

  /**
   * Calculate skills score
   */
  calculateSkillsScore(profile, jobDescription) {
    if (!profile.skills || profile.skills.length === 0) {
      return 25;
    }

    const jobKeywords = this.extractAdvancedKeywords(jobDescription);
    const profileSkills = profile.skills.map(s => s.toLowerCase());
    let matchedSkills = 0;
    const totalSkills = profileSkills.length;
    let skillRelevanceScore = 0;

    for (const skill of profileSkills) {
      let skillMatched = false;
      let bestMatch = 0;

      for (const jobKeyword of jobKeywords) {
        const similarity = this.calculateStringSimilarity(skill, jobKeyword);
        if (similarity > 0.8 || skill.includes(jobKeyword) || jobKeyword.includes(skill)) {
          matchedSkills++;
          const score = similarity > 0.9 ? 10 : (similarity > 0.8 ? 8 : 6);
          bestMatch = Math.max(bestMatch, score);
          skillMatched = true;
        } else if (similarity > 0.6) {
          bestMatch = Math.max(bestMatch, 4);
          skillMatched = true;
        }
      }

      skillRelevanceScore += bestMatch;

      // Check technical synonyms
      if (!skillMatched) {
        for (const [mainTerm, synonyms] of Object.entries(TECH_SYNONYMS)) {
          if (mainTerm === skill || synonyms.has(skill)) {
            for (const jobKeyword of jobKeywords) {
              if (mainTerm === jobKeyword || synonyms.has(jobKeyword)) {
                matchedSkills++;
                skillRelevanceScore += 9;
                skillMatched = true;
                break;
              }
            }
            if (skillMatched) break;
          }
        }
      }
    }

    const baseScore = Math.min(totalSkills * 3, 40);
    const relevanceBonus = totalSkills > 0 ? Math.min((skillRelevanceScore / totalSkills) * 4, 50) : 0;
    const matchPercentage = totalSkills > 0 ? matchedSkills / totalSkills : 0;
    const matchBonus = matchPercentage * 30;
    const skillCountBonus = Math.min(matchedSkills * 3, 15);

    let finalScore = baseScore + relevanceBonus + matchBonus + skillCountBonus;

    if (matchedSkills >= 5 && matchPercentage > 0.6) {
      finalScore = Math.max(finalScore, 75);
    } else if (matchedSkills >= 3 && matchPercentage > 0.4) {
      finalScore = Math.max(finalScore, 60);
    }

    if (matchedSkills >= 7 && matchPercentage > 0.5) {
      finalScore = Math.min(finalScore * 1.15, 100);
    }

    return Math.min(finalScore, 100);
  }

  /**
   * Calculate experience score
   */
  calculateExperienceScore(profile, jobDescription) {
    if (profile.experienceYears == null) {
      return 35;
    }

    const experienceYears = profile.experienceYears;
    const requiredExperience = this.extractRequiredExperience(jobDescription);

    if (requiredExperience > 0) {
      if (experienceYears >= requiredExperience) {
        return Math.min(100, 90 + Math.min((experienceYears - requiredExperience) * 2, 10));
      } else {
        const ratio = experienceYears / requiredExperience;
        return Math.max(25, 45 + (ratio * 40));
      }
    } else {
      if (experienceYears === 0) return 45;
      if (experienceYears <= 1) return 55;
      if (experienceYears <= 3) return 65 + (experienceYears * 5);
      if (experienceYears <= 7) return 80 + ((experienceYears - 3) * 2);
      return Math.min(88 + ((experienceYears - 7) * 1), 98);
    }
  }

  /**
   * Calculate education score
   */
  calculateEducationScore(profile, jobDescription) {
    if (!profile.education || !profile.education.trim()) {
      return 40;
    }

    const education = profile.education.toLowerCase();
    const jobDesc = jobDescription.toLowerCase();

    let baseScore = 60;
    let relevanceBonus = 0;

    // Check degree level matches
    if (jobDesc.includes('master') && education.includes('master')) {
      relevanceBonus += 25;
    } else if (jobDesc.includes('bachelor') && (education.includes('bachelor') || education.includes('master'))) {
      relevanceBonus += 20;
    } else if (jobDesc.includes('phd') && education.includes('phd')) {
      relevanceBonus += 30;
    } else if (jobDesc.includes('degree') && (education.includes('degree') || education.includes('bachelor') || education.includes('master'))) {
      relevanceBonus += 15;
    } else if (education.includes('degree') || education.includes('bachelor') || education.includes('master') || education.includes('diploma')) {
      relevanceBonus += 5;
    }

    // Check field relevance
    const jobKeywords = this.extractAdvancedKeywords(jobDescription);
    const educationKeywords = this.extractAdvancedKeywords(education);

    let matchedFields = 0;
    for (const eduKeyword of educationKeywords) {
      for (const jobKeyword of jobKeywords) {
        if (eduKeyword.includes(jobKeyword) || jobKeyword.includes(eduKeyword) ||
          this.calculateStringSimilarity(eduKeyword, jobKeyword) > 0.7) {
          matchedFields++;
          break;
        }
      }
    }

    if (matchedFields > 0) {
      relevanceBonus += Math.min(matchedFields * 4, 20);
    }

    return Math.min(baseScore + relevanceBonus, 100);
  }

  /**
   * Extract required experience from job description
   */
  extractRequiredExperience(jobDescription) {
    const text = jobDescription.toLowerCase();
    const patterns = [
      /(\d+)\+?\s*years?\s*of\s*experience/,
      /(\d+)\+?\s*years?\s*experience/,
      /minimum\s*(\d+)\s*years?/,
      /at\s*least\s*(\d+)\s*years?/,
      /(\d+)\+\s*years?/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        if (!isNaN(years) && years > 0) {
          return years;
        }
      }
    }

    return 0;
  }
}

module.exports = new ATSScoringService();
