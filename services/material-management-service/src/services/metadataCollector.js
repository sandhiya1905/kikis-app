const mongoose = require('mongoose');
const EnhancedStudyMaterial = require('../../../../shared/schemas/enhancedMaterial');

/**
 * Enhanced Metadata Collection Service
 * Handles comprehensive metadata collection, validation, and management
 * for all material types with hierarchical categorization and custom fields
 */
class MetadataCollector {
  constructor() {
    this.validationRules = this.initializeValidationRules();
    this.categoryHierarchy = this.initializeCategoryHierarchy();
    this.customFieldTemplates = this.initializeCustomFieldTemplates();
  }

  /**
   * Initialize validation rules for different metadata fields
   */
  initializeValidationRules() {
    return {
      title: {
        required: true,
        minLength: 3,
        maxLength: 200,
        pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/
      },
      description: {
        required: false,
        maxLength: 2000
      },
      subject: {
        required: true,
        allowedValues: [
          'mathematics', 'physics', 'chemistry', 'biology', 'computer_science',
          'engineering', 'literature', 'history', 'philosophy', 'psychology',
          'economics', 'business', 'art', 'music', 'language', 'medicine',
          'law', 'education', 'social_sciences', 'environmental_science'
        ]
      },
      difficulty_level: {
        required: true,
        allowedValues: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      learning_objectives: {
        required: true,
        minItems: 1,
        maxItems: 10,
        itemMaxLength: 200
      },
      target_audience: {
        required: true,
        minItems: 1,
        allowedValues: [
          'undergraduate', 'graduate', 'postgraduate', 'professional',
          'beginner', 'intermediate', 'advanced'
        ]
      },
      estimated_study_time: {
        required: true,
        min: 1,
        max: 10080 // max 1 week in minutes
      },
      language: {
        required: true,
        pattern: /^[a-z]{2}(-[A-Z]{2})?$/ // ISO language codes
      },
      topics: {
        required: true,
        minItems: 1,
        maxItems: 20,
        itemMaxLength: 50
      },
      tags: {
        required: false,
        maxItems: 30,
        itemMaxLength: 30,
        pattern: /^[a-zA-Z0-9\-_]+$/
      }
    };
  }

  /**
   * Initialize hierarchical category structure
   */
  initializeCategoryHierarchy() {
    return {
      'STEM': {
        'Mathematics': {
          'Algebra': ['Linear Algebra', 'Abstract Algebra', 'Boolean Algebra'],
          'Calculus': ['Differential Calculus', 'Integral Calculus', 'Multivariable Calculus'],
          'Statistics': ['Descriptive Statistics', 'Inferential Statistics', 'Probability Theory'],
          'Geometry': ['Euclidean Geometry', 'Analytical Geometry', 'Topology']
        },
        'Computer Science': {
          'Programming': ['Web Development', 'Mobile Development', 'System Programming'],
          'Algorithms': ['Data Structures', 'Sorting Algorithms', 'Graph Algorithms'],
          'AI/ML': ['Machine Learning', 'Deep Learning', 'Natural Language Processing'],
          'Systems': ['Operating Systems', 'Database Systems', 'Distributed Systems']
        },
        'Physics': {
          'Classical Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism'],
          'Modern Physics': ['Quantum Mechanics', 'Relativity', 'Particle Physics'],
          'Applied Physics': ['Optics', 'Acoustics', 'Materials Science']
        },
        'Engineering': {
          'Software Engineering': ['Design Patterns', 'Testing', 'Architecture'],
          'Electrical Engineering': ['Circuit Analysis', 'Signal Processing', 'Power Systems'],
          'Mechanical Engineering': ['Fluid Mechanics', 'Heat Transfer', 'Materials']
        }
      },
      'Liberal Arts': {
        'Literature': {
          'Fiction': ['Novels', 'Short Stories', 'Poetry'],
          'Non-Fiction': ['Essays', 'Biographies', 'Historical Texts'],
          'Drama': ['Classical Drama', 'Modern Theater', 'Screenwriting']
        },
        'History': {
          'Ancient History': ['Classical Antiquity', 'Medieval Period'],
          'Modern History': ['Renaissance', 'Industrial Revolution', 'Contemporary'],
          'Regional History': ['American History', 'European History', 'World History']
        },
        'Philosophy': {
          'Ethics': ['Applied Ethics', 'Meta-ethics', 'Normative Ethics'],
          'Logic': ['Formal Logic', 'Informal Logic', 'Mathematical Logic'],
          'Metaphysics': ['Ontology', 'Philosophy of Mind', 'Philosophy of Science']
        }
      },
      'Business': {
        'Management': {
          'Leadership': ['Team Management', 'Strategic Planning', 'Change Management'],
          'Operations': ['Project Management', 'Quality Management', 'Supply Chain'],
          'Human Resources': ['Recruitment', 'Training', 'Performance Management']
        },
        'Finance': {
          'Corporate Finance': ['Financial Analysis', 'Investment', 'Risk Management'],
          'Personal Finance': ['Budgeting', 'Investing', 'Insurance'],
          'Economics': ['Microeconomics', 'Macroeconomics', 'International Economics']
        }
      }
    };
  }

