# Activity Tracking Service

The Activity Tracking Service is a comprehensive user activity logging and analytics system for the Nova Learn Platform. It provides real-time activity tracking, detailed analytics processing, and learning session management capabilities.

## Features

### Core Functionality
- **Comprehensive Activity Logging**: Tracks all user interactions with detailed context capture
- **Real-time Analytics Processing**: Processes activity data in batches for performance optimization
- **Material Interaction Tracking**: Detailed tracking of user engagement with learning materials
- **Search Query Analytics**: Comprehensive search behavior analysis and pattern recognition
- **Learning Session Management**: Complete session lifecycle tracking with engagement metrics
- **Platform-wide Metrics**: Aggregated analytics across all users and resources

### Advanced Capabilities
- **Context-aware Logging**: Captures device type, location, user agent, and interaction depth
- **Engagement Scoring**: Calculates user engagement based on interaction patterns and duration
- **Real-time Caching**: Redis-based caching for high-performance analytics queries
- **Batch Processing**: Efficient background processing of analytics data
- **GDPR Compliance**: User data deletion capabilities for privacy compliance

## API Endpoints

### Activity Logging
- `POST /api/activity/log` - Log general user activity
- `POST /api/activity/material-interaction` - Track material interactions
- `POST /api/activity/search` - Record search queries
- `POST /api/activity/learning-session` - Capture learning session data
- `GET /api/activity/user/:userId` - Get user activities
- `GET /api/activity/recent` - Get recent activities for current user
- `DELETE /api/activity/user/:userId` - Delete user activities (GDPR)

### Analytics
- `GET /api/analytics/user/:userId` - Get comprehensive user analytics
- `GET /api/analytics/platform` - Get platform-wide metrics (Admin only)
- `GET /api/analytics/real-time` - Get real-time analytics data (Admin only)
- `GET /api/analytics/material/:materialId` - Get material-specific analytics
- `GET /api/analytics/search` - Get search analytics (Admin only)
- `GET /api/analytics/engagement` - Get user engagement analytics
- `GET /api/analytics/trends` - Get analytics trends over time (Admin only)

### Session Management
- `GET /api/sessions/user/:userId` - Get learning sessions for a user
- `GET /api/sessions/:sessionId` - Get specific session details
- `PUT /api/sessions/:sessionId` - Update learning session
- `GET /api/sessions/current/active` - Get current active session
- `POST /api/sessions/current/end` - End current active session
- `GET /api/sessions/stats/summary` - Get session statistics summary

## Data Models

### User Activity
```javascript
{
  activity_id: String,
  user_id: ObjectId,
  action_type: String, // view, download, search, upload, comment, rate, share, bookmark, login, logout
  resource_type: String, // material, collection, user, system, interview, scholarship
  resource_id: String,
  timestamp: Date,
  session_id: String,
  context: {
    ip_address: String,
    user_agent: String,
    referrer: String,
    device_type: String, // desktop, mobile, tablet, unknown
    location: {
      country: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number
    },
    duration: Number, // in seconds
    interaction_depth: Number
  },
  metadata: Object // flexible metadata storage
}
```

### Learning Session
```javascript
{
  session_id: String,
  user_id: ObjectId,
  start_time: Date,
  end_time: Date,
  materials_accessed: [{
    material_id: ObjectId,
    access_time: Date,
    duration: Number,
    completion_percentage: Number,
    interactions: [{
      interaction_type: String,
      timestamp: Date,
      duration: Number,
      position: Number,
      data: Object
    }],
    notes_taken: Boolean,
    bookmarked: Boolean
  }],
  learning_objectives: [String],
  completion_rate: Number,
  engagement_score: Number,
  outcomes: [{
    outcome_type: String, // skill_acquired, concept_understood, problem_solved, goal_achieved
    description: String,
    confidence_level: Number, // 1-5
    timestamp: Date
  }]
}
```

## Configuration

### Environment Variables
```bash
PORT=3006
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nova_learn_enhanced
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-key-here
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
ANALYTICS_BATCH_SIZE=100
ANALYTICS_BATCH_INTERVAL=5000
ACTIVITY_RETENTION_DAYS=365
```

