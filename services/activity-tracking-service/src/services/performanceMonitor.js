const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');
const { UserActivity, LearningSession } = require('../../../../shared/schemas/userActivity');

class PerformanceMonitor {
  constructor() {
    this.redisClient = getRedisClient();
    this.performanceMetrics = new Map();
    this.startPerformanceTracking();
  }

  /**
   * Track user session performance metrics
   * Validates: Requirements 1.5 - Session analytics maintenance
   */
  async trackSessionPerformance(userId, sessionId, performanceData) {
    try {
      const {
        pageLoadTime,
        interactionLatency,
        memoryUsage,
        networkLatency,
        errorCount = 0,
        featureUsage = {},
        devicePerformance = {}
      } = performanceData;

      const performanceRecord = {
        user_id: userId,
        session_id: sessionId,
        timestamp: new Date(),
        metrics: {
          page_load_time: pageLoadTime,
          interaction_latency: interactionLatency,
          memory_usage: memoryUsage,
          network_latency: networkLatency,
          error_count: errorCount,
          feature_usage: featureUsage,
          device_performance: devicePerformance
        }
      };

      // Store in Redis for real-time monitoring
      if (this.redisClient) {
        await this.cachePerformanceMetrics(userId, sessionId, performanceRecord);
      }

      // Log performance activity
      await this.logPerformanceActivity(userId, sessionId, performanceRecord);

      return {
        success: true,
        sessionId,
        timestamp: performanceRecord.timestamp
      };

    } catch (error) {
      logger.error('Error tracking session performance:', error);
      throw new Error(`Failed to track session performance: ${error.message}`);
    }
  }

  /**
   * Monitor material interaction performance
   * Validates: Requirements 1.4 - Material interaction tracking completeness
   */
  async monitorMaterialInteractionPerformance(userId, materialId, interactionMetrics) {
    try {
      const {
        loadTime,
        renderTime,
        interactionDelay,
        scrollDepth,
        timeToFirstInteraction,
        bounceRate,
        engagementDepth
      } = interactionMetrics;

      const performanceData = {
        user_id: userId,
        material_id: materialId,
        timestamp: new Date(),
        performance_metrics: {
          load_time: loadTime,
          render_time: renderTime,
          interaction_delay: interactionDelay,
          scroll_depth: scrollDepth,
          time_to_first_interaction: timeToFirstInteraction,
          bounce_rate: bounceRate,
          engagement_depth: engagementDepth
        }
      };

      // Update material performance cache
      if (this.redisClient) {
        await this.updateMaterialPerformanceCache(materialId, performanceData);
      }

      // Calculate performance score
      const performanceScore = this.calculatePerformanceScore(performanceData.performance_metrics);
      
      return {
        success: true,
        materialId,
        performanceScore,
        timestamp: performanceData.timestamp
      };

    } catch (error) {
      logger.error('Error monitoring material interaction performance:', error);
      throw new Error(`Failed to monitor material interaction performance: ${error.message}`);
    }
  }

