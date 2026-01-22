const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validation');

/**
 * Categorization Routes
 * Handles hierarchical categorization and tagging systems
 */

/**
 * POST /api/categorization/categorize
 * Categorize material based on metadata and content
 */
router.post('/categorize', validationMiddleware.validateCategorizationInput, async (req, res) => {
  try {
    const { metadata, contentAnalysis } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.categorizationSystem.categorize(metadata, contentAnalysis);

    if (result.success) {
      res.json({
        success: true,
        categorization: result.categorization,
        enhanced_metadata: result.metadata_enhanced
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/hierarchy
 * Get the complete category hierarchy
 */
router.get('/hierarchy', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const hierarchy = materialService.categorizationSystem.categoryTree;

    res.json({
      success: true,
      hierarchy,
      total_categories: Object.keys(hierarchy).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/hierarchy/:category
 * Get specific category branch
 */
router.get('/hierarchy/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const materialService = req.app.locals.materialManagementService;
    const hierarchy = materialService.categorizationSystem.categoryTree;

    const categoryData = hierarchy[category];
    if (!categoryData) {
      return res.status(404).json({
        success: false,
        error: `Category '${category}' not found`
      });
    }

    res.json({
      success: true,
      category: category,
      data: categoryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/tags/relationships
 * Get tag relationships and synonyms
 */
router.get('/tags/relationships', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const relationships = materialService.categorizationSystem.tagRelationships;

    res.json({
      success: true,
      relationships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/tags/suggest/:term
 * Get tag suggestions for a term
 */
router.get('/tags/suggest/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const materialService = req.app.locals.materialManagementService;
    const relationships = materialService.categorizationSystem.tagRelationships;

    const suggestions = {
      synonyms: relationships.synonyms[term] || [],
      related: relationships.related[term] || [],
      hierarchical: relationships.hierarchical[term] || []
    };

    res.json({
      success: true,
      term,
      suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/semantic-connections
 * Get semantic connections between concepts
 */
router.get('/semantic-connections', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const connections = materialService.categorizationSystem.semanticConnections;

    res.json({
      success: true,
      semantic_connections: connections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/prerequisites/:subject
 * Get prerequisites for a subject
 */
router.get('/prerequisites/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const materialService = req.app.locals.materialManagementService;
    const connections = materialService.categorizationSystem.semanticConnections;

    const prerequisites = connections.conceptual_relationships.prerequisite[subject] || [];

    res.json({
      success: true,
      subject,
      prerequisites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/difficulty-progression/:subject
 * Get difficulty progression for a subject
 */
router.get('/difficulty-progression/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const materialService = req.app.locals.materialManagementService;
    const connections = materialService.categorizationSystem.semanticConnections;

    const progression = connections.difficulty_progression[subject] || [];

    res.json({
      success: true,
      subject,
      progression
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/dynamic-stats
 * Get dynamic categorization statistics
 */
router.get('/dynamic-stats', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const dynamicCategories = materialService.categorizationSystem.dynamicCategories;

    const stats = {};
    for (const [category, data] of dynamicCategories.entries()) {
      stats[category] = {
        usage_count: data.usage_count,
        common_tags: Array.from(data.common_tags.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count })),
        difficulty_distribution: Object.fromEntries(data.difficulty_distribution),
        content_types: Object.fromEntries(data.content_types),
        last_updated: data.last_updated
      };
    }

    res.json({
      success: true,
      dynamic_stats: stats,
      total_categories: dynamicCategories.size
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/categorization/find-category
 * Find category for given criteria
 */
router.post('/find-category', validationMiddleware.validateCategorySearch, async (req, res) => {
  try {
    const { searchType, searchValue } = req.body;
    const materialService = req.app.locals.materialManagementService;

    let category = null;
    switch (searchType) {
      case 'subject':
        category = materialService.categorizationSystem.findCategoryBySubject(searchValue);
        break;
      case 'topic':
        category = materialService.categorizationSystem.findCategoryByTopic(searchValue);
        break;
      case 'tag':
        category = materialService.categorizationSystem.findCategoryByTag(searchValue);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid search type. Must be: subject, topic, or tag'
        });
    }

    res.json({
      success: true,
      search_type: searchType,
      search_value: searchValue,
      category: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/popular-categories
 * Get most popular categories based on usage
 */
router.get('/popular-categories', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const materialService = req.app.locals.materialManagementService;
    const dynamicCategories = materialService.categorizationSystem.dynamicCategories;

    const popularCategories = Array.from(dynamicCategories.entries())
      .sort(([,a], [,b]) => b.usage_count - a.usage_count)
      .slice(0, parseInt(limit))
      .map(([category, data]) => ({
        category,
        usage_count: data.usage_count,
        last_updated: data.last_updated
      }));

    res.json({
      success: true,
      popular_categories: popularCategories,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/categorization/trending-tags
 * Get trending tags across all categories
 */
router.get('/trending-tags', async (req, res) => {
  try {
    const { limit = 20, timeframe = '7d' } = req.query;
    const materialService = req.app.locals.materialManagementService;
    const dynamicCategories = materialService.categorizationSystem.dynamicCategories;

    // Calculate time threshold
    const timeThreshold = new Date();
    switch (timeframe) {
      case '1d':
        timeThreshold.setDate(timeThreshold.getDate() - 1);
        break;
      case '7d':
        timeThreshold.setDate(timeThreshold.getDate() - 7);
        break;
      case '30d':
        timeThreshold.setDate(timeThreshold.getDate() - 30);
        break;
      default:
        timeThreshold.setDate(timeThreshold.getDate() - 7);
    }

    // Aggregate tags from recent categories
    const tagCounts = new Map();
    for (const [category, data] of dynamicCategories.entries()) {
      if (data.last_updated >= timeThreshold) {
        for (const [tag, count] of data.common_tags.entries()) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + count);
        }
      }
    }

    const trendingTags = Array.from(tagCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, parseInt(limit))
      .map(([tag, count]) => ({ tag, count }));

    res.json({
      success: true,
      trending_tags: trendingTags,
      timeframe,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;