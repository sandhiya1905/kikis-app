const mongoose = require('mongoose');

const eligibilityCriteriaSchema = new mongoose.Schema({
  min_gpa: {
    type: Number,
    min: 0.0,
    max: 4.0
  },
  academic_year: [{
    type: String,
    enum: ['freshman', 'sophomore', 'junior', 'senior', 'graduate', 'postgraduate']
  }],
  majors: [{
    type: String,
    trim: true
  }],
  financial_need: {
    type: Boolean,
    default: false
  },
  other_requirements: [{
    type: String,
    trim: true
  }]
});

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  eligibility_criteria: {
    type: eligibilityCriteriaSchema,
    required: true
  },
  application_deadline: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  application_link: {
    type: String,
    required: true,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
scholarshipSchema.index({ 'eligibility_criteria.majors': 1 });
scholarshipSchema.index({ 'eligibility_criteria.academic_year': 1 });
scholarshipSchema.index({ application_deadline: 1 });
scholarshipSchema.index({ title: 'text', description: 'text' });
scholarshipSchema.index({ is_active: 1 });

module.exports = mongoose.model('Scholarship', scholarshipSchema);