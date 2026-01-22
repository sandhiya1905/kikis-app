const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');

class AnalyticsProcessor {
  constructor() {
    this.redisClient = getRedisClient();
  }

  /**
   * Process batch of activities for real-time analytics
   * Validates: Requirements 1.2 - Analytics data aggregation consistency
   */
  async processBatch(activities) {
    try {
      if (!activities || activities.length === 0) {
        return { processed: 0 };
      }

      // Group activities by type for efficient processing
      const groupedActivities = this.groupActivitiesByType(activities);
      
      // Process each group
      const results = await Promise.allSettled([
        this.processUserEngagement(groupedActivities.user || []),
        this.processMaterialAnalytics(groupedActivities.material || []),
        this.processSearchAnalytics(groupedActivities.search || []),
        this.processSystemAnalytics(groupedActivities.system || [])
      ]);

      // Log any failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error(`Analytics processing failed for group ${index}:`, result.reason);
        }
      });

      // Update real-time metrics
      await this.updateRealTimeMetrics(activities);

      logger.info(`Analytics batch processed: ${activities.length} activities`);
      
      return {
        processed: activities.length,
        timestamp: new Date(),
        results: results.map(r => r.status)
      };

    } catch (error) {
      logger.error('Error processing analytics batch:', error);
      throw error;
    }
  }

  /**
   * Process user engagement analytics
   */
  async processUserEngagement(activities) {
    if (!activities.length) return;

    try {
      const userEngagement = {};
      
      activities.forEach(activity => {
        const userId = activity.user_id.toString();
        
        if (!userEngagement[userId]) {
          userEngagement[userId] = {
            totalActivities: 0,
            actionTypes: {},
            totalDuration: 0,
            sessionCount: new Set(),
            lastActivity: null
          };
        }

        const engagement = userEngagement[userId];
        engagement.totalActivities++;
        engagement.actionTypes[activity.action_type] = 
          (engagement.actionTypes[activity.action_type] || 0) + 1;
        engagement.totalDuration += activity.context?.duration || 0;
        engagement.sessionCount.add(activity.session_id);
        engagement.lastActivity = activity.timestamp;
      });

      // Update Redis cache for real-time access
      if (this.redisClient) {
        for (const [userId, engagement] of Object.entries(userEngagement)) {
          await this.updateUserEngagementCache(userId, {
            ...engagement,
            sessionCount: engagement.sessionCount.size
          });
        }
      }

      return { processedUsers: Object.keys(userEngagement).length };

    } catch (error) {
      logger.error('Error processing user engagement:', error);
      throw error;
    }
  }

  /**
   * Process material analytics
   */
  async processMaterialAnalytics(activities) {
    if (!activities.length) return;

    try {
      const materialMetrics = {};
      
      activities.forEach(activity => {
        const materialId = activity.resource_id;
        
        if (!materialMetrics[materialId]) {
          materialMetrics[materialId] = {
            views: 0,
            downloads: 0,
            bookmarks: 0,
            shares: 0,
            totalDuration: 0,
            uniqueUsers: new Set(),
            avgCompletionRate: 0,
            completionRates: []
          };
        }

        const metrics = materialMetrics[materialId];
        metrics[activity.action_type] = (metrics[activity.action_type] || 0) + 1;
        metrics.totalDuration += activity.context?.duration || 0;
        metrics.uniqueUsers.add(activity.user_id.toString());
        
        // Track completion rates
        if (activity.metadata?.completion_percentage !== undefined) {
          metrics.completionRates.push(activity.metadata.completion_percentage);
        }
      });

      // Calculate averages and update cache
      if (this.redisClient) {
        for (const [materialId, metrics] of Object.entries(materialMetrics)) {
          // Calculate average completion rate
          if (metrics.completionRates.length > 0) {
            metrics.avgCompletionRate = metrics.completionRates.reduce((a, b) => a + b, 0) / 
              metrics.completionRates.length;
          }

          await this.updateMaterialAnalyticsCache(materialId, {
            ...metrics,
            uniqueUsers: metrics.uniqueUsers.size,
            avgDuration: metrics.totalDuration / (metrics.views || 1)
          });
        }
      }

      return { processedMaterials: Object.keys(materialMetrics).length };

    } catch (error) {
      logger.error('Error processing material analytics:', error);
      throw error;
    }
  }

  /**
   * Process search analytics
   */
  async processSearchAnalytics(activities) {
    if (!activities.length) return;

    try {
      const searchMetrics = {
        totalSearches: activities.length,
        uniqueUsers: new Set(),
        queryTerms: {},
        filters: {},
        avgResultsCount: 0,
        totalResultsCount: 0
      };

      activities.forEach(activity => {
        searchMetrics.uniqueUsers.add(activity.user_id.toString());
        
        if (activity.metadata?.query_text) {
          const query = activity.metadata.query_text.toLowerCase();
          searchMetrics.queryTerms[query] = (searchMetrics.queryTerms[query] || 0) + 1;
        }

        if (activity.metadata?.filters_applied) {
          Object.keys(activity.metadata.filters_applied).forEach(filter => {
            searchMetrics.filters[filter] = (searchMetrics.filters[filter] || 0) + 1;
          });
        }

        if (activity.metadata?.results_count !== undefined) {
          searchMetrics.totalResultsCount += activity.metadata.results_count;
        }
      });

      searchMetrics.avgResultsCount = searchMetrics.totalResultsCount / activities.length;
      searchMetrics.uniqueUsers = searchMetrics.uniqueUsers.size;

      // Update search analytics cache
      if (this.redisClient) {
        await this.updateSearchAnalyticsCache(searchMetrics);
      }

      return { processedSearches: activities.length };

    } catch (error) {
      logger.error('Error processing search analytics:', error);
      throw error;
    }
  }

  /**
   * Process system analytics
   */
  async processSystemAnalytics(activities) {
    if (!activities.length) return;

    try {
      const systemMetrics = {
        totalSystemActivities: activities.length,
        actionBreakdown: {},
        deviceBreakdown: {},
        locationBreakdown: {},
        timePatterns: {}
      };

      activities.forEach(activity => {
        // Action breakdown
        systemMetrics.actionBreakdown[activity.action_type] = 
          (systemMetrics.actionBreakdown[activity.action_type] || 0) + 1;

        // Device breakdown
        const deviceType = activity.context?.device_type || 'unknown';
        systemMetrics.deviceBreakdown[deviceType] = 
          (systemMetrics.deviceBreakdown[deviceType] || 0) + 1;

        // Location breakdown
        if (activity.context?.location?.country) {
          const country = activity.context.location.country;
          systemMetrics.locationBreakdown[country] = 
            (systemMetrics.locationBreakdown[country] || 0) + 1;
        }

        // Time patterns
        const hour = new Date(activity.timestamp).getHours();
        systemMetrics.timePatterns[hour] = (systemMetrics.timePatterns[hour] || 0) + 1;
      });

      // Update system analytics cache
      if (this.redisClient) {
        await this.updateSystemAnalyticsCache(systemMetrics);
      }

      return { processedSystemActivities: activities.length };

    } catch (error) {
      logger.error('Error processing system analytics:', error);
      throw error;
    }
  }

  /**
   * Update real-time metrics aggregation
   */
  async updateRealTimeMetrics(activities) {
    if (!this.redisClient || !activities.length) return;

    try {
      const now = new Date();
      const hourKey = `metrics:hour:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
      const dayKey = `metrics:day:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

      // Aggregate metrics
      const metrics = {
        totalActivities: activities.length,
        uniqueUsers: new Set(activities.map(a => a.user_id.toString())).size,
        actionBreakdown: {},
        resourceBreakdown: {}
      };

      activities.forEach(activity => {
        metrics.actionBreakdown[activity.action_type] = 
          (metrics.actionBreakdown[activity.action_type] || 0) + 1;
        metrics.resourceBreakdown[activity.resource_type] = 
          (metrics.resourceBreakdown[activity.resource_type] || 0) + 1;
      });

      // Update hourly metrics
      await this.redisClient.hSet(hourKey, {
        totalActivities: metrics.totalActivities,
        uniqueUsers: metrics.uniqueUsers,
        actionBreakdown: JSON.stringify(metrics.actionBreakdown),
        resourceBreakdown: JSON.stringify(metrics.resourceBreakdown),
        lastUpdated: now.toISOString()
      });
      await this.redisClient.expire(hourKey, 86400); // 24 hours

      // Update daily metrics
      await this.redisClient.hIncrBy(dayKey, 'totalActivities', metrics.totalActivities);
      await this.redisClient.hSet(dayKey, 'lastUpdated', now.toISOString());
      await this.redisClient.expire(dayKey, 604800); // 7 days

    } catch (error) {
      logger.error('Error updating real-time metrics:', error);
    }
  }

  // Helper methods for cache updates

  async updateUserEngagementCache(userId, engagement) {
    try {
      const key = `user_engagement:${userId}`;
      await this.redisClient.hSet(key, {
        totalActivities: engagement.totalActivities,
        actionTypes: JSON.stringify(engagement.actionTypes),
        totalDuration: engagement.totalDuration,
        sessionCount: engagement.sessionCount,
        lastActivity: engagement.lastActivity?.toISOString() || '',
        lastUpdated: new Date().toISOString()
      });
      await this.redisClient.expire(key, 3600); // 1 hour
    } catch (error) {
      logger.error('Error updating user engagement cache:', error);
    }
  }

  async updateMaterialAnalyticsCache(materialId, metrics) {
    try {
      const key = `material_analytics:${materialId}`;
      await this.redisClient.hSet(key, {
        views: metrics.views || 0,
        downloads: metrics.downloads || 0,
        bookmarks: metrics.bookmarks || 0,
        shares: metrics.shares || 0,
        uniqueUsers: metrics.uniqueUsers,
        avgDuration: Math.round(metrics.avgDuration || 0),
        avgCompletionRate: Math.round(metrics.avgCompletionRate || 0),
        lastUpdated: new Date().toISOString()
      });
      await this.redisClient.expire(key, 3600); // 1 hour
    } catch (error) {
      logger.error('Error updating material analytics cache:', error);
    }
  }

  async updateSearchAnalyticsCache(metrics) {
    try {
      const key = 'search_analytics:current';
      await this.redisClient.hSet(key, {
        totalSearches: metrics.totalSearches,
        uniqueUsers: metrics.uniqueUsers,
        queryTerms: JSON.stringify(metrics.queryTerms),
        filters: JSON.stringify(metrics.filters),
        avgResultsCount: Math.round(metrics.avgResultsCount),
        lastUpdated: new Date().toISOString()
      });
      await this.redisClient.expire(key, 3600); // 1 hour
    } catch (error) {
      logger.error('Error updating search analytics cache:', error);
    }
  }

  async updateSystemAnalyticsCache(metrics) {
    try {
      const key = 'system_analytics:current';
      await this.redisClient.hSet(key, {
        totalSystemActivities: metrics.totalSystemActivities,
        actionBreakdown: JSON.stringify(metrics.actionBreakdown),
        deviceBreakdown: JSON.stringify(metrics.deviceBreakdown),
        locationBreakdown: JSON.stringify(metrics.locationBreakdown),
        timePatterns: JSON.stringify(metrics.timePatterns),
        lastUpdated: new Date().toISOString()
      });
      await this.redisClient.expire(key, 3600); // 1 hour
    } catch (error) {
      logger.error('Error updating system analytics cache:', error);
    }
  }

  // Helper methods

  groupActivitiesByType(activities) {
    return activities.reduce((groups, activity) => {
      const type = activity.resource_type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(activity);
      return groups;
    }, {});
  }

  /**
   * Get real-time analytics data from cache
   */
  async getRealTimeAnalytics(timeframe = 'hour') {
    if (!this.redisClient) {
      throw new Error('Redis not available for real-time analytics');
    }

    try {
      const now = new Date();
      let key;
      
      if (timeframe === 'hour') {
        key = `metrics:hour:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
      } else {
        key = `metrics:day:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      }

      const data = await this.redisClient.hGetAll(key);
      
      if (!data || Object.keys(data).length === 0) {
        return {
          totalActivities: 0,
          uniqueUsers: 0,
          actionBreakdown: {},
          resourceBreakdown: {},
          lastUpdated: null
        };
      }

      return {
        totalActivities: parseInt(data.totalActivities) || 0,
        uniqueUsers: parseInt(data.uniqueUsers) || 0,
        actionBreakdown: data.actionBreakdown ? JSON.parse(data.actionBreakdown) : {},
        resourceBreakdown: data.resourceBreakdown ? JSON.parse(data.resourceBreakdown) : {},
        lastUpdated: data.lastUpdated
      };

    } catch (error) {
      logger.error('Error getting real-time analytics:', error);
      throw error;
    }
  }

  /**
   * Get cached user engagement data
   */
  async getCachedUserEngagement(userId) {
    if (!this.redisClient) return null;

    try {
      const key = `user_engagement:${userId}`;
      const data = await this.redisClient.hGetAll(key);
      
      if (!data || Object.keys(data).length === 0) return null;

      return {
        totalActivities: parseInt(data.totalActivities) || 0,
        actionTypes: data.actionTypes ? JSON.parse(data.actionTypes) : {},
        totalDuration: parseInt(data.totalDuration) || 0,
        sessionCount: parseInt(data.sessionCount) || 0,
        lastActivity: data.lastActivity ? new Date(data.lastActivity) : null,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null
      };

    } catch (error) {
      logger.error('Error getting cached user engagement:', error);
      return null;
    }
  }

  /**
   * Get cached material analytics
   */
  async getCachedMaterialAnalytics(materialId) {
    if (!this.redisClient) return null;

    try {
      const key = `material_analytics:${materialId}`;
      const data = await this.redisClient.hGetAll(key);
      
      if (!data || Object.keys(data).length === 0) return null;

      return {
        views: parseInt(data.views) || 0,
        downloads: parseInt(data.downloads) || 0,
        bookmarks: parseInt(data.bookmarks) || 0,
        shares: parseInt(data.shares) || 0,
        uniqueUsers: parseInt(data.uniqueUsers) || 0,
        avgDuration: parseInt(data.avgDuration) || 0,
        avgCompletionRate: parseInt(data.avgCompletionRate) || 0,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null
      };

    } catch (error) {
      logger.error('Error getting cached material analytics:', error);
      return null;
    }
  }
}

module.exports = new AnalyticsProcessor();