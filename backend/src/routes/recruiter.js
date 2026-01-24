const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Dummy candidate profiles for shortlist/search experiences
const dummyProfiles = [
  {
    id: 'rahul-gupta',
    name: 'Rahul Gupta',
    title: 'UX Designer',
    location: 'Jaipur',
    experienceYears: 2,
    experienceLabel: '2 years',
    phone: '+91 7829451044',
    education: 'B.Tech',
    availabilityDays: 15,
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=60',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    topCandidate: true,
    keywords: ['product design', 'ux', 'figma']
  },
  {
    id: 'ananya-mehra',
    name: 'Ananya Mehra',
    title: 'Web Designer',
    location: 'Pune',
    experienceYears: 3,
    experienceLabel: '3 years',
    phone: '+91 6354783291',
    education: 'B.Tech',
    availabilityDays: 10,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=60',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    topCandidate: true,
    keywords: ['ui', 'illustration', 'responsive']
  },
  {
    id: 'sanya-shah',
    name: 'Sanya Shah',
    title: 'Frontend Engineer',
    location: 'Bengaluru',
    experienceYears: 4,
    experienceLabel: '4 years',
    phone: '+91 9876501234',
    education: 'M.Tech',
    availabilityDays: 30,
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    topCandidate: false,
    keywords: ['react', 'javascript', 'frontend']
  },
  {
    id: 'rohit-singh',
    name: 'Rohit Singh',
    title: 'Web Developer',
    location: 'Hyderabad',
    experienceYears: 2.5,
    experienceLabel: '2-3 years',
    phone: '+91 7682341098',
    education: 'B.Sc Computer Science',
    availabilityDays: 20,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=60',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    topCandidate: false,
    keywords: ['javascript', 'node', 'css']
  }
];

const experienceMatches = (years, filter) => {
  if (!filter || filter === 'all') return true;
  if (years === undefined || years === null) return false;
  switch (filter) {
    case '0-2':
      return years <= 2;
    case '2-4':
      return years >= 2 && years <= 4;
    case '3':
      return Math.round(years) === 3;
    case '4-6':
      return years >= 4 && years <= 6;
    case '6+':
      return years >= 6;
    default:
      return true;
  }
};

const computeRelevance = (profile, searchTerm = '') => {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) return profile.topCandidate ? 5 : 0;
  const haystack = [
    profile.name,
    profile.title,
    profile.location,
    profile.education,
    ...(profile.keywords || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  
  const terms = normalized.split(/\s+/);
  let score = profile.topCandidate ? 5 : 0;
  terms.forEach(term => {
    if (haystack.includes(term)) {
      score += 12;
    }
  });
  return score;
};

// Get recruiter profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get shortlisted profiles with filters
router.get('/shortlisted-profiles', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      search = '',
      experience = 'all',
      location = 'all',
      education = 'all',
      availability = 'all',
      sortBy = 'relevance',
      onlyShortlisted = 'false'
    } = req.query;

    const user = await User.findById(req.user.userId).select('shortlistedProfiles role');
    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const shortlistIds = user.shortlistedProfiles || [];
    const keyword = search.trim().toLowerCase();
    const availabilityNum = availability === 'all' ? null : parseInt(availability, 10);
    const shortlistOnly = String(onlyShortlisted).toLowerCase() === 'true';

    let profiles = dummyProfiles.map(profile => ({
      ...profile,
      isShortlisted: shortlistIds.includes(profile.id)
    }));

    if (shortlistOnly) {
      profiles = profiles.filter(p => p.isShortlisted);
    }

    if (keyword) {
      profiles = profiles.filter(profile => {
        const haystack = [
          profile.name,
          profile.title,
          profile.location,
          profile.education,
          ...(profile.keywords || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(keyword);
      });
    }

    if (experience && experience !== 'all') {
      profiles = profiles.filter(profile => experienceMatches(profile.experienceYears, experience));
    }

    if (location && location !== 'all') {
      profiles = profiles.filter(profile => profile.location?.toLowerCase() === location.toLowerCase());
    }

    if (education && education !== 'all') {
      profiles = profiles.filter(profile => profile.education?.toLowerCase().includes(education.toLowerCase()));
    }

    if (availabilityNum && !Number.isNaN(availabilityNum)) {
      profiles = profiles.filter(profile => profile.availabilityDays && profile.availabilityDays <= availabilityNum);
    }

    profiles = profiles.map(profile => ({
      ...profile,
      relevanceScore: computeRelevance(profile, keyword)
    }));

    switch (sortBy) {
      case 'experience':
        profiles.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
        break;
      case 'location':
        profiles.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
      case 'name':
        profiles.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        profiles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    res.json({
      profiles,
      shortlistIds,
      total: profiles.length,
      appliedFilters: { search, experience, location, education, availability, sortBy, onlyShortlisted: shortlistOnly }
    });
  } catch (error) {
    console.error('Shortlisted profiles fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch shortlisted profiles', error: error.message });
  }
});

