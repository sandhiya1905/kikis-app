const express = require('express');
const router = express.Router();
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const sessionQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0)
});

const updateSessionSchema = Joi.object({
  endTime: Joi.date().iso(),
  materialsAccessed: Joi.array().items(Joi.object({
    materialId: Joi.string().required(),
    duration: Joi.number().min(0).default(0),
    completionPercentage: Joi.number().min(0).max(100).default(0),
    interactions: Joi.array().items(Joi.object({
      interactionType: Joi.string().valid('view', 'download', 'bookmark', 'note', 'highlight', 'share').required(),
      timestamp: Joi.date().iso().default(() => new Date()),
      duration: Joi.number().min(0).default(0),
      position: Joi.number().min(0).default(0),
      data: Joi.object().default({})
    })).default([]),
    notesTaken: Joi.boolean().default(false),
    bookmarked: Joi.boolean().default(false)
  })).default([]),
  learningObjectives: Joi.array().items(Joi.string()).default([]),
  outcomes: Joi.array().items(Joi.object({
    outcomeType: Joi.string().valid('skill_acquired', 'concept_understood', 'problem_solved', 'goal_achieved').required(),
    description: Joi.string(),
    confidenceLevel: Joi.number().min(1).max(5).default(3),
    timestamp: Joi.date().iso().default(() => new Date())
  })).default([])
});

/**
 * @route GET /api/sessions/user/:userId
 * @desc Get learning sessions for a user
 * @access Private
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Authorization check
    if (userId !== req.userContext.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own session data'
      });
    }

    const { error, value } = sessionQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { startDate, endDate, limit, offset } = value;

    // Build query
    const query = { user_id: userId };
    if (startDate || endDate) {
      query.start_time = {};
      if (startDate) query.start_time.$gte = new Date(startDate);
      if (endDate) query.start_time.$lte = new Date(endDate);
    }

    const { LearningSession } = require('../../../../shared/schemas/userActivity');
    
    const sessions = await LearningSession.find(query)
      .sort({ start_time: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const total = await LearningSession.countDocuments(query);

    // Calculate session statistics
    const stats = {
      totalSessions: total,
      avgSessionDuration: 0,
      avgCompletionRate: 0,
      avgEngagementScore: 0,
      totalLearningTime: 0
    };

    if (sessions.length > 0) {
      let totalDuration = 0;
      let totalCompletion = 0;
      let totalEngagement = 0;
      let durationCount = 0;

      sessions.forEach(session => {
        if (session.start_time && session.end_time) {
          const duration = (new Date(session.end_time) - new Date(session.start_time)) / 1000;
          totalDuration += duration;
          durationCount++;
        }
        totalCompletion += session.completion_rate || 0;
        totalEngagement += session.engagement_score || 0;
      });

      stats.avgSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
      stats.avgCompletionRate = Math.round(totalCompletion / sessions.length);
      stats.avgEngagementScore = Math.round(totalEngagement / sessions.length);
      stats.totalLearningTime = totalDuration;
    }

    res.json({
      success: true,
      data: {
        sessions,
        stats,
        pagination: {
          total,
          limit,
          offset,
          hasMore: total > offset + limit
        }
      }
    });

  } catch (error) {
    logger.error('Error getting user sessions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user sessions'
    });
  }
});

/**
 * @route GET /api/sessions/:sessionId
 * @desc Get specific learning session details
 * @access Private
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { LearningSession } = require('../../../../shared/schemas/userActivity');
    
    const session = await LearningSession.findOne({ session_id: sessionId }).lean();

    if (!session) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Learning session not found'
      });
    }

    // Authorization check
    if (session.user_id.toString() !== req.userContext.userId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own session data'
      });
    }

    // Calculate additional session metrics
    const sessionMetrics = {
      duration: session.start_time && session.end_time ? 
        (new Date(session.end_time) - new Date(session.start_time)) / 1000 : 0,
      materialsCount: session.materials_accessed.length,
      totalInteractions: session.materials_accessed.reduce(
        (sum, material) => sum + (material.interactions?.length || 0), 0
      ),
      avgMaterialCompletion: session.materials_accessed.length > 0 ?
        session.materials_accessed.reduce(
          (sum, material) => sum + (material.completion_percentage || 0), 0
        ) / session.materials_accessed.length : 0,
      notesCount: session.materials_accessed.filter(m => m.notes_taken).length,
      bookmarksCount: session.materials_accessed.filter(m => m.bookmarked).length
    };

    res.json({
      success: true,
      data: {
        session,
        metrics: sessionMetrics
      }
    });

  } catch (error) {
    logger.error('Error getting session details:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve session details'
    });
  }
});

/**
 * @route PUT /api/sessions/:sessionId
 * @desc Update learning session
 * @access Private
 */