  /**
   * Initialize custom field templates for different material types
   */
  initializeCustomFieldTemplates() {
    return {
      'video': {
        video_duration: { type: 'number', required: true, min: 1 },
        video_quality: { type: 'string', enum: ['720p', '1080p', '4K'], required: true },
        has_subtitles: { type: 'boolean', default: false },
        subtitle_languages: { type: 'array', items: { type: 'string' } },
        video_format: { type: 'string', enum: ['mp4', 'webm', 'avi', 'mov'] },
        chapters: { 
          type: 'array', 
          items: { 
            title: { type: 'string', required: true },
            start_time: { type: 'number', required: true },
            end_time: { type: 'number', required: true }
          }
        }
      },
      'audio': {
        audio_duration: { type: 'number', required: true, min: 1 },
        audio_quality: { type: 'string', enum: ['128kbps', '256kbps', '320kbps'], required: true },
        audio_format: { type: 'string', enum: ['mp3', 'wav', 'flac', 'aac'] },
        has_transcript: { type: 'boolean', default: false },
        speaker_count: { type: 'number', min: 1, max: 10 }
      },
      'pdf': {
        page_count: { type: 'number', required: true, min: 1 },
        is_searchable: { type: 'boolean', default: true },
        has_bookmarks: { type: 'boolean', default: false },
        pdf_version: { type: 'string' },
        is_protected: { type: 'boolean', default: false }
      },
      'interactive': {
        interaction_types: { 
          type: 'array', 
          items: { 
            type: 'string', 
            enum: ['quiz', 'simulation', 'drag_drop', 'click_through', 'form_input'] 
          },
          required: true
        },
        estimated_completion_time: { type: 'number', required: true, min: 1 },
        requires_login: { type: 'boolean', default: false },
        supported_devices: { 
          type: 'array', 
          items: { type: 'string', enum: ['desktop', 'tablet', 'mobile'] },
          required: true
        },
        technology_requirements: { 
          type: 'array', 
          items: { type: 'string' }
        }
      },
      'text': {
        word_count: { type: 'number', min: 1 },
        reading_level: { type: 'string', enum: ['elementary', 'middle_school', 'high_school', 'college', 'graduate'] },
        text_format: { type: 'string', enum: ['plain_text', 'markdown', 'html', 'rich_text'] },
        has_images: { type: 'boolean', default: false },
        has_code_examples: { type: 'boolean', default: false }
      }
    };
  }

