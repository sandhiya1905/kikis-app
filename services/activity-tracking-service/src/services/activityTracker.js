const geoip = require('geoip-lite');
const useragent = require('useragent');
const { UserActivity, LearningSession } = require('../../../../shared/schemas/userActivity');
const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');
const analyticsProcessor = require('./analyticsProcessor');

class ActivityTrackingService {
  constructor() {
    this.redisClient = getRedisClient();
    this.batchSize = parseInt(process.env.ANALYTICS_BATCH_SIZE) || 100;
    this.batchInterval = parseInt(process.env.ANALYTICS_BATCH_INTERVAL) || 5000;
    this.activityBuffer = [];
    this.startBatchProcessor();
  }

  /**
   * Log user action with comprehensive context capture
   * Validates: Requirements 1.1 - Complete action logging
   */
  async logUserAction(userId, actionType, resourceType, resourceId, context = {}, metadata = {}) {
    try {
      // Generate unique activity ID
      const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Extract and enhance context information
      const enhancedContext = this.extractContext(context);
      
      // Create activity record
      const activityData = {
        activity_id: activityId,
        user_id: userId,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        timestamp: new Date(),
        session_id: context.sessionId || `session_${Date.now()}`,
        context: enhancedContext,
        metadata: {
          ...metadata,
          logged_at: new Date().toISOString(),
          service: 'activity-tracking-service'
        }
      };

      // Save to database
      const activity = new UserActivity(activityData);
      await activity.save();

      // Add to analytics processing buffer
      this.activityBuffer.push(activityData);

      // Cache recent activity for real-time analytics
      if (this.redisClient) {
        await this.cacheRecentActivity(userId, activityData);
      }

      logger.info(`Activity logged: ${actionType} on ${resourceType}:${resourceId} by user ${userId}`);
      
      return {
        success: true,
        activityId,
        timestamp: activityData.timestamp
      };

    } catch (error) {
      logger.error('Error logging user activity:', error);
      throw new Error(`Failed to log activity: ${error.message}`);
    }
  }

