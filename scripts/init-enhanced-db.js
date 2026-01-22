#!/usr/bin/env node

/**
 * Enhanced Database Initialization Script
 * 
 * This script initializes the enhanced data storage and materials system
 * by creating all necessary MongoDB collections, indexes, and initial data.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import all enhanced schemas and utilities
const {
  models,
  createAllIndexes,
  migrationUtils,
  dbUtils
} = require('../shared/schemas');

// Configuration
const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nova_learn_enhanced',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

/**
 * Initialize database connection
 */
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', config.mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    await mongoose.connect(config.mongoUri, config.options);
    console.log('✅ Connected to MongoDB successfully');
    
    return mongoose.connection.db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Create all collections with validation
 */
async function createCollections() {
  console.log('\n📁 Creating collections...');
  
  const collections = [
    'useractivities',
    'learningsessions',
    'enhancedstudymaterials',
    'materialsharings',
    'materialcomments',
    'materialratings',
    'contentreports',
    'collaborationhistories',
    'userlearningprofiles',
    'searchanalytics',
    'platformmetrics',
    'recommendationlists',
    'learningpaths',
    'similarmaterials',
    'userfeedbacks',
    'collaboratorsuggestions',
    'enhancedinterviewsessions',
    'interviewperformancehistories'
  ];
  
  const db = mongoose.connection.db;
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map(col => col.name);
  
  for (const collectionName of collections) {
    if (!existingNames.includes(collectionName)) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} might already exist:`, error.message);
      }
    } else {
      console.log(`ℹ️  Collection ${collectionName} already exists`);
    }
  }
}

/**
 * Initialize all database indexes
 */
async function initializeIndexes() {
  console.log('\n🔍 Creating database indexes...');
  
  try {
    const db = mongoose.connection.db;
    const results = await createAllIndexes(db);
    
    const summary = results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Index creation summary:', summary);
    
    // Log any errors
    const errors = results.filter(r => r.status === 'error');
    if (errors.length > 0) {
      console.log('\n❌ Index creation errors:');
      errors.forEach(error => {
        console.log(`  - ${error.collection}: ${error.error}`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('❌ Failed to create indexes:', error.message);
    throw error;
  }
}

/**
 * Create initial platform metrics document
 */
async function createInitialPlatformMetrics() {
  console.log('\n📈 Creating initial platform metrics...');
  
  try {
    const { PlatformMetrics } = models;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingMetrics = await PlatformMetrics.findOne({ date: today });
    
    if (!existingMetrics) {
      const initialMetrics = new PlatformMetrics({
        date: today,
        active_users: { daily: 0, weekly: 0, monthly: 0 },
        content_metrics: {
          materials_uploaded: 0,
          materials_viewed: 0,
          materials_downloaded: 0,
          comments_posted: 0,
          ratings_given: 0
        },
        engagement_metrics: {
          average_session_duration: 0,
          bounce_rate: 0,
          return_user_rate: 0
        },
        search_metrics: {
          total_searches: 0,
          successful_searches: 0,
          average_results_per_search: 0
        },
        quality_metrics: {
          materials_pending_review: 0,
          materials_approved: 0,
          materials_rejected: 0,
          reports_submitted: 0,
          reports_resolved: 0
        }
      });
      
      await initialMetrics.save();
      console.log('✅ Created initial platform metrics');
    } else {
      console.log('ℹ️  Platform metrics already exist for today');
    }
  } catch (error) {
    console.error('❌ Failed to create initial platform metrics:', error.message);
  }
}

/**
 * Migrate existing data to enhanced schemas
 */
async function migrateExistingData() {
  console.log('\n🔄 Migrating existing data...');
  
  try {
    // Check if migration is needed
    const { StudyMaterial, EnhancedStudyMaterial, User, UserLearningProfile } = models;
    
    const existingMaterialsCount = await StudyMaterial.countDocuments();
    const enhancedMaterialsCount = await EnhancedStudyMaterial.countDocuments();
    
    console.log(`Found ${existingMaterialsCount} existing materials, ${enhancedMaterialsCount} enhanced materials`);
    
    // Migrate study materials if needed
    if (existingMaterialsCount > 0 && enhancedMaterialsCount === 0) {
      console.log('🔄 Migrating study materials...');
      const migrationResults = await migrationUtils.migrateStudyMaterials();
      
      const summary = migrationResults.reduce((acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Material migration summary:', summary);
    }
    
    // Create user learning profiles
    const usersCount = await User.countDocuments();
    const profilesCount = await UserLearningProfile.countDocuments();
    
    console.log(`Found ${usersCount} users, ${profilesCount} learning profiles`);
    
    if (usersCount > 0 && profilesCount < usersCount) {
      console.log('🔄 Creating user learning profiles...');
      const profileResults = await migrationUtils.createInitialUserProfiles();
      
      const summary = profileResults.reduce((acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Profile creation summary:', summary);
    }
    
  } catch (error) {
    console.error('❌ Failed to migrate existing data:', error.message);
  }
}

/**
 * Validate database setup
 */
async function validateSetup() {
  console.log('\n✅ Validating database setup...');
  
  try {
    const db = mongoose.connection.db;
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections`);
    
    // Check indexes
    const indexStats = await dbUtils.getIndexStats(db);
    const totalIndexes = Object.values(indexStats).reduce((total, collectionStats) => {
      return total + (collectionStats.indexes ? collectionStats.indexes.length : 0);
    }, 0);
    
    console.log(`🔍 Found ${totalIndexes} indexes across all collections`);
    
    // Test basic operations
    const { UserActivity, EnhancedStudyMaterial } = models;
    
    // Test UserActivity model
    const activityCount = await UserActivity.countDocuments();
    console.log(`📊 UserActivity documents: ${activityCount}`);
    
    // Test EnhancedStudyMaterial model
    const materialCount = await EnhancedStudyMaterial.countDocuments();
    console.log(`📚 EnhancedStudyMaterial documents: ${materialCount}`);
    
    console.log('✅ Database validation completed successfully');
    
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
    throw error;
  }
}

