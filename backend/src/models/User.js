const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['candidate', 'recruiter'], required: true },
  // Social login fields
  googleId: String,
  facebookId: String,
  linkedinId: String,
  provider: { type: String, enum: ['local', 'google', 'facebook', 'linkedin'], default: 'local' },
  photo: String,
  linkedIn: String,
  phone: String,
  // Candidate specific fields
  resumeUrl: String,
  skills: [String],
  experience: String, // Can be string or array
  experienceYears: Number,
  currentRole: String,
  location: String,
  education: String, // Can be string or array
  resumeScore: Number,
  scoreBreakdown: {
    skillsScore: Number,
    experienceScore: Number,
    grammarScore: Number,
    completenessScore: Number,
    skillMatchPercentage: Number
  },
  // Recruiter specific fields
  companyName: String,
  companyLogo: String,
  contactInfo: String,
  // Wallet balance (shared by both roles)
  walletBalance: { type: Number, default: 0 },
  // Payment cards
  paymentCards: [{
    id: String,
    last4: String,
    brand: String,
    holder: String,
    expiry: String
  }],
  primaryCardId: String
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);