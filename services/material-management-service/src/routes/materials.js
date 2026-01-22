const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validation');

/**
 * Materials Routes
 * Handles enhanced material management with metadata processing
 */

/**
 * POST /api/materials
 * Create a new material with enhanced metadata
 */
router.post('/', validationMiddleware.validateMaterialCreation, async (req, res) => {
  try {
    const { materialData, userInput } = req.body;
    const userId = req.user.id; // From auth middleware
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.createEnhancedMaterial(
      materialData,
      userInput,
      userId
    );

    if (result.success) {
      res.status(201).json({
        success: true,
        material: result.material,
        metadata_processing: result.metadata_processing,
        material_id: result.material_id
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/materials/:id
 * Get material with enhanced metadata
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { populate_references = false } = req.query;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.getMaterialWithMetadata(id, {
      populate_references: populate_references === 'true'
    });

    if (result.success) {
      res.json({
        success: true,
        material: result.material,
        metadata_summary: result.metadata_summary
      });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/materials/:id/metadata
 * Update material metadata
 */
router.put('/:id/metadata', validationMiddleware.validateMetadataUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { metadataUpdates } = req.body;
    const userId = req.user.id;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.updateMaterialMetadata(
      id,
      metadataUpdates,
      userId
    );

    if (result.success) {
      res.json({
        success: true,
        material: result.material,
        metadata_processing: result.metadata_processing,
        version_created: result.version_created
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/materials/search
 * Search materials with enhanced metadata filtering
 */
router.get('/search', async (req, res) => {
  try {
    const searchCriteria = {
      text: req.query.q,
      subject: req.query.subject,
      difficulty_level: req.query.difficulty,
      category: req.query.category,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      content_type: req.query.content_type,
      min_quality_score: req.query.min_quality ? parseFloat(req.query.min_quality) : undefined,
      date_range: req.query.start_date || req.query.end_date ? {
        start: req.query.start_date,
        end: req.query.end_date
      } : undefined,
      custom_fields: req.query.custom_fields ? JSON.parse(req.query.custom_fields) : undefined
    };

    const options = {
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      sort_by: req.query.sort || 'date_desc',
      populate_metadata: req.query.populate === 'true'
    };

    const materialService = req.app.locals.materialManagementService;
    const result = await materialService.searchMaterialsWithMetadata(searchCriteria, options);

    if (result.success) {
      res.json({
        success: true,
        materials: result.materials,
        total_count: result.total_count,
        search_metadata: result.search_metadata,
        pagination: {
          limit: options.limit,
          offset: options.offset,
          has_more: result.total_count > (options.offset + options.limit)
        }
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/materials/:id/suggestions
 * Get metadata improvement suggestions for a material
 */
router.get('/:id/suggestions', async (req, res) => {
  try {
    const { id } = req.params;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.getMetadataImprovementSuggestions(id);

    if (result.success) {
      res.json({
        success: true,
        suggestions: result.suggestions,
        completeness_score: result.completeness_score,
        priority_suggestions: result.priority_suggestions
      });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/materials/analytics/metadata
 * Get metadata usage analytics
 */
router.get('/analytics/metadata', async (req, res) => {
  try {
    const filters = {
      subject: req.query.subject,
      content_type: req.query.content_type,
      date_range: req.query.start_date || req.query.end_date ? {
        start: req.query.start_date,
        end: req.query.end_date
      } : undefined
    };

    const materialService = req.app.locals.materialManagementService;
    const result = await materialService.getMetadataAnalytics(filters);

    if (result.success) {
      res.json({
        success: true,
        analytics: result.analytics,
        generated_at: result.generated_at,
        filters_applied: result.filters_applied
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/materials/:id/versions
 * Get version history for a material
 */
router.get('/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const EnhancedStudyMaterial = require('../../../../shared/schemas/enhancedMaterial');
    const material = await EnhancedStudyMaterial.findById(id).select('versions current_version');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    const versions = material.versions
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      versions,
      current_version: material.current_version,
      total_versions: material.versions.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: material.versions.length > (parseInt(offset) + parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/materials/:id/related
 * Get related materials based on metadata
 */
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;
    
    const EnhancedStudyMaterial = require('../../../../shared/schemas/enhancedMaterial');
    const material = await EnhancedStudyMaterial.findById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    // Find related materials based on subject, tags, and categories
    const relatedMaterials = await EnhancedStudyMaterial.find({
      _id: { $ne: id },
      $or: [
        { 'metadata.subject': material.metadata.subject },
        { tags: { $in: material.tags || [] } },
        { categories: { $in: material.categories || [] } },
        { 'metadata.primary_category': material.metadata.primary_category }
      ],
      status: 'approved',
      visibility: 'public'
    })
    .limit(parseInt(limit))
    .select('title description metadata.subject tags categories analytics.view_count quality.community_rating')
    .sort({ 'analytics.view_count': -1, 'quality.community_rating': -1 });

    res.json({
      success: true,
      related_materials: relatedMaterials,
      material_id: id,
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
 * POST /api/materials/bulk-process
 * Process metadata for multiple materials
 */
router.post('/bulk-process', validationMiddleware.validateBulkMaterialProcessing, async (req, res) => {
  try {
    const { materials } = req.body;
    const userId = req.user.id;
    const materialService = req.app.locals.materialManagementService;

    const results = [];
    
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      try {
        const result = await materialService.processEnhancedMetadata(
          material.materialData || {},
          material.userInput,
          material.contentType
        );
        
        results.push({
          index: i,
          success: result.success,
          enhanced_metadata: result.success ? result.enhanced_metadata : null,
          categorization: result.success ? result.categorization : null,
          warnings: result.validation_warnings || [],
          suggestions: result.suggestions || [],
          error: result.success ? null : result.error
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          enhanced_metadata: null,
          categorization: null,
          warnings: [],
          suggestions: [],
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;

    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: errorCount,
        success_rate: (successCount / results.length) * 100
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/materials/stats/overview
 * Get overview statistics for materials
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const EnhancedStudyMaterial = require('../../../../shared/schemas/enhancedMaterial');
    
    const stats = await EnhancedStudyMaterial.aggregate([
      {
        $group: {
          _id: null,
          total_materials: { $sum: 1 },
          by_status: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          by_content_type: {
            $push: {
              content_type: '$content_type',
              count: 1
            }
          },
          by_subject: {
            $push: {
              subject: '$metadata.subject',
              count: 1
            }
          },
          avg_quality_score: { $avg: '$quality.community_rating' },
          total_views: { $sum: '$analytics.view_count' },
          total_downloads: { $sum: '$analytics.download_count' }
        }
      }
    ]);

    // Process aggregation results
    const overview = stats[0] || {
      total_materials: 0,
      by_status: [],
      by_content_type: [],
      by_subject: [],
      avg_quality_score: 0,
      total_views: 0,
      total_downloads: 0
    };

    // Group by status
    const statusCounts = {};
    overview.by_status.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    // Group by content type
    const contentTypeCounts = {};
    overview.by_content_type.forEach(item => {
      contentTypeCounts[item.content_type] = (contentTypeCounts[item.content_type] || 0) + 1;
    });

    // Group by subject
    const subjectCounts = {};
    overview.by_subject.forEach(item => {
      if (item.subject) {
        subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
      }
    });

    res.json({
      success: true,
      overview: {
        total_materials: overview.total_materials,
        status_distribution: statusCounts,
        content_type_distribution: contentTypeCounts,
        subject_distribution: subjectCounts,
        avg_quality_score: Math.round(overview.avg_quality_score * 100) / 100,
        total_views: overview.total_views,
        total_downloads: overview.total_downloads
      },
      generated_at: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;