/**
 * Main initialization function
 */
async function initializeEnhancedDatabase() {
  console.log('🚀 Initializing Enhanced Data Storage and Materials System Database...\n');
  
  try {
    // Connect to database
    await connectToDatabase();
    
    // Create collections
    await createCollections();
    
    // Initialize indexes
    await initializeIndexes();
    
    // Create initial data
    await createInitialPlatformMetrics();
    
    // Migrate existing data
    await migrateExistingData();
    
    // Validate setup
    await validateSetup();
    
    console.log('\n🎉 Enhanced database initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the enhanced services');
    console.log('2. Test the new functionality');
    console.log('3. Monitor performance and adjust indexes as needed');
    
  } catch (error) {
    console.error('\n💥 Database initialization failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

/**
 * Command line interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Enhanced Database Initialization Script

Usage: node scripts/init-enhanced-db.js [options]

Options:
  --help, -h          Show this help message
  --indexes-only      Only create indexes (skip collections and migration)
  --migrate-only      Only run data migration
  --validate-only     Only run validation
  
Environment Variables:
  MONGODB_URI         MongoDB connection string (default: mongodb://localhost:27017/nova_learn_enhanced)
    `);
    process.exit(0);
  }
  
  if (args.includes('--indexes-only')) {
    connectToDatabase()
      .then(initializeIndexes)
      .then(() => console.log('✅ Indexes created successfully'))
      .catch(error => {
        console.error('❌ Failed to create indexes:', error.message);
        process.exit(1);
      })
      .finally(() => mongoose.connection.close());
  } else if (args.includes('--migrate-only')) {
    connectToDatabase()
      .then(migrateExistingData)
      .then(() => console.log('✅ Migration completed successfully'))
      .catch(error => {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
      })
      .finally(() => mongoose.connection.close());
  } else if (args.includes('--validate-only')) {
    connectToDatabase()
      .then(validateSetup)
      .then(() => console.log('✅ Validation completed successfully'))
      .catch(error => {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
      })
      .finally(() => mongoose.connection.close());
  } else {
    initializeEnhancedDatabase();
  }
}

module.exports = {
  initializeEnhancedDatabase,
  connectToDatabase,
  createCollections,
  initializeIndexes,
  createInitialPlatformMetrics,
  migrateExistingData,
  validateSetup
};