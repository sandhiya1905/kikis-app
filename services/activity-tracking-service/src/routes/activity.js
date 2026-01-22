const express = require('express');
const router = express.Router();
const Joi = require('joi');
const activityTracker = require('../services/activityTracker');
const logger = require('../utils/logger');

// Validation schemas
const logActivitySchema = Joi.object({
  actionType: Joi.string().valid(
    'view', 'download', 'search', 'upload', 'comment', 'rate', 
    'share', 'bookmark', 'login', 'logout'
  ).required(),
  resourceType: Joi.string().valid(
    'material', 'collection', 'user', 'system', 'interview', 'scholarship'
  ).required(),
  resourceId: Joi.string().required(),
  context: Joi.object({
    duration: Joi.number().min(0),
    interactionDepth: Joi.number().min(1),
    referrer: Joi.string().uri().allow(''),
    additionalData: Joi.object()
  }).default({}),
  metadata: Joi.object().default({})
});

const materialInteractionSchema = Joi.object({
  materialId: Joi.string().required(),
  interactionType: Joi.string().valid(
    'view', 'download', 'bookmark', 'note', 'highlight', 'share'
  ).required(),
  duration: Joi.number().min(0).default(0),
  completionPercentage: Joi.number().min(0).max(100).default(0),
  position: Joi.number().min(0).default(0),
  notesTaken: Joi.boolean().default(false),
  bookmarked: Joi.boolean().default(false),
  scrollDepth: Joi.number().min(0).max(100).default(0),
  timeOnPage: Joi.number().min(0).default(0),
  clickCount: Joi.number().min(0).default(0),
  focusTime: Joi.number().min(0).default(0),
  idleTime: Joi.number().min(0).default(0),
  navigationPattern: Joi.array().items(Joi.object({
    action: Joi.string().required(),
    timestamp: Joi.date().iso().default(() => new Date()),
    element: Joi.string(),
    position: Joi.object({
      x: Joi.number(),
      y: Joi.number()
    })
  })).default([]),
  contentEngagement: Joi.object({
    sectionsViewed: Joi.array().items(Joi.string()).default([]),
    timePerSection: Joi.object().default({}),
    interactiveElementsUsed: Joi.array().items(Joi.string()).default([]),
    mediaEngagement: Joi.object({
      videosWatched: Joi.number().min(0).default(0),
      imagesViewed: Joi.number().min(0).default(0),
      audioPlayed: Joi.number().min(0).default(0)
    }).default({})
  }).default({}),
  learningIndicators: Joi.object({
    conceptsIdentified: Joi.array().items(Joi.string()).default([]),
    difficultyRating: Joi.number().min(1).max(5),
    confidenceLevel: Joi.number().min(1).max(5),
    questionsGenerated: Joi.number().min(0).default(0),
    keyTermsHighlighted: Joi.number().min(0).default(0)
  }).default({}),
  context: Joi.object().default({}),
  additionalData: Joi.object().default({})
});

const searchQuerySchema = Joi.object({
  queryText: Joi.string().required(),
  filters: Joi.object().default({}),
  resultsCount: Joi.number().min(0).default(0),
  clickedResults: Joi.array().items(Joi.string()).default([]),
  context: Joi.object().default({})
});

const learningSessionSchema = Joi.object({
  sessionId: Joi.string(),
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso(),
  materialsAccessed: Joi.array().items(Joi.object({
    materialId: Joi.string().required(),
    duration: Joi.number().min(0).default(0),
    completionPercentage: Joi.number().min(0).max(100).default(0)
  })).default([]),
  learningObjectives: Joi.array().items(Joi.string()).default([]),
  outcomes: Joi.array().items(Joi.object({
    outcomeType: Joi.string().valid(
      'skill_acquired', 'concept_understood', 'problem_solved', 'goal_achieved'
    ).required(),
    description: Joi.string(),
    confidenceLevel: Joi.number().min(1).max(5).default(3)
  })).default([])
});

/**
 * @route POST /api/activity/log
 * @desc Log a user activity
 * @access Private
 */
