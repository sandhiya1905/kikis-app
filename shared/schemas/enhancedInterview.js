const mongoose = require('mongoose');

// Enhanced Interview Question Schema
const enhancedInterviewQuestionSchema = new mongoose.Schema({
  question_id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  question_text: {
    type: String,
    required: true,
    trim: true
  },
  question_type: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'case_study', 'coding', 'system_design'],
    required: true
  },
  expected_answer: {
    type: String,
    trim: true
  },
  answer_keywords: [{
    keyword: String,
    weight: { type: Number, min: 0, max: 1 }
  }],
  user_answer: {
    type: String,
    trim: true
  },
  response_time: {
    type: Number, // in seconds
    required: true
  },
  thinking_time: {
    type: Number, // time before starting to answer
    default: 0
  },
  answer_length: {
    type: Number, // character count
    default: 0
  },
  confidence_indicators: {
    speech_pace: {
      type: String,
      enum: ['very_slow', 'slow', 'normal', 'fast', 'very_fast']
    },
    hesitation_count: {
      type: Number,
      default: 0
    },
    filler_words: {
      type: Number,
      default: 0
    },
    clarity_score: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  detailed_scoring: {
    content_accuracy: { type: Number, min: 0, max: 100 },
    communication_clarity: { type: Number, min: 0, max: 100 },
    problem_solving_approach: { type: Number, min: 0, max: 100 },
    technical_depth: { type: Number, min: 0, max: 100 },
    creativity: { type: Number, min: 0, max: 100 }
  },
  feedback: {
    type: String,
    trim: true
  },
  improvement_suggestions: [{
    category: {
      type: String,
      enum: ['content', 'delivery', 'structure', 'technical_knowledge', 'communication']
    },
    suggestion: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  difficulty_level: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Enhanced Evaluation Result Schema
const enhancedEvaluationResultSchema = new mongoose.Schema({
  // Core scores
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
  
  // Detailed performance metrics
  technical_competency: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  communication_skills: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  problem_solving: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  confidence_level: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  
  // Behavioral indicators
  emotional_indicators: {
    stress_level: {
      type: String,
      enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
      default: 'moderate'
    },
    enthusiasm: {
      type: String,
      enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
      default: 'moderate'
    },
    engagement: {
      type: String,
      enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
      default: 'moderate'
    }
  },
  
  // Performance analysis
  strengths: [{
    category: String,
    description: String,
    evidence: String // specific examples from the interview
  }],
  weaknesses: [{
    category: String,
    description: String,
    evidence: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major'],
      default: 'moderate'
    }
  }],
  improvement_suggestions: [{
    area: String,
    suggestion: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    resources: [String] // recommended materials or exercises
  }],
  
  // Comparative analysis
  peer_comparison: {
    percentile: {
      type: Number,
      min: 0,
      max: 100
    },
    similar_profiles_avg: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Skill gap analysis
  skill_gaps: [{
    skill: String,
    current_level: { type: Number, min: 0, max: 100 },
    target_level: { type: Number, min: 0, max: 100 },
    gap_severity: {
      type: String,
      enum: ['minor', 'moderate', 'major'],
      default: 'moderate'
    },
    recommended_actions: [String]
  }],
  
  // Readiness assessment
  job_readiness: {
    overall_readiness: {
      type: Number,
      min: 0,
      max: 100
    },
    readiness_by_role: [{
      role: String,
      readiness_score: { type: Number, min: 0, max: 100 },
      missing_skills: [String]
    }]
  }
}, { _id: false });

// Interview Session Analytics Schema
const interviewSessionAnalyticsSchema = new mongoose.Schema({
  session_duration: {
    type: Number, // in minutes
    required: true
  },
  questions_answered: {
    type: Number,
    required: true
  },
  average_response_time: {
    type: Number, // in seconds
    required: true
  },
  completion_rate: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  difficulty_progression: [{
    question_number: Number,
    difficulty: Number,
    score: Number
  }],
  performance_trend: {
    type: String,
    enum: ['improving', 'declining', 'consistent', 'variable'],
    required: true
  },
  engagement_metrics: {
    attention_score: {
      type: Number,
      min: 0,
      max: 100
    },
    interaction_quality: {
      type: Number,
      min: 0,
      max: 100
    }
  }
}, { _id: false });

// Enhanced Interview Session Schema
const enhancedInterviewSessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
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
  subdomain: {
    type: String,
    trim: true
  },
  interview_type: {
    type: String,
    enum: ['practice', 'mock', 'assessment', 'coaching'],
    default: 'practice'
  },
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  target_role: {
    type: String,
    trim: true
  },
  company_context: {
    type: String,
    trim: true
  },
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date
  },
  questions: [enhancedInterviewQuestionSchema],
  overall_score: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'abandoned', 'paused'],
    default: 'in_progress'
  },
  evaluation_result: {
    type: enhancedEvaluationResultSchema
  },
  session_analytics: {
    type: interviewSessionAnalyticsSchema
  },
  
  // Historical tracking
  previous_sessions: [{
    session_id: String,
    score_improvement: Number,
    date: Date
  }],
  
  // Coaching and recommendations
  personalized_coaching: [{
    area: String,
    current_level: Number,
    target_level: Number,
    coaching_plan: [String],
    resources: [String]
  }],
  next_session_recommendations: {
    suggested_topics: [String],
    suggested_difficulty: String,
    focus_areas: [String]
  },
  
  // Metadata
  interview_settings: {
    time_limit: Number, // in minutes
    question_count: Number,
    adaptive_difficulty: Boolean,
    feedback_mode: {
      type: String,
      enum: ['immediate', 'end_of_session', 'delayed'],
      default: 'end_of_session'
    }
  },
  technical_metadata: {
    platform: String,
    device_type: String,
    connection_quality: String,
    audio_quality: String,
    video_quality: String
  }
}, {
  timestamps: true
});

