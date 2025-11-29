const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const router = express.Router();

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  location: user.location || '',
  currentRole: user.currentRole || '',
  experience: user.experience || '',
  education: user.education || '',
  linkedIn: user.linkedIn || '',
  skills: user.skills || [],
  experienceYears: user.experienceYears || 0,
  walletBalance: user.walletBalance || 0,
  paymentCards: user.paymentCards || [],
  primaryCardId: user.primaryCardId || null
});

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret',
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      return done(null, user);
    }

    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value,
      role: 'candidate',
      provider: 'google'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['candidate', 'recruiter']).withMessage('Role must be candidate or recruiter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      password,
      role,
      phone,
      location,
      currentRole,
      experience,
      education,
      linkedIn,
      skills,
      experienceYears
    } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = { name, email, password, role };
    if (phone !== undefined) userData.phone = phone;
    if (location !== undefined) userData.location = location;
    if (currentRole !== undefined) userData.currentRole = currentRole;
    if (experience !== undefined) userData.experience = experience;
    if (education !== undefined) userData.education = education;
    if (linkedIn !== undefined) userData.linkedIn = linkedIn;
    if (skills !== undefined) {
      userData.skills = Array.isArray(skills)
        ? skills
        : String(skills)
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean);
    }
    if (experienceYears !== undefined && experienceYears !== null) {
      const parsedYears = Number(experienceYears);
      if (!Number.isNaN(parsedYears)) {
        userData.experienceYears = parsedYears;
      }
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'candidate';
  req.session.pendingRole = role;
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/?error=auth_failed' }),
  async (req, res) => {
    try {
      const role = req.session.pendingRole || 'candidate';
      
      if (req.user.role !== role) {
        await User.findByIdAndUpdate(req.user._id, { role });
        req.user.role = role;
      }

      const token = jwt.sign(
        { userId: req.user._id, role: req.user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      const redirectUrl = role === 'candidate' ? '/candidate' : '/recruiter';
      res.redirect(`http://localhost:3000${redirectUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      res.redirect('http://localhost:3000/?error=auth_failed');
    }
  }
);

// Facebook and LinkedIn (redirect to Google for now)
router.get('/facebook', (req, res) => {
  const role = req.query.role || 'candidate';
  res.redirect(`/api/auth/google?role=${role}`);
});

router.get('/linkedin', (req, res) => {
  const role = req.query.role || 'candidate';
  res.redirect(`/api/auth/google?role=${role}`);
});

module.exports = router;
