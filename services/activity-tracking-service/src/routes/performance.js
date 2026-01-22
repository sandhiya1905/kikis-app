const express = require('express');
const router = express.Router();
const Joi = require('joi');
const performanceMonitor = require('../services/performanceMonitor');
const logger = require('../utils/logger');

// Validation schemas
const performanceTrackingSchema = Joi.object({
  sessionId: Joi.string().required(),
  pageLoadTime: Joi.number().min(0),
  interactionLatency: Joi.number().min(0),
  memoryUsage: Joi.number().min(0),
  networkLatency: Joi.number().min(0),
  errorCount: Joi.number().min(0).default(0),
  featureUsage: Joi.object().default({}),
  devicePerformance: Joi.object({
    cpuUsage: Joi.number().min(0).max(100),
    memoryPressure: Joi.string().valid('low', 'medium', 'high'),
    batteryLevel: Joi.number().min(0).max(100),
    connectionType: Joi.string().valid('wifi', '4g', '3g', 'ethernet', 'unknown')
  }).default({})
});

const materialPerformanceSchema = Joi.object({
  materialId: Joi.string().required(),
  loadTime: Joi.number().min(0),
  renderTime: Joi.number().min(0),
  interactionDelay: Joi.number().min(0),
  scrollDepth: Joi.number().min(0).max(100),
  timeToFirstInteraction: Joi.number().min(0),
  bounceRate: Joi.number().min(0).max(100),
  engagementDepth: Joi.number().min(0)
});

const learningAnalyticsSchema = Joi.object({
  sessionId: Joi.string().required(),
  learningEfficiency: Joi.number().min(0).max(100),
  cognitiveLoad: Joi.number().min(0).max(100),
  attentionSpan: Joi.number().min(0),
  comprehensionRate: Joi.number().min(0).max(100),
  retentionIndicators: Joi.object({
    shortTerm: Joi.number().min(0).max(100),
    mediumTerm: Joi.number().min(0).max(100),
    longTerm: Joi.number().min(0).max(100)
  }).default({}),
  learningVelocity: Joi.number().min(0),
  performanceContext: Joi.object().default({})
});

/**
 * @route POST /api/performance/session
 * @desc Track session performance metrics
 * @access Private
 */
router.post('/session', async (req, res) => {
  try {
    const { error, value } = performanceTrackingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const result = await performanceMonitor.trackSessionPerformance(
      req.userContext.userId,
      value.sessionId,
      value
    );

    res.status(201).json({
      success: true,
      message: 'Session performance tracked successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error tracking session performance:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track session performance'
    });
  }
});

/**
 * @route POST /api/performance/material
 * @desc Monitor material interaction performance
 * @access Private
 */
router.post('/material', async (req, res) => {
  try {
    const { error, value } = materialPerformanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const result = await performanceMonitor.monitorMaterialInteractionPerformance(
      req.userContext.userId,
      value.materialId,
      value
    );

    res.status(201).json({
      success: true,
      message: 'Material interaction performance monitored successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error monitoring material interaction performance:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to monitor material interaction performance'
    });
  }
});

/**
 * @route POST /api/performance/learning-analytics
 * @desc Track learning session analytics
 * @access Private
 */
router.post('/learning-analytics', async (req, res) => {
  try {
    const { error, value } = learningAnalyticsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const result = await performanceMonitor.trackLearningSessionAnalytics(
      req.userContext.userId,
      value,
      value.performanceContext
    );

    res.status(201).json({
      success: true,
      message: 'Learning session analytics tracked successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error tracking learning session analytics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track learning session analytics'
    });
  }
});

/**
 * @route GET /api/performance/report/:userId
 * @desc Get comprehensive performance report
 * @access Private
 */
router.get('/report/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Authorization check
    if (userId !== req.userContext.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own performance data'
      });
    }

    const timeRange = {};
    if (startDate) timeRange.startDate = startDate;
    if (endDate) timeRange.endDate = endDate;

    const report = await performanceMonitor.generatePerformanceReport(userId, timeRange);

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    logger.error('Error generating performance report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate performance report'
    });
  }
});

/**
 * @route GET /api/performance/real-time
 * @desc Get real-time performance metrics for current user
 * @access Private
 */
router.get('/real-time', async (req, res) => {
  try {
    const userId = req.userContext.userId;

    const metrics = await performanceMonitor.getRealTimePerformanceMetrics(userId);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Error getting real-time performance metrics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve real-time performance metrics'
    });
  }
});

