const mongoose = require('mongoose');

// Enhanced User Activity Tracking Schema
const geoLocationSchema = new mongoose.Schema({
  country: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, { _id: false });

const activityContextSchema = new mongoose.Schema({
  ip_address: {
    type: String,
    trim: true
  },
  user_agent: {
    type: String,
    trim: true
  },
  referrer: {
    type: String,
    trim: true
  },
  device_type: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  location: geoLocationSchema,
  duration: {
    type: Number, // in seconds
    default: 0
  },
  interaction_depth: {
    type: Number,
    default: 1
  }
}, { _id: false });

const userActivitySchema = new mongoose.Schema({
  activity_id: {
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
  action_type: {
    type: String,
    enum: ['view', 'download', 'search', 'upload', 'comment', 'rate', 'share', 'bookmark', 'login', 'logout'],
    required: true
  },
  resource_type: {
    type: String,
    enum: ['material', 'collection', 'user', 'system', 'interview', 'scholarship'],
    required: true
  },
  resource_id: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  session_id: {
    type: String,
    required: true
  },
  context: {
    type: activityContextSchema,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Material Interaction Schema
const materialInteractionSchema = new mongoose.Schema({
  interaction_type: {
    type: String,
    enum: ['view', 'download', 'bookmark', 'note', 'highlight', 'share'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  position: {
    type: Number, // for videos/documents - position where interaction occurred
    default: 0
  },
  data: {
    type: mongoose.Schema.Types.Mixed // additional interaction-specific data
  }
}, { _id: false });

const materialAccessSchema = new mongoose.Schema({
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial',
    required: true
  },
  access_time: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  completion_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  interactions: [materialInteractionSchema],
  notes_taken: {
    type: Boolean,
    default: false
  },
  bookmarked: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const learningOutcomeSchema = new mongoose.Schema({
  outcome_type: {
    type: String,
    enum: ['skill_acquired', 'concept_understood', 'problem_solved', 'goal_achieved'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  confidence_level: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const learningSessionSchema = new mongoose.Schema({
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
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date
  },
  materials_accessed: [materialAccessSchema],
  learning_objectives: [{
    type: String,
    trim: true
  }],
  completion_rate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  engagement_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  outcomes: [learningOutcomeSchema]
}, {
  timestamps: true
});

// Indexes for optimal query performance
userActivitySchema.index({ user_id: 1, timestamp: -1 });
userActivitySchema.index({ action_type: 1, timestamp: -1 });
userActivitySchema.index({ resource_type: 1, resource_id: 1 });
userActivitySchema.index({ session_id: 1 });
userActivitySchema.index({ timestamp: -1 });

learningSessionSchema.index({ user_id: 1, start_time: -1 });
learningSessionSchema.index({ session_id: 1 });
learningSessionSchema.index({ 'materials_accessed.material_id': 1 });

module.exports = {
  UserActivity: mongoose.model('UserActivity', userActivitySchema),
  LearningSession: mongoose.model('LearningSession', learningSessionSchema)
};