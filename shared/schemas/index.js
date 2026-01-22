/**
 * Enhanced Data Storage and Materials System - Schema Index
 * 
 * This file exports all enhanced data models for the Nova Learn Platform.
 * It provides a centralized access point for all database schemas and models.
 */

// Import existing schemas
const User = require('./user');
const StudyMaterial = require('./studyMaterial');
const InterviewSession = require('./interview');
const Scholarship = require('./scholarship');

// Import enhanced schemas
const { UserActivity, LearningSession } = require('./userActivity');
const EnhancedStudyMaterial = require('./enhancedMaterial');
const {
  MaterialSharing,
  MaterialComment,
  MaterialRating,
  ContentReport,
  CollaborationHistory
} = require('./collaboration');
const {
  UserLearningProfile,
  SearchAnalytics,
  PlatformMetrics
} = require('./analytics');
const {
  RecommendationList,
  LearningPath,
  SimilarMaterials,
  UserFeedback,
  CollaboratorSuggestions
} = require('./recommendations');
const {
  EnhancedInterviewSession,
  InterviewPerformanceHistory
} = require('./enhancedInterview');

// Import index configuration
const { createAllIndexes, dropAllIndexes, getIndexStats } = require('../config/mongoIndexes');

/**
 * Enhanced Data Models
 * These models extend the existing Nova Learn Platform with comprehensive
 * data storage capabilities for user activity tracking, material management,
 * collaboration features, analytics, and recommendations.
 */
const enhancedModels = {
  // User Activity and Learning Tracking
  UserActivity,
  LearningSession,
  
  // Enhanced Material Management
  EnhancedStudyMaterial,
  
  // Collaboration Features
  MaterialSharing,
  MaterialComment,
  MaterialRating,
  ContentReport,
  CollaborationHistory,
  
  // Analytics and User Profiles
  UserLearningProfile,
  SearchAnalytics,
  PlatformMetrics,
  
  // Recommendation System
  RecommendationList,
  LearningPath,
  SimilarMaterials,
  UserFeedback,
  CollaboratorSuggestions,
  
  // Enhanced Interview System
  EnhancedInterviewSession,
  InterviewPerformanceHistory
};

/**
 * Existing Models (for backward compatibility)
 */
const existingModels = {
  User,
  StudyMaterial,
  InterviewSession,
  Scholarship
};

/**
 * All Models - Combined enhanced and existing models
 */
const allModels = {
  ...existingModels,
  ...enhancedModels
};

/**
 * Model Categories for organized access
 */
const modelCategories = {
  user: {
    User,
    UserActivity,
    UserLearningProfile,
    UserFeedback
  },
  
  material: {
    StudyMaterial,
    EnhancedStudyMaterial,
    MaterialSharing,
    MaterialComment,
    MaterialRating
  },
  
  collaboration: {
    MaterialSharing,
    MaterialComment,
    MaterialRating,
    ContentReport,
    CollaborationHistory,
    CollaboratorSuggestions
  },
  
  analytics: {
    UserActivity,
    LearningSession,
    SearchAnalytics,
    PlatformMetrics,
    UserLearningProfile
  },
  
  recommendations: {
    RecommendationList,
    LearningPath,
    SimilarMaterials,
    UserFeedback,
    CollaboratorSuggestions
  },
  
  interview: {
    InterviewSession,
    EnhancedInterviewSession,
    InterviewPerformanceHistory
  },
  
  scholarship: {
    Scholarship
  }
};

/**
 * Schema Validation Helpers
 */
const schemaValidators = {
  /**
   * Validate user activity data before saving
   */
  validateUserActivity: (activityData) => {
    const required = ['user_id', 'action_type', 'resource_type', 'resource_id', 'session_id'];
    const missing = required.filter(field => !activityData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields for UserActivity: ${missing.join(', ')}`);
    }
    
    return true;
  },
  
  /**
   * Validate enhanced material metadata
   */
  validateEnhancedMaterial: (materialData) => {
    const required = ['title', 'content_type', 'metadata', 'uploaded_by'];
    const missing = required.filter(field => !materialData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields for EnhancedStudyMaterial: ${missing.join(', ')}`);
    }
    
    if (!materialData.metadata.learning_objectives || materialData.metadata.learning_objectives.length === 0) {
      throw new Error('EnhancedStudyMaterial must have at least one learning objective');
    }
    
    return true;
  },
  
  /**
   * Validate collaboration data
   */
  validateCollaboration: (collaborationType, data) => {
    switch (collaborationType) {
      case 'sharing':
        if (!data.material_id || !data.owner_id || !data.permissions) {
          throw new Error('MaterialSharing requires material_id, owner_id, and permissions');
        }
        break;
      case 'comment':
        if (!data.material_id || !data.user_id || !data.content) {
          throw new Error('MaterialComment requires material_id, user_id, and content');
        }
        break;
      case 'rating':
        if (!data.material_id || !data.user_id || !data.overall_rating) {
          throw new Error('MaterialRating requires material_id, user_id, and overall_rating');
        }
        break;
    }
    
    return true;
  }
};