  /**
   * Collect comprehensive metadata for a material
   * @param {Object} materialData - Raw material data
   * @param {Object} userInput - User-provided metadata
   * @param {string} contentType - Type of content (video, pdf, etc.)
   * @returns {Object} Validated and enhanced metadata
   */
  async collectMetadata(materialData, userInput, contentType) {
    try {
      // Start with basic metadata validation
      const basicMetadata = await this.validateBasicMetadata(userInput);
      
      // Add content-specific metadata
      const contentSpecificMetadata = await this.collectContentSpecificMetadata(
        materialData, 
        contentType, 
        userInput
      );
      
      // Generate intelligent suggestions
      const suggestions = await this.generateMetadataSuggestions(materialData, basicMetadata);
      
      // Apply hierarchical categorization
      const categorization = await this.applyCategorization(basicMetadata, suggestions);
      
      // Validate custom fields
      const customFields = await this.validateCustomFields(contentType, userInput.customFields || {});
      
      // Combine all metadata
      const enhancedMetadata = {
        ...basicMetadata,
        ...contentSpecificMetadata,
        ...categorization,
        custom_fields: customFields,
        suggestions: suggestions,
        collection_timestamp: new Date(),
        metadata_version: '1.0'
      };

      // Final validation
      await this.validateCompleteMetadata(enhancedMetadata);
      
      return {
        success: true,
        metadata: enhancedMetadata,
        suggestions: suggestions,
        warnings: this.getValidationWarnings(enhancedMetadata)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        field: error.field || null,
        suggestions: error.suggestions || []
      };
    }
  }

  /**
   * Validate basic metadata fields
   */
  async validateBasicMetadata(userInput) {
    const metadata = {};
    const errors = [];

    for (const [field, rules] of Object.entries(this.validationRules)) {
      const value = userInput[field];
      
      try {
        if (rules.required && (!value || (Array.isArray(value) && value.length === 0))) {
          throw new Error(`${field} is required`);
        }
        
        if (value !== undefined && value !== null) {
          metadata[field] = await this.validateField(field, value, rules);
        }
      } catch (error) {
        error.field = field;
        throw error;
      }
    }

    return metadata;
  }

  /**
   * Validate individual field based on rules
   */
  async validateField(fieldName, value, rules) {
    // String validation
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        throw new Error(`${fieldName} must be at least ${rules.minLength} characters long`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        throw new Error(`${fieldName} must be no more than ${rules.maxLength} characters long`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        throw new Error(`${fieldName} format is invalid`);
      }
      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        const suggestions = this.findSimilarValues(value, rules.allowedValues);
        const error = new Error(`${fieldName} must be one of: ${rules.allowedValues.join(', ')}`);
        error.suggestions = suggestions;
        throw error;
      }
    }

    // Array validation
    if (Array.isArray(value)) {
      if (rules.minItems && value.length < rules.minItems) {
        throw new Error(`${fieldName} must have at least ${rules.minItems} items`);
      }
      if (rules.maxItems && value.length > rules.maxItems) {
        throw new Error(`${fieldName} must have no more than ${rules.maxItems} items`);
      }
      
      // Validate array items
      if (rules.allowedValues) {
        const invalidItems = value.filter(item => !rules.allowedValues.includes(item));
        if (invalidItems.length > 0) {
          throw new Error(`Invalid ${fieldName} values: ${invalidItems.join(', ')}`);
        }
      }
      
      if (rules.itemMaxLength) {
        const longItems = value.filter(item => item.length > rules.itemMaxLength);
        if (longItems.length > 0) {
          throw new Error(`${fieldName} items must be no more than ${rules.itemMaxLength} characters`);
        }
      }
    }

    // Number validation
    if (typeof value === 'number') {
      if (rules.min && value < rules.min) {
        throw new Error(`${fieldName} must be at least ${rules.min}`);
      }
      if (rules.max && value > rules.max) {
        throw new Error(`${fieldName} must be no more than ${rules.max}`);
      }
    }