### Dependencies
- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **Redis**: Caching and session storage
- **Bull**: Background job processing
- **GeoIP-lite**: IP geolocation
- **UserAgent**: User agent parsing
- **Winston**: Logging
- **Joi**: Input validation
- **JWT**: Authentication

## Installation and Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the service**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

4. **Run tests**:
   ```bash
   # Unit tests
   npm test
   
   # Test coverage
   npm run test:coverage
   ```

## Docker Deployment

```bash
# Build image
docker build -t activity-tracking-service .

# Run container
docker run -p 3006:3006 \
  -e MONGODB_URI=mongodb://mongo:27017/nova_learn_enhanced \
  -e REDIS_URL=redis://redis:6379 \
  activity-tracking-service
```

## Performance Considerations

### Batch Processing
- Activities are processed in batches for optimal performance
- Configurable batch size and interval
- Background processing prevents blocking of API requests

### Caching Strategy
- Redis caching for frequently accessed analytics data
- Real-time metrics cached with appropriate TTL
- User engagement data cached for quick access

### Database Optimization
- Comprehensive indexing strategy for query performance
- Aggregation pipelines for complex analytics queries
- Time-based partitioning for large datasets

## Monitoring and Health Checks

### Health Check Endpoint
```bash
GET /health
```

Returns service status, uptime, and database connectivity.

### Logging
- Structured JSON logging with Winston
- Configurable log levels
- Error tracking and performance monitoring

### Metrics
- Request/response metrics
- Database query performance
- Cache hit/miss ratios
- Background job processing stats

## Security Features

### Authentication
- JWT-based authentication
- User context extraction from tokens
- Session-based activity correlation

### Authorization
- User-specific data access controls
- Admin-only endpoints for platform analytics
- GDPR compliance with data deletion capabilities

### Data Protection
- Input validation with Joi schemas
- SQL injection prevention
- Rate limiting for API endpoints
- Secure headers with Helmet

## Integration with Nova Learn Platform

### Service Communication
- RESTful API integration
- Event-driven architecture support
- Microservice-compatible design

### Data Consistency
- Transactional operations where needed
- Eventual consistency for analytics data
- Error handling and retry mechanisms

## Testing Strategy

### Unit Tests
- Comprehensive test coverage for core functionality
- Mock external dependencies
- Database integration tests

### Property-Based Tests
- Fast-check for property validation
- Universal correctness properties
- Randomized input testing

### Integration Tests
- End-to-end API testing
- Database interaction validation
- Redis caching verification

## Contributing

1. Follow the existing code style and patterns
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all tests pass before submitting PRs

## License

MIT License - see LICENSE file for details.

## Enhanced Material Interaction Tracking (Task 2.3)

### New Features Added

#### Enhanced Engagement Metrics
- **Scroll Depth Tracking**: Monitor how far users scroll through content
- **Focus Time Measurement**: Track actual time users spend actively engaged
- **Click Pattern Analysis**: Record user interaction patterns and navigation
- **Idle Time Detection**: Measure periods of user inactivity

#### Content Engagement Analysis
- **Section-level Tracking**: Monitor time spent in each content section
- **Interactive Element Usage**: Track engagement with quizzes, simulations, etc.
- **Media Engagement**: Monitor video watching, image viewing, and audio playback
- **Navigation Pattern Recording**: Capture user navigation sequences

#### Learning Indicators
- **Concept Identification**: Track concepts users identify and understand
- **Difficulty and Confidence Ratings**: Capture user self-assessment
- **Question Generation**: Monitor user-generated questions and curiosity
- **Key Term Highlighting**: Track important terms users highlight

#### Performance Monitoring
- **Session Performance**: Track page load times, interaction latency, memory usage
- **Material Performance**: Monitor content load times and render performance
- **Learning Analytics**: Measure cognitive load, attention span, learning efficiency
- **Real-time Metrics**: Live performance dashboards and optimization recommendations

### New API Endpoints

