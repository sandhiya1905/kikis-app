const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import all enhanced models
const {
  UserActivity,
  LearningSession,
  EnhancedStudyMaterial,
  MaterialSharing,
  MaterialComment,
  MaterialRating,
  ContentReport,
  CollaborationHistory,
  UserLearningProfile,
  SearchAnalytics,
  PlatformMetrics,
  RecommendationList,
  LearningPath,
  SimilarMaterials,
  UserFeedback,
  CollaboratorSuggestions,
  EnhancedInterviewSession,
  InterviewPerformanceHistory,
  User,
  schemaValidators,
  dbUtils
} = require('./index');

describe('Enhanced Data Models', () => {
  let mongoServer;
  let testUserId;
  let testMaterialId;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      password_hash: 'hashed_password',
      profile: {
        name: 'Test User',
        college: 'Test University',
        major: 'Computer Science',
        year: 3,
        interests: ['AI', 'Web Development'],
        academic_level: 'undergraduate'
      }
    });
    
    const savedUser = await testUser.save();
    testUserId = savedUser._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('User Activity Tracking', () => {
    test('should create and validate UserActivity', async () => {
      const activityData = {
        user_id: testUserId,
        action_type: 'view',
        resource_type: 'material',
        resource_id: new mongoose.Types.ObjectId().toString(),
        session_id: 'test_session_123',
        context: {
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          device_type: 'desktop',
          duration: 300,
          interaction_depth: 5
        },
        metadata: {
          page_url: '/materials/123',
          referrer: 'google.com'
        }
      };

      // Test schema validator
      expect(() => schemaValidators.validateUserActivity(activityData)).not.toThrow();

      // Test model creation
      const activity = new UserActivity(activityData);
      const savedActivity = await activity.save();

      expect(savedActivity._id).toBeDefined();
      expect(savedActivity.user_id.toString()).toBe(testUserId.toString());
      expect(savedActivity.action_type).toBe('view');
      expect(savedActivity.context.device_type).toBe('desktop');
      expect(savedActivity.timestamp).toBeInstanceOf(Date);
    });

    test('should create LearningSession with material access', async () => {
      const sessionData = {
        user_id: testUserId,
        materials_accessed: [{
          material_id: new mongoose.Types.ObjectId(),
          duration: 1800, // 30 minutes
          completion_percentage: 75,
          interactions: [{
            interaction_type: 'bookmark',
            duration: 5,
            position: 150
          }],
          notes_taken: true,
          bookmarked: true
        }],
        learning_objectives: ['Understand React hooks', 'Build a todo app'],
        completion_rate: 75,
        engagement_score: 85,
        outcomes: [{
          outcome_type: 'skill_acquired',
          description: 'Learned useState hook',
          confidence_level: 4
        }]
      };

      const session = new LearningSession(sessionData);
      const savedSession = await session.save();

      expect(savedSession._id).toBeDefined();
      expect(savedSession.materials_accessed).toHaveLength(1);
      expect(savedSession.materials_accessed[0].completion_percentage).toBe(75);
      expect(savedSession.outcomes).toHaveLength(1);
    });
  });

  describe('Enhanced Study Materials', () => {
    test('should create EnhancedStudyMaterial with comprehensive metadata', async () => {
      const materialData = {
        title: 'Advanced React Patterns',
        description: 'Learn advanced React patterns and best practices',
        content_type: 'video',
        file_path: '/uploads/react-patterns.mp4',
        metadata: {
          subject: 'Computer Science',
          difficulty_level: 'advanced',
          topics: ['React', 'JavaScript', 'Frontend'],
          file_size: 1024000,
          duration: 120,
          prerequisites: [],
          learning_objectives: [
            'Understand render props pattern',
            'Master compound components',
            'Implement custom hooks'
          ],
          target_audience: ['intermediate', 'advanced'],
          language: 'en',
          estimated_study_time: 180,
          content_format: 'video',
          interactive_elements: ['quiz', 'exercise']
        },
        uploaded_by: testUserId,
        tags: ['react', 'javascript', 'patterns'],
        categories: ['programming', 'frontend'],
        status: 'approved',
        visibility: 'public'
      };

      // Test schema validator
      expect(() => schemaValidators.validateEnhancedMaterial(materialData)).not.toThrow();

      const material = new EnhancedStudyMaterial(materialData);
      const savedMaterial = await material.save();
      testMaterialId = savedMaterial._id;

      expect(savedMaterial._id).toBeDefined();
      expect(savedMaterial.metadata.learning_objectives).toHaveLength(3);
      expect(savedMaterial.metadata.target_audience).toContain('advanced');
      expect(savedMaterial.tags).toContain('react');
      expect(savedMaterial.current_version).toBe('1.0.0');
    });

    test('should handle material versioning', async () => {
      const material = await EnhancedStudyMaterial.findById(testMaterialId);
      
      // Add a new version
      material.versions.push({
        version_number: '1.1.0',
        created_by: testUserId,
        changes: [{
          change_type: 'content',
          field_name: 'description',
          old_value: 'Learn advanced React patterns and best practices',
          new_value: 'Master advanced React patterns and best practices',
          change_reason: 'Improved clarity'
        }],
        change_summary: 'Updated description for better clarity',
        approval_status: 'approved',
        file_hash: 'abc123def456',
        is_current: true
      });

      material.current_version = '1.1.0';
      const updatedMaterial = await material.save();

      expect(updatedMaterial.versions).toHaveLength(1);
      expect(updatedMaterial.versions[0].version_number).toBe('1.1.0');
      expect(updatedMaterial.current_version).toBe('1.1.0');
    });
  });

  describe('Collaboration Features', () => {
    test('should create MaterialSharing with permissions', async () => {
      const sharingData = {
        material_id: testMaterialId,
        owner_id: testUserId,
        shared_with: [{
          target_type: 'public',
          target_id: 'public',
          permissions: ['view', 'comment'],
          added_by: testUserId
        }],
        permissions: {
          can_view: true,
          can_download: false,
          can_comment: true,
          can_rate: true
        },
        sharing_type: 'public'
      };

      // Test schema validator
      expect(() => schemaValidators.validateCollaboration('sharing', sharingData)).not.toThrow();

      const sharing = new MaterialSharing(sharingData);
      const savedSharing = await sharing.save();

      expect(savedSharing._id).toBeDefined();
      expect(savedSharing.shared_with).toHaveLength(1);
      expect(savedSharing.permissions.can_view).toBe(true);
      expect(savedSharing.permissions.can_download).toBe(false);
    });

    test('should create MaterialComment with threading support', async () => {
      const commentData = {
        material_id: testMaterialId,
        user_id: testUserId,
        content: 'This is an excellent tutorial on React patterns!',
        parent_comment_id: null // Top-level comment
      };

      // Test schema validator
      expect(() => schemaValidators.validateCollaboration('comment', commentData)).not.toThrow();

      const comment = new MaterialComment(commentData);
      const savedComment = await comment.save();

      expect(savedComment._id).toBeDefined();
      expect(savedComment.content).toBe('This is an excellent tutorial on React patterns!');
      expect(savedComment.likes).toBe(0);
      expect(savedComment.status).toBe('active');

      // Create a reply
      const replyData = {
        material_id: testMaterialId,
        user_id: testUserId,
        content: 'Thank you for the feedback!',
        parent_comment_id: savedComment.comment_id
      };

      const reply = new MaterialComment(replyData);
      const savedReply = await reply.save();

      expect(savedReply.parent_comment_id).toBe(savedComment.comment_id);
    });

    test('should create MaterialRating with multi-dimensional scoring', async () => {
      const ratingData = {
        material_id: testMaterialId,
        user_id: testUserId,
        overall_rating: 5,
        dimension_ratings: {
          accuracy: 5,
          clarity: 4,
          usefulness: 5,
          completeness: 4,
          organization: 5
        },
        review_text: 'Excellent content with clear explanations and practical examples.',
        learning_outcome: 'helped_significantly',
        would_recommend: true,
        verified_learner: true
      };

      // Test schema validator
      expect(() => schemaValidators.validateCollaboration('rating', ratingData)).not.toThrow();

      const rating = new MaterialRating(ratingData);
      const savedRating = await rating.save();

      expect(savedRating._id).toBeDefined();
      expect(savedRating.overall_rating).toBe(5);
      expect(savedRating.dimension_ratings.accuracy).toBe(5);
      expect(savedRating.would_recommend).toBe(true);
    });
  });

  describe('Analytics and User Profiles', () => {
    test('should create UserLearningProfile with comprehensive data', async () => {
      const profileData = {
        user_id: testUserId,
        learning_style: 'visual',
        preferred_difficulty: 'intermediate',
        subject_proficiencies: new Map([
          ['JavaScript', { level: 75, confidence: 80, last_assessed: new Date() }],
          ['React', { level: 60, confidence: 70, last_assessed: new Date() }]
        ]),
        learning_goals: [{
          title: 'Master React Hooks',
          description: 'Learn all React hooks and their use cases',
          target_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          priority: 'high',
          progress: 25
        }],
        preferences: {
          content_types: ['video', 'interactive'],
          notification_settings: {
            email: true,
            push: false,
            frequency: 'weekly'
          }
        }
      };

      const profile = new UserLearningProfile(profileData);
      const savedProfile = await profile.save();

      expect(savedProfile._id).toBeDefined();
      expect(savedProfile.learning_style).toBe('visual');
      expect(savedProfile.subject_proficiencies.get('JavaScript').level).toBe(75);
      expect(savedProfile.learning_goals).toHaveLength(1);
    });

    test('should create SearchAnalytics for query tracking', async () => {
      const searchData = {
        user_id: testUserId,
        query_text: 'react hooks tutorial',
        filters_applied: {
          subject: ['Computer Science'],
          difficulty: ['intermediate'],
          content_type: ['video']
        },
        results_count: 15,
        clicked_results: [{
          material_id: testMaterialId,
          position: 1,
          clicked_at: new Date()
        }],
        session_id: 'search_session_456',
        satisfaction_score: 4,
        found_what_looking_for: true,
        time_to_first_click: 5
      };

      const searchAnalytics = new SearchAnalytics(searchData);
      const savedSearch = await searchAnalytics.save();

      expect(savedSearch._id).toBeDefined();
      expect(savedSearch.query_text).toBe('react hooks tutorial');
      expect(savedSearch.clicked_results).toHaveLength(1);
      expect(savedSearch.satisfaction_score).toBe(4);
    });
  });

  describe('Recommendation System', () => {
    test('should create RecommendationList with context and explanations', async () => {
      const recommendationData = {
        user_id: testUserId,
        context: {
          current_subject: 'Computer Science',
          current_difficulty: 'intermediate',
          learning_goals: ['Learn React hooks'],
          time_available: 60,
          preferred_content_types: ['video'],
          context_type: 'study_session'
        },
        recommendations: [{
          material_id: testMaterialId,
          confidence_score: 0.95,
          relevance_score: 0.90,
          novelty_score: 0.75,
          difficulty_match: 0.85,
          reason_codes: ['matches_learning_style', 'high_quality_rating'],
          explanation: 'This material matches your learning style and has excellent ratings from similar users.',
          position: 1
        }],
        algorithm_version: '1.0.0',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      const recommendations = new RecommendationList(recommendationData);
      const savedRecommendations = await recommendations.save();

      expect(savedRecommendations._id).toBeDefined();
      expect(savedRecommendations.recommendations).toHaveLength(1);
      expect(savedRecommendations.recommendations[0].confidence_score).toBe(0.95);
      expect(savedRecommendations.context.current_subject).toBe('Computer Science');
    });

    test('should create LearningPath with ordered materials', async () => {
      const pathData = {
        user_id: testUserId,
        goal: {
          title: 'React Mastery Path',
          description: 'Complete path to master React development',
          target_completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          difficulty_level: 'intermediate'
        },
        materials: [{
          material_id: testMaterialId,
          order: 1,
          is_prerequisite: false,
          estimated_duration: 180,
          completion_status: 'not_started',
          progress_percentage: 0
        }],
        total_estimated_duration: 180,
        overall_progress: 0,
        status: 'active'
      };

      const learningPath = new LearningPath(pathData);
      const savedPath = await learningPath.save();

      expect(savedPath._id).toBeDefined();
      expect(savedPath.goal.title).toBe('React Mastery Path');
      expect(savedPath.materials).toHaveLength(1);
      expect(savedPath.materials[0].order).toBe(1);
    });
  });

  describe('Enhanced Interview System', () => {
    test('should create EnhancedInterviewSession with detailed analytics', async () => {
      const interviewData = {
        user_id: testUserId,
        domain: 'Frontend Development',
        subdomain: 'React',
        interview_type: 'practice',
        difficulty_level: 'intermediate',
        target_role: 'Frontend Developer',
        questions: [{
          question_text: 'Explain the difference between useState and useEffect hooks',
          question_type: 'technical',
          expected_answer: 'useState manages state, useEffect handles side effects',
          user_answer: 'useState is for state management and useEffect is for side effects like API calls',
          response_time: 45,
          thinking_time: 10,
          confidence_indicators: {
            speech_pace: 'normal',
            hesitation_count: 2,
            clarity_score: 85
          },
          score: 88,
          detailed_scoring: {
            content_accuracy: 90,
            communication_clarity: 85,
            technical_depth: 85
          },
          feedback: 'Good understanding of React hooks with clear explanation',
          difficulty_level: 3,
          tags: ['react', 'hooks', 'frontend']
        }],
        overall_score: 88,
        status: 'completed'
      };

      const interview = new EnhancedInterviewSession(interviewData);
      const savedInterview = await interview.save();

      expect(savedInterview._id).toBeDefined();
      expect(savedInterview.domain).toBe('Frontend Development');
      expect(savedInterview.questions).toHaveLength(1);
      expect(savedInterview.questions[0].score).toBe(88);
      expect(savedInterview.overall_score).toBe(88);
    });
  });

  describe('Database Utilities', () => {
    test('should log user activity using dbUtils', async () => {
      const activityData = {
        user_id: testUserId,
        action_type: 'download',
        resource_type: 'material',
        resource_id: testMaterialId.toString(),
        session_id: 'util_test_session',
        context: {
          ip_address: '10.0.0.1',
          user_agent: 'Test Agent',
          device_type: 'mobile',
          duration: 0,
          interaction_depth: 1
        }
      };

      const savedActivity = await dbUtils.logUserActivity(activityData);

      expect(savedActivity._id).toBeDefined();
      expect(savedActivity.action_type).toBe('download');
      expect(savedActivity.timestamp).toBeInstanceOf(Date);
    });

    test('should update user learning profile using dbUtils', async () => {
      const profileUpdates = {
        learning_style: 'kinesthetic',
        'engagement_metrics.total_time_spent': 3600
      };

      const updatedProfile = await dbUtils.updateUserLearningProfile(testUserId, profileUpdates);

      expect(updatedProfile.learning_style).toBe('kinesthetic');
      expect(updatedProfile.last_updated).toBeInstanceOf(Date);
    });
  });

  describe('Schema Validation', () => {
    test('should validate required fields for UserActivity', () => {
      const incompleteData = {
        user_id: testUserId,
        action_type: 'view'
        // Missing required fields
      };

      expect(() => schemaValidators.validateUserActivity(incompleteData))
        .toThrow('Missing required fields for UserActivity');
    });

    test('should validate learning objectives for EnhancedStudyMaterial', () => {
      const materialWithoutObjectives = {
        title: 'Test Material',
        content_type: 'pdf',
        metadata: {
          subject: 'Test',
          difficulty_level: 'beginner',
          learning_objectives: [] // Empty array
        },
        uploaded_by: testUserId
      };

      expect(() => schemaValidators.validateEnhancedMaterial(materialWithoutObjectives))
        .toThrow('EnhancedStudyMaterial must have at least one learning objective');
    });
  });
});

