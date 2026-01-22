const express = require('express');
const router = express.Router();
const Joi = require('joi');
const activityTracker = require('../services/activityTracker');
const analyticsProcessor = require('../services/analyticsProcessor');
const logger = require('../utils/logger');

// Validation schemas
const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  userId: Joi.string(),
  resourceType: Joi.string().valid('material', 'collection', 'user', 'system', 'interview', 'scholarship'),
  actionType: Joi.string().valid('view', 'download', 'search', 'upload', 'comment', 'rate', 'share', 'bookmark', 'login', 'logout'),
  groupBy: Joi.string().valid('hour', 'day', 'week', 'month').default('day'),
  limit: Joi.number().min(1).max(1000).default(100)
});

const platformMetricsSchema = Joi.object({
  timeRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso()
  }),
  userSegment: Joi.string(),
  resourceType: Joi.string().valid('material', 'collection', 'user', 'system', 'interview', 'scholarship')
});

/**
 * @route GET /api/analytics/user/:userId
 * @desc Get comprehensive user analytics
 * @access Private
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Authorization check
    if (userId !== req.userContext.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own analytics data'
      });
    }

    const timeRange = {};
    if (startDate) timeRange.startDate = startDate;
    if (endDate) timeRange.endDate = endDate;

    const analytics = await activityTracker.generateUserAnalytics(userId, timeRange);

    // Get cached real-time data if available
    const cachedEngagement = await analyticsProcessor.getCachedUserEngagement(userId);
    if (cachedEngagement) {
      analytics.realTimeEngagement = cachedEngagement;
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error getting user analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user analytics'
    });
  }
});

/**
 * @route GET /api/analytics/platform
 * @desc Get platform-wide analytics and metrics
 * @access Private (Admin only)
 */
router.get('/platform', async (req, res) => {
  try {
    // Admin authorization check
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin access required for platform analytics'
      });
    }

    const { error, value } = platformMetricsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const metrics = await activityTracker.getPlatformMetrics(value);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Error getting platform metrics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve platform metrics'
    });
  }
});

/**
 * @route GET /api/analytics/real-time
 * @desc Get real-time analytics data
 * @access Private (Admin only)
 */
router.get('/real-time', async (req, res) => {
  try {
    // Admin authorization check
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin access required for real-time analytics'
      });
    }

    const { timeframe = 'hour' } = req.query;

    const realTimeData = await analyticsProcessor.getRealTimeAnalytics(timeframe);

    res.json({
      success: true,
      data: realTimeData
    });

  } catch (error) {
    logger.error('Error getting real-time analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve real-time analytics'
    });
  }
});

/**
 * @route GET /api/analytics/material/:materialId
 * @desc Get material-specific analytics
 * @access Private
 */
router.get('/material/:materialId', async (req, res) => {
  try {
    const { materialId } = req.params;
    const { startDate, endDate } = req.query;

    // Build query for material activities
    const query = { 
      resource_type: 'material',
      resource_id: materialId
    };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const { UserActivity } = require('../../../../shared/schemas/userActivity');
    
    // Get material activities
    const activities = await UserActivity.find(query).lean();
    
    // Calculate material analytics
    const analytics = {
      materialId,
      totalInteractions: activities.length,
      uniqueUsers: new Set(activities.map(a => a.user_id.toString())).size,
      actionBreakdown: {},
      deviceBreakdown: {},
      timePatterns: {},
      avgDuration: 0,
      totalDuration: 0
    };

    let totalDuration = 0;
    let durationCount = 0;

    activities.forEach(activity => {
      // Action breakdown
      analytics.actionBreakdown[activity.action_type] = 
        (analytics.actionBreakdown[activity.action_type] || 0) + 1;

      // Device breakdown
      const deviceType = activity.context?.device_type || 'unknown';
      analytics.deviceBreakdown[deviceType] = 
        (analytics.deviceBreakdown[deviceType] || 0) + 1;

      // Time patterns
      const hour = new Date(activity.timestamp).getHours();
      analytics.timePatterns[hour] = (analytics.timePatterns[hour] || 0) + 1;

      // Duration calculation
      if (activity.context?.duration) {
        totalDuration += activity.context.duration;
        durationCount++;
      }
    });

    analytics.avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
    analytics.totalDuration = totalDuration;

    // Get cached analytics if available
    const cachedAnalytics = await analyticsProcessor.getCachedMaterialAnalytics(materialId);
    if (cachedAnalytics) {
      analytics.cached = cachedAnalytics;
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error getting material analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve material analytics'
    });
  }
});

