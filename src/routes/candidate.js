const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get candidate profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update candidate profile
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      name,
      photo,
      linkedIn,
      phone,
      skills,
      experience,
      currentRole,
      education,
      location,
      experienceYears,
      email
    } = req.body;
    
    // Filter out undefined values
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (photo !== undefined) updateData.photo = photo;
    if (linkedIn !== undefined) updateData.linkedIn = linkedIn;
    if (phone !== undefined) updateData.phone = phone;
    if (skills !== undefined) updateData.skills = skills;
    if (experience !== undefined) updateData.experience = experience;
    if (currentRole !== undefined) updateData.currentRole = currentRole;
    if (education !== undefined) updateData.education = education;
    if (location !== undefined) updateData.location = location;
    if (experienceYears !== undefined) {
      const parsedYears = Number(experienceYears);
      if (!Number.isNaN(parsedYears)) {
        updateData.experienceYears = parsedYears;
      }
    }
    
    console.log('Updating profile with:', updateData);
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Update parsed resume data
router.put('/resume-data', auth, async (req, res) => {
  try {
    const { skills, experience, education, resumeScore, scoreBreakdown, experienceYears } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { skills, experience, education, resumeScore, scoreBreakdown, experienceYears },
      { new: true, runValidators: true }
    ).select('-password');

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
    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
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

// Remove stored resume
router.delete('/resume', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (!user.resumeUrl) {
      return res.status(400).json({ message: 'No resume to remove' });
    }

    if (process.env.USE_S3 !== 'true') {
      const filePath = path.join(__dirname, '../../..', user.resumeUrl);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.warn('Failed to delete resume file:', err.message);
        }
      });
    }

    user.resumeUrl = undefined;
    await user.save();

    res.json({ message: 'Resume removed successfully' });
  } catch (error) {
    console.error('Resume removal error:', error);
    res.status(500).json({ message: 'Failed to remove resume', error: error.message });
  }
});

module.exports = router;