    return value;
  }

  /**
   * Collect content-specific metadata based on material type
   */
  async collectContentSpecificMetadata(materialData, contentType, userInput) {
    const metadata = {};

    switch (contentType) {
      case 'video':
        metadata.video_duration = materialData.duration || userInput.video_duration;
        metadata.video_quality = userInput.video_quality || this.detectVideoQuality(materialData);
        metadata.has_subtitles = materialData.hasSubtitles || false;
        metadata.video_format = materialData.format || this.detectVideoFormat(materialData);
        break;

      case 'audio':
        metadata.audio_duration = materialData.duration || userInput.audio_duration;
        metadata.audio_quality = userInput.audio_quality || this.detectAudioQuality(materialData);
        metadata.audio_format = materialData.format || this.detectAudioFormat(materialData);
        metadata.has_transcript = userInput.has_transcript || false;
        break;

      case 'pdf':
        metadata.page_count = materialData.pageCount || userInput.page_count;
        metadata.is_searchable = materialData.isSearchable !== false;
        metadata.has_bookmarks = materialData.hasBookmarks || false;
        metadata.pdf_version = materialData.pdfVersion;
        break;

      case 'text':
        metadata.word_count = this.calculateWordCount(materialData.content || '');
        metadata.reading_level = userInput.reading_level || this.detectReadingLevel(materialData.content);
        metadata.text_format = userInput.text_format || 'plain_text';
        metadata.has_images = this.detectImages(materialData.content);
        metadata.has_code_examples = this.detectCodeExamples(materialData.content);
        break;

      case 'interactive':
        metadata.interaction_types = userInput.interaction_types || ['click_through'];
        metadata.estimated_completion_time = userInput.estimated_completion_time;
        metadata.requires_login = userInput.requires_login || false;
        metadata.supported_devices = userInput.supported_devices || ['desktop'];
        break;
    }

    return metadata;
  }

  /**
   * Generate intelligent metadata suggestions based on content analysis
   */
  async generateMetadataSuggestions(materialData, basicMetadata) {
    const suggestions = {
      tags: [],
      topics: [],
      related_subjects: [],
      difficulty_adjustment: null,
      target_audience_expansion: []
    };

    // Analyze content for tag suggestions
    if (materialData.content || materialData.title) {
      const text = (materialData.content || '') + ' ' + (materialData.title || '');
      suggestions.tags = await this.extractTagsFromContent(text);
      suggestions.topics = await this.extractTopicsFromContent(text);
    }

    // Suggest related subjects based on current subject
    if (basicMetadata.subject) {
      suggestions.related_subjects = this.findRelatedSubjects(basicMetadata.subject);
    }

    // Suggest difficulty level adjustments
    if (materialData.content) {
      const detectedDifficulty = await this.detectContentDifficulty(materialData.content);
      if (detectedDifficulty !== basicMetadata.difficulty_level) {
        suggestions.difficulty_adjustment = detectedDifficulty;
      }
    }

    // Suggest target audience expansion
    suggestions.target_audience_expansion = this.suggestTargetAudienceExpansion(
      basicMetadata.target_audience,
      basicMetadata.difficulty_level
    );

    return suggestions;
  }

  /**
   * Apply hierarchical categorization to metadata
   */
  async applyCategorization(basicMetadata, suggestions) {
    const categorization = {
      primary_category: null,
      secondary_categories: [],
      category_path: [],
      hierarchical_tags: []
    };

    // Find primary category based on subject
    const primaryCategory = this.findPrimaryCategory(basicMetadata.subject);
    if (primaryCategory) {
      categorization.primary_category = primaryCategory.name;
      categorization.category_path = primaryCategory.path;
    }

    // Find secondary categories based on topics and tags
    const secondaryCategories = this.findSecondaryCategories(
      basicMetadata.topics || [],
      suggestions.tags || []
    );
    categorization.secondary_categories = secondaryCategories;

    // Generate hierarchical tags
    categorization.hierarchical_tags = this.generateHierarchicalTags(
      categorization.category_path,
      basicMetadata.topics || []
    );

    return categorization;
  }

  /**
   * Validate custom fields based on content type template
   */
  async validateCustomFields(contentType, customFields) {
    const template = this.customFieldTemplates[contentType];
    if (!template) {
      return customFields; // No validation template, return as-is
    }

    const validatedFields = {};
    const errors = [];

    for (const [fieldName, fieldConfig] of Object.entries(template)) {
      const value = customFields[fieldName];
      
      try {
        if (fieldConfig.required && value === undefined) {
          throw new Error(`Custom field ${fieldName} is required for ${contentType} materials`);
        }
        
        if (value !== undefined) {
          validatedFields[fieldName] = await this.validateCustomField(fieldName, value, fieldConfig);
        } else if (fieldConfig.default !== undefined) {
          validatedFields[fieldName] = fieldConfig.default;
        }
      } catch (error) {
        errors.push({ field: fieldName, error: error.message });
      }
    }

    if (errors.length > 0) {
      const error = new Error(`Custom field validation failed: ${errors.map(e => e.error).join(', ')}`);
      error.field = 'custom_fields';
      error.details = errors;
      throw error;
    }

    return validatedFields;
  }

  /**
   * Validate individual custom field
   */
  async validateCustomField(fieldName, value, config) {
    switch (config.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`${fieldName} must be a string`);
        }
        if (config.enum && !config.enum.includes(value)) {
          throw new Error(`${fieldName} must be one of: ${config.enum.join(', ')}`);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`${fieldName} must be a number`);
        }
        if (config.min && value < config.min) {
          throw new Error(`${fieldName} must be at least ${config.min}`);
        }
        if (config.max && value > config.max) {
          throw new Error(`${fieldName} must be no more than ${config.max}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`${fieldName} must be a boolean`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`${fieldName} must be an array`);
        }
        if (config.items) {
          for (const item of value) {
            await this.validateCustomField(`${fieldName}[item]`, item, config.items);
          }
        }
        break;
    }

    return value;
  }

  /**
   * Perform final validation on complete metadata
   */
  async validateCompleteMetadata(metadata) {
    // Check for required field combinations
    if (metadata.prerequisites && metadata.prerequisites.length > 0) {
      if (!metadata.learning_path_position) {
        throw new Error('Materials with prerequisites must specify learning_path_position');
      }
    }

    // Validate learning objectives match difficulty level
    if (metadata.difficulty_level === 'beginner' && metadata.learning_objectives) {
      const complexObjectives = metadata.learning_objectives.filter(obj => 
        obj.toLowerCase().includes('analyze') || 
        obj.toLowerCase().includes('synthesize') ||
        obj.toLowerCase().includes('evaluate')
      );
      if (complexObjectives.length > 0) {
        throw new Error('Beginner materials should focus on basic understanding rather than analysis/synthesis');
      }
    }

    // Validate estimated study time is reasonable for content
    if (metadata.estimated_study_time && metadata.word_count) {
      const expectedTime = Math.ceil(metadata.word_count / 200); // 200 words per minute
      if (metadata.estimated_study_time < expectedTime * 0.5 || 
          metadata.estimated_study_time > expectedTime * 3) {
        throw new Error(`Estimated study time (${metadata.estimated_study_time} min) seems unrealistic for content length`);
      }
    }
  }

  /**
   * Get validation warnings for metadata
   */
  getValidationWarnings(metadata) {
    const warnings = [];

    // Check for missing optional but recommended fields
    if (!metadata.description || metadata.description.length < 50) {
      warnings.push('Consider adding a more detailed description to help users understand the content');
    }

    if (!metadata.accessibility_features || metadata.accessibility_features.length === 0) {
      warnings.push('Consider specifying accessibility features to improve content discoverability');
    }

    if (!metadata.content_warnings || metadata.content_warnings.length === 0) {
      if (metadata.subject === 'history' || metadata.subject === 'social_sciences') {
        warnings.push('Consider adding content warnings if material covers sensitive topics');
      }
    }

    // Check tag quantity
    if (!metadata.tags || metadata.tags.length < 3) {
      warnings.push('Adding more tags will improve content discoverability');
    }

    return warnings;
  }

  // Helper methods for content analysis
  detectVideoQuality(materialData) {
    if (materialData.height >= 2160) return '4K';
    if (materialData.height >= 1080) return '1080p';
    return '720p';
  }

  detectVideoFormat(materialData) {
    return materialData.mimetype?.split('/')[1] || 'mp4';
  }

  detectAudioQuality(materialData) {
    if (materialData.bitrate >= 320) return '320kbps';
    if (materialData.bitrate >= 256) return '256kbps';
    return '128kbps';
  }

  detectAudioFormat(materialData) {
    return materialData.mimetype?.split('/')[1] || 'mp3';
  }

  calculateWordCount(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  detectReadingLevel(content) {
    const avgWordsPerSentence = this.calculateAverageWordsPerSentence(content);
    const avgSyllablesPerWord = this.calculateAverageSyllablesPerWord(content);
    
    // Simplified Flesch-Kincaid grade level
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    if (gradeLevel <= 6) return 'elementary';
    if (gradeLevel <= 8) return 'middle_school';
    if (gradeLevel <= 12) return 'high_school';
    if (gradeLevel <= 16) return 'college';
    return 'graduate';
  }

  detectImages(content) {
    return /!\[.*?\]\(.*?\)|<img.*?>/.test(content);
  }

  detectCodeExamples(content) {
    return /```|<code>|<pre>/.test(content);
  }

  calculateAverageWordsPerSentence(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    return sentences.length > 0 ? words.length / sentences.length : 0;
  }

  calculateAverageSyllablesPerWord(content) {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const totalSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    return words.length > 0 ? totalSyllables / words.length : 0;
  }

  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  async extractTagsFromContent(text) {
    // Simple keyword extraction - in production, use NLP libraries
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
      if (!commonWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  async extractTopicsFromContent(text) {
    // Simple topic extraction based on common academic terms
    const topicKeywords = {
      'algorithms': ['algorithm', 'sorting', 'searching', 'complexity'],
      'data_structures': ['array', 'list', 'tree', 'graph', 'stack', 'queue'],
      'calculus': ['derivative', 'integral', 'limit', 'function'],
      'statistics': ['mean', 'median', 'variance', 'probability', 'distribution'],
      'programming': ['code', 'function', 'variable', 'loop', 'condition']
    };
    
    const detectedTopics = [];
    const lowerText = text.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      if (matches.length >= 2) {
        detectedTopics.push(topic);
      }
    }
    
    return detectedTopics;
  }

  findRelatedSubjects(subject) {
    const subjectRelations = {
      'mathematics': ['physics', 'computer_science', 'engineering'],
      'physics': ['mathematics', 'chemistry', 'engineering'],
      'computer_science': ['mathematics', 'engineering', 'physics'],
      'chemistry': ['physics', 'biology', 'medicine'],
      'biology': ['chemistry', 'medicine', 'psychology'],
      'history': ['literature', 'philosophy', 'social_sciences'],
      'literature': ['history', 'philosophy', 'language'],
      'economics': ['business', 'mathematics', 'social_sciences']
    };
    
    return subjectRelations[subject] || [];
  }

  async detectContentDifficulty(content) {
    const readingLevel = this.detectReadingLevel(content);
    const technicalTerms = this.countTechnicalTerms(content);
    const conceptualComplexity = this.assessConceptualComplexity(content);
    
    // Simple heuristic - in production, use ML models
    if (readingLevel === 'graduate' || technicalTerms > 20 || conceptualComplexity > 0.7) {
      return 'expert';
    } else if (readingLevel === 'college' || technicalTerms > 10 || conceptualComplexity > 0.5) {
      return 'advanced';
    } else if (readingLevel === 'high_school' || technicalTerms > 5 || conceptualComplexity > 0.3) {
      return 'intermediate';
    }
    return 'beginner';
  }

  countTechnicalTerms(content) {
    const technicalPatterns = [
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\w+\(\)/g, // Function calls
      /\b\d+\.\d+\b/g, // Decimal numbers
      /\b[a-z]+_[a-z]+\b/g // Snake_case terms
    ];
    
    let count = 0;
    technicalPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      count += matches ? matches.length : 0;
    });
    
    return count;
  }

  assessConceptualComplexity(content) {
    const complexityIndicators = [
      'therefore', 'however', 'furthermore', 'consequently', 'nevertheless',
      'analyze', 'synthesize', 'evaluate', 'compare', 'contrast',
      'hypothesis', 'theory', 'principle', 'concept', 'framework'
    ];
    
    const lowerContent = content.toLowerCase();
    const matches = complexityIndicators.filter(indicator => 
      lowerContent.includes(indicator)
    ).length;
    
    return Math.min(matches / 10, 1); // Normalize to 0-1 scale
  }

  suggestTargetAudienceExpansion(currentAudience, difficultyLevel) {
    const expansions = [];
    
    if (difficultyLevel === 'beginner' && !currentAudience.includes('undergraduate')) {
      expansions.push('undergraduate');
    }
    
    if (difficultyLevel === 'intermediate' && !currentAudience.includes('graduate')) {
      expansions.push('graduate');
    }
    
    if (difficultyLevel === 'advanced' && !currentAudience.includes('professional')) {
      expansions.push('professional');
    }
    
    return expansions;
  }

  findPrimaryCategory(subject) {
    for (const [primaryCat, subCategories] of Object.entries(this.categoryHierarchy)) {
      for (const [subCat, topics] of Object.entries(subCategories)) {
        if (subCat.toLowerCase().includes(subject) || 
            Object.keys(topics).some(topic => topic.toLowerCase().includes(subject))) {
          return {
            name: primaryCat,
            path: [primaryCat, subCat]
          };
        }
      }
    }
    return null;
  }

  findSecondaryCategories(topics, tags) {
    const categories = new Set();
    
    [...topics, ...tags].forEach(term => {
      const category = this.findCategoryForTerm(term);
      if (category) {
        categories.add(category);
      }
    });
    
    return Array.from(categories);
  }

  findCategoryForTerm(term) {
    const lowerTerm = term.toLowerCase();
    
    for (const [primaryCat, subCategories] of Object.entries(this.categoryHierarchy)) {
      for (const [subCat, topics] of Object.entries(subCategories)) {
        for (const [topicCat, subtopics] of Object.entries(topics)) {
          if (topicCat.toLowerCase().includes(lowerTerm) ||
              subtopics.some(subtopic => subtopic.toLowerCase().includes(lowerTerm))) {
            return `${primaryCat}/${subCat}/${topicCat}`;
          }
        }
      }
    }
    
    return null;
  }

  generateHierarchicalTags(categoryPath, topics) {
    const hierarchicalTags = [];
    
    // Add category path as tags
    if (categoryPath && categoryPath.length > 0) {
      hierarchicalTags.push(...categoryPath.map(cat => cat.toLowerCase().replace(/\s+/g, '_')));
    }
    
    // Add topic-based hierarchical tags
    topics.forEach(topic => {
      const category = this.findCategoryForTerm(topic);
      if (category) {
        const parts = category.split('/');
        hierarchicalTags.push(...parts.map(part => part.toLowerCase().replace(/\s+/g, '_')));
      }
    });
    
    return [...new Set(hierarchicalTags)]; // Remove duplicates
  }

  findSimilarValues(input, allowedValues) {
    // Simple string similarity - in production, use better algorithms
    const similarities = allowedValues.map(value => ({
      value,
      similarity: this.calculateStringSimilarity(input.toLowerCase(), value.toLowerCase())
    }));
    
    return similarities
      .filter(item => item.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.value);
  }

  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  calculateEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

module.exports = MetadataCollector;