/**
 * @route GET /api/analytics/search
 * @desc Get search analytics
 * @access Private (Admin only)
 */
router.get('/search', async (req, res) => {
  try {
    // Admin authorization check
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin access required for search analytics'
      });
    }

    const { startDate, endDate, limit = 100 } = req.query;

    // Build query for search activities
    const query = { 
      action_type: 'search',
      resource_type: 'system'
    };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const { UserActivity } = require('../../../../shared/schemas/userActivity');
    
    // Get search activities
    const searchActivities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    // Calculate search analytics
    const analytics = {
      totalSearches: searchActivities.length,
      uniqueUsers: new Set(searchActivities.map(a => a.user_id.toString())).size,
      topQueries: {},
      popularFilters: {},
      avgResultsCount: 0,
      searchPatterns: {},
      timeRange: { startDate, endDate }
    };

    let totalResults = 0;
    let resultsCount = 0;

    searchActivities.forEach(activity => {
      // Top queries
      if (activity.metadata?.query_text) {
        const query = activity.metadata.query_text.toLowerCase();
        analytics.topQueries[query] = (analytics.topQueries[query] || 0) + 1;
      }

      // Popular filters
      if (activity.metadata?.filters_applied) {
        Object.keys(activity.metadata.filters_applied).forEach(filter => {
          analytics.popularFilters[filter] = (analytics.popularFilters[filter] || 0) + 1;
        });
      }

      // Results count
      if (activity.metadata?.results_count !== undefined) {
        totalResults += activity.metadata.results_count;
        resultsCount++;
      }

      // Time patterns
      const hour = new Date(activity.timestamp).getHours();
      analytics.searchPatterns[hour] = (analytics.searchPatterns[hour] || 0) + 1;
    });

    analytics.avgResultsCount = resultsCount > 0 ? Math.round(totalResults / resultsCount) : 0;

    // Sort top queries and filters
    analytics.topQueries = Object.entries(analytics.topQueries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    analytics.popularFilters = Object.entries(analytics.popularFilters)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error getting search analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve search analytics'
    });
  }
});

/**
 * @route GET /api/analytics/engagement
 * @desc Get user engagement analytics
 * @access Private
 */
