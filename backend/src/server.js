const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidate');
const recruiterRoutes = require('./routes/recruiter');
const uploadRoutes = require('./routes/upload');
const linkedinRoutes = require('./routes/linkedin');
const socialAuthRoutes = require('./routes/social-auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', linkedinRoutes);
app.use('/api/auth', socialAuthRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/upload', uploadRoutes);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prehire';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`MongoDB connected: ${mongoUri}`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Simple DB health endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
      status: states[state] || 'unknown',
      readyState: state,
      uri: process.env.NODE_ENV === 'production' ? undefined : mongoUri,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Prefer BACKEND_PORT to avoid conflicts with global PORT on Windows/dev tools
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});