router.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { error, value } = updateSessionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { LearningSession } = require('../../../../shared/schemas/userActivity');
    
    // Find existing session
    const existingSession = await LearningSession.findOne({ session_id: sessionId });

    if (!existingSession) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Learning session not found'
      });
    }

    // Authorization check
    if (existingSession.user_id.toString() !== req.userContext.userId) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only update your own sessions'
      });
    }

    // Calculate updated metrics
    const updatedData = { ...value };
    
    if (updatedData.materialsAccessed && updatedData.materialsAccessed.length > 0) {
      // Calculate completion rate
      const totalCompletion = updatedData.materialsAccessed.reduce(
        (sum, material) => sum + (material.completionPercentage || 0), 0
      );
      updatedData.completion_rate = Math.round(totalCompletion / updatedData.materialsAccessed.length);

      // Calculate engagement score
      const totalInteractions = updatedData.materialsAccessed.reduce(
        (sum, material) => sum + (material.interactions?.length || 0), 0
      );
      const avgDuration = updatedData.materialsAccessed.reduce(
        (sum, material) => sum + (material.duration || 0), 0
      ) / updatedData.materialsAccessed.length;

      // Normalize engagement score (0-100)
      const durationScore = Math.min(avgDuration / 60, 1) * 40; // Max 40 points
      const interactionScore = Math.min(totalInteractions / 10, 1) * 60; // Max 60 points
      updatedData.engagement_score = Math.round(durationScore + interactionScore);
    }

    // Update session
    const updatedSession = await LearningSession.findOneAndUpdate(
      { session_id: sessionId },
      { $set: updatedData },
      { new: true, runValidators: true }
    ).lean();

    res.json({
      success: true,
      message: 'Learning session updated successfully',
      data: updatedSession
    });

  } catch (error) {
    logger.error('Error updating session:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update session'
    });
  }
});

/**
 * @route GET /api/sessions/current/active
 * @desc Get current active session for user
 * @access Private
 */
router.get('/current/active', async (req, res) => {
  try {
    const userId = req.userContext.userId;

    const { LearningSession } = require('../../../../shared/schemas/userActivity');
    
    // Find active session (no end_time)
    const activeSession = await LearningSession.findOne({
      user_id: userId,
      end_time: { $exists: false }
    }).sort({ start_time: -1 }).lean();

    if (!activeSession) {
      return res.json({
        success: true,
        data: null,
        message: 'No active session found'
      });
    }

    // Calculate session duration
    const duration = (new Date() - new Date(activeSession.start_time)) / 1000;

    res.json({
      success: true,
      data: {
        ...activeSession,
        currentDuration: Math.round(duration)
      }
    });

  } catch (error) {
    logger.error('Error getting active session:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve active session'
    });
  }
});

/**
 * @route POST /api/sessions/current/end
 * @desc End current active session
 * @access Private
 */
router.post('/current/end', async (req, res) => {
  try {
    const userId = req.userContext.userId;
    const { outcomes = [] } = req.body;

    const { LearningSession } = require('../../../../shared/schemas/userActivity');
    
    // Find and update active session
    const updatedSession = await LearningSession.findOneAndUpdate(
      {
        user_id: userId,
        end_time: { $exists: false }
      },
      {
        $set: {
          end_time: new Date(),
          ...(outcomes.length > 0 && { outcomes })
        }
      },
      { new: true, sort: { start_time: -1 } }
    ).lean();

    if (!updatedSession) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No active session found to end'
      });
    }

    // Calculate final session metrics
    const duration = (new Date(updatedSession.end_time) - new Date(updatedSession.start_time)) / 1000;

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: {
        ...updatedSession,
        finalDuration: Math.round(duration)
      }
    });

  } catch (error) {
    logger.error('Error ending session:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to end session'
    });
  }
});

