const express = require('express');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'demo_client_secret',
  callbackURL: "http://localhost:5001/api/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const linkedInData = {
      name: profile.displayName,
      email: profile.emails?.[0]?.value || `${profile.id}@linkedin.com`,
      photo: profile.photos?.[0]?.value || '',
      linkedIn: `https://linkedin.com/in/${profile.id}`,
      linkedInId: profile.id
    };
    
    return done(null, linkedInData);
  } catch (error) {
    return done(error, null);
  }
}));

// LinkedIn auth route
router.get('/linkedin', (req, res, next) => {
  // Check if LinkedIn credentials are configured
  if (!process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID === '') {
    // Demo mode - simulate LinkedIn login
    const demoUser = {
      name: 'John Doe (Demo)',
      email: 'demo@linkedin.com',
      photo: 'https://via.placeholder.com/150',
      linkedIn: 'https://linkedin.com/in/demo-user',
      linkedInId: 'demo_user_123'
    };
    
    // Simulate the callback process
    req.user = demoUser;
    return next();
  }
  
  passport.authenticate('linkedin')(req, res, next);
}, async (req, res) => {
  // Handle demo mode
  if (req.user && req.user.linkedInId === 'demo_user_123') {
    try {
      const linkedInData = req.user;
      
      // Find or create demo user
      let user = await User.findOne({ email: linkedInData.email });
      
      if (!user) {
        user = new User({
          ...linkedInData,
          role: 'candidate',
          password: 'demo_linkedin_' + Date.now()
        });
        await user.save();
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      
      return res.redirect(`http://localhost:3000/linkedin-success?token=${token}`);
    } catch (error) {
      return res.redirect('http://localhost:3000/login?error=demo_failed');
    }
  }
});

// LinkedIn callback
router.get('/linkedin/callback', 
  passport.authenticate('linkedin', { session: false }),
  async (req, res) => {
    try {
      const linkedInData = req.user;
      
      // Find or create user
      let user = await User.findOne({ email: linkedInData.email });
      
      if (!user) {
        user = new User({
          ...linkedInData,
          role: 'candidate',
          password: 'linkedin_auth_' + Date.now() // Placeholder password
        });
        await user.save();
      } else {
        // Update user with LinkedIn data
        user.name = linkedInData.name;
        user.photo = linkedInData.photo;
        user.linkedIn = linkedInData.linkedIn;
        await user.save();
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      
      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/linkedin-success?token=${token}`);
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      res.redirect('http://localhost:3000/login?error=linkedin_failed');
    }
  }
);

module.exports = router;