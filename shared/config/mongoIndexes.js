const mongoose = require('mongoose');

/**
 * MongoDB Index Configuration for Enhanced Data Storage and Materials System
 * 
 * This file contains comprehensive index definitions for optimal query performance
 * across all enhanced data models. Indexes are organized by collection and use case.
 */

const indexConfigurations = {
  // User Activity Indexes
  userActivities: [
    // Primary query patterns
    { fields: { user_id: 1, timestamp: -1 }, options: { background: true } },
    { fields: { action_type: 1, timestamp: -1 }, options: { background: true } },
    { fields: { resource_type: 1, resource_id: 1 }, options: { background: true } },
    { fields: { session_id: 1 }, options: { background: true } },
    { fields: { timestamp: -1 }, options: { background: true } },
    
    // Compound indexes for analytics queries
    { fields: { user_id: 1, action_type: 1, timestamp: -1 }, options: { background: true } },
    { fields: { resource_type: 1, action_type: 1, timestamp: -1 }, options: { background: true } },
    { fields: { 'context.device_type': 1, timestamp: -1 }, options: { background: true } },
    
    // Geospatial indexes for location-based analytics
    { fields: { 'context.location': '2dsphere' }, options: { background: true, sparse: true } },
    
    // TTL index for data retention (optional - remove old activity data)
    { fields: { timestamp: 1 }, options: { expireAfterSeconds: 31536000, background: true } } // 1 year
  ],

  // Learning Session Indexes
  learningSessions: [
    { fields: { user_id: 1, start_time: -1 }, options: { background: true } },
    { fields: { session_id: 1 }, options: { unique: true, background: true } },
    { fields: { 'materials_accessed.material_id': 1 }, options: { background: true } },
    { fields: { user_id: 1, completion_rate: -1 }, options: { background: true } },
    { fields: { engagement_score: -1 }, options: { background: true } }
  ],

  // Enhanced Study Materials Indexes
  enhancedStudyMaterials: [
    // Basic search and filtering
    { fields: { 'metadata.subject': 1 }, options: { background: true } },
    { fields: { 'metadata.topics': 1 }, options: { background: true } },
    { fields: { 'metadata.difficulty_level': 1 }, options: { background: true } },
    { fields: { 'metadata.target_audience': 1 }, options: { background: true } },
    { fields: { tags: 1 }, options: { background: true } },
    { fields: { categories: 1 }, options: { background: true } },
    
    // Status and visibility filtering
    { fields: { status: 1, visibility: 1 }, options: { background: true } },
    { fields: { uploaded_by: 1, upload_date: -1 }, options: { background: true } },
    
    // Full-text search
    { fields: { title: 'text', description: 'text', tags: 'text' }, options: { background: true } },
    
    // Analytics and recommendations
    { fields: { 'analytics.trending_score': -1 }, options: { background: true } },
    { fields: { 'quality.community_rating': -1 }, options: { background: true } },
    { fields: { 'analytics.view_count': -1 }, options: { background: true } },
    
    // Relationship indexes
    { fields: { 'metadata.prerequisites': 1 }, options: { background: true } },
    { fields: { 'metadata.related_materials': 1 }, options: { background: true } },
    
    // Compound indexes for complex queries
    { fields: { 'metadata.subject': 1, 'metadata.difficulty_level': 1, status: 1 }, options: { background: true } },
    { fields: { status: 1, 'quality.community_rating': -1, 'analytics.view_count': -1 }, options: { background: true } },
    { fields: { 'metadata.target_audience': 1, 'metadata.subject': 1, 'analytics.trending_score': -1 }, options: { background: true } }
  ],

  // Material Sharing Indexes
  materialSharings: [
    { fields: { material_id: 1 }, options: { background: true } },
    { fields: { owner_id: 1 }, options: { background: true } },
    { fields: { 'shared_with.target_id': 1 }, options: { background: true } },
    { fields: { share_link: 1 }, options: { unique: true, sparse: true, background: true } },
    { fields: { created_at: -1 }, options: { background: true } },
    { fields: { expires_at: 1 }, options: { background: true } },
    { fields: { is_active: 1, expires_at: 1 }, options: { background: true } }
  ],

  // Material Comments Indexes
  materialComments: [
    { fields: { material_id: 1, timestamp: -1 }, options: { background: true } },
    { fields: { user_id: 1 }, options: { background: true } },
    { fields: { parent_comment_id: 1 }, options: { background: true, sparse: true } },
    { fields: { status: 1 }, options: { background: true } },
    { fields: { material_id: 1, status: 1, timestamp: -1 }, options: { background: true } },
    { fields: { likes: -1 }, options: { background: true } },
    { fields: { flags: -1 }, options: { background: true } }
  ],

  // Material Ratings Indexes
  materialRatings: [
    { fields: { material_id: 1 }, options: { background: true } },
    { fields: { user_id: 1 }, options: { background: true } },
    { fields: { material_id: 1, user_id: 1 }, options: { unique: true, background: true } },
    { fields: { overall_rating: -1 }, options: { background: true } },
    { fields: { timestamp: -1 }, options: { background: true } },
    { fields: { verified_learner: 1, overall_rating: -1 }, options: { background: true } }
  ],

  // Content Reports Indexes
  contentReports: [
    { fields: { material_id: 1 }, options: { background: true } },
    { fields: { reporter_id: 1 }, options: { background: true } },
    { fields: { status: 1, priority: -1 }, options: { background: true } },
    { fields: { created_at: -1 }, options: { background: true } },
    { fields: { report_type: 1, status: 1 }, options: { background: true } },
    { fields: { severity: 1, status: 1, created_at: -1 }, options: { background: true } }
  ],

  // Collaboration History Indexes
  collaborationHistories: [
    { fields: { material_id: 1, timestamp: -1 }, options: { background: true } },
    { fields: { user_id: 1, timestamp: -1 }, options: { background: true } },
    { fields: { action_type: 1 }, options: { background: true } },
    { fields: { session_id: 1 }, options: { background: true, sparse: true } }
  ],

  // User Learning Profiles Indexes
  userLearningProfiles: [
    { fields: { user_id: 1 }, options: { unique: true, background: true } },
    { fields: { learning_style: 1 }, options: { background: true } },
    { fields: { preferred_difficulty: 1 }, options: { background: true } },
    { fields: { last_updated: -1 }, options: { background: true } },
    { fields: { 'engagement_metrics.engagement_score': -1 }, options: { background: true } }
  ],

  // Search Analytics Indexes
  searchAnalytics: [
    { fields: { user_id: 1, timestamp: -1 }, options: { background: true } },
    { fields: { query_text: 'text' }, options: { background: true } },
    { fields: { session_id: 1 }, options: { background: true } },
    { fields: { timestamp: -1 }, options: { background: true } },
    { fields: { 'clicked_results.material_id': 1 }, options: { background: true } },
    { fields: { results_count: 1, satisfaction_score: -1 }, options: { background: true } }
  ],

  // Platform Metrics Indexes
  platformMetrics: [
    { fields: { date: -1 }, options: { unique: true, background: true } }
  ],

  // Recommendation Lists Indexes
  recommendationLists: [
    { fields: { user_id: 1, generated_at: -1 }, options: { background: true } },
    { fields: { recommendation_id: 1 }, options: { unique: true, background: true } },
    { fields: { expires_at: 1 }, options: { background: true } },
    { fields: { 'recommendations.material_id': 1 }, options: { background: true } },
    { fields: { viewed: 1, generated_at: -1 }, options: { background: true } }
  ],

  // Learning Paths Indexes
  learningPaths: [
    { fields: { user_id: 1, status: 1 }, options: { background: true } },
    { fields: { path_id: 1 }, options: { unique: true, background: true } },
    { fields: { 'materials.material_id': 1 }, options: { background: true } },
    { fields: { created_at: -1 }, options: { background: true } },
    { fields: { status: 1, overall_progress: -1 }, options: { background: true } }
  ],

  // Similar Materials Indexes
  similarMaterials: [
    { fields: { source_material_id: 1 }, options: { background: true } },
    { fields: { 'similar_materials.material_id': 1 }, options: { background: true } },
    { fields: { expires_at: 1 }, options: { background: true } }
  ],

  // User Feedback Indexes
  userFeedbacks: [
    { fields: { user_id: 1, timestamp: -1 }, options: { background: true } },
    { fields: { feedback_type: 1 }, options: { background: true } },
    { fields: { target_id: 1 }, options: { background: true } },
    { fields: { processed: 1 }, options: { background: true } },
    { fields: { feedback_type: 1, processed: 1, timestamp: -1 }, options: { background: true } }
  ],

  // Collaborator Suggestions Indexes
  collaboratorSuggestions: [
    { fields: { user_id: 1, material_id: 1 }, options: { background: true } },
    { fields: { 'suggested_collaborators.user_id': 1 }, options: { background: true } },
    { fields: { expires_at: 1 }, options: { background: true } }
  ],

  // Enhanced Interview Sessions Indexes
  enhancedInterviewSessions: [
    { fields: { user_id: 1, start_time: -1 }, options: { background: true } },
    { fields: { session_id: 1 }, options: { unique: true, background: true } },
    { fields: { domain: 1, difficulty_level: 1 }, options: { background: true } },
    { fields: { status: 1 }, options: { background: true } },
    { fields: { target_role: 1 }, options: { background: true } },
    { fields: { overall_score: -1 }, options: { background: true } },
    { fields: { user_id: 1, domain: 1, start_time: -1 }, options: { background: true } }
  ],

  // Interview Performance History Indexes
  interviewPerformanceHistories: [
    { fields: { user_id: 1 }, options: { unique: true, background: true } },
    { fields: { 'performance_timeline.date': -1 }, options: { background: true } },
    { fields: { 'skill_development_tracking.skill': 1 }, options: { background: true } }
  ]
};