describe('Model Integration', () => {
  let mongoServer;
  let testUserId;
  let testMaterialId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test data
    const testUser = new User({
      email: 'integration@example.com',
      password_hash: 'hashed_password',
      profile: {
        name: 'Integration Test User',
        college: 'Test University',
        major: 'Computer Science',
        year: 2,
        interests: ['Programming'],
        academic_level: 'undergraduate'
      }
    });
    
    const savedUser = await testUser.save();
    testUserId = savedUser._id;

    const testMaterial = new EnhancedStudyMaterial({
      title: 'Integration Test Material',
      description: 'Test material for integration testing',
      content_type: 'pdf',
      file_path: '/test/material.pdf',
      metadata: {
        subject: 'Computer Science',
        difficulty_level: 'beginner',
        topics: ['Testing'],
        file_size: 1000,
        learning_objectives: ['Learn testing'],
        target_audience: ['undergraduate'],
        estimated_study_time: 30,
        content_format: 'text'
      },
      uploaded_by: testUserId,
      status: 'approved',
      visibility: 'public'
    });

    const savedMaterial = await testMaterial.save();
    testMaterialId = savedMaterial._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  test('should create complete user learning workflow', async () => {
    // 1. Log user activity
    const activity = await dbUtils.logUserActivity({
      user_id: testUserId,
      action_type: 'view',
      resource_type: 'material',
      resource_id: testMaterialId.toString(),
      session_id: 'workflow_session',
      context: {
        device_type: 'desktop',
        duration: 600,
        interaction_depth: 3
      }
    });

    // 2. Create learning session
    const session = await dbUtils.createLearningSession({
      user_id: testUserId,
      materials_accessed: [{
        material_id: testMaterialId,
        duration: 600,
        completion_percentage: 100,
        notes_taken: true
      }],
      learning_objectives: ['Complete integration test'],
      completion_rate: 100,
      engagement_score: 95
    });

    // 3. Add material rating
    const rating = new MaterialRating({
      material_id: testMaterialId,
      user_id: testUserId,
      overall_rating: 5,
      dimension_ratings: {
        accuracy: 5,
        clarity: 5,
        usefulness: 5
      },
      learning_outcome: 'helped_significantly',
      would_recommend: true
    });
    await rating.save();

    // 4. Update user learning profile
    const profile = await dbUtils.updateUserLearningProfile(testUserId, {
      'engagement_metrics.materials_completed': 1,
      'engagement_metrics.total_time_spent': 600
    });

    // Verify the complete workflow
    expect(activity.action_type).toBe('view');
    expect(session.completion_rate).toBe(100);
    expect(rating.overall_rating).toBe(5);
    expect(profile.engagement_metrics.materials_completed).toBe(1);

    // Verify relationships
    const userActivities = await UserActivity.find({ user_id: testUserId });
    const userSessions = await LearningSession.find({ user_id: testUserId });
    const materialRatings = await MaterialRating.find({ material_id: testMaterialId });

    expect(userActivities).toHaveLength(1);
    expect(userSessions).toHaveLength(1);
    expect(materialRatings).toHaveLength(1);
  });
});