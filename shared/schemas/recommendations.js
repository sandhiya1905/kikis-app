const mongoose = require('mongoose');

// Recommendation Context Schema
const recommendationContextSchema = new mongoose.Schema({
  current_subject: {
    type: String,
    trim: true
  },
  current_difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  learning_goals: [{
    type: String,
    trim: true
  }],
  time_available: {
    type: Number, // in minutes
    default: 30
  },
  preferred_content_types: [{
    type: String,
    enum: ['pdf', 'video', 'audio', 'interactive', 'text']
  }],
  exclude_materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial'
  }],
  include_prerequisites: {
    type: Boolean,
    default: true
  },
  context_type: {
    type: String,
    enum: ['study_session', 'quick_review', 'deep_learning', 'exam_prep', 'exploration'],
    default: 'study_session'
  }
}, { _id: false });

// Recommendation Item Schema
const recommendationItemSchema = new mongoose.Schema({
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  relevance_score: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  novelty_score: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  difficulty_match: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  reason_codes: [{
    type: String,
    enum: [
      'similar_users_liked',
      'matches_learning_style',
      'prerequisite_completed',
      'trending_content',
      'fills_knowledge_gap',
      'matches_goals',
      'high_quality_rating',
      'recently_updated',
      'collaborative_filtering',
      'content_based_similarity'
    ]
  }],
  explanation: {
    type: String,
    trim: true
  },
  position: {
    type: Number,
    required: true
  }
}, { _id: false });

// Recommendation List Schema
const recommendationListSchema = new mongoose.Schema({
  recommendation_id: {
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
  context: {
    type: recommendationContextSchema,
    required: true
  },
  recommendations: [recommendationItemSchema],
  algorithm_version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  generated_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  },
  viewed: {
    type: Boolean,
    default: false
  },
  viewed_at: {
    type: Date
  },
  interactions: [{
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedStudyMaterial'
    },
    interaction_type: {
      type: String,
      enum: ['viewed', 'clicked', 'dismissed', 'bookmarked', 'shared']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    position: Number
  }],
  feedback: {
    overall_satisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    relevance_rating: {
      type: Number,
      min: 1,
      max: 5
    },
    diversity_rating: {
      type: Number,
      min: 1,
      max: 5
    },
    explanation_clarity: {
      type: Number,
      min: 1,
      max: 5
    },
    would_use_again: {
      type: Boolean
    },
    feedback_text: {
      type: String,
      trim: true,
      maxlength: 500
    },
    feedback_given_at: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Learning Path Schema
const learningPathSchema = new mongoose.Schema({
  path_id: {
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
  goal: {
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
    difficulty_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    }
  },
  materials: [{
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedStudyMaterial',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    is_prerequisite: {
      type: Boolean,
      default: false
    },
    estimated_duration: {
      type: Number, // in minutes
      required: true
    },
    completion_status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'skipped'],
      default: 'not_started'
    },
    completed_at: {
      type: Date
    },
    progress_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  total_estimated_duration: {
    type: Number, // in minutes
    required: true
  },
  overall_progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_accessed: {
    type: Date
  },
  completion_date: {
    type: Date
  }
}, {
  timestamps: true
});

// Similar Materials Schema
const similarMaterialsSchema = new mongoose.Schema({
  source_material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  similar_materials: [{
    material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedStudyMaterial',
      required: true
    },
    similarity_score: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    similarity_reasons: [{
      type: String,
      enum: [
        'same_subject',
        'similar_topics',
        'same_difficulty',
        'same_author',
        'similar_content_type',
        'user_behavior_similarity',
        'semantic_similarity'
      ]
    }]
  }],
  algorithm_version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  calculated_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// User Feedback Schema
const userFeedbackSchema = new mongoose.Schema({
  feedback_id: {
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
  feedback_type: {
    type: String,
    enum: ['recommendation_rating', 'material_preference', 'algorithm_feedback', 'feature_request'],
    required: true
  },
  target_id: {
    type: String, // recommendation_id, material_id, etc.
    required: true
  },
  feedback_data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  implicit_feedback: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  },
  processed_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Collaborator Suggestions Schema
const collaboratorSuggestionsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedStudyMaterial',
    required: true
  },
  suggested_collaborators: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    compatibility_score: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    reasons: [{
      type: String,
      enum: [
        'similar_interests',
        'complementary_skills',
        'same_institution',
        'similar_learning_style',
        'previous_collaboration',
        'mutual_connections'
      ]
    }],
    suggested_role: {
      type: String,
      enum: ['co_author', 'reviewer', 'contributor', 'mentor', 'study_partner']
    }
  }],
  generated_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for optimal query performance
recommendationListSchema.index({ user_id: 1, generated_at: -1 });
recommendationListSchema.index({ recommendation_id: 1 });
recommendationListSchema.index({ expires_at: 1 });
recommendationListSchema.index({ 'recommendations.material_id': 1 });

learningPathSchema.index({ user_id: 1, status: 1 });
learningPathSchema.index({ path_id: 1 });
learningPathSchema.index({ 'materials.material_id': 1 });
learningPathSchema.index({ created_at: -1 });

similarMaterialsSchema.index({ source_material_id: 1 });
similarMaterialsSchema.index({ 'similar_materials.material_id': 1 });
similarMaterialsSchema.index({ expires_at: 1 });

userFeedbackSchema.index({ user_id: 1, timestamp: -1 });
userFeedbackSchema.index({ feedback_type: 1 });
userFeedbackSchema.index({ target_id: 1 });
userFeedbackSchema.index({ processed: 1 });

collaboratorSuggestionsSchema.index({ user_id: 1, material_id: 1 });
collaboratorSuggestionsSchema.index({ 'suggested_collaborators.user_id': 1 });
collaboratorSuggestionsSchema.index({ expires_at: 1 });

module.exports = {
  RecommendationList: mongoose.model('RecommendationList', recommendationListSchema),
  LearningPath: mongoose.model('LearningPath', learningPathSchema),
  SimilarMaterials: mongoose.model('SimilarMaterials', similarMaterialsSchema),
  UserFeedback: mongoose.model('UserFeedback', userFeedbackSchema),
  CollaboratorSuggestions: mongoose.model('CollaboratorSuggestions', collaboratorSuggestionsSchema)
};