router.post('/log', async (req, res) => {
  try {
    const { error, value } = logActivitySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { actionType, resourceType, resourceId, context, metadata } = value;
    
    // Add request context
    const enhancedContext = {
      ...context,
      sessionId: req.userContext.sessionId,
      ipAddress: req.userContext.ipAddress,
      userAgent: req.userContext.userAgent,
      referrer: req.userContext.referrer
    };

    const result = await activityTracker.logUserAction(
      req.userContext.userId,
      actionType,
      resourceType,
      resourceId,
      enhancedContext,
      metadata
    );

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error logging activity:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to log activity'
    });
  }
});

/**
 * @route POST /api/activity/material-interaction
 * @desc Track material interaction
 * @access Private
 */
router.post('/material-interaction', async (req, res) => {
  try {
    const { error, value } = materialInteractionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const interactionData = {
      ...value,
      context: {
        ...value.context,
        sessionId: req.userContext.sessionId,
        ipAddress: req.userContext.ipAddress,
        userAgent: req.userContext.userAgent,
        referrer: req.userContext.referrer
      }
    };

    const result = await activityTracker.trackMaterialInteraction(
      req.userContext.userId,
      value.materialId,
      interactionData
    );

    res.status(201).json({
      success: true,
      message: 'Material interaction tracked successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error tracking material interaction:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to track material interaction'
    });
  }
});

/**
 * @route POST /api/activity/search
 * @desc Record search query
 * @access Private
 */
router.post('/search', async (req, res) => {
  try {
    const { error, value } = searchQuerySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const queryData = {
      ...value,
      sessionId: req.userContext.sessionId,
      context: {
        ...value.context,
        ipAddress: req.userContext.ipAddress,
        userAgent: req.userContext.userAgent,
        referrer: req.userContext.referrer
      }
    };

    const result = await activityTracker.recordSearchQuery(
      req.userContext.userId,
      queryData,
      req.body.results
    );

    res.status(201).json({
      success: true,
      message: 'Search query recorded successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error recording search query:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to record search query'
    });
  }
});

/**
 * @route POST /api/activity/learning-session
 * @desc Capture learning session data
 * @access Private
 */
router.post('/learning-session', async (req, res) => {
  try {
    const { error, value } = learningSessionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const sessionData = {
      ...value,
      sessionId: value.sessionId || req.userContext.sessionId
    };

    const result = await activityTracker.captureLearningSession(
      req.userContext.userId,
      sessionData
    );

    res.status(201).json({
      success: true,
      message: 'Learning session captured successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error capturing learning session:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to capture learning session'
    });
  }
});

/**
 * @route GET /api/activity/user/:userId
 * @desc Get user activities
 * @access Private
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      limit = 50, 
      offset = 0, 
      actionType, 
      resourceType,
      startDate,
      endDate 
    } = req.query;

    // Authorization check - users can only access their own data or admins can access any
    if (userId !== req.userContext.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own activity data'
      });
    }

    const query = { user_id: userId };
    
    // Add filters
    if (actionType) query.action_type = actionType;
    if (resourceType) query.resource_type = resourceType;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const { UserActivity } = require('../../../../shared/schemas/userActivity');
    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const total = await UserActivity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting user activities:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user activities'
    });
  }
});

/**
 * @route GET /api/activity/recent
 * @desc Get recent activities for current user
 * @access Private
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const { UserActivity } = require('../../../../shared/schemas/userActivity');
    const activities = await UserActivity.find({ user_id: req.userContext.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    logger.error('Error getting recent activities:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve recent activities'
    });
  }
});

/**
 * @route DELETE /api/activity/user/:userId
 * @desc Delete user activities (GDPR compliance)
 * @access Private
 */
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Authorization check - users can only delete their own data or admins can delete any
    if (userId !== req.userContext.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only delete your own activity data'
      });
    }

    const { UserActivity, LearningSession } = require('../../../../shared/schemas/userActivity');
    
    // Delete activities and sessions
    const [activitiesResult, sessionsResult] = await Promise.all([
      UserActivity.deleteMany({ user_id: userId }),
      LearningSession.deleteMany({ user_id: userId })
    ]);

    logger.info(`Deleted user data for ${userId}: ${activitiesResult.deletedCount} activities, ${sessionsResult.deletedCount} sessions`);

    res.json({
      success: true,
      message: 'User activity data deleted successfully',
      data: {
        deletedActivities: activitiesResult.deletedCount,
        deletedSessions: sessionsResult.deletedCount
      }
    });

  } catch (error) {
    logger.error('Error deleting user activities:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete user activities'
    });
  }
});

module.exports = router;