const activityTracker = require('../services/activityTracker');
const { UserActivity, LearningSession } = require('../../../../shared/schemas/userActivity');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../config/redis', () => ({
  getRedisClient: () => null
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('ActivityTrackingService', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/nova_learn_test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await UserActivity.deleteMany({});
    await LearningSession.deleteMany({});
  });

  describe('logUserAction', () => {
    it('should log user action with complete context', async () => {
      const userId = new mongoose.Types.ObjectId();
      const context = {
        sessionId: 'test-session-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referrer: 'https://example.com',
        duration: 120
      };

      const result = await activityTracker.logUserAction(
        userId,
        'view',
        'material',
        'material-123',
        context,
        { test: 'metadata' }
      );

      expect(result.success).toBe(true);
      expect(result.activityId).toBeDefined();
      expect(result.timestamp).toBeDefined();

      // Verify activity was saved to database
      const savedActivity = await UserActivity.findOne({ user_id: userId });
      expect(savedActivity).toBeTruthy();
      expect(savedActivity.action_type).toBe('view');
      expect(savedActivity.resource_type).toBe('material');
      expect(savedActivity.resource_id).toBe('material-123');
      expect(savedActivity.context.ip_address).toBe('192.168.1.1');
      expect(savedActivity.context.device_type).toBe('desktop');
      expect(savedActivity.metadata.test).toBe('metadata');
    });

    it('should handle missing context gracefully', async () => {
      const userId = new mongoose.Types.ObjectId();

      const result = await activityTracker.logUserAction(
        userId,
        'download',
        'material',
        'material-456'
      );

      expect(result.success).toBe(true);

      const savedActivity = await UserActivity.findOne({ user_id: userId });
      expect(savedActivity).toBeTruthy();
      expect(savedActivity.context.device_type).toBe('unknown');
      expect(savedActivity.context.duration).toBe(0);
    });

    it('should throw error for invalid action type', async () => {
      const userId = new mongoose.Types.ObjectId();

      await expect(
        activityTracker.logUserAction(userId, 'invalid-action', 'material', 'material-123')
      ).rejects.toThrow();
    });
  });

  describe('trackMaterialInteraction', () => {
    it('should track material interaction with engagement metrics', async () => {
      const userId = new mongoose.Types.ObjectId();
      const materialId = 'material-789';
      const interactionData = {
        interactionType: 'view',
        duration: 300,
        completionPercentage: 75,
        position: 150,
        notesTaken: true,
        bookmarked: false,
        context: {
          sessionId: 'test-session-456'
        }
      };

      const result = await activityTracker.trackMaterialInteraction(
        userId,
        materialId,
        interactionData
      );

      expect(result.success).toBe(true);
      expect(result.materialId).toBe(materialId);
      expect(result.interactionType).toBe('view');

      // Verify activity was logged
      const activity = await UserActivity.findOne({ 
        user_id: userId,
        resource_id: materialId 
      });
      expect(activity).toBeTruthy();
      expect(activity.metadata.duration).toBe(300);
      expect(activity.metadata.completion_percentage).toBe(75);
      expect(activity.metadata.notes_taken).toBe(true);
    });

    it('should create or update learning session', async () => {
      const userId = new mongoose.Types.ObjectId();
      const materialId = 'material-session-test';
      const interactionData = {
        interactionType: 'view',
        duration: 180,
        completionPercentage: 50,
        context: { sessionId: 'session-test-789' }
      };

      await activityTracker.trackMaterialInteraction(
        userId,
        materialId,
        interactionData
      );

      // Check if learning session was created/updated
      const sessions = await LearningSession.find({ user_id: userId });
      expect(sessions.length).toBeGreaterThan(0);
      
      const session = sessions[0];
      expect(session.materials_accessed.length).toBeGreaterThan(0);
      expect(session.materials_accessed[0].material_id.toString()).toBe(materialId);
    });
  });

  describe('recordSearchQuery', () => {
    it('should record search query with results', async () => {
      const userId = new mongoose.Types.ObjectId();
      const queryData = {
        queryText: 'machine learning',
        filters: { subject: 'computer-science', difficulty: 'intermediate' },
        resultsCount: 25,
        clickedResults: ['result-1', 'result-3'],
        sessionId: 'search-session-123',
        context: { ipAddress: '10.0.0.1' }
      };

      const results = [
        { id: 'result-1', title: 'ML Basics' },
        { id: 'result-2', title: 'Advanced ML' }
      ];

      const result = await activityTracker.recordSearchQuery(
        userId,
        queryData,
        results
      );

      expect(result.success).toBe(true);
      expect(result.queryId).toBeDefined();

      // Verify search activity was logged
      const activity = await UserActivity.findOne({ 
        user_id: userId,
        action_type: 'search'
      });
      expect(activity).toBeTruthy();
      expect(activity.metadata.query_text).toBe('machine learning');
      expect(activity.metadata.results_count).toBe(25);
      expect(activity.metadata.clicked_results).toEqual(['result-1', 'result-3']);
    });
  });

  describe('captureLearningSession', () => {
    it('should capture complete learning session data', async () => {
      const userId = new mongoose.Types.ObjectId();
      const sessionData = {
        sessionId: 'complete-session-123',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T11:30:00Z'),
        materialsAccessed: [
          {
            material_id: 'mat-1',
            duration: 1800,
            completion_percentage: 90,
            interactions: [
              {
                interaction_type: 'view',
                duration: 1800,
                timestamp: new Date()
              }
            ]
          }
        ],
        learningObjectives: ['Understand ML concepts', 'Practice algorithms'],
        outcomes: [
          {
            outcome_type: 'concept_understood',
            description: 'Grasped linear regression',
            confidence_level: 4
          }
        ]
      };

      const result = await activityTracker.captureLearningSession(userId, sessionData);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('complete-session-123');
      expect(result.duration).toBe(5400); // 1.5 hours in seconds
      expect(result.completionRate).toBe(90);
      expect(result.engagementScore).toBeGreaterThan(0);

      // Verify session was saved
      const session = await LearningSession.findOne({ session_id: 'complete-session-123' });
      expect(session).toBeTruthy();
      expect(session.materials_accessed.length).toBe(1);
      expect(session.learning_objectives.length).toBe(2);
      expect(session.outcomes.length).toBe(1);
    });

    it('should calculate engagement score correctly', async () => {
      const userId = new mongoose.Types.ObjectId();
      const sessionData = {
        sessionId: 'engagement-test-session',
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T10:30:00Z'),
        materialsAccessed: [
          {
            material_id: 'mat-engagement',
            duration: 1200, // 20 minutes
            completion_percentage: 100,
            interactions: [
              { interaction_type: 'view', duration: 600 },
              { interaction_type: 'bookmark', duration: 0 },
              { interaction_type: 'note', duration: 300 },
              { interaction_type: 'highlight', duration: 300 }
            ]
          }
        ]
      };

      const result = await activityTracker.captureLearningSession(userId, sessionData);

      expect(result.engagementScore).toBeGreaterThan(50); // Should be high due to multiple interactions
      expect(result.completionRate).toBe(100);
    });
  });

  describe('generateUserAnalytics', () => {
    beforeEach(async () => {
      // Create test data
      const userId = new mongoose.Types.ObjectId();
      const activities = [
        {
          user_id: userId,
          action_type: 'view',
          resource_type: 'material',
          resource_id: 'mat-1',
          timestamp: new Date('2023-01-01T10:00:00Z'),
          session_id: 'session-1',
          context: { duration: 300, device_type: 'desktop' },
          metadata: {}
        },
        {
          user_id: userId,
          action_type: 'download',
          resource_type: 'material',
          resource_id: 'mat-2',
          timestamp: new Date('2023-01-01T11:00:00Z'),
          session_id: 'session-1',
          context: { duration: 60, device_type: 'mobile' },
          metadata: {}
        },
        {
          user_id: userId,
          action_type: 'bookmark',
          resource_type: 'material',
          resource_id: 'mat-1',
          timestamp: new Date('2023-01-01T12:00:00Z'),
          session_id: 'session-2',
          context: { duration: 10, device_type: 'desktop' },
          metadata: {}
        }
      ];

      await UserActivity.insertMany(activities);

      const sessions = [
        {
          session_id: 'session-1',
          user_id: userId,
          start_time: new Date('2023-01-01T10:00:00Z'),
          end_time: new Date('2023-01-01T11:30:00Z'),
          materials_accessed: [
            { material_id: 'mat-1', duration: 300, completion_percentage: 80 },
            { material_id: 'mat-2', duration: 60, completion_percentage: 100 }
          ],
          completion_rate: 90,
          engagement_score: 75
        }
      ];

      await LearningSession.insertMany(sessions);
    });

    it('should generate comprehensive user analytics', async () => {
      const userId = (await UserActivity.findOne()).user_id;
      
      const analytics = await activityTracker.generateUserAnalytics(userId);

      expect(analytics.userId).toEqual(userId);
      expect(analytics.totalActivities).toBe(3);
      expect(analytics.activityBreakdown.view).toBe(1);
      expect(analytics.activityBreakdown.download).toBe(1);
      expect(analytics.activityBreakdown.bookmark).toBe(1);
      expect(analytics.learningPatterns).toBeDefined();
      expect(analytics.engagementMetrics).toBeDefined();
      expect(analytics.materialPreferences).toBeDefined();
      expect(analytics.sessionAnalytics).toBeDefined();
    });

    it('should filter analytics by time range', async () => {
      const userId = (await UserActivity.findOne()).user_id;
      
      const analytics = await activityTracker.generateUserAnalytics(userId, {
        startDate: '2023-01-01T10:30:00Z',
        endDate: '2023-01-01T12:30:00Z'
      });

      expect(analytics.totalActivities).toBe(2); // Should exclude first activity
    });
  });

  describe('getPlatformMetrics', () => {
    beforeEach(async () => {
      // Create test data for multiple users
      const user1 = new mongoose.Types.ObjectId();
      const user2 = new mongoose.Types.ObjectId();
      
      const activities = [
        {
          user_id: user1,
          action_type: 'view',
          resource_type: 'material',
          resource_id: 'mat-1',
          timestamp: new Date('2023-01-01T10:00:00Z'),
          session_id: 'session-1',
          context: { duration: 300 },
          metadata: {}
        },
        {
          user_id: user2,
          action_type: 'download',
          resource_type: 'material',
          resource_id: 'mat-2',
          timestamp: new Date('2023-01-01T11:00:00Z'),
          session_id: 'session-2',
          context: { duration: 120 },
          metadata: {}
        },
        {
          user_id: user1,
          action_type: 'search',
          resource_type: 'system',
          resource_id: 'search_engine',
          timestamp: new Date('2023-01-01T12:00:00Z'),
          session_id: 'session-3',
          context: { duration: 30 },
          metadata: {}
        }
      ];

      await UserActivity.insertMany(activities);
    });

    it('should generate platform-wide metrics', async () => {
      const metrics = await activityTracker.getPlatformMetrics();

      expect(metrics.totalActivities).toBe(3);
      expect(metrics.uniqueUserCount).toBe(2);
      expect(metrics.actionBreakdown.view).toBe(1);
      expect(metrics.actionBreakdown.download).toBe(1);
      expect(metrics.actionBreakdown.search).toBe(1);
      expect(metrics.resourceBreakdown.material).toBe(2);
      expect(metrics.resourceBreakdown.system).toBe(1);
      expect(metrics.avgDuration).toBeGreaterThan(0);
    });

    it('should filter metrics by time range', async () => {
      const metrics = await activityTracker.getPlatformMetrics({
        timeRange: {
          startDate: '2023-01-01T10:30:00Z',
          endDate: '2023-01-01T12:30:00Z'
        }
      });

      expect(metrics.totalActivities).toBe(2); // Should exclude first activity
    });

    it('should filter metrics by resource type', async () => {
      const metrics = await activityTracker.getPlatformMetrics({
        resourceType: 'material'
      });

      expect(metrics.totalActivities).toBe(2);
      expect(metrics.resourceBreakdown.material).toBe(2);
      expect(metrics.resourceBreakdown.system).toBeUndefined();
    });
  });
});