/**
 * Create all indexes for the enhanced data storage system
 * @param {Object} db - MongoDB database connection
 */
async function createAllIndexes(db) {
  console.log('Creating MongoDB indexes for enhanced data storage system...');
  
  const collections = Object.keys(indexConfigurations);
  const results = [];
  
  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const indexes = indexConfigurations[collectionName];
      
      console.log(`Creating ${indexes.length} indexes for ${collectionName}...`);
      
      for (const indexConfig of indexes) {
        try {
          const result = await collection.createIndex(indexConfig.fields, indexConfig.options || {});
          results.push({
            collection: collectionName,
            index: indexConfig.fields,
            result: result,
            status: 'success'
          });
        } catch (error) {
          // Handle duplicate index errors gracefully
          if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
            console.log(`Index already exists for ${collectionName}:`, indexConfig.fields);
            results.push({
              collection: collectionName,
              index: indexConfig.fields,
              result: 'already_exists',
              status: 'skipped'
            });
          } else {
            console.error(`Error creating index for ${collectionName}:`, error);
            results.push({
              collection: collectionName,
              index: indexConfig.fields,
              error: error.message,
              status: 'error'
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error accessing collection ${collectionName}:`, error);
      results.push({
        collection: collectionName,
        error: error.message,
        status: 'collection_error'
      });
    }
  }
  
  console.log('Index creation completed.');
  return results;
}

/**
 * Drop all indexes for a clean slate (use with caution)
 * @param {Object} db - MongoDB database connection
 */
async function dropAllIndexes(db) {
  console.log('Dropping all indexes for enhanced data storage system...');
  
  const collections = Object.keys(indexConfigurations);
  const results = [];
  
  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const result = await collection.dropIndexes();
      results.push({
        collection: collectionName,
        result: result,
        status: 'success'
      });
    } catch (error) {
      console.error(`Error dropping indexes for ${collectionName}:`, error);
      results.push({
        collection: collectionName,
        error: error.message,
        status: 'error'
      });
    }
  }
  
  console.log('Index dropping completed.');
  return results;
}

/**
 * Get index statistics for performance monitoring
 * @param {Object} db - MongoDB database connection
 */
async function getIndexStats(db) {
  const collections = Object.keys(indexConfigurations);
  const stats = {};
  
  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      const indexStats = await collection.aggregate([
        { $indexStats: {} }
      ]).toArray();
      
      stats[collectionName] = {
        indexes: indexes,
        usage: indexStats
      };
    } catch (error) {
      console.error(`Error getting stats for ${collectionName}:`, error);
      stats[collectionName] = { error: error.message };
    }
  }
  
  return stats;
}

module.exports = {
  indexConfigurations,
  createAllIndexes,
  dropAllIndexes,
  getIndexStats
};