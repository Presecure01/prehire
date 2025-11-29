const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const role = profile.role || 'candidate'; // Default to candidate
    
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
      role: role,
      provider: 'google'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Configure Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const role = profile.role || 'candidate';
    
    let user = await User.findOne({ 
      $or: [
        { facebookId: profile.id },
        { email: profile.emails?.[0]?.value }
      ]
    });

    if (user) {
      return done(null, user);
    }

    user = new User({
      facebookId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
      photo: profile.photos?.[0]?.value,
      role: role,
      provider: 'facebook'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Configure LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID || 'your-linkedin-client-id',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'your-linkedin-client-secret',
  callbackURL: "/api/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const role = profile.role || 'candidate';
    
    let user = await User.findOne({ 
      $or: [
        { linkedinId: profile.id },
        { email: profile.emails?.[0]?.value }
      ]
    });

    if (user) {
      return done(null, user);
    }

    user = new User({
      linkedinId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      photo: profile.photos?.[0]?.value,
      role: role,
      provider: 'linkedin'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'candidate';
  req.session.pendingRole = role;
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const role = req.session.pendingRole || 'candidate';
      
      // Update user role if needed
      if (req.user.role !== role) {
        await User.findByIdAndUpdate(req.user._id, { role });
        req.user.role = role;
      }

      const token = jwt.sign(
        { userId: req.user._id, role: req.user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // Redirect based on role
      const redirectUrl = role === 'candidate' ? '/candidate' : '/recruiter';
      res.redirect(`http://localhost:3000${redirectUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

// Facebook OAuth routes
router.get('/facebook', (req, res, next) => {
  const role = req.query.role || 'candidate';
  req.session.pendingRole = role;
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const role = req.session.pendingRole || 'candidate';
      
      if (req.user.role !== role) {
        await User.findByIdAndUpdate(req.user._id, { role });
        req.user.role = role;
      }

      const token = jwt.sign(
        { userId: req.user._id, role: req.user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      const redirectUrl = role === 'candidate' ? '/candidate' : '/recruiter';
      res.redirect(`http://localhost:3000${redirectUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

// LinkedIn OAuth routes
router.get('/linkedin', (req, res, next) => {
  const role = req.query.role || 'candidate';
  req.session.pendingRole = role;
  passport.authenticate('linkedin')(req, res, next);
});

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const role = req.session.pendingRole || 'candidate';
      
      if (req.user.role !== role) {
        await User.findByIdAndUpdate(req.user._id, { role });
        req.user.role = role;
      }

      const token = jwt.sign(
        { userId: req.user._id, role: req.user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      const redirectUrl = role === 'candidate' ? '/candidate' : '/recruiter';
      res.redirect(`http://localhost:3000${redirectUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

module.exports = router;