/**
 * Database Utilities
 */
const dbUtils = {
  /**
   * Initialize all database indexes
   */
  initializeIndexes: createAllIndexes,
  
  /**
   * Drop all indexes (use with caution)
   */
  dropIndexes: dropAllIndexes,
  
  /**
   * Get index statistics for performance monitoring
   */
  getIndexStats: getIndexStats,
  
  /**
   * Create a new user activity entry
   */
  async logUserActivity(activityData) {
    schemaValidators.validateUserActivity(activityData);
    
    const activity = new UserActivity({
      ...activityData,
      timestamp: new Date()
    });
    
    return await activity.save();
  },
  
  /**
   * Create a new learning session
   */
  async createLearningSession(sessionData) {
    const session = new LearningSession({
      ...sessionData,
      start_time: new Date()
    });
    
    return await session.save();
  },
  
  /**
   * Update user learning profile
   */
  async updateUserLearningProfile(userId, profileUpdates) {
    return await UserLearningProfile.findOneAndUpdate(
      { user_id: userId },
      { 
        ...profileUpdates,
        last_updated: new Date()
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );
  }
};

/**
 * Migration Utilities
 */
const migrationUtils = {
  /**
   * Migrate existing StudyMaterial to EnhancedStudyMaterial
   */
  async migrateStudyMaterials() {
    const existingMaterials = await StudyMaterial.find({});
    const migrationResults = [];
    
    for (const material of existingMaterials) {
      try {
        const enhancedMaterial = new EnhancedStudyMaterial({
          title: material.title,
          description: material.description || '',
          content_type: material.content_type,
          file_path: material.file_path,
          metadata: {
            subject: material.subject,
            difficulty_level: material.metadata.difficulty_level,
            topics: material.metadata.topics || [],
            file_size: material.metadata.file_size,
            duration: material.metadata.duration || 0,
            learning_objectives: [`Learn about ${material.subject}`], // Default objective
            target_audience: ['undergraduate'], // Default audience
            estimated_study_time: material.metadata.duration || 30,
            content_format: material.content_type === 'video' ? 'video' : 'text'
          },
          uploaded_by: material.uploaded_by,
          upload_date: material.upload_date,
          status: 'approved', // Assume existing materials are approved
          visibility: 'public'
        });
        
        await enhancedMaterial.save();
        migrationResults.push({ 
          originalId: material._id, 
          enhancedId: enhancedMaterial._id, 
          status: 'success' 
        });
      } catch (error) {
        migrationResults.push({ 
          originalId: material._id, 
          error: error.message, 
          status: 'error' 
        });
      }
    }
    
    return migrationResults;
  },
  
  /**
   * Create initial user learning profiles for existing users
   */
  async createInitialUserProfiles() {
    const users = await User.find({});
    const profileResults = [];
    
    for (const user of users) {
      try {
        const existingProfile = await UserLearningProfile.findOne({ user_id: user._id });
        
        if (!existingProfile) {
          const profile = new UserLearningProfile({
            user_id: user._id,
            learning_style: 'mixed',
            preferred_difficulty: user.profile.academic_level === 'undergraduate' ? 'beginner' : 'intermediate',
            subject_proficiencies: new Map(),
            learning_goals: [],
            preferences: {
              content_types: ['pdf', 'video'],
              notification_settings: {
                email: true,
                push: true,
                frequency: 'daily'
              },
              privacy_settings: {
                profile_visibility: 'friends',
                activity_visibility: 'friends'
              }
            }
          });
          
          await profile.save();
          profileResults.push({ 
            userId: user._id, 
            profileId: profile._id, 
            status: 'created' 
          });
        } else {
          profileResults.push({ 
            userId: user._id, 
            status: 'exists' 
          });
        }
      } catch (error) {
        profileResults.push({ 
          userId: user._id, 
          error: error.message, 
          status: 'error' 
        });
      }
    }
    
    return profileResults;
  }
};

module.exports = {
  // Model exports
  ...allModels,
  
  // Organized model access
  models: allModels,
  enhancedModels,
  existingModels,
  modelCategories,
  
  // Utilities
  schemaValidators,
  dbUtils,
  migrationUtils,
  
  // Index management
  createAllIndexes,
  dropAllIndexes,
  getIndexStats
};