#### Performance Monitoring
- `POST /api/performance/session` - Track session performance metrics
- `POST /api/performance/material` - Monitor material interaction performance
- `POST /api/performance/learning-analytics` - Track learning session analytics
- `GET /api/performance/report/:userId` - Generate comprehensive performance reports
- `GET /api/performance/real-time` - Get real-time performance metrics
- `GET /api/performance/platform` - Platform-wide performance metrics (Admin)
- `GET /api/performance/material/:materialId/metrics` - Material-specific performance data
- `GET /api/performance/health` - Service health check (Admin)

### Enhanced Data Models

#### Enhanced Material Interaction
```javascript
{
  materialId: "material-789",
  interactionType: "view",
  duration: 1800,
  completionPercentage: 85,
  scrollDepth: 92,
  timeOnPage: 1650,
  clickCount: 15,
  focusTime: 1500,
  idleTime: 150,
  navigationPattern: [
    {
      action: "scroll",
      timestamp: "2023-12-01T10:15:30Z",
      element: "content-section-1",
      position: { x: 0, y: 250 }
    }
  ],
  contentEngagement: {
    sectionsViewed: ["introduction", "main-content", "examples"],
    timePerSection: {
      "introduction": 180,
      "main-content": 900,
      "examples": 450
    },
    interactiveElementsUsed: ["code-runner", "quiz-widget"],
    mediaEngagement: {
      videosWatched: 2,
      imagesViewed: 8,
      audioPlayed: 1
    }
  },
  learningIndicators: {
    conceptsIdentified: ["machine-learning", "neural-networks"],
    difficultyRating: 3,
    confidenceLevel: 4,
    questionsGenerated: 5,
    keyTermsHighlighted: 12
  }
}
```

#### Performance Metrics
```javascript
{
  sessionId: "session-123",
  pageLoadTime: 1200,
  interactionLatency: 50,
  memoryUsage: 85.5,
  networkLatency: 120,
  errorCount: 0,
  devicePerformance: {
    cpuUsage: 45,
    memoryPressure: "low",
    batteryLevel: 78,
    connectionType: "wifi"
  }
}
```

#### Learning Analytics
```javascript
{
  sessionId: "session-123",
  learningEfficiency: 78,
  cognitiveLoad: 65,
  attentionSpan: 1800,
  comprehensionRate: 82,
  retentionIndicators: {
    shortTerm: 85,
    mediumTerm: 70,
    longTerm: 60
  },
  learningVelocity: 1.2
}
```

### Requirements Validation

This enhanced implementation validates:
- **Requirement 1.4**: Material interaction tracking with detailed engagement metrics ✓
- **Requirement 1.5**: Session analytics and performance monitoring ✓

### Key Improvements

1. **Comprehensive Engagement Tracking**: Now captures detailed user interaction patterns including scroll depth, focus time, and navigation patterns
2. **Performance Monitoring**: Real-time tracking of system performance and user experience metrics
3. **Learning Analytics**: Advanced analytics for measuring learning effectiveness and cognitive load
4. **Enhanced Caching**: Improved Redis caching for performance metrics and real-time data
5. **Optimization Recommendations**: Automated performance recommendations based on analytics data

### Usage Examples

#### Enhanced Material Interaction Tracking
```javascript
await fetch('/api/activity/material-interaction', {
  method: 'POST',
  body: JSON.stringify({
    materialId: 'material-789',
    interactionType: 'view',
    duration: 1800,
    completionPercentage: 85,
    scrollDepth: 92,
    focusTime: 1500,
    contentEngagement: {
      sectionsViewed: ['intro', 'main', 'conclusion'],
      interactiveElementsUsed: ['quiz', 'simulator']
    },
    learningIndicators: {
      conceptsIdentified: ['algorithms', 'data-structures'],
      difficultyRating: 3,
      confidenceLevel: 4
    }
  })
});
```

#### Performance Monitoring
```javascript
// Track session performance
await fetch('/api/performance/session', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: 'session-123',
    pageLoadTime: 1200,
    interactionLatency: 50,
    memoryUsage: 85.5,
    devicePerformance: {
      cpuUsage: 45,
      connectionType: 'wifi'
    }
  })
});

// Get performance report
const report = await fetch('/api/performance/report/user-123');
```

This enhanced implementation provides comprehensive material interaction tracking with detailed engagement metrics and performance monitoring, fulfilling the requirements for task 2.3.