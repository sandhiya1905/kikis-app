# Enhanced Data Storage and Materials System - Database Schemas

This directory contains the comprehensive database schemas for the Enhanced Data Storage and Materials system, which extends the Nova Learn Platform with advanced data persistence capabilities, user activity tracking, collaborative material management, and sophisticated analytics.

## Overview

The enhanced data models provide:

- **Comprehensive User Activity Tracking**: Detailed logging of all user interactions with analytics context
- **Enhanced Material Management**: Rich metadata, version control, and quality tracking for study materials
- **Collaboration Features**: Sharing, commenting, rating, and community moderation capabilities
- **Advanced Analytics**: User learning profiles, search analytics, and platform metrics
- **Recommendation System**: Personalized content recommendations and learning path optimization
- **Enhanced Interview System**: Detailed interview session tracking with performance analytics

## Schema Categories

### 1. User Activity and Learning Tracking

#### UserActivity (`userActivity.js`)
Tracks all user interactions across the platform with detailed context information.

**Key Features:**
- Action type classification (view, download, search, upload, comment, rate, etc.)
- Device and location context tracking
- Session-based activity grouping
- Metadata storage for custom tracking data

**Indexes:**
- `user_id + timestamp` for user activity timelines
- `action_type + timestamp` for action-based analytics
- `resource_type + resource_id` for resource-specific tracking

#### LearningSession (`userActivity.js`)
Captures comprehensive learning session data with material interactions and outcomes.

**Key Features:**
- Material access tracking with completion rates
- Learning objective alignment
- Engagement scoring and outcome tracking
- Detailed interaction logging (bookmarks, notes, highlights)

### 2. Enhanced Material Management

#### EnhancedStudyMaterial (`enhancedMaterial.js`)
Extended study material model with comprehensive metadata and version control.

**Key Features:**
- Rich metadata including prerequisites, learning objectives, target audience
- Version control with change tracking and approval workflows
- Quality scoring and analytics integration
- Multi-format content support (text, video, interactive, URL-based)
- Accessibility features and content warnings

**Enhanced Metadata:**
- Prerequisites and related materials linking
- Learning path positioning
- Estimated study time and interactive elements
- Language and accessibility support
- Quality metrics and community ratings

### 3. Collaboration Features

#### MaterialSharing (`collaboration.js`)
Granular sharing controls with permission management.

**Key Features:**
- Multiple sharing types (direct, link-based, public, group)
- Fine-grained permission control
- Access tracking and expiration management
- Share link generation and management

#### MaterialComment (`collaboration.js`)
Threaded discussion system with moderation capabilities.

**Key Features:**
- Hierarchical comment threading
- Like/dislike functionality
- Community moderation and flagging
- Edit history tracking

#### MaterialRating (`collaboration.js`)
Multi-dimensional rating system with detailed feedback.

**Key Features:**
- Overall and dimension-specific ratings (accuracy, clarity, usefulness)
- Learning outcome tracking
- Verified learner status
- Helpful vote system

#### ContentReport (`collaboration.js`)
Community-driven content moderation system.

**Key Features:**
- Categorized reporting (inappropriate, copyright, quality, spam)
- Priority-based moderation queues
- Evidence attachment support
- Resolution tracking and appeals

### 4. Analytics and User Profiles

#### UserLearningProfile (`analytics.js`)
Comprehensive user learning profile with preferences and progress tracking.

**Key Features:**
- Learning style and difficulty preferences
- Subject proficiency mapping
- Learning goal management
- Activity pattern analysis
- Engagement metrics and achievement tracking

#### SearchAnalytics (`analytics.js`)
Detailed search query and result tracking for optimization.

**Key Features:**
- Query text and filter tracking
- Click-through rate analysis
- Satisfaction scoring
- Query refinement patterns

#### PlatformMetrics (`analytics.js`)
Daily platform-wide metrics for administrative insights.

**Key Features:**
- User engagement metrics
- Content creation and consumption tracking
- Quality control metrics
- Search performance indicators

### 5. Recommendation System

#### RecommendationList (`recommendations.js`)
Personalized content recommendations with explanations.

**Key Features:**
- Context-aware recommendation generation
- Multi-factor scoring (confidence, relevance, novelty, difficulty match)
- Explanation and reasoning codes
- User feedback integration

#### LearningPath (`recommendations.js`)
Structured learning sequences with progress tracking.

**Key Features:**
- Goal-oriented material sequencing
- Prerequisite management
- Progress tracking and completion status
- Adaptive path recommendations

#### SimilarMaterials (`recommendations.js`)
Content-based similarity recommendations.

**Key Features:**
- Multi-factor similarity scoring
- Similarity reason tracking
- Cache management with expiration

### 6. Enhanced Interview System

#### EnhancedInterviewSession (`enhancedInterview.js`)
Comprehensive interview session tracking with detailed analytics.

**Key Features:**
- Multi-dimensional question scoring
- Confidence indicator tracking (speech pace, hesitation, clarity)
- Detailed performance analytics
- Skill gap analysis and coaching recommendations

#### InterviewPerformanceHistory (`enhancedInterview.js`)
Historical performance tracking and trend analysis.

**Key Features:**
- Performance timeline tracking
- Skill development monitoring
- Comparative analytics and benchmarking
- Achievement milestone tracking

## Database Indexes

The system includes comprehensive indexing for optimal query performance:

### Primary Indexes
- User-based queries: `user_id + timestamp`
- Resource-based queries: `resource_type + resource_id`
- Status-based filtering: `status + visibility`

### Compound Indexes
- Complex filtering: `subject + difficulty + status`
- Analytics queries: `user_id + action_type + timestamp`
- Recommendation queries: `user_id + generated_at`

### Text Indexes
- Full-text search: `title + description + tags`
- Query analysis: `query_text`

### Geospatial Indexes
- Location-based analytics: `context.location` (2dsphere)

### TTL Indexes
- Data retention: `timestamp` with configurable expiration

## Usage Examples

### Creating User Activity
```javascript
const { dbUtils } = require('./index');

await dbUtils.logUserActivity({
  user_id: userId,
  action_type: 'view',
  resource_type: 'material',
  resource_id: materialId,
  session_id: sessionId,
  context: {
    device_type: 'mobile',
    duration: 300,
    interaction_depth: 5
  }
});
```

### Creating Enhanced Material
```javascript
const { EnhancedStudyMaterial } = require('./index');

const material = new EnhancedStudyMaterial({
  title: 'Advanced React Patterns',
  content_type: 'video',
  metadata: {
    subject: 'Computer Science',
    difficulty_level: 'advanced',
    learning_objectives: ['Master render props', 'Understand compound components'],
    target_audience: ['intermediate', 'advanced'],
    estimated_study_time: 120
  },
  uploaded_by: userId
});

await material.save();
```

### Updating User Learning Profile
```javascript
const { dbUtils } = require('./index');

await dbUtils.updateUserLearningProfile(userId, {
  learning_style: 'visual',
  'engagement_metrics.total_time_spent': 3600,
  'subject_proficiencies.JavaScript': {
    level: 85,
    confidence: 80,
    last_assessed: new Date()
  }
});
```

## Migration and Setup

### Database Initialization
```bash
# Initialize enhanced database with indexes
node scripts/init-enhanced-db.js

# Create indexes only
node scripts/init-enhanced-db.js --indexes-only

# Migrate existing data
node scripts/init-enhanced-db.js --migrate-only
```

### Schema Validation
The system includes comprehensive validation helpers:

```javascript
const { schemaValidators } = require('./index');

// Validate user activity data
schemaValidators.validateUserActivity(activityData);

// Validate enhanced material data
schemaValidators.validateEnhancedMaterial(materialData);

// Validate collaboration data
schemaValidators.validateCollaboration('rating', ratingData);
```

## Testing

Comprehensive test suite covering:
- Model creation and validation
- Schema constraint enforcement
- Index performance
- Integration workflows
- Migration scenarios

```bash
# Run all tests
npm test shared/schemas/enhanced-models.test.js

# Run specific test suites
npm test -- --grep "User Activity Tracking"
npm test -- --grep "Collaboration Features"
```

## Performance Considerations

### Index Strategy
- **Selective Indexing**: Only indexes frequently queried fields
- **Compound Indexes**: Optimized for common query patterns
- **Background Creation**: All indexes created with `background: true`
- **Sparse Indexes**: Used for optional fields to save space

### Data Retention
- **TTL Indexes**: Automatic cleanup of old activity data
- **Archival Strategy**: Move old data to separate collections
- **Aggregation Optimization**: Pre-computed metrics for heavy queries

### Caching Strategy
- **Redis Integration**: Cache frequently accessed user profiles
- **Query Result Caching**: Cache expensive aggregation results
- **Recommendation Caching**: Cache generated recommendations

## Security Considerations

### Data Privacy
- **PII Handling**: Careful handling of personally identifiable information
- **Access Control**: Field-level access control for sensitive data
- **Audit Logging**: Comprehensive audit trail for data modifications

### Input Validation
- **Schema Validation**: Mongoose schema validation for all models
- **Custom Validators**: Additional business logic validation
- **Sanitization**: Input sanitization for text fields

## Monitoring and Maintenance

### Performance Monitoring
```javascript
const { getIndexStats } = require('./index');

// Get index usage statistics
const stats = await getIndexStats(db);
console.log('Index usage:', stats);
```

### Health Checks
- **Connection Monitoring**: Database connection health
- **Index Performance**: Query execution time monitoring
- **Data Integrity**: Regular data consistency checks

## Future Enhancements

### Planned Features
- **Real-time Analytics**: WebSocket-based real-time updates
- **Advanced ML Integration**: Machine learning model integration
- **Multi-tenant Support**: Organization-based data isolation
- **Advanced Search**: Elasticsearch integration for complex queries

### Scalability Improvements
- **Sharding Strategy**: Horizontal scaling preparation
- **Read Replicas**: Read-heavy workload optimization
- **Microservice Integration**: Service-specific database optimization

## Contributing

When adding new schemas or modifying existing ones:

1. **Follow Naming Conventions**: Use camelCase for fields, PascalCase for models
2. **Add Comprehensive Indexes**: Consider query patterns and add appropriate indexes
3. **Include Validation**: Add both schema and custom validation
4. **Write Tests**: Comprehensive test coverage for new functionality
5. **Update Documentation**: Keep this README and inline documentation current
6. **Consider Migration**: Plan for data migration if modifying existing schemas

## Support

For questions or issues related to the enhanced data models:

1. **Check Tests**: Review test files for usage examples
2. **Review Documentation**: This README and inline code documentation
3. **Performance Issues**: Use index statistics and query profiling
4. **Data Integrity**: Use validation helpers and schema constraints