// Interview Performance History Schema
const interviewPerformanceHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  performance_timeline: [{
    session_id: String,
    date: Date,
    domain: String,
    overall_score: Number,
    key_improvements: [String],
    areas_for_focus: [String]
  }],
  skill_development_tracking: [{
    skill: String,
    historical_scores: [{
      date: Date,
      score: Number,
      session_id: String
    }],
    trend: {
      type: String,
      enum: ['improving', 'declining', 'stable']
    },
    current_level: Number,
    target_level: Number
  }],
  achievement_milestones: [{
    milestone: String,
    achieved_at: Date,
    session_id: String,
    description: String
  }],
  comparative_analytics: {
    peer_ranking: {
      percentile: Number,
      total_peers: Number,
      last_updated: Date
    },
    industry_benchmarks: [{
      role: String,
      benchmark_score: Number,
      user_score: Number,
      gap: Number
    }]
  },
  coaching_effectiveness: [{
    coaching_area: String,
    sessions_focused: Number,
    improvement_rate: Number,
    effectiveness_score: Number
  }],
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for optimal query performance
enhancedInterviewSessionSchema.index({ user_id: 1, start_time: -1 });
enhancedInterviewSessionSchema.index({ session_id: 1 });
enhancedInterviewSessionSchema.index({ domain: 1, difficulty_level: 1 });
enhancedInterviewSessionSchema.index({ status: 1 });
enhancedInterviewSessionSchema.index({ target_role: 1 });
enhancedInterviewSessionSchema.index({ overall_score: -1 });

interviewPerformanceHistorySchema.index({ user_id: 1 });
interviewPerformanceHistorySchema.index({ 'performance_timeline.date': -1 });
interviewPerformanceHistorySchema.index({ 'skill_development_tracking.skill': 1 });

module.exports = {
  EnhancedInterviewSession: mongoose.model('EnhancedInterviewSession', enhancedInterviewSessionSchema),
  InterviewPerformanceHistory: mongoose.model('InterviewPerformanceHistory', interviewPerformanceHistorySchema)
};