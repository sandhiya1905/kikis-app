const mongoose = require('mongoose');

// Activity Patterns Schema
const activityPatternsSchema = new mongoose.Schema({
  peak_hours: [{
    hour: { type: Number, min: 0, max: 23 },
    activity_level: { type: Number, min: 0, max: 100 }
  }],
  preferred_days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  session_duration_avg: {
    type: Number, // in minutes
    default: 0
  },
  sessions_per_week: {
    type: Number,
    default: 0
  },
  most_active_features: [{
    feature: String,
    usage_percentage: { type: Number, min: 0, max: 100 }
  }]
}, { _id: false });

// Engagement Metrics Schema
const engagementMetricsSchema = new mongoose.Schema({
  total_time_spent: {
    type: Number, // in minutes
    default: 0
  },
  materials_viewed: {
    type: Number,
    default: 0
  },
  materials_completed: {
    type: Number,
    default: 0
  },
  comments_made: {
    type: Number,
    default: 0
  },
  ratings_given: {
    type: Number,
    default: 0
  },
  materials_shared: {
    type: Number,
    default: 0
  },
  materials_uploaded: {
    type: Number,
    default: 0
  },
  engagement_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { _id: false });

// Learning Goal Schema
const learningGoalSchema = new mongoose.Schema({
  goal_id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  target_completion_date: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Progress Tracking Schema
const progressTrackingSchema = new mongoose.Schema({
  subjects: [{
    subject: String,
    proficiency_level: { type: Number, min: 0, max: 100, default: 0 },
    materials_completed: { type: Number, default: 0 },
    time_spent: { type: Number, default: 0 }, // in minutes
    last_activity: Date
  }],
  skills: [{
    skill: String,
    level: { type: Number, min: 0, max: 100, default: 0 },
    evidence: [String], // material IDs that demonstrate this skill
    last_updated: Date
  }],
  achievements: [{
    achievement_id: String,
    title: String,
    description: String,
    earned_at: Date,
    evidence: String // material or activity that earned this achievement
  }],
  learning_streaks: {
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    last_activity_date: Date
  }
}, { _id: false });

// User Learning Profile Schema
const userLearningProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  learning_style: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading_writing', 'mixed'],
    default: 'mixed'
  },
  preferred_difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    default: 'mixed'
  },
  subject_proficiencies: {
    type: Map,
    of: {
      level: { type: Number, min: 0, max: 100, default: 0 },
      confidence: { type: Number, min: 0, max: 100, default: 0 },
      last_assessed: Date
    }
  },
  learning_goals: [learningGoalSchema],
  activity_patterns: {
    type: activityPatternsSchema,
    default: () => ({})
  },
  engagement_metrics: {
    type: engagementMetricsSchema,
    default: () => ({})
  },
  progress_tracking: {
    type: progressTrackingSchema,
    default: () => ({})
  },
  preferences: {
    content_types: [{
      type: String,
      enum: ['pdf', 'video', 'audio', 'interactive', 'text']
    }],
    notification_settings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'daily' }
    },
    privacy_settings: {
      profile_visibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
      activity_visibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' }
    }
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Feedback Summary Schema
const feedbackSummarySchema = new mongoose.Schema({
  total_ratings: {
    type: Number,
    default: 0
  },
  average_rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  rating_distribution: {
    one_star: { type: Number, default: 0 },
    two_star: { type: Number, default: 0 },
    three_star: { type: Number, default: 0 },
    four_star: { type: Number, default: 0 },
    five_star: { type: Number, default: 0 }
  },
  dimension_averages: {
    accuracy: { type: Number, min: 0, max: 5, default: 0 },
    clarity: { type: Number, min: 0, max: 5, default: 0 },
    usefulness: { type: Number, min: 0, max: 5, default: 0 },
    completeness: { type: Number, min: 0, max: 5, default: 0 },
    organization: { type: Number, min: 0, max: 5, default: 0 }
  },
  common_feedback_themes: [{
    theme: String,
    frequency: Number,
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] }
  }]
}, { _id: false });

// Search Analytics Schema
const searchAnalyticsSchema = new mongoose.Schema({
  query_id: {
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
  query_text: {
    type: String,
    required: true,
    trim: true
  },
  filters_applied: {
    subject: [String],
    difficulty: [String],
    content_type: [String],
    tags: [String],
    date_range: {
      start: Date,
      end: Date
    }
  },
  results_count: {
    type: Number,
    required: true
  },
  clicked_results: [{
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedStudyMaterial'
    },
    position: Number, // position in search results
    clicked_at: Date
  }],
  session_id: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  query_refinements: [{
    refined_query: String,
    timestamp: Date
  }],
  satisfaction_score: {
    type: Number,
    min: 1,
    max: 5
  },
  found_what_looking_for: {
    type: Boolean
  },
  time_to_first_click: {
    type: Number // in seconds
  },
  total_time_on_results: {
    type: Number // in seconds
  }
}, {
  timestamps: true
});

// Platform Metrics Schema
const platformMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  active_users: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
  },
  content_metrics: {
    materials_uploaded: { type: Number, default: 0 },
    materials_viewed: { type: Number, default: 0 },
    materials_downloaded: { type: Number, default: 0 },
    comments_posted: { type: Number, default: 0 },
    ratings_given: { type: Number, default: 0 }
  },
  engagement_metrics: {
    average_session_duration: { type: Number, default: 0 }, // in minutes
    bounce_rate: { type: Number, min: 0, max: 100, default: 0 },
    return_user_rate: { type: Number, min: 0, max: 100, default: 0 }
  },
  search_metrics: {
    total_searches: { type: Number, default: 0 },
    successful_searches: { type: Number, default: 0 },
    average_results_per_search: { type: Number, default: 0 }
  },
  quality_metrics: {
    materials_pending_review: { type: Number, default: 0 },
    materials_approved: { type: Number, default: 0 },
    materials_rejected: { type: Number, default: 0 },
    reports_submitted: { type: Number, default: 0 },
    reports_resolved: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for optimal query performance
userLearningProfileSchema.index({ user_id: 1 });
userLearningProfileSchema.index({ learning_style: 1 });
userLearningProfileSchema.index({ preferred_difficulty: 1 });
userLearningProfileSchema.index({ last_updated: -1 });

searchAnalyticsSchema.index({ user_id: 1, timestamp: -1 });
searchAnalyticsSchema.index({ query_text: 'text' });
searchAnalyticsSchema.index({ session_id: 1 });
searchAnalyticsSchema.index({ timestamp: -1 });
searchAnalyticsSchema.index({ 'clicked_results.material_id': 1 });

platformMetricsSchema.index({ date: -1 });

module.exports = {
  UserLearningProfile: mongoose.model('UserLearningProfile', userLearningProfileSchema),
  SearchAnalytics: mongoose.model('SearchAnalytics', searchAnalyticsSchema),
  PlatformMetrics: mongoose.model('PlatformMetrics', platformMetricsSchema)
};