/**
 * @route GET /api/sessions/stats/summary
 * @desc Get session statistics summary for current user
 * @access Private
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.userContext.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { LearningSession } = require('../../../../shared/schemas/userActivity');
    
    const sessions = await LearningSession.find({
      user_id: userId,
      start_time: { $gte: startDate }
    }).lean();

    // Calculate comprehensive statistics
    const stats = {
      totalSessions: sessions.length,
      totalLearningTime: 0,
      avgSessionDuration: 0,
      avgCompletionRate: 0,
      avgEngagementScore: 0,
      totalMaterialsAccessed: 0,
      uniqueMaterialsAccessed: new Set(),
      totalInteractions: 0,
      totalNotes: 0,
      totalBookmarks: 0,
      learningStreak: 0,
      mostActiveDay: null,
      mostActiveHour: null,
      outcomesSummary: {
        skills_acquired: 0,
        concepts_understood: 0,
        problems_solved: 0,
        goals_achieved: 0
      }
    };

    if (sessions.length > 0) {
      let totalDuration = 0;
      let totalCompletion = 0;
      let totalEngagement = 0;
      let durationCount = 0;
      const dailyActivity = {};
      const hourlyActivity = {};

      sessions.forEach(session => {
        // Duration calculation
        if (session.start_time && session.end_time) {
          const duration = (new Date(session.end_time) - new Date(session.start_time)) / 1000;
          totalDuration += duration;
          durationCount++;
        }

        // Completion and engagement
        totalCompletion += session.completion_rate || 0;
        totalEngagement += session.engagement_score || 0;

        // Materials and interactions
        stats.totalMaterialsAccessed += session.materials_accessed.length;
        session.materials_accessed.forEach(material => {
          stats.uniqueMaterialsAccessed.add(material.material_id.toString());
          stats.totalInteractions += material.interactions?.length || 0;
          if (material.notes_taken) stats.totalNotes++;
          if (material.bookmarked) stats.totalBookmarks++;
        });

        // Outcomes
        session.outcomes?.forEach(outcome => {
          stats.outcomesSummary[outcome.outcome_type] = 
            (stats.outcomesSummary[outcome.outcome_type] || 0) + 1;
        });

        // Activity patterns
        const date = new Date(session.start_time).toDateString();
        const hour = new Date(session.start_time).getHours();
        
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
      });

      // Calculate averages
      stats.totalLearningTime = totalDuration;
      stats.avgSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
      stats.avgCompletionRate = Math.round(totalCompletion / sessions.length);
      stats.avgEngagementScore = Math.round(totalEngagement / sessions.length);
      stats.uniqueMaterialsAccessed = stats.uniqueMaterialsAccessed.size;

      // Find most active patterns
      const sortedDays = Object.entries(dailyActivity).sort(([,a], [,b]) => b - a);
      const sortedHours = Object.entries(hourlyActivity).sort(([,a], [,b]) => b - a);
      
      stats.mostActiveDay = sortedDays[0]?.[0];
      stats.mostActiveHour = sortedHours[0]?.[0];

      // Calculate learning streak (consecutive days with sessions)
      const sortedDates = Object.keys(dailyActivity).sort((a, b) => new Date(b) - new Date(a));
      let streak = 0;
      let currentDate = new Date();
      
      for (const dateStr of sortedDates) {
        const sessionDate = new Date(dateStr);
        const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
          currentDate = sessionDate;
        } else {
          break;
        }
      }
      stats.learningStreak = streak;
    }

    res.json({
      success: true,
      data: {
        ...stats,
        timeRange: {
          days: parseInt(days),
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Error getting session stats summary:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve session statistics'
    });
  }
});

module.exports = router;