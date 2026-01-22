const mongoose = require('mongoose');

// Sharing Target Schema
const sharingTargetSchema = new mongoose.Schema({
  target_type: {
    type: String,
    enum: ['user', 'group', 'public', 'class', 'institution'],
    required: true
  },
  target_id: {
    type: String, // Can be user ID, group ID, etc.
    required: true
  },
  permissions: [{
    type: String,
    enum: ['view', 'download', 'comment', 'rate', 'edit', 'share'],
    required: true
  }],
  added_at: {
    type: Date,
    default: Date.now
  },
  added_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { _id: false });

// Sharing Permissions Schema
const sharingPermissionsSchema = new mongoose.Schema({
  can_view: {
    type: Boolean,
    default: true
  },
  can_download: {
    type: Boolean,
    default: false
  },
  can_comment: {
    type: Boolean,
    default: false
  },
  can_rate: {
    type: Boolean,
    default: false
  },
  can_edit: {
    type: Boolean,
    default: false
  },
  can_share: {
    type: Boolean,
    default: false
  },
  can_delete: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Material Sharing Schema
const materialSharingSchema = new mongoose.Schema({
  sharing_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shared_with: [sharingTargetSchema],
  permissions: {
    type: sharingPermissionsSchema,
    required: true
  },
  sharing_type: {
    type: String,
    enum: ['direct', 'link', 'public', 'group'],
    default: 'direct'
  },
  share_link: {
    type: String,
    unique: true,
    sparse: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date
  },
  access_count: {
    type: Number,
    default: 0
  },
  last_accessed: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Material Comment Schema
const materialCommentSchema = new mongoose.Schema({
  comment_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent_comment_id: {
    type: String, // For threading
    default: null
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  edited_at: {
    type: Date
  },
  edit_history: [{
    content: String,
    edited_at: { type: Date, default: Date.now }
  }],
  likes: {
    type: Number,
    default: 0
  },
  liked_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: String // comment_ids of replies
  }],
  is_moderated: {
    type: Boolean,
    default: false
  },
  moderation_reason: {
    type: String,
    trim: true
  },
  moderated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderated_at: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted', 'flagged'],
    default: 'active'
  },
  flags: {
    type: Number,
    default: 0
  },
  flagged_by: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Material Rating Schema
const materialRatingSchema = new mongoose.Schema({
  rating_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  overall_rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  dimension_ratings: {
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    clarity: {
      type: Number,
      min: 1,
      max: 5
    },
    usefulness: {
      type: Number,
      min: 1,
      max: 5
    },
    completeness: {
      type: Number,
      min: 1,
      max: 5
    },
    organization: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  review_text: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  helpful_votes: {
    type: Number,
    default: 0
  },
  voted_helpful_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified_learner: {
    type: Boolean,
    default: false
  },
  learning_outcome: {
    type: String,
    enum: ['helped_significantly', 'helped_somewhat', 'neutral', 'not_helpful', 'confusing'],
    required: true
  },
  would_recommend: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

// Content Report Schema
const contentReportSchema = new mongoose.Schema({
  report_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  comment_id: {
    type: String // If reporting a comment
  },
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  report_type: {
    type: String,
    enum: ['inappropriate', 'copyright', 'quality', 'spam', 'harassment', 'misinformation', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  evidence: [{
    type: String, // URLs or file paths to evidence
    trim: true
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed', 'escalated'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  resolved_at: {
    type: Date
  },
  moderator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    trim: true
  },
  action_taken: {
    type: String,
    enum: ['no_action', 'content_removed', 'content_edited', 'user_warned', 'user_suspended', 'other'],
    default: 'no_action'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  }
}, {
  timestamps: true
});

// Collaboration History Schema
const collaborationHistorySchema = new mongoose.Schema({
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action_type: {
    type: String,
    enum: ['shared', 'commented', 'rated', 'edited', 'reported', 'moderated'],
    required: true
  },
  action_details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  session_id: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for optimal query performance
materialSharingSchema.index({ material_id: 1 });
materialSharingSchema.index({ owner_id: 1 });
materialSharingSchema.index({ 'shared_with.target_id': 1 });
materialSharingSchema.index({ share_link: 1 });
materialSharingSchema.index({ created_at: -1 });

materialCommentSchema.index({ material_id: 1, timestamp: -1 });
materialCommentSchema.index({ user_id: 1 });
materialCommentSchema.index({ parent_comment_id: 1 });
materialCommentSchema.index({ status: 1 });

materialRatingSchema.index({ material_id: 1 });
materialRatingSchema.index({ user_id: 1 });
materialRatingSchema.index({ overall_rating: -1 });
materialRatingSchema.index({ timestamp: -1 });

contentReportSchema.index({ material_id: 1 });
contentReportSchema.index({ reporter_id: 1 });
contentReportSchema.index({ status: 1, priority: -1 });
contentReportSchema.index({ created_at: -1 });

collaborationHistorySchema.index({ material_id: 1, timestamp: -1 });
collaborationHistorySchema.index({ user_id: 1, timestamp: -1 });
collaborationHistorySchema.index({ action_type: 1 });

// Compound indexes for common queries
materialCommentSchema.index({ material_id: 1, status: 1, timestamp: -1 });
materialRatingSchema.index({ material_id: 1, user_id: 1 }, { unique: true });

module.exports = {
  MaterialSharing: mongoose.model('MaterialSharing', materialSharingSchema),
  MaterialComment: mongoose.model('MaterialComment', materialCommentSchema),
  MaterialRating: mongoose.model('MaterialRating', materialRatingSchema),
  ContentReport: mongoose.model('ContentReport', contentReportSchema),
  CollaborationHistory: mongoose.model('CollaborationHistory', collaborationHistorySchema)
};