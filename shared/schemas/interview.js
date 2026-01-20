const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
    trim: true
  },
  expected_answer: {
    type: String,
    trim: true
  },
  user_answer: {
    type: String,
    trim: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    trim: true
  },
  difficulty_level: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

const evaluationResultSchema = new mongoose.Schema({
  accuracy_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  clarity_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  relevance_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  overall_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  strengths: [{
    type: String,
    trim: true
  }],
  weaknesses: [{
    type: String,
    trim: true
  }],
  improvement_suggestions: [{
    type: String,
    trim: true
  }]
});

const interviewSessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date
  },
  questions: [interviewQuestionSchema],
  overall_score: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  evaluation_result: evaluationResultSchema
}, {
  timestamps: true
});

// Indexes
interviewSessionSchema.index({ user_id: 1 });
interviewSessionSchema.index({ domain: 1 });
interviewSessionSchema.index({ start_time: 1 });
interviewSessionSchema.index({ status: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);