/**
 * @route GET /api/performance/platform
 * @desc Get platform-wide performance metrics
 * @access Private (Admin only)
 */
router.get('/platform', async (req, res) => {
  try {
    // Admin authorization check
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin access required for platform performance metrics'
      });
    }

    const { getRedisClient } = require('../config/redis');
    const redisClient = getRedisClient();

    if (!redisClient) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Performance metrics service is not available'
      });
    }

    const platformMetrics = await redisClient.hGetAll('platform_performance:current');

    if (!platformMetrics || Object.keys(platformMetrics).length === 0) {
      return res.json({
        success: true,
        data: {
          avgLoadTime: 0,
          avgInteractionLatency: 0,
          avgMemoryUsage: 0,
          avgNetworkLatency: 0,
          totalErrors: 0,
          activeUsers: 0,
          lastUpdated: null
        }
      });
    }

    const formattedMetrics = {
      avgLoadTime: parseInt(platformMetrics.avgLoadTime) || 0,
      avgInteractionLatency: parseInt(platformMetrics.avgInteractionLatency) || 0,
      avgMemoryUsage: parseInt(platformMetrics.avgMemoryUsage) || 0,
      avgNetworkLatency: parseInt(platformMetrics.avgNetworkLatency) || 0,
      totalErrors: parseInt(platformMetrics.totalErrors) || 0,
      activeUsers: parseInt(platformMetrics.activeUsers) || 0,
      lastUpdated: platformMetrics.lastUpdated ? new Date(platformMetrics.lastUpdated) : null
    };

    res.json({
      success: true,
      data: formattedMetrics
    });

  } catch (error) {
    logger.error('Error getting platform performance metrics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve platform performance metrics'
    });
  }
});

/**
 * @route GET /api/performance/material/:materialId/metrics
 * @desc Get performance metrics for a specific material
 * @access Private
 */
router.get('/material/:materialId/metrics', async (req, res) => {
  try {
    const { materialId } = req.params;

    const { getRedisClient } = require('../config/redis');
    const redisClient = getRedisClient();

    if (!redisClient) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Performance metrics service is not available'
      });
    }

    const key = `material_performance:${materialId}`;
    const metrics = await redisClient.hGetAll(key);

    if (!metrics || Object.keys(metrics).length === 0) {
      return res.json({
        success: true,
        data: {
          materialId,
          lastLoadTime: 0,
          lastRenderTime: 0,
          lastInteractionDelay: 0,
          avgScrollDepth: 0,
          lastUpdated: null
        }
      });
    }

    const formattedMetrics = {
      materialId,
      lastLoadTime: parseFloat(metrics.lastLoadTime) || 0,
      lastRenderTime: parseFloat(metrics.lastRenderTime) || 0,
      lastInteractionDelay: parseFloat(metrics.lastInteractionDelay) || 0,
      avgScrollDepth: parseFloat(metrics.avgScrollDepth) || 0,
      lastUpdated: metrics.lastUpdated ? new Date(metrics.lastUpdated) : null
    };

    res.json({
      success: true,
      data: formattedMetrics
    });

  } catch (error) {
    logger.error('Error getting material performance metrics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve material performance metrics'
    });
  }
});

/**
 * @route GET /api/performance/health
 * @desc Get performance monitoring service health
 * @access Private (Admin only)
 */
router.get('/health', async (req, res) => {
  try {
    // Admin authorization check
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Admin access required for service health check'
      });
    }

    const { getRedisClient } = require('../config/redis');
    const redisClient = getRedisClient();

    const health = {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        redis: 'unknown',
        database: 'unknown',
        performanceMonitor: 'healthy'
      }
    };

    // Check Redis connection
    try {
      if (redisClient) {
        await redisClient.ping();
        health.services.redis = 'healthy';
      } else {
        health.services.redis = 'unavailable';
      }
    } catch (error) {
      health.services.redis = 'unhealthy';
    }

    // Check database connection
    try {
      const { UserActivity } = require('../../../../shared/schemas/userActivity');
      await UserActivity.findOne().limit(1);
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
    }

    // Determine overall status
    const serviceStatuses = Object.values(health.services);
    if (serviceStatuses.includes('unhealthy')) {
      health.status = 'unhealthy';
    } else if (serviceStatuses.includes('unavailable')) {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: health.status !== 'unhealthy',
      data: health
    });

  } catch (error) {
    logger.error('Error checking performance service health:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check service health'
    });
  }
});

module.exports = router;