  /**
   * Track detailed material interaction with engagement metrics
   * Validates: Requirements 1.4 - Material interaction tracking completeness
   */
  async trackMaterialInteraction(userId, materialId, interactionData) {
    try {
      const {
        interactionType,
        duration = 0,
        completionPercentage = 0,
        position = 0,
        notesTaken = false,
        bookmarked = false,
        scrollDepth = 0,
        timeOnPage = 0,
        clickCount = 0,
        focusTime = 0,
        idleTime = 0,
        navigationPattern = [],
        contentEngagement = {},
        learningIndicators = {},
        additionalData = {}
      } = interactionData;

      // Enhanced metadata with detailed engagement metrics
      const enhancedMetadata = {
        duration,
        completion_percentage: completionPercentage,
        position,
        notes_taken: notesTaken,
        bookmarked,
        scroll_depth: scrollDepth,
        time_on_page: timeOnPage,
        click_count: clickCount,
        focus_time: focusTime,
        idle_time: idleTime,
        navigation_pattern: navigationPattern,
        content_engagement: contentEngagement,
        learning_indicators: learningIndicators,
        engagement_score: this.calculateEngagementScore({
          duration,
          completionPercentage,
          scrollDepth,
          focusTime,
          clickCount,
          notesTaken,
          bookmarked
        }),
        ...additionalData
      };

      // Log the base activity with enhanced metrics
      await this.logUserAction(
        userId,
        interactionType,
        'material',
        materialId,
        interactionData.context || {},
        enhancedMetadata
      );

      // Update or create learning session with detailed tracking
      await this.updateLearningSession(userId, materialId, {
        duration,
        completionPercentage,
        interactionType,
        position,
        notesTaken,
        bookmarked,
        scrollDepth,
        focusTime,
        clickCount,
        engagementScore: enhancedMetadata.engagement_score
      });

      // Update real-time engagement metrics with enhanced data
      if (this.redisClient) {
        await this.updateEngagementMetrics(userId, materialId, {
          duration,
          completionPercentage,
          interactionType,
          scrollDepth,
          focusTime,
          engagementScore: enhancedMetadata.engagement_score
        });
      }

      // Track material performance metrics
      await this.trackMaterialPerformanceMetrics(materialId, {
        interactionType,
        duration,
        completionPercentage,
        engagementScore: enhancedMetadata.engagement_score,
        userId
      });

      return {
        success: true,
        materialId,
        interactionType,
        engagementScore: enhancedMetadata.engagement_score,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Error tracking material interaction:', error);
      throw new Error(`Failed to track material interaction: ${error.message}`);
    }
  }

  /**
   * Record comprehensive search query with context
   * Validates: Requirements 4.1 - Search query logging completeness
   */
  async recordSearchQuery(userId, queryData, results) {
    try {
      const {
        queryText,
        filters = {},
        resultsCount = 0,
        clickedResults = [],
        sessionId,
        context = {}
      } = queryData;

      const searchMetadata = {
        query_text: queryText,
        filters_applied: filters,
        results_count: resultsCount,
        clicked_results: clickedResults,
        search_timestamp: new Date(),
        results_preview: results ? results.slice(0, 5) : []
      };

      await this.logUserAction(
        userId,
        'search',
        'system',
        'search_engine',
        { ...context, sessionId },
        searchMetadata
      );

      // Cache search patterns for analytics
      if (this.redisClient) {
        await this.cacheSearchPattern(userId, queryText, filters);
      }

      return {
        success: true,
        queryId: `search_${Date.now()}_${userId}`,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Error recording search query:', error);
      throw new Error(`Failed to record search query: ${error.message}`);
    }
  }

  /**
   * Capture comprehensive learning session data
   * Validates: Requirements 1.5 - Session analytics maintenance
   */
  async captureLearningSession(userId, sessionData) {
    try {
      const {
        sessionId,
        startTime,
        endTime,
        materialsAccessed = [],
        learningObjectives = [],
        outcomes = []
      } = sessionData;

      // Calculate session metrics
      const duration = endTime ? (new Date(endTime) - new Date(startTime)) / 1000 : 0;
      const completionRate = this.calculateSessionCompletionRate(materialsAccessed);
      const engagementScore = this.calculateEngagementScore(materialsAccessed, duration);

      const sessionRecord = {
        session_id: sessionId,
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
        materials_accessed: materialsAccessed,
        learning_objectives: learningObjectives,
        completion_rate: completionRate,
        engagement_score: engagementScore,
        outcomes
      };

      const session = new LearningSession(sessionRecord);
      await session.save();

      // Update user session analytics cache
      if (this.redisClient) {
        await this.updateSessionAnalytics(userId, sessionRecord);
      }

      logger.info(`Learning session captured: ${sessionId} for user ${userId}`);

      return {
        success: true,
        sessionId,
        duration,
        completionRate,
        engagementScore
      };

    } catch (error) {
      logger.error('Error capturing learning session:', error);
      throw new Error(`Failed to capture learning session: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive user analytics
   * Validates: Requirements 1.2 - Analytics data aggregation consistency
   */
  async generateUserAnalytics(userId, timeRange = {}) {
    try {
      const { startDate, endDate } = timeRange;
      const query = { user_id: userId };
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      // Aggregate activity data
      const activities = await UserActivity.find(query).sort({ timestamp: -1 });
      const sessions = await LearningSession.find({ 
        user_id: userId,
        ...(startDate && { start_time: { $gte: new Date(startDate) } }),
        ...(endDate && { end_time: { $lte: new Date(endDate) } })
      });

      // Calculate analytics metrics
      const analytics = {
        userId,
        timeRange: { startDate, endDate },
        totalActivities: activities.length,
        activityBreakdown: this.calculateActivityBreakdown(activities),
        learningPatterns: this.analyzeLearningPatterns(activities, sessions),
        engagementMetrics: this.calculateEngagementMetrics(sessions),
        materialPreferences: this.analyzeMaterialPreferences(activities),
        sessionAnalytics: this.calculateSessionAnalytics(sessions),
        generatedAt: new Date()
      };

      return analytics;

    } catch (error) {
      logger.error('Error generating user analytics:', error);
      throw new Error(`Failed to generate user analytics: ${error.message}`);
    }
  }

  /**
   * Get platform-wide metrics and analytics
   */
  async getPlatformMetrics(filters = {}) {
    try {
      const { timeRange, userSegment, resourceType } = filters;
      
      // Build aggregation pipeline
      const pipeline = [];
      
      // Match stage
      const matchStage = {};
      if (timeRange?.startDate || timeRange?.endDate) {
        matchStage.timestamp = {};
        if (timeRange.startDate) matchStage.timestamp.$gte = new Date(timeRange.startDate);
        if (timeRange.endDate) matchStage.timestamp.$lte = new Date(timeRange.endDate);
      }
      if (resourceType) matchStage.resource_type = resourceType;
      
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Group and calculate metrics
      pipeline.push(
        {
          $group: {
            _id: null,
            totalActivities: { $sum: 1 },
            uniqueUsers: { $addToSet: '$user_id' },
            actionTypes: { $push: '$action_type' },
            resourceTypes: { $push: '$resource_type' },
            avgDuration: { $avg: '$context.duration' }
          }
        },
        {
          $project: {
            totalActivities: 1,
            uniqueUserCount: { $size: '$uniqueUsers' },
            actionBreakdown: '$actionTypes',
            resourceBreakdown: '$resourceTypes',
            avgDuration: 1
          }
        }
      );

      const [metrics] = await UserActivity.aggregate(pipeline);
      
      if (!metrics) {
        return {
          totalActivities: 0,
          uniqueUserCount: 0,
          actionBreakdown: {},
          resourceBreakdown: {},
          avgDuration: 0,
          generatedAt: new Date()
        };
      }

      // Process breakdown data
      metrics.actionBreakdown = this.processBreakdownData(metrics.actionBreakdown);
      metrics.resourceBreakdown = this.processBreakdownData(metrics.resourceBreakdown);
      metrics.generatedAt = new Date();

      return metrics;

    } catch (error) {
      logger.error('Error getting platform metrics:', error);
      throw new Error(`Failed to get platform metrics: ${error.message}`);
    }
  }

  // Helper methods

  extractContext(context) {
    const {
      ipAddress,
      userAgent,
      referrer,
      sessionId
    } = context;

    // Extract device information
    const agent = useragent.parse(userAgent || '');
    const deviceType = this.determineDeviceType(agent);

    // Extract location information
    const location = ipAddress ? geoip.lookup(ipAddress) : null;

    return {
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer,
      device_type: deviceType,
      location: location ? {
        country: location.country,
        region: location.region,
        city: location.city,
        latitude: location.ll?.[0],
        longitude: location.ll?.[1]
      } : null,
      duration: context.duration || 0,
      interaction_depth: context.interactionDepth || 1
    };
  }

  determineDeviceType(agent) {
    if (agent.device.family && agent.device.family !== 'Other') {
      if (agent.device.family.includes('iPad') || 
          (agent.device.family.includes('Android') && agent.os.family.includes('Android'))) {
        return 'tablet';
      }
      return 'mobile';
    }
    
    if (agent.os.family.includes('iOS') || agent.os.family.includes('Android')) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  async updateLearningSession(userId, materialId, interactionData) {
    try {
      const sessionId = `session_${userId}_${new Date().toDateString()}`;
      
      const session = await LearningSession.findOneAndUpdate(
        { session_id: sessionId, user_id: userId },
        {
          $setOnInsert: {
            session_id: sessionId,
            user_id: userId,
            start_time: new Date()
          },
          $set: {
            end_time: new Date()
          },
          $push: {
            materials_accessed: {
              material_id: materialId,
              access_time: new Date(),
              duration: interactionData.duration,
              completion_percentage: interactionData.completionPercentage,
              interactions: [{
                interaction_type: interactionData.interactionType,
                timestamp: new Date(),
                duration: interactionData.duration,
                position: interactionData.position,
                data: interactionData
              }],
              notes_taken: interactionData.notesTaken,
              bookmarked: interactionData.bookmarked
            }
          }
        },
        { upsert: true, new: true }
      );

      return session;
    } catch (error) {
      logger.error('Error updating learning session:', error);
      throw error;
    }
  }

  async cacheRecentActivity(userId, activityData) {
    try {
      const key = `recent_activity:${userId}`;
      await this.redisClient.lPush(key, JSON.stringify(activityData));
      await this.redisClient.lTrim(key, 0, 99); // Keep last 100 activities
      await this.redisClient.expire(key, 3600); // Expire in 1 hour
    } catch (error) {
      logger.error('Error caching recent activity:', error);
    }
  }

  async updateEngagementMetrics(userId, materialId, metrics) {
    try {
      const key = `engagement:${userId}:${materialId}`;
      const data = {
        duration: metrics.duration,
        completion: metrics.completionPercentage,
        interaction: metrics.interactionType,
        scroll_depth: metrics.scrollDepth || 0,
        focus_time: metrics.focusTime || 0,
        engagement_score: metrics.engagementScore || 0,
        timestamp: new Date().toISOString()
      };
      
      await this.redisClient.hSet(key, data);
      await this.redisClient.expire(key, 86400); // Expire in 24 hours
    } catch (error) {
      logger.error('Error updating engagement metrics:', error);
    }
  }

  async cacheSearchPattern(userId, queryText, filters) {
    try {
      const key = `search_patterns:${userId}`;
      const pattern = {
        query: queryText,
        filters,
        timestamp: new Date().toISOString()
      };
      
      await this.redisClient.lPush(key, JSON.stringify(pattern));
      await this.redisClient.lTrim(key, 0, 49); // Keep last 50 searches
      await this.redisClient.expire(key, 86400); // Expire in 24 hours
    } catch (error) {
      logger.error('Error caching search pattern:', error);
    }
  }

  async updateSessionAnalytics(userId, sessionData) {
    try {
      const key = `session_analytics:${userId}`;
      const analytics = {
        sessionId: sessionData.session_id,
        duration: sessionData.end_time ? 
          (new Date(sessionData.end_time) - new Date(sessionData.start_time)) / 1000 : 0,
        materialsCount: sessionData.materials_accessed.length,
        completionRate: sessionData.completion_rate,
        engagementScore: sessionData.engagement_score,
        timestamp: new Date().toISOString()
      };
      
      await this.redisClient.lPush(key, JSON.stringify(analytics));
      await this.redisClient.lTrim(key, 0, 29); // Keep last 30 sessions
      await this.redisClient.expire(key, 604800); // Expire in 7 days
    } catch (error) {
      logger.error('Error updating session analytics:', error);
    }
  }

  calculateSessionCompletionRate(materialsAccessed) {
    if (!materialsAccessed.length) return 0;
    
    const totalCompletion = materialsAccessed.reduce(
      (sum, material) => sum + (material.completion_percentage || 0), 0
    );
    
    return Math.round(totalCompletion / materialsAccessed.length);
  }

  calculateEngagementScore(materialsAccessed, sessionDuration) {
    if (!materialsAccessed.length) return 0;
    
    const avgDuration = materialsAccessed.reduce(
      (sum, material) => sum + (material.duration || 0), 0
    ) / materialsAccessed.length;
    
    const interactionScore = materialsAccessed.reduce(
      (sum, material) => sum + (material.interactions?.length || 0), 0
    );
    
    // Normalize to 0-100 scale
    const durationScore = Math.min(avgDuration / 60, 1) * 40; // Max 40 points for duration
    const interactionScoreNormalized = Math.min(interactionScore / 10, 1) * 60; // Max 60 points for interactions
    
    return Math.round(durationScore + interactionScoreNormalized);
  }

  calculateActivityBreakdown(activities) {
    const breakdown = {};
    activities.forEach(activity => {
      breakdown[activity.action_type] = (breakdown[activity.action_type] || 0) + 1;
    });
    return breakdown;
  }

  analyzeLearningPatterns(activities, sessions) {
    // Analyze time patterns
    const hourlyPattern = {};
    const dailyPattern = {};
    
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      const day = new Date(activity.timestamp).getDay();
      
      hourlyPattern[hour] = (hourlyPattern[hour] || 0) + 1;
      dailyPattern[day] = (dailyPattern[day] || 0) + 1;
    });

    return {
      hourlyPattern,
      dailyPattern,
      avgSessionDuration: sessions.length ? 
        sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / sessions.length : 0,
      preferredLearningTimes: this.findPeakTimes(hourlyPattern)
    };
  }

  calculateEngagementMetrics(sessions) {
    if (!sessions.length) return {};
    
    const totalSessions = sessions.length;
    const avgCompletionRate = sessions.reduce((sum, s) => sum + (s.completion_rate || 0), 0) / totalSessions;
    const avgEngagementScore = sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / totalSessions;
    
    return {
      totalSessions,
      avgCompletionRate: Math.round(avgCompletionRate),
      avgEngagementScore: Math.round(avgEngagementScore),
      totalMaterialsAccessed: sessions.reduce((sum, s) => sum + s.materials_accessed.length, 0)
    };
  }

  analyzeMaterialPreferences(activities) {
    const materialActivities = activities.filter(a => a.resource_type === 'material');
    const preferences = {};
    
    materialActivities.forEach(activity => {
      const materialId = activity.resource_id;
      if (!preferences[materialId]) {
        preferences[materialId] = {
          views: 0,
          downloads: 0,
          bookmarks: 0,
          totalInteractions: 0
        };
      }
      
      preferences[materialId][activity.action_type] = 
        (preferences[materialId][activity.action_type] || 0) + 1;
      preferences[materialId].totalInteractions++;
    });

    // Sort by total interactions
    const sortedPreferences = Object.entries(preferences)
      .sort(([,a], [,b]) => b.totalInteractions - a.totalInteractions)
      .slice(0, 10); // Top 10

    return Object.fromEntries(sortedPreferences);
  }

  calculateSessionAnalytics(sessions) {
    if (!sessions.length) return {};
    
    const totalDuration = sessions.reduce((sum, s) => {
      if (s.start_time && s.end_time) {
        return sum + (new Date(s.end_time) - new Date(s.start_time)) / 1000;
      }
      return sum;
    }, 0);

    return {
      totalSessions: sessions.length,
      avgSessionDuration: Math.round(totalDuration / sessions.length),
      totalLearningTime: Math.round(totalDuration),
      avgMaterialsPerSession: Math.round(
        sessions.reduce((sum, s) => sum + s.materials_accessed.length, 0) / sessions.length
      )
    };
  }

  calculateEngagementScore(metrics) {
    const {
      duration = 0,
      completionPercentage = 0,
      scrollDepth = 0,
      focusTime = 0,
      clickCount = 0,
      notesTaken = false,
      bookmarked = false
    } = metrics;

    // Base engagement from duration (max 30 points)
    const durationScore = Math.min(30, (duration / 300) * 30); // 5 minutes = max points

    // Completion engagement (max 25 points)
    const completionScore = (completionPercentage / 100) * 25;

    // Scroll depth engagement (max 15 points)
    const scrollScore = (scrollDepth / 100) * 15;

    // Focus time engagement (max 15 points)
    const focusScore = Math.min(15, (focusTime / duration) * 15);

    // Interaction engagement (max 10 points)
    const interactionScore = Math.min(10, (clickCount / 10) * 10);

    // Bonus points for active learning behaviors (max 5 points)
    const bonusScore = (notesTaken ? 3 : 0) + (bookmarked ? 2 : 0);

    return Math.round(durationScore + completionScore + scrollScore + focusScore + interactionScore + bonusScore);
  }

  async trackMaterialPerformanceMetrics(materialId, metrics) {
    try {
      if (!this.redisClient) return;

      const key = `material_performance_tracking:${materialId}`;
      const timestamp = new Date().toISOString();

      // Update material performance metrics
      await this.redisClient.hIncrBy(key, 'total_interactions', 1);
      await this.redisClient.hIncrBy(key, 'total_duration', metrics.duration || 0);
      await this.redisClient.hIncrBy(key, 'total_completion', metrics.completionPercentage || 0);
      await this.redisClient.hIncrBy(key, 'total_engagement', metrics.engagementScore || 0);
      
      // Track unique users
      await this.redisClient.sAdd(`${key}:users`, metrics.userId);
      
      // Update averages
      const totalInteractions = await this.redisClient.hGet(key, 'total_interactions');
      if (totalInteractions) {
        const interactions = parseInt(totalInteractions);
        const avgDuration = Math.round((await this.redisClient.hGet(key, 'total_duration')) / interactions);
        const avgCompletion = Math.round((await this.redisClient.hGet(key, 'total_completion')) / interactions);
        const avgEngagement = Math.round((await this.redisClient.hGet(key, 'total_engagement')) / interactions);
        
        await this.redisClient.hSet(key, {
          avg_duration: avgDuration,
          avg_completion: avgCompletion,
          avg_engagement: avgEngagement,
          last_updated: timestamp
        });
      }

      await this.redisClient.expire(key, 86400); // 24 hours
      await this.redisClient.expire(`${key}:users`, 86400);

    } catch (error) {
      logger.error('Error tracking material performance metrics:', error);
    }
  }

  findPeakTimes(hourlyPattern) {
    const sortedHours = Object.entries(hourlyPattern)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    return sortedHours;
  }

  processBreakdownData(dataArray) {
    const breakdown = {};
    dataArray.forEach(item => {
      breakdown[item] = (breakdown[item] || 0) + 1;
    });
    return breakdown;
  }

  startBatchProcessor() {
    setInterval(() => {
      if (this.activityBuffer.length >= this.batchSize) {
        this.processBatch();
      }
    }, this.batchInterval);
  }

  async processBatch() {
    if (this.activityBuffer.length === 0) return;
    
    const batch = this.activityBuffer.splice(0, this.batchSize);
    
    try {
      await analyticsProcessor.processBatch(batch);
      logger.info(`Processed analytics batch of ${batch.length} activities`);
    } catch (error) {
      logger.error('Error processing analytics batch:', error);
      // Re-add failed items to buffer for retry
      this.activityBuffer.unshift(...batch);
    }
  }
}

module.exports = new ActivityTrackingService();