router.get('/engagement', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    // If userId is provided, check authorization
    if (userId && userId !== req.userContext.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own engagement data'
      });
    }

    const targetUserId = userId || req.userContext.userId;

    // Get learning sessions for engagement calculation
    const { LearningSession } = require('../../../../shared/schemas/userActivity');
    
    const query = { user_id: targetUserId };
    if (startDate || endDate) {
      query.start_time = {};
      if (startDate) query.start_time.$gte = new Date(startDate);
      if (endDate) query.start_time.$lte = new Date(endDate);
    }

    const sessions = await LearningSession.find(query).lean();

    // Calculate engagement metrics
    const engagement = {
      userId: targetUserId,
      totalSessions: sessions.length,
      avgSessionDuration: 0,
      avgCompletionRate: 0,
      avgEngagementScore: 0,
      totalLearningTime: 0,
      materialsEngaged: new Set(),
      engagementTrends: {},
      timeRange: { startDate, endDate }
    };

    if (sessions.length > 0) {
      let totalDuration = 0;
      let totalCompletion = 0;
      let totalEngagement = 0;

      sessions.forEach(session => {
        // Duration calculation
        if (session.start_time && session.end_time) {
          const duration = (new Date(session.end_time) - new Date(session.start_time)) / 1000;
          totalDuration += duration;
        }

        // Completion and engagement
        totalCompletion += session.completion_rate || 0;
        totalEngagement += session.engagement_score || 0;

        // Materials engaged
        session.materials_accessed.forEach(material => {
          engagement.materialsEngaged.add(material.material_id.toString());
        });

        // Engagement trends by date
        const date = new Date(session.start_time).toDateString();
        if (!engagement.engagementTrends[date]) {
          engagement.engagementTrends[date] = {
            sessions: 0,
            avgEngagement: 0,
            totalEngagement: 0
          };
        }
        engagement.engagementTrends[date].sessions++;
        engagement.engagementTrends[date].totalEngagement += session.engagement_score || 0;
        engagement.engagementTrends[date].avgEngagement = 
          engagement.engagementTrends[date].totalEngagement / engagement.engagementTrends[date].sessions;
      });

      engagement.avgSessionDuration = Math.round(totalDuration / sessions.length);
      engagement.avgCompletionRate = Math.round(totalCompletion / sessions.length);
      engagement.avgEngagementScore = Math.round(totalEngagement / sessions.length);
      engagement.totalLearningTime = totalDuration;
      engagement.uniqueMaterialsEngaged = engagement.materialsEngaged.size;
    }

    // Convert Set to number for JSON serialization
    engagement.materialsEngaged = engagement.materialsEngaged.size;

    res.json({
      success: true,
      data: engagement
    });

  } catch (error) {
    logger.error('Error getting engagement analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve engagement analytics'
    });
  }
});

/**
 * @route GET /api/analytics/trends
 * @desc Get analytics trends over time
 * @access Private (Admin only)
 */
router.get('/trends', async (req, res) => {
  try {
    // Admin authorization check
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin access required for trend analytics'
      });
    }

    const { 
      startDate, 
      endDate, 
      groupBy = 'day',
      metric = 'activities' 
    } = req.query;

    const { UserActivity } = require('../../../../shared/schemas/userActivity');

    // Build aggregation pipeline
    const pipeline = [];

    // Match stage
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Group by time period
    let groupId;
    switch (groupBy) {
      case 'hour':
        groupId = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        };
        break;
      case 'day':
        groupId = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
        break;
      case 'week':
        groupId = {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' }
        };
        break;
      case 'month':
        groupId = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' }
        };
        break;
      default:
        groupId = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
    }

    pipeline.push({
      $group: {
        _id: groupId,
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user_id' },
        actions: { $push: '$action_type' },
        avgDuration: { $avg: '$context.duration' }
      }
    });

    pipeline.push({
      $project: {
        _id: 1,
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgDuration: { $round: ['$avgDuration', 2] },
        actions: 1
      }
    });

    pipeline.push({ $sort: { '_id': 1 } });

    const trends = await UserActivity.aggregate(pipeline);

    // Format the results
    const formattedTrends = trends.map(trend => ({
      period: trend._id,
      [metric]: trend.count,
      uniqueUsers: trend.uniqueUsers,
      avgDuration: trend.avgDuration || 0,
      timestamp: this.formatPeriodToDate(trend._id, groupBy)
    }));

    res.json({
      success: true,
      data: {
        trends: formattedTrends,
        groupBy,
        metric,
        timeRange: { startDate, endDate }
      }
    });

  } catch (error) {
    logger.error('Error getting trend analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve trend analytics'
    });
  }
});

// Helper function to format period to date
function formatPeriodToDate(period, groupBy) {
  switch (groupBy) {
    case 'hour':
      return new Date(period.year, period.month - 1, period.day, period.hour);
    case 'day':
      return new Date(period.year, period.month - 1, period.day);
    case 'week':
      // Approximate week start date
      const jan1 = new Date(period.year, 0, 1);
      const weekStart = new Date(jan1.getTime() + (period.week - 1) * 7 * 24 * 60 * 60 * 1000);
      return weekStart;
    case 'month':
      return new Date(period.year, period.month - 1, 1);
    default:
      return new Date(period.year, period.month - 1, period.day);
  }
}

module.exports = router;