// Property-based tests using fast-check
const fc = require('fast-check');

describe('ActivityTrackingService Property Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/nova_learn_test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await UserActivity.deleteMany({});
    await LearningSession.deleteMany({});
  });

  /**
   * Property 1: Complete action logging
   * For any user action performed on the platform, the User_Activity_Tracker should create a log entry 
   * with timestamp, user context, and relevant metadata
   * Validates: Requirements 1.1
   */
  it('Property 1: Complete action logging', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 24, maxLength: 24 }).map(s => new mongoose.Types.ObjectId(s.padEnd(24, '0'))),
      fc.constantFrom('view', 'download', 'search', 'upload', 'comment', 'rate', 'share', 'bookmark'),
      fc.constantFrom('material', 'collection', 'user', 'system', 'interview', 'scholarship'),
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.record({
        sessionId: fc.string({ minLength: 1, maxLength: 50 }),
        ipAddress: fc.ipV4(),
        userAgent: fc.string({ minLength: 10, maxLength: 200 }),
        duration: fc.integer({ min: 0, max: 3600 })
      }),
      fc.object(),
      async (userId, actionType, resourceType, resourceId, context, metadata) => {
        const result = await activityTracker.logUserAction(
          userId, actionType, resourceType, resourceId, context, metadata
        );

        // Verify result structure
        expect(result.success).toBe(true);
        expect(result.activityId).toBeDefined();
        expect(result.timestamp).toBeDefined();

        // Verify database entry
        const activity = await UserActivity.findOne({ user_id: userId });
        expect(activity).toBeTruthy();
        expect(activity.action_type).toBe(actionType);
        expect(activity.resource_type).toBe(resourceType);
        expect(activity.resource_id).toBe(resourceId);
        expect(activity.timestamp).toBeDefined();
        expect(activity.context).toBeDefined();
        expect(activity.metadata).toBeDefined();
      }
    ), { numRuns: 20 });
  });

  /**
   * Property 4: Material interaction tracking completeness
   * For any material access by a user, the User_Activity_Tracker should record all interaction data 
   * including time spent, completion rates, and navigation patterns
   * Validates: Requirements 1.4
   */
  it('Property 4: Material interaction tracking completeness', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 24, maxLength: 24 }).map(s => new mongoose.Types.ObjectId(s.padEnd(24, '0'))),
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.constantFrom('view', 'download', 'bookmark', 'note', 'highlight', 'share'),
      fc.integer({ min: 0, max: 7200 }),
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 0, max: 1000 }),
      fc.boolean(),
      fc.boolean(),
      async (userId, materialId, interactionType, duration, completionPercentage, position, notesTaken, bookmarked) => {
        const interactionData = {
          interactionType,
          duration,
          completionPercentage,
          position,
          notesTaken,
          bookmarked,
          context: { sessionId: `session_${Date.now()}` }
        };

        const result = await activityTracker.trackMaterialInteraction(
          userId, materialId, interactionData
        );

        // Verify result
        expect(result.success).toBe(true);
        expect(result.materialId).toBe(materialId);
        expect(result.interactionType).toBe(interactionType);

        // Verify activity was logged with complete data
        const activity = await UserActivity.findOne({ 
          user_id: userId,
          resource_id: materialId,
          action_type: interactionType
        });
        
        expect(activity).toBeTruthy();
        expect(activity.metadata.duration).toBe(duration);
        expect(activity.metadata.completion_percentage).toBe(completionPercentage);
        expect(activity.metadata.position).toBe(position);
        expect(activity.metadata.notes_taken).toBe(notesTaken);
        expect(activity.metadata.bookmarked).toBe(bookmarked);
      }
    ), { numRuns: 15 });
  });
});