const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validation');

/**
 * Custom Fields Routes
 * Handles custom metadata field management for different material types
 */

/**
 * GET /api/custom-fields/templates
 * Get all field templates
 */
router.get('/templates', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const templates = materialService.customFieldManager.getAllFieldTemplates();

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/custom-fields/templates/:materialType
 * Get field template for specific material type
 */
router.get('/templates/:materialType', async (req, res) => {
  try {
    const { materialType } = req.params;
    const materialService = req.app.locals.materialManagementService;

    const template = materialService.customFieldManager.getFieldTemplate(materialType);

    res.json({
      success: true,
      template,
      material_type: materialType
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/custom-fields/validate
 * Validate custom fields for a material type
 */
router.post('/validate', validationMiddleware.validateCustomFieldsInput, async (req, res) => {
  try {
    const { materialType, customFields } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.customFieldManager.validateCustomFields(
      materialType,
      customFields
    );

    res.json({
      success: true,
      validation_result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/custom-fields/create
 * Create a new custom field for a material type
 */
router.post('/create', validationMiddleware.validateCustomFieldCreation, async (req, res) => {
  try {
    const { materialType, fieldName, fieldConfig } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.customFieldManager.createCustomField(
      materialType,
      fieldName,
      fieldConfig
    );

    if (result.success) {
      res.status(201).json(result);
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
 * PUT /api/custom-fields/:materialType/:fieldName
 * Update an existing custom field
 */
router.put('/:materialType/:fieldName', validationMiddleware.validateCustomFieldUpdate, async (req, res) => {
  try {
    const { materialType, fieldName } = req.params;
    const { updates } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.customFieldManager.updateCustomField(
      materialType,
      fieldName,
      updates
    );

    if (result.success) {
      res.json(result);
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
 * DELETE /api/custom-fields/:materialType/:fieldName
 * Delete a custom field
 */
router.delete('/:materialType/:fieldName', async (req, res) => {
  try {
    const { materialType, fieldName } = req.params;
    const materialService = req.app.locals.materialManagementService;

    const result = await materialService.customFieldManager.deleteCustomField(
      materialType,
      fieldName
    );

    if (result.success) {
      res.json(result);
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
 * GET /api/custom-fields/usage-stats
 * Get field usage statistics
 */
router.get('/usage-stats', async (req, res) => {
  try {
    const { materialType, fieldName } = req.query;
    const materialService = req.app.locals.materialManagementService;

    const stats = materialService.customFieldManager.getFieldUsageStats(materialType, fieldName);

    res.json({
      success: true,
      usage_stats: stats,
      filters: { materialType, fieldName }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/custom-fields/validation-rules
 * Get validation rules for custom fields
 */
router.get('/validation-rules', async (req, res) => {
  try {
    const materialService = req.app.locals.materialManagementService;
    const validationRules = materialService.customFieldManager.validationRules;

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
 * GET /api/custom-fields/field-types
 * Get available field types and their configurations
 */
router.get('/field-types', async (req, res) => {
  try {
    const fieldTypes = [
      {
        type: 'text',
        label: 'Text',
        description: 'Single line text input',
        properties: ['min_length', 'max_length', 'pattern', 'placeholder']
      },
      {
        type: 'number',
        label: 'Number',
        description: 'Numeric input with validation',
        properties: ['min', 'max', 'integer', 'step']
      },
      {
        type: 'boolean',
        label: 'Boolean',
        description: 'True/false checkbox',
        properties: ['default']
      },
      {
        type: 'select',
        label: 'Select',
        description: 'Single selection from predefined options',
        properties: ['options', 'default']
      },
      {
        type: 'multi_select',
        label: 'Multi-Select',
        description: 'Multiple selections from predefined options',
        properties: ['options', 'min_selections', 'max_selections']
      },
      {
        type: 'date',
        label: 'Date',
        description: 'Date picker input',
        properties: ['min_date', 'max_date', 'format']
      },
      {
        type: 'array',
        label: 'Array',
        description: 'List of items with validation',
        properties: ['min_items', 'max_items', 'item_schema']
      },
      {
        type: 'object',
        label: 'Object',
        description: 'Structured object with schema validation',
        properties: ['schema', 'required_fields']
      }
    ];

    res.json({
      success: true,
      field_types: fieldTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/custom-fields/bulk-validate
 * Validate custom fields for multiple materials
 */
router.post('/bulk-validate', validationMiddleware.validateBulkCustomFields, async (req, res) => {
  try {
    const { materials } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const results = [];
    
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      try {
        const result = await materialService.customFieldManager.validateCustomFields(
          material.materialType,
          material.customFields
        );
        
        results.push({
          index: i,
          material_type: material.materialType,
          validation_result: result
        });
      } catch (error) {
        results.push({
          index: i,
          material_type: material.materialType,
          validation_result: {
            valid: false,
            errors: [{ field: null, message: error.message }]
          }
        });
      }
    }

    const validCount = results.filter(r => r.validation_result.valid).length;
    const invalidCount = results.length - validCount;

    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        valid: validCount,
        invalid: invalidCount,
        validation_rate: (validCount / results.length) * 100
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
 * GET /api/custom-fields/suggestions/:materialType
 * Get field suggestions for a material type
 */
router.get('/suggestions/:materialType', async (req, res) => {
  try {
    const { materialType } = req.params;
    const { existingFields } = req.query;
    const materialService = req.app.locals.materialManagementService;

    const template = materialService.customFieldManager.getFieldTemplate(materialType);
    const existing = existingFields ? existingFields.split(',') : [];
    
    const suggestions = await materialService.customFieldManager.generateFieldSuggestions(
      materialType,
      Object.fromEntries(existing.map(field => [field, true])),
      template
    );

    res.json({
      success: true,
      material_type: materialType,
      suggestions,
      existing_fields: existing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/custom-fields/popular-fields/:materialType
 * Get most popular fields for a material type
 */
router.get('/popular-fields/:materialType', async (req, res) => {
  try {
    const { materialType } = req.params;
    const { limit = 10 } = req.query;
    const materialService = req.app.locals.materialManagementService;

    const stats = materialService.customFieldManager.getFieldUsageStats(materialType);
    
    const popularFields = Object.entries(stats)
      .sort(([,a], [,b]) => b.usage_count - a.usage_count)
      .slice(0, parseInt(limit))
      .map(([field, data]) => ({
        field_name: field,
        usage_count: data.usage_count,
        last_used: data.last_used
      }));

    res.json({
      success: true,
      material_type: materialType,
      popular_fields: popularFields,
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
 * POST /api/custom-fields/export-template
 * Export field template for backup or sharing
 */
router.post('/export-template', async (req, res) => {
  try {
    const { materialTypes } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const exportData = {
      exported_at: new Date().toISOString(),
      version: '1.0',
      templates: {}
    };

    for (const materialType of materialTypes) {
      try {
        const template = materialService.customFieldManager.getFieldTemplate(materialType);
        exportData.templates[materialType] = template;
      } catch (error) {
        // Skip invalid material types
        continue;
      }
    }

    res.json({
      success: true,
      export_data: exportData,
      exported_types: Object.keys(exportData.templates)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/custom-fields/import-template
 * Import field template from backup
 */
router.post('/import-template', validationMiddleware.validateTemplateImport, async (req, res) => {
  try {
    const { templateData, overwrite = false } = req.body;
    const materialService = req.app.locals.materialManagementService;

    const results = {
      imported: [],
      skipped: [],
      errors: []
    };

    for (const [materialType, template] of Object.entries(templateData.templates)) {
      try {
        // Check if template already exists
        const existingTemplate = materialService.customFieldManager.fieldTemplates[materialType];
        
        if (existingTemplate && !overwrite) {
          results.skipped.push({
            material_type: materialType,
            reason: 'Template already exists and overwrite is false'
          });
          continue;
        }

        // Import template
        materialService.customFieldManager.fieldTemplates[materialType] = template;
        results.imported.push(materialType);
        
      } catch (error) {
        results.errors.push({
          material_type: materialType,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      import_results: results,
      summary: {
        imported_count: results.imported.length,
        skipped_count: results.skipped.length,
        error_count: results.errors.length
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