// Toggle or update shortlist
router.post('/shortlisted-profiles/:profileId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { profileId } = req.params;
    const { action = 'toggle' } = req.body;

    const profile = dummyProfiles.find(p => p.id === profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    let shortlist = user.shortlistedProfiles || [];
    const alreadyShortlisted = shortlist.includes(profileId);

    if (action === 'remove' || (action === 'toggle' && alreadyShortlisted)) {
      shortlist = shortlist.filter(id => id !== profileId);
    } else if (!alreadyShortlisted) {
      shortlist.push(profileId);
    }

    user.shortlistedProfiles = shortlist;
    await user.save();

    res.json({
      shortlist,
      profile: { ...profile, isShortlisted: shortlist.includes(profileId) }
    });
  } catch (error) {
    console.error('Shortlist update error:', error);
    res.status(500).json({ message: 'Failed to update shortlist', error: error.message });
  }
});

// Add a panel member
router.post('/panel-members', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, designation, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !designation || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Check for duplicate email in existing panel members
    if (user.panelMembers && user.panelMembers.some(m => m.email === email)) {
      return res.status(400).json({ message: 'Panel member with this email already exists' });
    }

    // Add panel member
    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { panelMembers: { name: name.trim(), email: email.trim().toLowerCase(), designation: designation.trim(), role: role.trim() } } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'Failed to update panel members' });
    }

    return res.json(updated.panelMembers || []);
  } catch (error) {
    console.error('Error adding panel member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get panel members
router.get('/panel-members', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.user.userId).select('panelMembers');
    if (!user) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.json(user.panelMembers || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update recruiter profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, companyName, companyLogo, contactInfo, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, companyName, companyLogo, contactInfo, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Update wallet balance
router.put('/wallet-balance', auth, async (req, res) => {
  try {
    const { amount, operation = 'add' } = req.body; // operation: 'add' or 'set'
    
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const currentBalance = user.walletBalance || 0;
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : amount;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { walletBalance: newBalance },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Wallet balance updated successfully',
      walletBalance: updatedUser.walletBalance,
      user: updatedUser
    });
  } catch (error) {
    console.error('Wallet balance update error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Get filtered candidates for dashboard
router.get('/candidates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { skills, minScore, experience } = req.query;
    let filter = { role: 'candidate' };

    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }
    if (minScore) {
      filter.resumeScore = { $gte: parseInt(minScore) };
    }

    const candidates = await User.find(filter)
      .select('-password')
      .sort({ resumeScore: -1 });

    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Advanced search endpoint with faceted filtering
router.get('/search', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { 
      search, 
      experience, 
      location, 
      education, 
      minScore, 
      maxScore,
      skills, 
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;
    
    let filter = { role: 'candidate' };
    let sort = {};

    // Full-text search with weighted scoring
    if (search && search.trim()) {
      const searchTerms = search.trim().split(/\s+/);
      const searchConditions = [];
      
      searchTerms.forEach(term => {
        const termRegex = new RegExp(term, 'i');
        searchConditions.push({
          $or: [
            { name: termRegex },
            { skills: { $elemMatch: { $regex: term, $options: 'i' } } },
            { currentRole: termRegex },
            { experience: termRegex },
            { education: termRegex },
            { location: termRegex }
          ]
        });
      });
      
      filter.$and = searchConditions;
    }

    // Experience filter with flexible matching
    if (experience && experience !== 'all') {
      const expMap = {
        'entry': { $or: [{ experienceYears: { $lte: 2 } }, { experience: /entry|junior|fresher/i }] },
        '0-2': { $or: [{ experienceYears: { $lte: 2 } }, { experience: /0-2|entry|junior/i }] },
        '2-4': { $or: [{ experienceYears: { $gte: 2, $lte: 4 } }, { experience: /2-4|mid/i }] },
        '4-6': { $or: [{ experienceYears: { $gte: 4, $lte: 6 } }, { experience: /4-6|senior/i }] },
        '6+': { $or: [{ experienceYears: { $gte: 6 } }, { experience: /6\+|lead|principal/i }] }
      };
      if (expMap[experience]) filter = { ...filter, ...expMap[experience] };
    }

    // Location filter with city matching
    if (location && location !== 'all') {
      filter.location = new RegExp(location, 'i');
    }

    // Education filter
    if (education && education !== 'all') {
      filter.education = new RegExp(education, 'i');
    }

    // Skills filter with exact and partial matching
    if (skills && skills.trim()) {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      if (skillsArray.length > 0) {
        filter.skills = {
          $in: skillsArray.map(skill => new RegExp(skill, 'i'))
        };
      }
    }

    // Resume score range filter
    if (minScore || maxScore) {
      filter.resumeScore = {};
      if (minScore) filter.resumeScore.$gte = parseInt(minScore);
      if (maxScore) filter.resumeScore.$lte = parseInt(maxScore);
    }

    // Sorting logic
    switch (sortBy) {
      case 'score':
        sort = { resumeScore: -1, createdAt: -1 };
        break;
      case 'experience':
        sort = { experienceYears: -1, resumeScore: -1 };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      default:
        sort = { resumeScore: -1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search with pagination
    const [candidates, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Calculate relevance scores for search results
    const candidatesWithScore = candidates.map(candidate => {
      let relevanceScore = candidate.resumeScore || 0;
      
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        const candidateText = [
          candidate.name,
          candidate.currentRole,
          candidate.experience,
          candidate.education,
          ...(candidate.skills || [])
        ].join(' ').toLowerCase();
        
        // Boost for exact matches
        if (candidateText.includes(searchLower)) relevanceScore += 20;
        
        // Boost for skill matches
        const skillMatches = (candidate.skills || []).filter(skill => 
          skill.toLowerCase().includes(searchLower)
        ).length;
        relevanceScore += skillMatches * 15;
        
        // Boost for name matches
        if (candidate.name?.toLowerCase().includes(searchLower)) relevanceScore += 25;
        
        // Boost for role matches
        if (candidate.currentRole?.toLowerCase().includes(searchLower)) relevanceScore += 18;
      }
      
      return {
        ...candidate.toObject(),
        relevanceScore,
        matchPercentage: Math.min(100, Math.round((relevanceScore / 100) * 100))
      };
    });

    // Re-sort by relevance if search term provided
    if (search && search.trim() && sortBy === 'relevance') {
      candidatesWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    res.json({
      candidates: candidatesWithScore,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + candidates.length < totalCount,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        applied: { search, experience, location, education, minScore, maxScore, skills },
        totalResults: totalCount
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// Get search suggestions with categories
router.get('/suggestions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { q, type = 'all' } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const searchRegex = new RegExp(q, 'i');
    
    // Get candidates data for suggestions
    const candidates = await User.find({ role: 'candidate' })
      .select('skills currentRole location name')
      .limit(200);

    const suggestions = {
      skills: new Set(),
      roles: new Set(),
      locations: new Set(),
      names: new Set()
    };
    
    candidates.forEach(candidate => {
      // Skills suggestions
      candidate.skills?.forEach(skill => {
        if (skill.match(searchRegex) && skill.length > 1) {
          suggestions.skills.add(skill);
        }
      });
      
      // Role suggestions
      if (candidate.currentRole?.match(searchRegex)) {
        suggestions.roles.add(candidate.currentRole);
      }
      
      // Location suggestions
      if (candidate.location?.match(searchRegex)) {
        suggestions.locations.add(candidate.location);
      }
      
      // Name suggestions (for direct candidate search)
      if (candidate.name?.match(searchRegex)) {
        suggestions.names.add(candidate.name);
      }
    });

    // Format response based on type
    if (type === 'all') {
      const allSuggestions = [
        ...Array.from(suggestions.skills).slice(0, 3).map(s => ({ text: s, type: 'skill' })),
        ...Array.from(suggestions.roles).slice(0, 3).map(s => ({ text: s, type: 'role' })),
        ...Array.from(suggestions.locations).slice(0, 2).map(s => ({ text: s, type: 'location' }))
      ];
      res.json(allSuggestions.slice(0, 8));
    } else {
      const typeMap = {
        skills: Array.from(suggestions.skills).slice(0, 10),
        roles: Array.from(suggestions.roles).slice(0, 10),
        locations: Array.from(suggestions.locations).slice(0, 10),
        names: Array.from(suggestions.names).slice(0, 10)
      };
      res.json(typeMap[type] || []);
    }
  } catch (error) {
    res.status(500).json({ message: 'Suggestions failed', error: error.message });
  }
});

// Get filter facets (available filter options)
router.get('/facets', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get aggregated data for filter options
    const facets = await User.aggregate([
      { $match: { role: 'candidate' } },
      {
        $group: {
          _id: null,
          skills: { $addToSet: '$skills' },
          locations: { $addToSet: '$location' },
          educations: { $addToSet: '$education' },
          roles: { $addToSet: '$currentRole' },
          scoreRange: {
            $push: {
              min: { $min: '$resumeScore' },
              max: { $max: '$resumeScore' }
            }
          }
        }
      }
    ]);

    if (facets.length === 0) {
      return res.json({ skills: [], locations: [], educations: [], roles: [], scoreRange: { min: 0, max: 100 } });
    }

    const result = facets[0];
    
    res.json({
      skills: [...new Set(result.skills.flat())].filter(Boolean).sort(),
      locations: result.locations.filter(Boolean).sort(),
      educations: result.educations.filter(Boolean).sort(),
      roles: result.roles.filter(Boolean).sort(),
      scoreRange: {
        min: Math.min(...result.scoreRange.map(r => r.min).filter(Boolean)) || 0,
        max: Math.max(...result.scoreRange.map(r => r.max).filter(Boolean)) || 100
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Facets failed', error: error.message });
  }
});

// Unlock candidate profile (premium feature)
router.post('/unlock-profile/:candidateId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { candidateId } = req.params;
    
    // Find the candidate and recruiter
    const [candidate, recruiter] = await Promise.all([
      User.findById(candidateId).select('-password'),
      User.findById(req.user.userId).select('name companyName email')
    ]);
    
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // TODO: When payment gateway is integrated:
    // 1. Check if recruiter has sufficient wallet balance (₹500)
    // 2. Create transaction record
    // 3. Deduct from wallet balance
    // 4. Process payment

    // Create notification for candidate
    const Notification = require('../models/Notification');
    const emailService = require('../services/emailService');

    await Notification.create({
      userId: candidateId,
      type: 'profile_unlocked',
      title: 'Your Profile Was Unlocked',
      message: `${recruiter.name} from ${recruiter.companyName || 'a company'} unlocked your profile`,
      metadata: {
        candidateId: candidateId,
        link: '/candidate/profile'
      }
    });

    // Send email to candidate
    await emailService.sendProfileUnlockedEmail(
      candidate.email,
      candidate.name,
      recruiter.name,
      recruiter.companyName
    );
    
    res.json({
      success: true,
      message: 'Profile unlocked successfully',
      candidate: {
        ...candidate.toObject(),
        phone: candidate.phone,
        email: candidate.email,
        resumeUrl: candidate.resumeUrl,
        linkedIn: candidate.linkedIn,
        fullAccess: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unlock failed', error: error.message });
  }
});

// Download candidate resume
router.get('/download-resume/:candidateId', async (req, res) => {
  try {
    // Handle token from query parameter for file downloads
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    if (decoded.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { candidateId } = req.params;
    const candidate = await User.findById(candidateId).select('resumeUrl name');
    
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (!candidate.resumeUrl) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../..', candidate.resumeUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    const fileName = `${candidate.name}_Resume.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
});

// Get candidate statistics for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await User.aggregate([
      { $match: { role: 'candidate' } },
      {
        $group: {
          _id: null,
          totalCandidates: { $sum: 1 },
          avgResumeScore: { $avg: '$resumeScore' },
          topSkills: { $push: '$skills' },
          experienceLevels: {
            $push: {
              $switch: {
                branches: [
                  { case: { $lte: ['$experienceYears', 2] }, then: 'entry' },
                  { case: { $lte: ['$experienceYears', 4] }, then: 'mid' },
                  { case: { $lte: ['$experienceYears', 6] }, then: 'senior' },
                  { case: { $gt: ['$experienceYears', 6] }, then: 'expert' }
                ],
                default: 'unknown'
              }
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalCandidates: 0,
        avgResumeScore: 0,
        topSkills: [],
        experienceLevels: { entry: 0, mid: 0, senior: 0, expert: 0 }
      });
    }

    const result = stats[0];
    
    // Process top skills
    const skillCounts = {};
    result.topSkills.flat().forEach(skill => {
      if (skill) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    });
    
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Process experience levels
    const expLevelCounts = { entry: 0, mid: 0, senior: 0, expert: 0, unknown: 0 };
    result.experienceLevels.forEach(level => {
      expLevelCounts[level] = (expLevelCounts[level] || 0) + 1;
    });

    res.json({
      totalCandidates: result.totalCandidates,
      avgResumeScore: Math.round(result.avgResumeScore || 0),
      topSkills,
      experienceLevels: expLevelCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Stats failed', error: error.message });
  }
});

// Send filtered candidates via email
router.post('/send-candidates-email', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { search, experience, location, education, minScore, skills } = req.query;
    let filter = { role: 'candidate' };

    // Apply same filters as search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
        { currentRole: searchRegex },
        { experience: searchRegex },
        { education: searchRegex },
        { location: searchRegex }
      ];
    }

    if (experience) {
      const expMap = {
        '0-2': { $or: [{ experienceYears: { $lte: 2 } }, { experience: /0-2|entry|junior/i }] },
        '2-4': { $or: [{ experienceYears: { $gte: 2, $lte: 4 } }, { experience: /2-4|mid/i }] },
        '4-6': { $or: [{ experienceYears: { $gte: 4, $lte: 6 } }, { experience: /4-6|senior/i }] },
        '6+': { $or: [{ experienceYears: { $gte: 6 } }, { experience: /6\+|lead|principal/i }] }
      };
      if (expMap[experience]) filter = { ...filter, ...expMap[experience] };
    }

    if (location) filter.location = new RegExp(location, 'i');
    if (education) filter.education = new RegExp(education, 'i');
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      if (skillsArray.length > 0) {
        filter.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
      }
    }
    if (minScore) filter.resumeScore = { $gte: parseInt(minScore) };

    const candidates = await User.find(filter)
      .select('-password')
      .sort({ resumeScore: -1 })
      .limit(50);

    // Get recruiter info
    const recruiter = await User.findById(req.user.userId).select('name email companyName');
    
    // Generate email HTML
    const emailHtml = generateCandidatesEmailHtml(candidates, recruiter, { search, experience, location, education, minScore, skills });
    
    // Send email using configured service
    await sendEmail({
      to: recruiter.email,
      subject: `PreHire - ${candidates.length} Filtered Candidates`,
      html: emailHtml
    });

    res.json({ 
      message: 'Email sent successfully', 
      candidatesCount: candidates.length,
      sentTo: recruiter.email 
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// Email service handler
async function sendEmail({ to, subject, html }) {
  const emailService = process.env.EMAIL_SERVICE || 'smtp';
  
  switch (emailService) {
    case 'sendgrid':
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({
        to,
        from: process.env.EMAIL_USER || 'noreply@prehire.com',
        subject,
        html
      });
      break;
      
    case 'mailgun':
      const mailgun = require('mailgun-js')({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      });
      await mailgun.messages().send({
        from: process.env.EMAIL_USER || 'noreply@prehire.com',
        to,
        subject,
        html
      });
      break;
      
    default: // smtp
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@prehire.com',
        to,
        subject,
        html
      });
  }
}

// Generate HTML email template
function generateCandidatesEmailHtml(candidates, recruiter, filters) {
  const filterSummary = Object.entries(filters)
    .filter(([key, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ') || 'No filters applied';

  const candidatesHtml = candidates.map(candidate => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937;">${candidate.name}</h3>
      <p style="margin: 0 0 8px 0; color: #6b7280;">${candidate.currentRole || 'Candidate'}</p>
      <div style="margin-bottom: 12px;">
        ${candidate.location ? `<span style="margin-right: 16px;">📍 ${candidate.location}</span>` : ''}
        ${candidate.experienceYears ? `<span style="margin-right: 16px;">👤 ${candidate.experienceYears} years</span>` : ''}
        ${candidate.education ? `<span>🎓 ${candidate.education}</span>` : ''}
      </div>
      ${candidate.skills && candidate.skills.length > 0 ? `
        <div style="margin-bottom: 12px;">
          ${candidate.skills.slice(0, 5).map(skill => 
            `<span style="background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 16px; font-size: 12px; margin-right: 8px;">${skill}</span>`
          ).join('')}
          ${candidate.skills.length > 5 ? `<span style="color: #6b7280; font-size: 12px;">+${candidate.skills.length - 5} more</span>` : ''}
        </div>
      ` : ''}
      ${candidate.resumeScore ? `<div style="color: #10b981; font-weight: 600;">Resume Score: ${candidate.resumeScore}/100</div>` : ''}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>PreHire - Filtered Candidates</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #8b5cf6; margin: 0;">PreHire</h1>
        <h2 style="color: #1f2937; margin: 8px 0;">Filtered Candidates Report</h2>
      </div>
      
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p><strong>Dear ${recruiter.name || 'Recruiter'},</strong></p>
        <p>Here are <strong>${candidates.length} candidates</strong> matching your search criteria:</p>
        <p><strong>Filters Applied:</strong> ${filterSummary}</p>
        <p><strong>Company:</strong> ${recruiter.companyName || 'N/A'}</p>
      </div>
      
      <div>
        ${candidatesHtml}
      </div>
      
      <div style="text-align: center; margin-top: 32px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
        <p style="margin: 0; color: #6b7280;">Generated by PreHire - Connecting talent with opportunity</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af;">This email was sent to ${recruiter.email}</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;