  /**
   * Track learning session analytics with performance correlation
   * Validates: Requirements 1.5 - Session analytics maintenance
   */
  async trackLearningSessionAnalytics(userId, sessionData, performanceContext) {
    try {
      const {
        sessionId,
        learningEfficiency,
        cognitiveLoad,
        attentionSpan,
        comprehensionRate,
        retentionIndicators,
        learningVelocity
      } = sessionData;

      const analyticsData = {
        user_id: userId,
        session_id: sessionId,
        timestamp: new Date(),
        learning_analytics: {
          learning_efficiency: learningEfficiency,
          cognitive_load: cognitiveLoad,
          attention_span: attentionSpan,
          comprehension_rate: comprehensionRate,
          retention_indicators: retentionIndicators,
          learning_velocity: learningVelocity
        },
        performance_context: performanceContext
      };

      // Update learning session with analytics
      await this.updateLearningSessionAnalytics(sessionId, analyticsData);

      // Cache for real-time access
      if (this.redisClient) {
        await this.cacheLearningAnalytics(userId, sessionId, analyticsData);
      }

      return {
        success: true,
        sessionId,
        analyticsData: analyticsData.learning_analytics
      };

    } catch (error) {
      logger.error('Error tracking learning session analytics:', error);
      throw new Error(`Failed to track learning session analytics: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(userId, timeRange = {}) {
    try {
      const { startDate, endDate } = timeRange;
      
      // Get performance data from activities
      const query = { 
        user_id: userId,
        action_type: { $in: ['view', 'interaction', 'performance'] }
      };
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const activities = await UserActivity.find(query).lean();
      const sessions = await LearningSession.find({ 
        user_id: userId,
        ...(startDate && { start_time: { $gte: new Date(startDate) } }),
        ...(endDate && { end_time: { $lte: new Date(endDate) } })
      }).lean();

      // Calculate performance metrics
      const report = {
        userId,
        timeRange: { startDate, endDate },
        performanceMetrics: this.calculatePerformanceMetrics(activities),
        sessionPerformance: this.calculateSessionPerformance(sessions),
        materialPerformance: this.calculateMaterialPerformance(activities),
        learningEfficiency: this.calculateLearningEfficiency(sessions),
        recommendations: this.generatePerformanceRecommendations(activities, sessions),
        generatedAt: new Date()
      };

      return report;

    } catch (error) {
      logger.error('Error generating performance report:', error);
      throw new Error(`Failed to generate performance report: ${error.message}`);
    }
  }

  /**
   * Get real-time performance metrics
   */
  async getRealTimePerformanceMetrics(userId) {
    if (!this.redisClient) {
      throw new Error('Redis not available for real-time metrics');
    }

    try {
      const key = `performance_metrics:${userId}`;
      const data = await this.redisClient.hGetAll(key);
      
      if (!data || Object.keys(data).length === 0) {
        return {
          avgLoadTime: 0,
          avgInteractionLatency: 0,
          errorRate: 0,
          engagementScore: 0,
          lastUpdated: null
        };
      }

      return {
        avgLoadTime: parseFloat(data.avgLoadTime) || 0,
        avgInteractionLatency: parseFloat(data.avgInteractionLatency) || 0,
        errorRate: parseFloat(data.errorRate) || 0,
        engagementScore: parseFloat(data.engagementScore) || 0,
        sessionCount: parseInt(data.sessionCount) || 0,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null
      };

    } catch (error) {
      logger.error('Error getting real-time performance metrics:', error);
      throw error;
    }
  }

  // Helper methods

  async logPerformanceActivity(userId, sessionId, performanceRecord) {
    try {
      const activity = new UserActivity({
        activity_id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        action_type: 'performance',
        resource_type: 'system',
        resource_id: 'performance_monitor',
        timestamp: performanceRecord.timestamp,
        session_id: sessionId,
        context: {
          performance_data: true,
          metrics: performanceRecord.metrics
        },
        metadata: {
          service: 'activity-tracking-service',
          type: 'performance_monitoring'
        }
      });

      await activity.save();
    } catch (error) {
      logger.error('Error logging performance activity:', error);
    }
  }

  async cachePerformanceMetrics(userId, sessionId, performanceRecord) {
    try {
      const key = `performance_metrics:${userId}`;
      const sessionKey = `session_performance:${sessionId}`;
      
      // Update user performance metrics
      await this.redisClient.hSet(key, {
        lastLoadTime: performanceRecord.metrics.page_load_time || 0,
        lastInteractionLatency: performanceRecord.metrics.interaction_latency || 0,
        lastMemoryUsage: performanceRecord.metrics.memory_usage || 0,
        lastNetworkLatency: performanceRecord.metrics.network_latency || 0,
        lastErrorCount: performanceRecord.metrics.error_count || 0,
        lastUpdated: performanceRecord.timestamp.toISOString()
      });
      await this.redisClient.expire(key, 3600); // 1 hour

      // Store session-specific performance
      await this.redisClient.hSet(sessionKey, {
        userId,
        sessionId,
        performanceData: JSON.stringify(performanceRecord.metrics),
        timestamp: performanceRecord.timestamp.toISOString()
      });
      await this.redisClient.expire(sessionKey, 86400); // 24 hours

    } catch (error) {
      logger.error('Error caching performance metrics:', error);
    }
  }

  async updateMaterialPerformanceCache(materialId, performanceData) {
    try {
      const key = `material_performance:${materialId}`;
      
      await this.redisClient.hSet(key, {
        lastLoadTime: performanceData.performance_metrics.load_time || 0,
        lastRenderTime: performanceData.performance_metrics.render_time || 0,
        lastInteractionDelay: performanceData.performance_metrics.interaction_delay || 0,
        avgScrollDepth: performanceData.performance_metrics.scroll_depth || 0,
        lastUpdated: performanceData.timestamp.toISOString()
      });
      await this.redisClient.expire(key, 3600); // 1 hour

    } catch (error) {
      logger.error('Error updating material performance cache:', error);
    }
  }

  async updateLearningSessionAnalytics(sessionId, analyticsData) {
    try {
      await LearningSession.findOneAndUpdate(
        { session_id: sessionId },
        {
          $set: {
            learning_analytics: analyticsData.learning_analytics,
            performance_context: analyticsData.performance_context,
            analytics_updated_at: analyticsData.timestamp
          }
        },
        { upsert: false }
      );
    } catch (error) {
      logger.error('Error updating learning session analytics:', error);
    }
  }

  async cacheLearningAnalytics(userId, sessionId, analyticsData) {
    try {
      const key = `learning_analytics:${userId}:${sessionId}`;
      
      await this.redisClient.hSet(key, {
        learningEfficiency: analyticsData.learning_analytics.learning_efficiency || 0,
        cognitiveLoad: analyticsData.learning_analytics.cognitive_load || 0,
        attentionSpan: analyticsData.learning_analytics.attention_span || 0,
        comprehensionRate: analyticsData.learning_analytics.comprehension_rate || 0,
        learningVelocity: analyticsData.learning_analytics.learning_velocity || 0,
        timestamp: analyticsData.timestamp.toISOString()
      });
      await this.redisClient.expire(key, 86400); // 24 hours

    } catch (error) {
      logger.error('Error caching learning analytics:', error);
    }
  }

  calculatePerformanceScore(metrics) {
    // Normalize performance metrics to 0-100 scale
    const loadTimeScore = Math.max(0, 100 - (metrics.load_time / 50)); // 50ms = 0 points
    const renderTimeScore = Math.max(0, 100 - (metrics.render_time / 100)); // 100ms = 0 points
    const interactionScore = Math.max(0, 100 - (metrics.interaction_delay / 20)); // 20ms = 0 points
    const engagementScore = Math.min(100, (metrics.scroll_depth || 0) * 2); // 50% scroll = 100 points

    return Math.round((loadTimeScore + renderTimeScore + interactionScore + engagementScore) / 4);
  }

  calculatePerformanceMetrics(activities) {
    const performanceActivities = activities.filter(a => a.action_type === 'performance');
    
    if (performanceActivities.length === 0) {
      return {
        avgLoadTime: 0,
        avgInteractionLatency: 0,
        avgMemoryUsage: 0,
        avgNetworkLatency: 0,
        totalErrors: 0,
        errorRate: 0
      };
    }

    let totalLoadTime = 0;
    let totalInteractionLatency = 0;
    let totalMemoryUsage = 0;
    let totalNetworkLatency = 0;
    let totalErrors = 0;
    let validMetricsCount = 0;

    performanceActivities.forEach(activity => {
      const metrics = activity.context?.metrics;
      if (metrics) {
        totalLoadTime += metrics.page_load_time || 0;
        totalInteractionLatency += metrics.interaction_latency || 0;
        totalMemoryUsage += metrics.memory_usage || 0;
        totalNetworkLatency += metrics.network_latency || 0;
        totalErrors += metrics.error_count || 0;
        validMetricsCount++;
      }
    });

    return {
      avgLoadTime: validMetricsCount > 0 ? Math.round(totalLoadTime / validMetricsCount) : 0,
      avgInteractionLatency: validMetricsCount > 0 ? Math.round(totalInteractionLatency / validMetricsCount) : 0,
      avgMemoryUsage: validMetricsCount > 0 ? Math.round(totalMemoryUsage / validMetricsCount) : 0,
      avgNetworkLatency: validMetricsCount > 0 ? Math.round(totalNetworkLatency / validMetricsCount) : 0,
      totalErrors,
      errorRate: performanceActivities.length > 0 ? (totalErrors / performanceActivities.length) * 100 : 0
    };
  }

  calculateSessionPerformance(sessions) {
    if (sessions.length === 0) {
      return {
        avgSessionDuration: 0,
        avgEngagementScore: 0,
        avgCompletionRate: 0,
        totalSessions: 0
      };
    }

    let totalDuration = 0;
    let totalEngagement = 0;
    let totalCompletion = 0;
    let validSessions = 0;

    sessions.forEach(session => {
      if (session.start_time && session.end_time) {
        totalDuration += (new Date(session.end_time) - new Date(session.start_time)) / 1000;
        validSessions++;
      }
      totalEngagement += session.engagement_score || 0;
      totalCompletion += session.completion_rate || 0;
    });

    return {
      avgSessionDuration: validSessions > 0 ? Math.round(totalDuration / validSessions) : 0,
      avgEngagementScore: Math.round(totalEngagement / sessions.length),
      avgCompletionRate: Math.round(totalCompletion / sessions.length),
      totalSessions: sessions.length
    };
  }

  calculateMaterialPerformance(activities) {
    const materialActivities = activities.filter(a => a.resource_type === 'material');
    const materialMetrics = {};

    materialActivities.forEach(activity => {
      const materialId = activity.resource_id;
      if (!materialMetrics[materialId]) {
        materialMetrics[materialId] = {
          interactions: 0,
          totalDuration: 0,
          avgDuration: 0
        };
      }

      materialMetrics[materialId].interactions++;
      materialMetrics[materialId].totalDuration += activity.context?.duration || 0;
    });

    // Calculate averages
    Object.keys(materialMetrics).forEach(materialId => {
      const metrics = materialMetrics[materialId];
      metrics.avgDuration = metrics.interactions > 0 ? 
        Math.round(metrics.totalDuration / metrics.interactions) : 0;
    });

    return materialMetrics;
  }

  calculateLearningEfficiency(sessions) {
    if (sessions.length === 0) return 0;

    let totalEfficiency = 0;
    let validSessions = 0;

    sessions.forEach(session => {
      if (session.learning_analytics?.learning_efficiency) {
        totalEfficiency += session.learning_analytics.learning_efficiency;
        validSessions++;
      } else if (session.completion_rate && session.engagement_score) {
        // Calculate efficiency from completion and engagement
        const efficiency = (session.completion_rate * 0.6) + (session.engagement_score * 0.4);
        totalEfficiency += efficiency;
        validSessions++;
      }
    });

    return validSessions > 0 ? Math.round(totalEfficiency / validSessions) : 0;
  }

  generatePerformanceRecommendations(activities, sessions) {
    const recommendations = [];
    const performanceMetrics = this.calculatePerformanceMetrics(activities);
    const sessionPerformance = this.calculateSessionPerformance(sessions);

    // Load time recommendations
    if (performanceMetrics.avgLoadTime > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Page load times are above optimal threshold. Consider optimizing content delivery.',
        metric: 'load_time',
        currentValue: performanceMetrics.avgLoadTime,
        targetValue: 3000
      });
    }

    // Engagement recommendations
    if (sessionPerformance.avgEngagementScore < 60) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'User engagement is below average. Consider reviewing content relevance and interactivity.',
        metric: 'engagement_score',
        currentValue: sessionPerformance.avgEngagementScore,
        targetValue: 75
      });
    }

    // Session duration recommendations
    if (sessionPerformance.avgSessionDuration < 300) { // 5 minutes
      recommendations.push({
        type: 'retention',
        priority: 'medium',
        message: 'Session durations are short. Consider improving content depth and user experience.',
        metric: 'session_duration',
        currentValue: sessionPerformance.avgSessionDuration,
        targetValue: 900 // 15 minutes
      });
    }

    // Error rate recommendations
    if (performanceMetrics.errorRate > 5) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Error rate is above acceptable threshold. Review system stability and error handling.',
        metric: 'error_rate',
        currentValue: performanceMetrics.errorRate,
        targetValue: 2
      });
    }

    return recommendations;
  }

  startPerformanceTracking() {
    // Start periodic performance metric aggregation
    setInterval(async () => {
      try {
        await this.aggregatePerformanceMetrics();
      } catch (error) {
        logger.error('Error in performance metric aggregation:', error);
      }
    }, 60000); // Every minute
  }

  async aggregatePerformanceMetrics() {
    if (!this.redisClient) return;

    try {
      // Get all performance metric keys
      const keys = await this.redisClient.keys('performance_metrics:*');
      
      if (keys.length === 0) return;

      let totalLoadTime = 0;
      let totalInteractionLatency = 0;
      let totalMemoryUsage = 0;
      let totalNetworkLatency = 0;
      let totalErrors = 0;
      let validMetrics = 0;

      for (const key of keys) {
        const data = await this.redisClient.hGetAll(key);
        if (data && Object.keys(data).length > 0) {
          totalLoadTime += parseFloat(data.lastLoadTime) || 0;
          totalInteractionLatency += parseFloat(data.lastInteractionLatency) || 0;
          totalMemoryUsage += parseFloat(data.lastMemoryUsage) || 0;
          totalNetworkLatency += parseFloat(data.lastNetworkLatency) || 0;
          totalErrors += parseInt(data.lastErrorCount) || 0;
          validMetrics++;
        }
      }

      if (validMetrics > 0) {
        // Store aggregated metrics
        await this.redisClient.hSet('platform_performance:current', {
          avgLoadTime: Math.round(totalLoadTime / validMetrics),
          avgInteractionLatency: Math.round(totalInteractionLatency / validMetrics),
          avgMemoryUsage: Math.round(totalMemoryUsage / validMetrics),
          avgNetworkLatency: Math.round(totalNetworkLatency / validMetrics),
          totalErrors,
          activeUsers: validMetrics,
          lastUpdated: new Date().toISOString()
        });
        await this.redisClient.expire('platform_performance:current', 3600);
      }

    } catch (error) {
      logger.error('Error aggregating performance metrics:', error);
    }
  }
}

module.exports = new PerformanceMonitor();