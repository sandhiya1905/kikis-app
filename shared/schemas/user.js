const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  interests: [{
    type: String,
    trim: true
  }],
  academic_level: {
    type: String,
    enum: ['undergraduate', 'graduate', 'postgraduate'],
    required: true
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  profile: {
    type: studentProfileSchema,
    required: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.college': 1 });
userSchema.index({ 'profile.major': 1 });

module.exports = mongoose.model('User', userSchema);