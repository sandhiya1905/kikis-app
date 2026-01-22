const MetadataCollector = require('./metadataCollector');
const CategorizationSystem = require('./categorizationSystem');
const CustomFieldManager = require('./customFieldManager');
const EnhancedStudyMaterial = require('../../../../shared/schemas/enhancedMaterial');

/**
 * Material Management Service
 * Main service that orchestrates metadata collection, categorization,
 * and custom field management for enhanced material storage
 */
class MaterialManagementService {
  constructor() {
    this.metadataCollector = new MetadataCollector();
    this.categorizationSystem = new CategorizationSystem();
    this.customFieldManager = new CustomFieldManager();
  }

  /**
   * Process comprehensive metadata for a new material
   * @param {Object} materialData - Raw material data
   * @param {Object} userInput - User-provided metadata
   * @param {string} contentType - Type of content
   * @returns {Object} Processing result with enhanced metadata
   */
  async processEnhancedMetadata(materialData, userInput, contentType) {
    try {
      const processingResult = {
        success: true,
        enhanced_metadata: null,
        categorization: null,
        custom_fields: null,
        validation_warnings: [],
        suggestions: [],
        processing_steps: []
      };

      // Step 1: Collect and validate basic metadata
      processingResult.processing_steps.push('Collecting basic metadata');
      const metadataResult = await this.metadataCollector.collectMetadata(
        materialData,
        userInput,
        contentType
      );

      if (!metadataResult.success) {
        return {
          success: false,
          error: metadataResult.error,
          field: metadataResult.field,
          suggestions: metadataResult.suggestions
        };
      }

      processingResult.enhanced_metadata = metadataResult.metadata;
      processingResult.validation_warnings.push(...(metadataResult.warnings || []));
      processingResult.suggestions.push(...(metadataResult.suggestions || []));

      // Step 2: Apply hierarchical categorization
      processingResult.processing_steps.push('Applying categorization');
      const categorizationResult = await this.categorizationSystem.categorize(
        metadataResult.metadata,
        { detectedTopics: metadataResult.suggestions?.topics || [] }
      );

      if (categorizationResult.success) {
        processingResult.categorization = categorizationResult.categorization;
        processingResult.enhanced_metadata = categorizationResult.metadata_enhanced;
        processingResult.suggestions.push(...(categorizationResult.categorization.suggestions || []));
      } else {
        processingResult.validation_warnings.push({
          type: 'categorization_warning',
          message: `Categorization failed: ${categorizationResult.error}`
        });
      }

      // Step 3: Validate and process custom fields
      processingResult.processing_steps.push('Processing custom fields');
      const customFieldsResult = await this.customFieldManager.validateCustomFields(
        contentType,
        userInput.customFields || {}
      );

      if (customFieldsResult.valid) {
        processingResult.custom_fields = customFieldsResult.validated_fields;
        processingResult.validation_warnings.push(...customFieldsResult.warnings);
        processingResult.suggestions.push(...customFieldsResult.suggestions);
      } else {
        // Custom field validation errors are non-fatal
        processingResult.validation_warnings.push({
          type: 'custom_fields_warning',
          message: 'Custom field validation failed',
          errors: customFieldsResult.errors
        });
        processingResult.custom_fields = {};
      }

      // Step 4: Generate final enhanced metadata structure
      processingResult.processing_steps.push('Finalizing metadata structure');
      const finalMetadata = await this.generateFinalMetadata(
        processingResult.enhanced_metadata,
        processingResult.categorization,
        processingResult.custom_fields,
        contentType
      );

      processingResult.enhanced_metadata = finalMetadata;

      // Step 5: Generate comprehensive suggestions
      processingResult.processing_steps.push('Generating suggestions');
      const comprehensiveSuggestions = await this.generateComprehensiveSuggestions(
        processingResult.enhanced_metadata,
        processingResult.categorization,
        processingResult.validation_warnings
      );

      processingResult.suggestions = [...processingResult.suggestions, ...comprehensiveSuggestions];

      return processingResult;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        processing_steps: ['Error occurred during metadata processing']
      };
    }
  }

  /**
   * Create a new material with enhanced metadata
   * @param {Object} materialData - Material data
   * @param {Object} userInput - User input
   * @param {string} userId - User ID
   * @returns {Object} Creation result
   */
  async createEnhancedMaterial(materialData, userInput, userId) {
    try {
      // Process enhanced metadata
      const metadataResult = await this.processEnhancedMetadata(
        materialData,
        userInput,
        userInput.content_type
      );

      if (!metadataResult.success) {
        return metadataResult;
      }

      // Create material document
      const materialDoc = new EnhancedStudyMaterial({
        title: userInput.title,
        description: userInput.description,
        content_type: userInput.content_type,
        file_path: materialData.file_path,
        url: userInput.url,
        content: userInput.content,
        metadata: metadataResult.enhanced_metadata,
        uploaded_by: userId,
        status: 'draft',
        visibility: userInput.visibility || 'public',
        tags: metadataResult.enhanced_metadata.tags || [],
        categories: metadataResult.enhanced_metadata.categories || [],
        file_info: materialData.file_info || {},
        versions: [{
          version_number: '1.0.0',
          created_by: userId,
          change_summary: 'Initial version',
          approval_status: 'draft',
          is_current: true,
          changes: []
        }]
      });

      // Add custom fields to metadata
      if (metadataResult.custom_fields && Object.keys(metadataResult.custom_fields).length > 0) {
        materialDoc.metadata.custom_fields = metadataResult.custom_fields;
      }

      // Save to database
      const savedMaterial = await materialDoc.save();

      return {
        success: true,
        material: savedMaterial,
        metadata_processing: metadataResult,
        material_id: savedMaterial._id
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update material metadata
   * @param {string} materialId - Material ID
   * @param {Object} metadataUpdates - Metadata updates
   * @param {string} userId - User ID
   * @returns {Object} Update result
   */
  async updateMaterialMetadata(materialId, metadataUpdates, userId) {
    try {
      const material = await EnhancedStudyMaterial.findById(materialId);
      if (!material) {
        throw new Error('Material not found');
      }

      // Process metadata updates
      const metadataResult = await this.processEnhancedMetadata(
        { content: material.content },
        metadataUpdates,
        material.content_type
      );

      if (!metadataResult.success) {
        return metadataResult;
      }

      // Create version entry for the update
      const changes = this.generateChangeLog(material.metadata, metadataResult.enhanced_metadata);
      const newVersion = {
        version_number: this.incrementVersion(material.current_version),
        created_by: userId,
        change_summary: metadataUpdates.change_summary || 'Metadata update',
        approval_status: 'draft',
        is_current: false,
        changes: changes
      };

      // Update material
      material.metadata = metadataResult.enhanced_metadata;
      material.tags = metadataResult.enhanced_metadata.tags || [];
      material.categories = metadataResult.enhanced_metadata.categories || [];
      material.versions.push(newVersion);
      material.last_modified = new Date();

      const updatedMaterial = await material.save();

      return {
        success: true,
        material: updatedMaterial,
        metadata_processing: metadataResult,
        version_created: newVersion.version_number
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get material with enhanced metadata
   * @param {string} materialId - Material ID
   * @param {Object} options - Query options
   * @returns {Object} Material with metadata
   */
  async getMaterialWithMetadata(materialId, options = {}) {
    try {
      let query = EnhancedStudyMaterial.findById(materialId);

      if (options.populate_references) {
        query = query.populate('metadata.prerequisites metadata.related_materials uploaded_by');
      }

      const material = await query.exec();
      if (!material) {
        throw new Error('Material not found');
      }

      // Enhance with dynamic categorization data
      const enhancedMaterial = await this.enhanceMaterialWithDynamicData(material);

      return {
        success: true,
        material: enhancedMaterial,
        metadata_summary: this.generateMetadataSummary(enhancedMaterial.metadata)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search materials with enhanced metadata filtering
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} options - Search options
   * @returns {Object} Search results
   */
  async searchMaterialsWithMetadata(searchCriteria, options = {}) {
    try {
      const query = this.buildEnhancedSearchQuery(searchCriteria);
      const sortOptions = this.buildSortOptions(options.sort_by);
      
      let materialsQuery = EnhancedStudyMaterial.find(query)
        .sort(sortOptions)
        .limit(options.limit || 20)
        .skip(options.offset || 0);

      if (options.populate_metadata) {
        materialsQuery = materialsQuery.populate('metadata.prerequisites metadata.related_materials');
      }

      const materials = await materialsQuery.exec();
      const totalCount = await EnhancedStudyMaterial.countDocuments(query);

      // Enhance results with categorization insights
      const enhancedResults = await Promise.all(
        materials.map(material => this.enhanceMaterialWithDynamicData(material))
      );

      return {
        success: true,
        materials: enhancedResults,
        total_count: totalCount,
        search_metadata: {
          query_processed: query,
          sort_applied: sortOptions,
          filters_applied: Object.keys(searchCriteria).length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get metadata suggestions for material improvement
   * @param {string} materialId - Material ID
   * @returns {Object} Suggestions
   */
  async getMetadataImprovementSuggestions(materialId) {
    try {
      const material = await EnhancedStudyMaterial.findById(materialId);
      if (!material) {
        throw new Error('Material not found');
      }

      const suggestions = [];

      // Analyze current metadata completeness
      const completenessAnalysis = this.analyzeMetadataCompleteness(material.metadata);
      suggestions.push(...completenessAnalysis.suggestions);

      // Get categorization suggestions
      const categorizationSuggestions = await this.categorizationSystem.generateCategorizationSuggestions(
        material.metadata,
        { primary_category: material.metadata.primary_category }
      );
      suggestions.push(...categorizationSuggestions);

      // Get custom field suggestions
      const customFieldSuggestions = await this.customFieldManager.generateFieldSuggestions(
        material.content_type,
        material.metadata.custom_fields || {},
        this.customFieldManager.getFieldTemplate(material.content_type)
      );
      suggestions.push(...customFieldSuggestions);

      // Analyze usage patterns for suggestions
      const usageBasedSuggestions = await this.generateUsageBasedSuggestions(material);
      suggestions.push(...usageBasedSuggestions);

      return {
        success: true,
        suggestions: suggestions,
        completeness_score: completenessAnalysis.score,
        priority_suggestions: suggestions.filter(s => s.priority === 'high').slice(0, 5)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get analytics for metadata usage patterns
   * @param {Object} filters - Analytics filters
   * @returns {Object} Analytics data
   */
  async getMetadataAnalytics(filters = {}) {
    try {
      const analytics = {
        field_usage: {},
        categorization_distribution: {},
        quality_metrics: {},
        trending_metadata: {}
      };

      // Analyze field usage patterns
      analytics.field_usage = await this.analyzeFieldUsagePatterns(filters);

      // Analyze categorization distribution
      analytics.categorization_distribution = await this.analyzeCategorization(filters);

      // Calculate quality metrics
      analytics.quality_metrics = await this.calculateQualityMetrics(filters);

      // Identify trending metadata
      analytics.trending_metadata = await this.identifyTrendingMetadata(filters);

      return {
        success: true,
        analytics: analytics,
        generated_at: new Date(),
        filters_applied: filters
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper methods

  /**
   * Generate final metadata structure
   */
  async generateFinalMetadata(basicMetadata, categorization, customFields, contentType) {
    const finalMetadata = {
      ...basicMetadata,
      custom_fields: customFields,
      content_type_specific: await this.getContentTypeSpecificMetadata(contentType, customFields),
      processing_metadata: {
        processed_at: new Date(),
        processing_version: '1.0',
        categorization_applied: !!categorization,
        custom_fields_count: Object.keys(customFields).length
      }
    };

    // Add categorization data if available
    if (categorization) {
      finalMetadata.primary_category = categorization.primary_category;
      finalMetadata.secondary_categories = categorization.secondary_categories;
      finalMetadata.category_path = categorization.category_path;
      finalMetadata.hierarchical_tags = categorization.hierarchical_tags;
      finalMetadata.semantic_tags = categorization.semantic_tags;
      finalMetadata.categorization_confidence = categorization.confidence_scores;
    }

    return finalMetadata;
  }

  /**
   * Generate comprehensive suggestions
   */
  async generateComprehensiveSuggestions(metadata, categorization, warnings) {
    const suggestions = [];

    // Quality improvement suggestions
    if (warnings.length > 0) {
      suggestions.push({
        type: 'quality_improvement',
        priority: 'medium',
        message: 'Address validation warnings to improve metadata quality',
        action: 'review_warnings',
        details: warnings
      });
    }

    // Completeness suggestions
    const completenessScore = this.calculateCompletenessScore(metadata);
    if (completenessScore < 0.8) {
      suggestions.push({
        type: 'completeness_improvement',
        priority: 'high',
        message: `Metadata is ${Math.round(completenessScore * 100)}% complete. Consider adding more details.`,
        action: 'add_missing_fields',
        missing_fields: this.identifyMissingFields(metadata)
      });
    }

    // Categorization suggestions
    if (!categorization || !categorization.primary_category) {
      suggestions.push({
        type: 'categorization_needed',
        priority: 'high',
        message: 'Material needs better categorization for improved discoverability',
        action: 'improve_subject_topics'
      });
    }

    return suggestions;
  }

  /**
   * Generate change log for version tracking
   */
  generateChangeLog(oldMetadata, newMetadata) {
    const changes = [];
    
    // Compare all fields recursively
    const compareObjects = (old, updated, path = '') => {
      for (const key in updated) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in old)) {
          changes.push({
            change_type: 'metadata',
            field_name: currentPath,
            old_value: null,
            new_value: updated[key],
            change_reason: 'Field added'
          });
        } else if (JSON.stringify(old[key]) !== JSON.stringify(updated[key])) {
          changes.push({
            change_type: 'metadata',
            field_name: currentPath,
            old_value: old[key],
            new_value: updated[key],
            change_reason: 'Field updated'
          });
        }
      }
      
      // Check for removed fields
      for (const key in old) {
        if (!(key in updated)) {
          const currentPath = path ? `${path}.${key}` : key;
          changes.push({
            change_type: 'metadata',
            field_name: currentPath,
            old_value: old[key],
            new_value: null,
            change_reason: 'Field removed'
          });
        }
      }
    };

    compareObjects(oldMetadata, newMetadata);
    return changes;
  }

  /**
   * Increment version number
   */
  incrementVersion(currentVersion) {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Enhance material with dynamic data
   */
  async enhanceMaterialWithDynamicData(material) {
    const enhanced = material.toObject();
    
    // Add dynamic categorization insights
    if (enhanced.metadata.primary_category) {
      const categoryStats = this.categorizationSystem.dynamicCategories.get(enhanced.metadata.primary_category);
      if (categoryStats) {
        enhanced.dynamic_insights = {
          category_popularity: categoryStats.usage_count,
          common_tags: Array.from(categoryStats.common_tags.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([tag]) => tag),
          difficulty_distribution: Object.fromEntries(categoryStats.difficulty_distribution)
        };
      }
    }

    return enhanced;
  }

  /**
   * Generate metadata summary
   */
  generateMetadataSummary(metadata) {
    return {
      completeness_score: this.calculateCompletenessScore(metadata),
      field_count: this.countMetadataFields(metadata),
      has_custom_fields: !!(metadata.custom_fields && Object.keys(metadata.custom_fields).length > 0),
      categorization_level: metadata.category_path ? metadata.category_path.length : 0,
      tag_count: (metadata.tags || []).length,
      last_updated: metadata.processing_metadata?.processed_at
    };
  }

  /**
   * Build enhanced search query
   */
  buildEnhancedSearchQuery(criteria) {
    const query = {};

    // Text search
    if (criteria.text) {
      query.$text = { $search: criteria.text };
    }

    // Subject filter
    if (criteria.subject) {
      query['metadata.subject'] = criteria.subject;
    }

    // Difficulty filter
    if (criteria.difficulty_level) {
      query['metadata.difficulty_level'] = criteria.difficulty_level;
    }

    // Category filter
    if (criteria.category) {
      query['metadata.primary_category'] = criteria.category;
    }

    // Tags filter
    if (criteria.tags && criteria.tags.length > 0) {
      query.tags = { $in: criteria.tags };
    }

    // Content type filter
    if (criteria.content_type) {
      query.content_type = criteria.content_type;
    }

    // Custom field filters
    if (criteria.custom_fields) {
      for (const [field, value] of Object.entries(criteria.custom_fields)) {
        query[`metadata.custom_fields.${field}`] = value;
      }
    }

    // Quality score filter
    if (criteria.min_quality_score) {
      query['quality.community_rating'] = { $gte: criteria.min_quality_score };
    }

    // Date range filter
    if (criteria.date_range) {
      const dateQuery = {};
      if (criteria.date_range.start) {
        dateQuery.$gte = new Date(criteria.date_range.start);
      }
      if (criteria.date_range.end) {
        dateQuery.$lte = new Date(criteria.date_range.end);
      }
      if (Object.keys(dateQuery).length > 0) {
        query.upload_date = dateQuery;
      }
    }

    return query;
  }

  /**
   * Build sort options
   */
  buildSortOptions(sortBy) {
    const sortOptions = {};
    
    switch (sortBy) {
      case 'relevance':
        sortOptions.score = { $meta: 'textScore' };
        break;
      case 'date_desc':
        sortOptions.upload_date = -1;
        break;
      case 'date_asc':
        sortOptions.upload_date = 1;
        break;
      case 'quality':
        sortOptions['quality.community_rating'] = -1;
        break;
      case 'popularity':
        sortOptions['analytics.view_count'] = -1;
        break;
      case 'title':
        sortOptions.title = 1;
        break;
      default:
        sortOptions.upload_date = -1;
    }
    
    return sortOptions;
  }

  /**
   * Analyze metadata completeness
   */
  analyzeMetadataCompleteness(metadata) {
    const requiredFields = [
      'subject', 'difficulty_level', 'learning_objectives', 'target_audience',
      'estimated_study_time', 'topics', 'language'
    ];
    
    const optionalFields = [
      'description', 'prerequisites', 'accessibility_features', 'content_warnings',
      'related_materials', 'interactive_elements'
    ];

    let score = 0;
    const suggestions = [];
    const missingRequired = [];
    const missingOptional = [];

    // Check required fields
    for (const field of requiredFields) {
      if (metadata[field] && metadata[field] !== null && metadata[field] !== '') {
        score += 1;
      } else {
        missingRequired.push(field);
      }
    }

    // Check optional fields
    for (const field of optionalFields) {
      if (metadata[field] && metadata[field] !== null && metadata[field] !== '') {
        score += 0.5;
      } else {
        missingOptional.push(field);
      }
    }

    const maxScore = requiredFields.length + (optionalFields.length * 0.5);
    const completenessScore = score / maxScore;

    // Generate suggestions
    if (missingRequired.length > 0) {
      suggestions.push({
        type: 'missing_required_fields',
        priority: 'high',
        message: `Missing required fields: ${missingRequired.join(', ')}`,
        action: 'add_required_fields',
        fields: missingRequired
      });
    }

    if (missingOptional.length > 0 && completenessScore < 0.8) {
      suggestions.push({
        type: 'missing_optional_fields',
        priority: 'medium',
        message: `Consider adding optional fields for better discoverability: ${missingOptional.slice(0, 3).join(', ')}`,
        action: 'add_optional_fields',
        fields: missingOptional.slice(0, 3)
      });
    }

    return {
      score: completenessScore,
      suggestions,
      missing_required: missingRequired,
      missing_optional: missingOptional
    };
  }

  /**
   * Calculate completeness score
   */
  calculateCompletenessScore(metadata) {
    return this.analyzeMetadataCompleteness(metadata).score;
  }

  /**
   * Count metadata fields
   */
  countMetadataFields(metadata) {
    let count = 0;
    
    const countFields = (obj) => {
      for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
          count++;
          if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            countFields(obj[key]);
          }
        }
      }
    };
    
    countFields(metadata);
    return count;
  }

  /**
   * Identify missing fields
   */
  identifyMissingFields(metadata) {
    const analysis = this.analyzeMetadataCompleteness(metadata);
    return [...analysis.missing_required, ...analysis.missing_optional.slice(0, 3)];
  }

  /**
   * Get content type specific metadata
   */
  async getContentTypeSpecificMetadata(contentType, customFields) {
    const template = this.customFieldManager.getFieldTemplate(contentType);
    const specificMetadata = {};
    
    // Extract content-type specific fields from custom fields
    for (const [fieldName, fieldValue] of Object.entries(customFields)) {
      if (template.fields[fieldName]) {
        specificMetadata[fieldName] = fieldValue;
      }
    }
    
    return specificMetadata;
  }

  /**
   * Generate usage-based suggestions
   */
  async generateUsageBasedSuggestions(material) {
    const suggestions = [];
    
    // Analyze similar materials for suggestions
    const similarMaterials = await EnhancedStudyMaterial.find({
      'metadata.subject': material.metadata.subject,
      'metadata.difficulty_level': material.metadata.difficulty_level,
      _id: { $ne: material._id }
    }).limit(5);

    if (similarMaterials.length > 0) {
      // Analyze common tags in similar materials
      const commonTags = this.extractCommonTags(similarMaterials);
      const missingTags = commonTags.filter(tag => !material.tags.includes(tag));
      
      if (missingTags.length > 0) {
        suggestions.push({
          type: 'similar_material_tags',
          priority: 'medium',
          message: `Similar materials often use these tags: ${missingTags.slice(0, 3).join(', ')}`,
          action: 'consider_tags',
          suggested_tags: missingTags.slice(0, 5)
        });
      }
    }

    return suggestions;
  }

  /**
   * Extract common tags from materials
   */
  extractCommonTags(materials) {
    const tagCounts = {};
    
    materials.forEach(material => {
      (material.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  /**
   * Analyze field usage patterns
   */
  async analyzeFieldUsagePatterns(filters) {
    // Implementation would analyze database for field usage patterns
    return {
      most_used_fields: [],
      least_used_fields: [],
      field_completion_rates: {}
    };
  }

  /**
   * Analyze categorization distribution
   */
  async analyzeCategorization(filters) {
    // Implementation would analyze categorization patterns
    return {
      category_distribution: {},
      popular_categories: [],
      underutilized_categories: []
    };
  }

  /**
   * Calculate quality metrics
   */
  async calculateQualityMetrics(filters) {
    // Implementation would calculate quality metrics
    return {
      average_completeness: 0,
      quality_distribution: {},
      improvement_opportunities: []
    };
  }

  /**
   * Identify trending metadata
   */
  async identifyTrendingMetadata(filters) {
    // Implementation would identify trending patterns
    return {
      trending_tags: [],
      trending_subjects: [],
      emerging_categories: []
    };
  }
}

module.exports = MaterialManagementService;