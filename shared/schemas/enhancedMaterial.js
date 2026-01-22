const mongoose = require('mongoose');

// Enhanced Material Metadata Schema
const enhancedMaterialMetadataSchema = new mongoose.Schema({
  // Existing fields (extended)
  subject: {
    type: String,
    required: true,
    trim: true
  },
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  topics: [{
    type: String,
    trim: true
  }],
  file_size: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Enhanced fields
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial'
  }],
  learning_objectives: [{
    type: String,
    trim: true,
    required: true
  }],
  target_audience: [{
    type: String,
    enum: ['undergraduate', 'graduate', 'postgraduate', 'professional', 'beginner', 'intermediate', 'advanced'],
    required: true
  }],
  language: {
    type: String,
    default: 'en',
    trim: true
  },
  accessibility_features: [{
    type: String,
    enum: ['closed_captions', 'audio_description', 'screen_reader_compatible', 'high_contrast', 'large_text']
  }],
  content_warnings: [{
    type: String,
    trim: true
  }],
  related_materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial'
  }],
  learning_path_position: {
    type: Number,
    default: 0
  },
  estimated_study_time: {
    type: Number, // in minutes
    required: true
  },
  interactive_elements: [{
    type: String,
    enum: ['quiz', 'exercise', 'simulation', 'video', 'audio', 'animation', 'interactive_diagram']
  }],
  content_format: {
    type: String,
    enum: ['text', 'video', 'audio', 'interactive', 'mixed'],
    required: true
  },
  quality_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { _id: false });

// Material Change Tracking Schema
const materialChangeSchema = new mongoose.Schema({
  change_type: {
    type: String,
    enum: ['content', 'metadata', 'structure', 'permissions'],
    required: true
  },
  field_name: {
    type: String,
    required: true
  },
  old_value: {
    type: mongoose.Schema.Types.Mixed
  },
  new_value: {
    type: mongoose.Schema.Types.Mixed
  },
  change_reason: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Material Version Schema
const materialVersionSchema = new mongoose.Schema({
  version_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  version_number: {
    type: String,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  changes: [materialChangeSchema],
  change_summary: {
    type: String,
    trim: true,
    required: true
  },
  approval_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'draft'],
    default: 'draft'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: {
    type: Date
  },
  file_hash: {
    type: String,
    trim: true
  },
  size_delta: {
    type: Number,
    default: 0
  },
  is_current: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Material Analytics Schema
const materialAnalyticsSchema = new mongoose.Schema({
  view_count: {
    type: Number,
    default: 0
  },
  download_count: {
    type: Number,
    default: 0
  },
  completion_rates: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    by_difficulty: {
      beginner: { type: Number, min: 0, max: 100, default: 0 },
      intermediate: { type: Number, min: 0, max: 100, default: 0 },
      advanced: { type: Number, min: 0, max: 100, default: 0 }
    }
  },
  engagement_metrics: {
    average_time_spent: {
      type: Number, // in minutes
      default: 0
    },
    bounce_rate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    return_rate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  learning_effectiveness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  trending_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  recommendation_frequency: {
    type: Number,
    default: 0
  },
  last_calculated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Quality Data Schema
const qualityDataSchema = new mongoose.Schema({
  automated_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  manual_review_score: {
    type: Number,
    min: 0,
    max: 100
  },
  community_rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  review_count: {
    type: Number,
    default: 0
  },
  quality_flags: [{
    type: String,
    enum: ['inappropriate_content', 'copyright_violation', 'low_quality', 'outdated', 'inaccurate']
  }],
  last_reviewed: {
    type: Date
  },
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

// Enhanced Study Material Schema
const enhancedStudyMaterialSchema = new mongoose.Schema({
  // Existing fields
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content_type: {
    type: String,
    enum: ['pdf', 'video', 'document', 'presentation', 'audio', 'interactive', 'text', 'url'],
    required: true
  },
  file_path: {
    type: String
  },
  url: {
    type: String,
    trim: true
  },
  content: {
    type: String // For text-based materials
  },
  
  // Enhanced fields
  metadata: {
    type: enhancedMaterialMetadataSchema,
    required: true
  },
  versions: [materialVersionSchema],
  current_version: {
    type: String,
    default: '1.0.0'
  },
  analytics: {
    type: materialAnalyticsSchema,
    default: () => ({})
  },
  quality: {
    type: qualityDataSchema,
    default: () => ({})
  },
  
  // Upload and ownership
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upload_date: {
    type: Date,
    default: Date.now
  },
  last_modified: {
    type: Date,
    default: Date.now
  },
  
  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'public'
  },
  
  // Tags and categorization
  tags: [{
    type: String,
    trim: true
  }],
  categories: [{
    type: String,
    trim: true
  }],
  
  // File information
  file_info: {
    original_name: String,
    mime_type: String,
    encoding: String,
    size: Number,
    checksum: String
  }
}, {
  timestamps: true
});

// Indexes for optimal query performance
enhancedStudyMaterialSchema.index({ 'metadata.subject': 1 });
enhancedStudyMaterialSchema.index({ 'metadata.topics': 1 });
enhancedStudyMaterialSchema.index({ 'metadata.difficulty_level': 1 });
enhancedStudyMaterialSchema.index({ 'metadata.target_audience': 1 });
enhancedStudyMaterialSchema.index({ tags: 1 });
enhancedStudyMaterialSchema.index({ categories: 1 });
enhancedStudyMaterialSchema.index({ status: 1, visibility: 1 });
enhancedStudyMaterialSchema.index({ uploaded_by: 1, upload_date: -1 });
enhancedStudyMaterialSchema.index({ title: 'text', description: 'text', tags: 'text' });
enhancedStudyMaterialSchema.index({ 'analytics.trending_score': -1 });
enhancedStudyMaterialSchema.index({ 'quality.community_rating': -1 });
enhancedStudyMaterialSchema.index({ 'metadata.prerequisites': 1 });
enhancedStudyMaterialSchema.index({ 'metadata.related_materials': 1 });

module.exports = mongoose.model('EnhancedStudyMaterial', enhancedStudyMaterialSchema);