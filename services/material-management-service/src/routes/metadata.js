const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validation');

/**
 * Metadata Collection Routes
 * Handles comprehensive metadata collection, validation, and enhancement
 */

/**
 * POST /api/metadata/collect
 * Collect and validate metadata for a material
 */
router.post('/collect', validationMiddleware.validateMetadataCollection, async (req, res) => {
  try {
    const { materialData, userInput, contentType } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.processEnhancedMetadata(
      materialData,
      userInput,
      contentType
    );

    if (result.success) {
      res.json({
        success: true,
        metadata: result.enhanced_metadata,
        categorization: result.categorization,
        custom_fields: result.custom_fields,
        warnings: result.validation_warnings,
        suggestions: result.suggestions,
        processing_steps: result.processing_steps
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        field: result.field,
        suggestions: result.suggestions
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
 * POST /api/metadata/validate
 * Validate metadata without full processing
 */
router.post('/validate', validationMiddleware.validateMetadataInput, async (req, res) => {
  try {
    const { userInput, contentType } = req.body;
    const materialService = req.app.locals.materialManagementService;

    // Validate basic metadata
    const metadataResult = await materialService.metadataCollector.validateBasicMetadata(userInput);
    
    // Validate custom fields
    const customFieldsResult = await materialService.customFieldManager.validateCustomFields(
      contentType,
      userInput.customFields || {}
    );

    res.json({
      success: true,
      validation_results: {
        basic_metadata: {
          valid: true,
          validated_fields: metadataResult
        },
        custom_fields: customFieldsResult
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      field: error.field
    });
  }
});

/**
 * GET /api/metadata/suggestions/:contentType
 * Get metadata suggestions for a content type
 */
router.get('/suggestions/:contentType', async (req, res) => {
  try {
    const { contentType } = req.params;
    const { subject, topics, difficulty_level } = req.query;
    const materialService = req.app.locals.materialManagementService;

    const suggestions = {
      tags: [],
      topics: [],
      related_subjects: [],
      learning_objectives: [],
      target_audience: []
    };

    // Generate tag suggestions based on subject
    if (subject) {
      const relatedSubjects = materialService.metadataCollector.findRelatedSubjects(subject);
      suggestions.related_subjects = relatedSubjects;
    }

    // Generate topic suggestions
    if (topics) {
      const topicArray = Array.isArray(topics) ? topics : [topics];
      for (const topic of topicArray) {
        const topicSuggestions = await materialService.metadataCollector.extractTopicsFromContent(topic);
        suggestions.topics.push(...topicSuggestions);
      }
    }

    // Generate audience suggestions based on difficulty
    if (difficulty_level) {
      const audienceSuggestions = materialService.metadataCollector.suggestTargetAudienceExpansion(
        [],
        difficulty_level
      );
      suggestions.target_audience = audienceSuggestions;
    }

    // Get content-type specific suggestions
    const template = materialService.customFieldManager.getFieldTemplate(contentType);
    suggestions.content_specific_fields = Object.keys(template.fields);

    res.json({
      success: true,
      suggestions,
      content_type: contentType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metadata/templates
 * Get all available metadata templates
 */
router.get('/templates', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const templates = materialService.customFieldManager.getAllFieldTemplates();

    res.json({
      success: true,
      templates,
      total_count: templates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metadata/templates/:contentType
 * Get metadata template for specific content type
 */
router.get('/templates/:contentType', async (req, res) => {
  try {
    const { contentType } = req.params;
    const materialService = req.app.locals.materialManagementService;

    const template = materialService.customFieldManager.getFieldTemplate(contentType);

    res.json({
      success: true,
      template,
      content_type: contentType
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/metadata/analyze-content
 * Analyze content to suggest metadata
 */
router.post('/analyze-content', validationMiddleware.validateContentAnalysis, async (req, res) => {
  try {
    const { content, contentType, title } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const analysis = {
      suggested_tags: [],
      suggested_topics: [],
      detected_difficulty: null,
      reading_level: null,
      estimated_study_time: null
    };

    // Analyze text content
    if (content || title) {
      const text = (content || '') + ' ' + (title || '');
      analysis.suggested_tags = await materialService.metadataCollector.extractTagsFromContent(text);
      analysis.suggested_topics = await materialService.metadataCollector.extractTopicsFromContent(text);
      analysis.detected_difficulty = await materialService.metadataCollector.detectContentDifficulty(text);
    }

    // Content-type specific analysis
    if (contentType === 'text' && content) {
      analysis.reading_level = materialService.metadataCollector.detectReadingLevel(content);
      analysis.word_count = materialService.metadataCollector.calculateWordCount(content);
      analysis.estimated_study_time = Math.ceil(analysis.word_count / 200); // 200 words per minute
      analysis.has_images = materialService.metadataCollector.detectImages(content);
      analysis.has_code_examples = materialService.metadataCollector.detectCodeExamples(content);
    }

    res.json({
      success: true,
      analysis,
      content_type: contentType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metadata/validation-rules
 * Get validation rules for metadata fields
 */
router.get('/validation-rules', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const validationRules = materialService.metadataCollector.validationRules;

    res.json({
      success: true,
      validation_rules: validationRules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metadata/subjects
 * Get list of available subjects
 */
router.get('/subjects', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const subjects = materialService.metadataCollector.validationRules.subject.allowedValues;

    res.json({
      success: true,
      subjects: subjects.map(subject => ({
        value: subject,
        label: subject.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        related: materialService.metadataCollector.findRelatedSubjects(subject)
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metadata/difficulty-levels
 * Get available difficulty levels with descriptions
 */
router.get('/difficulty-levels', async (req, res) => {
  try {
    const difficultyLevels = [
      {
        value: 'beginner',
        label: 'Beginner',
        description: 'Introductory level, no prior knowledge required',
        target_audience: ['undergraduate', 'beginner']
      },
      {
        value: 'intermediate',
        label: 'Intermediate',
        description: 'Some background knowledge helpful',
        target_audience: ['undergraduate', 'graduate', 'intermediate']
      },
      {
        value: 'advanced',
        label: 'Advanced',
        description: 'Significant prior knowledge required',
        target_audience: ['graduate', 'postgraduate', 'advanced']
      },
      {
        value: 'expert',
        label: 'Expert',
        description: 'Specialized knowledge for professionals',
        target_audience: ['postgraduate', 'professional']
      }
    ];

    res.json({
      success: true,
      difficulty_levels: difficultyLevels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metadata/languages
 * Get supported languages for materials
 */
router.get('/languages', async (req, res) => {
  try {
    const languages = [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'es', name: 'Spanish', native: 'Español' },
      { code: 'fr', name: 'French', native: 'Français' },
      { code: 'de', name: 'German', native: 'Deutsch' },
      { code: 'zh', name: 'Chinese', native: '中文' },
      { code: 'ja', name: 'Japanese', native: '日本語' },
      { code: 'ko', name: 'Korean', native: '한국어' },
      { code: 'pt', name: 'Portuguese', native: 'Português' },
      { code: 'ru', name: 'Russian', native: 'Русский' },
      { code: 'ar', name: 'Arabic', native: 'العربية' },
      { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
      { code: 'it', name: 'Italian', native: 'Italiano' },
      { code: 'nl', name: 'Dutch', native: 'Nederlands' },
      { code: 'sv', name: 'Swedish', native: 'Svenska' },
      { code: 'no', name: 'Norwegian', native: 'Norsk' }
    ];

    res.json({
      success: true,
      languages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/metadata/bulk-validate
 * Validate metadata for multiple materials
 */
router.post('/bulk-validate', validationMiddleware.validateBulkMetadata, async (req, res) => {
  try {
    const { materials } = req.body;
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
          metadata: result.success ? result.enhanced_metadata : null,
          warnings: result.validation_warnings || [],
          error: result.success ? null : result.error
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          metadata: null,
          warnings: [],
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

module.exports = router;