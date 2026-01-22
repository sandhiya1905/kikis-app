const mongoose = require('mongoose');

/**
 * Custom Metadata Field Manager
 * Handles dynamic custom fields for different material types,
 * field validation, templates, and field evolution over time
 */
class CustomFieldManager {
  constructor() {
    this.fieldTemplates = this.initializeFieldTemplates();
    this.validationRules = this.initializeValidationRules();
    this.fieldRegistry = new Map();
    this.fieldUsageStats = new Map();
  }

  /**
   * Initialize field templates for different material types
   */
  initializeFieldTemplates() {
    return {
      'video': {
        name: 'Video Content Fields',
        description: 'Fields specific to video materials',
        fields: {
          video_duration: {
            type: 'number',
            label: 'Video Duration (minutes)',
            description: 'Total duration of the video in minutes',
            required: true,
            min: 0.1,
            max: 600,
            default: null,
            validation: {
              message: 'Duration must be between 0.1 and 600 minutes'
            }
          },
          video_quality: {
            type: 'select',
            label: 'Video Quality',
            description: 'Resolution quality of the video',
            required: true,
            options: [
              { value: '480p', label: '480p (SD)' },
              { value: '720p', label: '720p (HD)' },
              { value: '1080p', label: '1080p (Full HD)' },
              { value: '1440p', label: '1440p (2K)' },
              { value: '2160p', label: '2160p (4K)' }
            ],
            default: '720p'
          },
          has_subtitles: {
            type: 'boolean',
            label: 'Has Subtitles',
            description: 'Whether the video includes subtitles',
            required: false,
            default: false
          },
          subtitle_languages: {
            type: 'multi_select',
            label: 'Subtitle Languages',
            description: 'Available subtitle languages',
            required: false,
            depends_on: { field: 'has_subtitles', value: true },
            options: [
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' },
              { value: 'zh', label: 'Chinese' },
              { value: 'ja', label: 'Japanese' },
              { value: 'ko', label: 'Korean' },
              { value: 'pt', label: 'Portuguese' },
              { value: 'ru', label: 'Russian' },
              { value: 'ar', label: 'Arabic' }
            ],
            default: []
          },
          video_format: {
            type: 'select',
            label: 'Video Format',
            description: 'File format of the video',
            required: false,
            options: [
              { value: 'mp4', label: 'MP4' },
              { value: 'webm', label: 'WebM' },
              { value: 'avi', label: 'AVI' },
              { value: 'mov', label: 'MOV' },
              { value: 'mkv', label: 'MKV' }
            ],
            default: 'mp4'
          },
          chapters: {
            type: 'array',
            label: 'Video Chapters',
            description: 'Chapter breakdown of the video',
            required: false,
            item_schema: {
              title: { type: 'text', required: true, max_length: 100 },
              start_time: { type: 'number', required: true, min: 0 },
              end_time: { type: 'number', required: true, min: 0 },
              description: { type: 'text', required: false, max_length: 500 }
            },
            default: []
          },
          video_codec: {
            type: 'text',
            label: 'Video Codec',
            description: 'Video compression codec used',
            required: false,
            max_length: 50,
            default: null
          },
          frame_rate: {
            type: 'number',
            label: 'Frame Rate (fps)',
            description: 'Frames per second of the video',
            required: false,
            min: 1,
            max: 120,
            default: null
          },
          aspect_ratio: {
            type: 'select',
            label: 'Aspect Ratio',
            description: 'Video aspect ratio',
            required: false,
            options: [
              { value: '16:9', label: '16:9 (Widescreen)' },
              { value: '4:3', label: '4:3 (Standard)' },
              { value: '21:9', label: '21:9 (Ultra-wide)' },
              { value: '1:1', label: '1:1 (Square)' }
            ],
            default: '16:9'
          }
        }
      },
      'audio': {
        name: 'Audio Content Fields',
        description: 'Fields specific to audio materials',
        fields: {
          audio_duration: {
            type: 'number',
            label: 'Audio Duration (minutes)',
            description: 'Total duration of the audio in minutes',
            required: true,
            min: 0.1,
            max: 600,
            default: null
          },
          audio_quality: {
            type: 'select',
            label: 'Audio Quality',
            description: 'Bitrate quality of the audio',
            required: true,
            options: [
              { value: '96kbps', label: '96 kbps (Low)' },
              { value: '128kbps', label: '128 kbps (Standard)' },
              { value: '192kbps', label: '192 kbps (Good)' },
              { value: '256kbps', label: '256 kbps (High)' },
              { value: '320kbps', label: '320 kbps (Very High)' }
            ],
            default: '128kbps'
          },
          audio_format: {
            type: 'select',
            label: 'Audio Format',
            description: 'File format of the audio',
            required: false,
            options: [
              { value: 'mp3', label: 'MP3' },
              { value: 'wav', label: 'WAV' },
              { value: 'flac', label: 'FLAC' },
              { value: 'aac', label: 'AAC' },
              { value: 'ogg', label: 'OGG' }
            ],
            default: 'mp3'
          },
          has_transcript: {
            type: 'boolean',
            label: 'Has Transcript',
            description: 'Whether a text transcript is available',
            required: false,
            default: false
          },
          transcript_accuracy: {
            type: 'select',
            label: 'Transcript Accuracy',
            description: 'Accuracy level of the transcript',
            required: false,
            depends_on: { field: 'has_transcript', value: true },
            options: [
              { value: 'auto_generated', label: 'Auto-generated' },
              { value: 'human_reviewed', label: 'Human Reviewed' },
              { value: 'professional', label: 'Professional Transcription' }
            ],
            default: 'auto_generated'
          },
          speaker_count: {
            type: 'number',
            label: 'Number of Speakers',
            description: 'Number of different speakers in the audio',
            required: false,
            min: 1,
            max: 20,
            default: 1
          },
          audio_type: {
            type: 'select',
            label: 'Audio Type',
            description: 'Type of audio content',
            required: false,
            options: [
              { value: 'lecture', label: 'Lecture' },
              { value: 'interview', label: 'Interview' },
              { value: 'discussion', label: 'Discussion' },
              { value: 'presentation', label: 'Presentation' },
              { value: 'podcast', label: 'Podcast' },
              { value: 'music', label: 'Music' },
              { value: 'sound_effect', label: 'Sound Effect' }
            ],
            default: 'lecture'
          },
          background_music: {
            type: 'boolean',
            label: 'Has Background Music',
            description: 'Whether the audio includes background music',
            required: false,
            default: false
          }
        }
      },
      'pdf': {
        name: 'PDF Document Fields',
        description: 'Fields specific to PDF documents',
        fields: {
          page_count: {
            type: 'number',
            label: 'Page Count',
            description: 'Total number of pages in the PDF',
            required: true,
            min: 1,
            max: 10000,
            default: null
          },
          is_searchable: {
            type: 'boolean',
            label: 'Searchable Text',
            description: 'Whether the PDF contains searchable text',
            required: false,
            default: true
          },
          has_bookmarks: {
            type: 'boolean',
            label: 'Has Bookmarks',
            description: 'Whether the PDF includes navigation bookmarks',
            required: false,
            default: false
          },
          pdf_version: {
            type: 'text',
            label: 'PDF Version',
            description: 'PDF format version (e.g., 1.4, 1.7)',
            required: false,
            max_length: 10,
            default: null
          },
          is_protected: {
            type: 'boolean',
            label: 'Password Protected',
            description: 'Whether the PDF is password protected',
            required: false,
            default: false
          },
          has_forms: {
            type: 'boolean',
            label: 'Contains Forms',
            description: 'Whether the PDF contains fillable forms',
            required: false,
            default: false
          },
          color_mode: {
            type: 'select',
            label: 'Color Mode',
            description: 'Color mode of the PDF content',
            required: false,
            options: [
              { value: 'color', label: 'Color' },
              { value: 'grayscale', label: 'Grayscale' },
              { value: 'black_white', label: 'Black & White' }
            ],
            default: 'color'
          },
          optimization: {
            type: 'select',
            label: 'PDF Optimization',
            description: 'Optimization level of the PDF',
            required: false,
            options: [
              { value: 'web', label: 'Web Optimized' },
              { value: 'print', label: 'Print Optimized' },
              { value: 'archive', label: 'Archive Quality' },
              { value: 'standard', label: 'Standard' }
            ],
            default: 'standard'
          },
          annotations: {
            type: 'boolean',
            label: 'Has Annotations',
            description: 'Whether the PDF contains annotations or comments',
            required: false,
            default: false
          }
        }
      },
      'interactive': {
        name: 'Interactive Content Fields',
        description: 'Fields specific to interactive materials',
        fields: {
          interaction_types: {
            type: 'multi_select',
            label: 'Interaction Types',
            description: 'Types of interactions available in the content',
            required: true,
            options: [
              { value: 'quiz', label: 'Quiz/Assessment' },
              { value: 'simulation', label: 'Simulation' },
              { value: 'drag_drop', label: 'Drag & Drop' },
              { value: 'click_through', label: 'Click Through' },
              { value: 'form_input', label: 'Form Input' },
              { value: 'game', label: 'Educational Game' },
              { value: 'virtual_lab', label: 'Virtual Laboratory' },
              { value: 'animation', label: 'Interactive Animation' }
            ],
            default: []
          },
          estimated_completion_time: {
            type: 'number',
            label: 'Completion Time (minutes)',
            description: 'Estimated time to complete the interactive content',
            required: true,
            min: 1,
            max: 300,
            default: null
          },
          requires_login: {
            type: 'boolean',
            label: 'Requires Login',
            description: 'Whether the content requires user authentication',
            required: false,
            default: false
          },
          supported_devices: {
            type: 'multi_select',
            label: 'Supported Devices',
            description: 'Devices that can run this interactive content',
            required: true,
            options: [
              { value: 'desktop', label: 'Desktop Computer' },
              { value: 'tablet', label: 'Tablet' },
              { value: 'mobile', label: 'Mobile Phone' },
              { value: 'vr', label: 'VR Headset' },
              { value: 'ar', label: 'AR Device' }
            ],
            default: ['desktop']
          },
          technology_requirements: {
            type: 'multi_select',
            label: 'Technology Requirements',
            description: 'Technical requirements to run the content',
            required: false,
            options: [
              { value: 'javascript', label: 'JavaScript' },
              { value: 'flash', label: 'Adobe Flash' },
              { value: 'html5', label: 'HTML5' },
              { value: 'webgl', label: 'WebGL' },
              { value: 'unity', label: 'Unity Player' },
              { value: 'java', label: 'Java' },
              { value: 'silverlight', label: 'Silverlight' }
            ],
            default: []
          },
          difficulty_adaptive: {
            type: 'boolean',
            label: 'Adaptive Difficulty',
            description: 'Whether the content adapts difficulty based on user performance',
            required: false,
            default: false
          },
          progress_tracking: {
            type: 'boolean',
            label: 'Progress Tracking',
            description: 'Whether the content tracks user progress',
            required: false,
            default: false
          },
          scoring_system: {
            type: 'select',
            label: 'Scoring System',
            description: 'Type of scoring system used',
            required: false,
            options: [
              { value: 'points', label: 'Points Based' },
              { value: 'percentage', label: 'Percentage' },
              { value: 'pass_fail', label: 'Pass/Fail' },
              { value: 'rubric', label: 'Rubric Based' },
              { value: 'none', label: 'No Scoring' }
            ],
            default: 'none'
          }
        }
      },
      'text': {
        name: 'Text Content Fields',
        description: 'Fields specific to text-based materials',
        fields: {
          word_count: {
            type: 'number',
            label: 'Word Count',
            description: 'Total number of words in the text',
            required: false,
            min: 1,
            max: 1000000,
            default: null
          },
          reading_level: {
            type: 'select',
            label: 'Reading Level',
            description: 'Complexity level of the text',
            required: false,
            options: [
              { value: 'elementary', label: 'Elementary (Grades 1-5)' },
              { value: 'middle_school', label: 'Middle School (Grades 6-8)' },
              { value: 'high_school', label: 'High School (Grades 9-12)' },
              { value: 'college', label: 'College Level' },
              { value: 'graduate', label: 'Graduate Level' },
              { value: 'professional', label: 'Professional' }
            ],
            default: 'college'
          },
          text_format: {
            type: 'select',
            label: 'Text Format',
            description: 'Format of the text content',
            required: false,
            options: [
              { value: 'plain_text', label: 'Plain Text' },
              { value: 'markdown', label: 'Markdown' },
              { value: 'html', label: 'HTML' },
              { value: 'rich_text', label: 'Rich Text' },
              { value: 'latex', label: 'LaTeX' }
            ],
            default: 'plain_text'
          },
          has_images: {
            type: 'boolean',
            label: 'Contains Images',
            description: 'Whether the text includes embedded images',
            required: false,
            default: false
          },
          image_count: {
            type: 'number',
            label: 'Number of Images',
            description: 'Total number of images in the text',
            required: false,
            depends_on: { field: 'has_images', value: true },
            min: 0,
            max: 1000,
            default: 0
          },
          has_code_examples: {
            type: 'boolean',
            label: 'Contains Code Examples',
            description: 'Whether the text includes code examples',
            required: false,
            default: false
          },
          programming_languages: {
            type: 'multi_select',
            label: 'Programming Languages',
            description: 'Programming languages used in code examples',
            required: false,
            depends_on: { field: 'has_code_examples', value: true },
            options: [
              { value: 'javascript', label: 'JavaScript' },
              { value: 'python', label: 'Python' },
              { value: 'java', label: 'Java' },
              { value: 'cpp', label: 'C++' },
              { value: 'c', label: 'C' },
              { value: 'csharp', label: 'C#' },
              { value: 'php', label: 'PHP' },
              { value: 'ruby', label: 'Ruby' },
              { value: 'go', label: 'Go' },
              { value: 'rust', label: 'Rust' },
              { value: 'swift', label: 'Swift' },
              { value: 'kotlin', label: 'Kotlin' }
            ],
            default: []
          },
          has_mathematical_notation: {
            type: 'boolean',
            label: 'Contains Mathematical Notation',
            description: 'Whether the text includes mathematical formulas or notation',
            required: false,
            default: false
          },
          citation_style: {
            type: 'select',
            label: 'Citation Style',
            description: 'Citation format used in the text',
            required: false,
            options: [
              { value: 'apa', label: 'APA' },
              { value: 'mla', label: 'MLA' },
              { value: 'chicago', label: 'Chicago' },
              { value: 'harvard', label: 'Harvard' },
              { value: 'ieee', label: 'IEEE' },
              { value: 'vancouver', label: 'Vancouver' },
              { value: 'none', label: 'No Citations' }
            ],
            default: 'none'
          }
        }
      },
      'presentation': {
        name: 'Presentation Fields',
        description: 'Fields specific to presentation materials',
        fields: {
          slide_count: {
            type: 'number',
            label: 'Number of Slides',
            description: 'Total number of slides in the presentation',
            required: true,
            min: 1,
            max: 1000,
            default: null
          },
          presentation_format: {
            type: 'select',
            label: 'Presentation Format',
            description: 'File format of the presentation',
            required: false,
            options: [
              { value: 'pptx', label: 'PowerPoint (PPTX)' },
              { value: 'ppt', label: 'PowerPoint (PPT)' },
              { value: 'pdf', label: 'PDF' },
              { value: 'odp', label: 'OpenDocument (ODP)' },
              { value: 'key', label: 'Keynote' },
              { value: 'html', label: 'HTML Slides' }
            ],
            default: 'pptx'
          },
          has_animations: {
            type: 'boolean',
            label: 'Contains Animations',
            description: 'Whether the presentation includes slide animations',
            required: false,
            default: false
          },
          has_audio: {
            type: 'boolean',
            label: 'Contains Audio',
            description: 'Whether the presentation includes embedded audio',
            required: false,
            default: false
          },
          has_video: {
            type: 'boolean',
            label: 'Contains Video',
            description: 'Whether the presentation includes embedded video',
            required: false,
            default: false
          },
          presentation_style: {
            type: 'select',
            label: 'Presentation Style',
            description: 'Style or theme of the presentation',
            required: false,
            options: [
              { value: 'academic', label: 'Academic' },
              { value: 'business', label: 'Business' },
              { value: 'creative', label: 'Creative' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'technical', label: 'Technical' },
              { value: 'educational', label: 'Educational' }
            ],
            default: 'educational'
          },
          speaker_notes: {
            type: 'boolean',
            label: 'Has Speaker Notes',
            description: 'Whether the presentation includes speaker notes',
            required: false,
            default: false
          }
        }
      }
    };
  }

  /**
   * Initialize validation rules for custom fields
   */
  initializeValidationRules() {
    return {
      field_name: {
        pattern: /^[a-z][a-z0-9_]*$/,
        min_length: 2,
        max_length: 50,
        reserved_names: ['id', 'created_at', 'updated_at', 'metadata', 'content']
      },
      field_types: {
        allowed: ['text', 'number', 'boolean', 'select', 'multi_select', 'date', 'array', 'object'],
        validation_required: ['text', 'number', 'select', 'multi_select', 'array']
      },
      field_limits: {
        max_fields_per_type: 50,
        max_options_per_select: 100,
        max_array_items: 1000,
        max_text_length: 10000
      }
    };
  }

  /**
   * Get field template for a specific material type
   * @param {string} materialType - Type of material
   * @returns {Object} Field template
   */
  getFieldTemplate(materialType) {
    const template = this.fieldTemplates[materialType];
    if (!template) {
      throw new Error(`No field template found for material type: ${materialType}`);
    }
    return JSON.parse(JSON.stringify(template)); // Deep clone
  }

  /**
   * Get all available field templates
   * @returns {Object} All field templates
   */
  getAllFieldTemplates() {
    return Object.keys(this.fieldTemplates).map(type => ({
      type,
      name: this.fieldTemplates[type].name,
      description: this.fieldTemplates[type].description,
      field_count: Object.keys(this.fieldTemplates[type].fields).length
    }));
  }

  /**
   * Validate custom fields for a material
   * @param {string} materialType - Type of material
   * @param {Object} customFields - Custom field values
   * @returns {Object} Validation result
   */
  async validateCustomFields(materialType, customFields) {
    try {
      const template = this.getFieldTemplate(materialType);
      const validationResult = {
        valid: true,
        validated_fields: {},
        errors: [],
        warnings: [],
        missing_required: [],
        suggestions: []
      };

      // Validate each provided field
      for (const [fieldName, fieldValue] of Object.entries(customFields)) {
        const fieldConfig = template.fields[fieldName];
        
        if (!fieldConfig) {
          validationResult.warnings.push({
            field: fieldName,
            message: `Unknown field '${fieldName}' for material type '${materialType}'`,
            suggestion: this.suggestSimilarField(fieldName, template.fields)
          });
          continue;
        }

        try {
          const validatedValue = await this.validateField(fieldName, fieldValue, fieldConfig, customFields);
          validationResult.validated_fields[fieldName] = validatedValue;
        } catch (error) {
          validationResult.valid = false;
          validationResult.errors.push({
            field: fieldName,
            message: error.message,
            provided_value: fieldValue
          });
        }
      }

      // Check for missing required fields
      for (const [fieldName, fieldConfig] of Object.entries(template.fields)) {
        if (fieldConfig.required && !(fieldName in customFields)) {
          // Check if field has dependencies
          if (fieldConfig.depends_on) {
            const dependencyField = fieldConfig.depends_on.field;
            const dependencyValue = fieldConfig.depends_on.value;
            const actualValue = customFields[dependencyField];
            
            if (actualValue === dependencyValue) {
              validationResult.missing_required.push({
                field: fieldName,
                message: `Required field '${fieldName}' is missing (required because ${dependencyField} = ${dependencyValue})`
              });
              validationResult.valid = false;
            }
          } else {
            validationResult.missing_required.push({
              field: fieldName,
              message: `Required field '${fieldName}' is missing`
            });
            validationResult.valid = false;
          }
        }
      }

      // Add default values for missing optional fields
      for (const [fieldName, fieldConfig] of Object.entries(template.fields)) {
        if (!fieldConfig.required && !(fieldName in customFields) && fieldConfig.default !== undefined) {
          validationResult.validated_fields[fieldName] = fieldConfig.default;
        }
      }

      // Generate suggestions for improvement
      validationResult.suggestions = await this.generateFieldSuggestions(
        materialType,
        validationResult.validated_fields,
        template
      );

      // Update usage statistics
      await this.updateFieldUsageStats(materialType, Object.keys(validationResult.validated_fields));

      return validationResult;

    } catch (error) {
      return {
        valid: false,
        validated_fields: {},
        errors: [{ field: null, message: error.message }],
        warnings: [],
        missing_required: [],
        suggestions: []
      };
    }
  }

  /**
   * Validate individual field value
   */
  async validateField(fieldName, fieldValue, fieldConfig, allFields) {
    // Check dependencies first
    if (fieldConfig.depends_on) {
      const dependencyField = fieldConfig.depends_on.field;
      const dependencyValue = fieldConfig.depends_on.value;
      const actualValue = allFields[dependencyField];
      
      if (actualValue !== dependencyValue) {
        // Field is not required due to dependency not being met
        return fieldConfig.default;
      }
    }

    // Validate based on field type
    switch (fieldConfig.type) {
      case 'text':
        return await this.validateTextField(fieldName, fieldValue, fieldConfig);
      case 'number':
        return await this.validateNumberField(fieldName, fieldValue, fieldConfig);
      case 'boolean':
        return await this.validateBooleanField(fieldName, fieldValue, fieldConfig);
      case 'select':
        return await this.validateSelectField(fieldName, fieldValue, fieldConfig);
      case 'multi_select':
        return await this.validateMultiSelectField(fieldName, fieldValue, fieldConfig);
      case 'date':
        return await this.validateDateField(fieldName, fieldValue, fieldConfig);
      case 'array':
        return await this.validateArrayField(fieldName, fieldValue, fieldConfig);
      case 'object':
        return await this.validateObjectField(fieldName, fieldValue, fieldConfig);
      default:
        throw new Error(`Unknown field type: ${fieldConfig.type}`);
    }
  }

  /**
   * Validate text field
   */
  async validateTextField(fieldName, value, config) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    if (config.min_length && value.length < config.min_length) {
      throw new Error(`${fieldName} must be at least ${config.min_length} characters long`);
    }

    if (config.max_length && value.length > config.max_length) {
      throw new Error(`${fieldName} must be no more than ${config.max_length} characters long`);
    }

    if (config.pattern && !config.pattern.test(value)) {
      throw new Error(`${fieldName} format is invalid`);
    }

    return value.trim();
  }

  /**
   * Validate number field
   */
  async validateNumberField(fieldName, value, config) {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      throw new Error(`${fieldName} must be a valid number`);
    }

    if (config.min !== undefined && numValue < config.min) {
      throw new Error(`${fieldName} must be at least ${config.min}`);
    }

    if (config.max !== undefined && numValue > config.max) {
      throw new Error(`${fieldName} must be no more than ${config.max}`);
    }

    if (config.integer && !Number.isInteger(numValue)) {
      throw new Error(`${fieldName} must be an integer`);
    }

    return numValue;
  }

  /**
   * Validate boolean field
   */
  async validateBooleanField(fieldName, value, config) {
    if (typeof value !== 'boolean') {
      // Try to convert string values
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
          return true;
        }
        if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
          return false;
        }
      }
      throw new Error(`${fieldName} must be a boolean value`);
    }

    return value;
  }

  /**
   * Validate select field
   */
  async validateSelectField(fieldName, value, config) {
    if (!config.options || !Array.isArray(config.options)) {
      throw new Error(`${fieldName} configuration is invalid: missing options`);
    }

    const validValues = config.options.map(option => 
      typeof option === 'string' ? option : option.value
    );

    if (!validValues.includes(value)) {
      const suggestions = this.findSimilarValues(value, validValues);
      const error = new Error(`${fieldName} must be one of: ${validValues.join(', ')}`);
      if (suggestions.length > 0) {
        error.message += `. Did you mean: ${suggestions.join(', ')}?`;
      }
      throw error;
    }

    return value;
  }

  /**
   * Validate multi-select field
   */
  async validateMultiSelectField(fieldName, value, config) {
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array`);
    }

    if (!config.options || !Array.isArray(config.options)) {
      throw new Error(`${fieldName} configuration is invalid: missing options`);
    }

    const validValues = config.options.map(option => 
      typeof option === 'string' ? option : option.value
    );

    const invalidValues = value.filter(v => !validValues.includes(v));
    if (invalidValues.length > 0) {
      throw new Error(`${fieldName} contains invalid values: ${invalidValues.join(', ')}`);
    }

    if (config.min_selections && value.length < config.min_selections) {
      throw new Error(`${fieldName} must have at least ${config.min_selections} selections`);
    }

    if (config.max_selections && value.length > config.max_selections) {
      throw new Error(`${fieldName} must have no more than ${config.max_selections} selections`);
    }

    return [...new Set(value)]; // Remove duplicates
  }

  /**
   * Validate date field
   */
  async validateDateField(fieldName, value, config) {
    let dateValue;
    
    if (value instanceof Date) {
      dateValue = value;
    } else if (typeof value === 'string') {
      dateValue = new Date(value);
    } else {
      throw new Error(`${fieldName} must be a valid date`);
    }

    if (isNaN(dateValue.getTime())) {
      throw new Error(`${fieldName} must be a valid date`);
    }

    if (config.min_date) {
      const minDate = new Date(config.min_date);
      if (dateValue < minDate) {
        throw new Error(`${fieldName} must be after ${minDate.toISOString().split('T')[0]}`);
      }
    }

    if (config.max_date) {
      const maxDate = new Date(config.max_date);
      if (dateValue > maxDate) {
        throw new Error(`${fieldName} must be before ${maxDate.toISOString().split('T')[0]}`);
      }
    }

    return dateValue;
  }

  /**
   * Validate array field
   */
  async validateArrayField(fieldName, value, config) {
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array`);
    }

    if (config.min_items && value.length < config.min_items) {
      throw new Error(`${fieldName} must have at least ${config.min_items} items`);
    }

    if (config.max_items && value.length > config.max_items) {
      throw new Error(`${fieldName} must have no more than ${config.max_items} items`);
    }

    // Validate array items if schema is provided
    if (config.item_schema) {
      const validatedItems = [];
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        try {
          const validatedItem = await this.validateObjectAgainstSchema(item, config.item_schema);
          validatedItems.push(validatedItem);
        } catch (error) {
          throw new Error(`${fieldName}[${i}]: ${error.message}`);
        }
      }
      return validatedItems;
    }

    return value;
  }

  /**
   * Validate object field
   */
  async validateObjectField(fieldName, value, config) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`${fieldName} must be an object`);
    }

    if (config.schema) {
      return await this.validateObjectAgainstSchema(value, config.schema);
    }

    return value;
  }

  /**
   * Validate object against schema
   */
  async validateObjectAgainstSchema(obj, schema) {
    const validated = {};
    
    for (const [key, keyConfig] of Object.entries(schema)) {
      const value = obj[key];
      
      if (keyConfig.required && value === undefined) {
        throw new Error(`Required field '${key}' is missing`);
      }
      
      if (value !== undefined) {
        validated[key] = await this.validateField(key, value, keyConfig, obj);
      }
    }
    
    return validated;
  }

  /**
   * Create a new custom field template
   * @param {string} materialType - Material type
   * @param {string} fieldName - Field name
   * @param {Object} fieldConfig - Field configuration
   * @returns {Object} Creation result
   */
  async createCustomField(materialType, fieldName, fieldConfig) {
    try {
      // Validate field name
      if (!this.validationRules.field_name.pattern.test(fieldName)) {
        throw new Error('Field name must start with a letter and contain only lowercase letters, numbers, and underscores');
      }

      if (this.validationRules.field_name.reserved_names.includes(fieldName)) {
        throw new Error(`Field name '${fieldName}' is reserved`);
      }

      // Validate field configuration
      await this.validateFieldConfiguration(fieldConfig);

      // Check if template exists
      if (!this.fieldTemplates[materialType]) {
        this.fieldTemplates[materialType] = {
          name: `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} Content Fields`,
          description: `Fields specific to ${materialType} materials`,
          fields: {}
        };
      }

      // Check field limit
      const currentFieldCount = Object.keys(this.fieldTemplates[materialType].fields).length;
      if (currentFieldCount >= this.validationRules.field_limits.max_fields_per_type) {
        throw new Error(`Maximum number of fields (${this.validationRules.field_limits.max_fields_per_type}) reached for material type '${materialType}'`);
      }

      // Add field to template
      this.fieldTemplates[materialType].fields[fieldName] = {
        ...fieldConfig,
        created_at: new Date(),
        created_by: 'system' // In production, use actual user ID
      };

      // Register field
      this.registerField(materialType, fieldName, fieldConfig);

      return {
        success: true,
        message: `Custom field '${fieldName}' created successfully for material type '${materialType}'`,
        field_config: this.fieldTemplates[materialType].fields[fieldName]
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update an existing custom field
   * @param {string} materialType - Material type
   * @param {string} fieldName - Field name
   * @param {Object} updates - Field updates
   * @returns {Object} Update result
   */
  async updateCustomField(materialType, fieldName, updates) {
    try {
      if (!this.fieldTemplates[materialType] || !this.fieldTemplates[materialType].fields[fieldName]) {
        throw new Error(`Field '${fieldName}' not found for material type '${materialType}'`);
      }

      // Validate updates
      await this.validateFieldConfiguration(updates);

      // Apply updates
      const currentConfig = this.fieldTemplates[materialType].fields[fieldName];
      this.fieldTemplates[materialType].fields[fieldName] = {
        ...currentConfig,
        ...updates,
        updated_at: new Date(),
        updated_by: 'system' // In production, use actual user ID
      };

      return {
        success: true,
        message: `Custom field '${fieldName}' updated successfully`,
        field_config: this.fieldTemplates[materialType].fields[fieldName]
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a custom field
   * @param {string} materialType - Material type
   * @param {string} fieldName - Field name
   * @returns {Object} Deletion result
   */
  async deleteCustomField(materialType, fieldName) {
    try {
      if (!this.fieldTemplates[materialType] || !this.fieldTemplates[materialType].fields[fieldName]) {
        throw new Error(`Field '${fieldName}' not found for material type '${materialType}'`);
      }

      // Check if field is in use
      const usageStats = this.fieldUsageStats.get(`${materialType}.${fieldName}`);
      if (usageStats && usageStats.usage_count > 0) {
        throw new Error(`Cannot delete field '${fieldName}' as it is currently in use by ${usageStats.usage_count} materials`);
      }

      // Delete field
      delete this.fieldTemplates[materialType].fields[fieldName];
      this.fieldRegistry.delete(`${materialType}.${fieldName}`);
      this.fieldUsageStats.delete(`${materialType}.${fieldName}`);

      return {
        success: true,
        message: `Custom field '${fieldName}' deleted successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get field usage statistics
   * @param {string} materialType - Material type (optional)
   * @param {string} fieldName - Field name (optional)
   * @returns {Object} Usage statistics
   */
  getFieldUsageStats(materialType = null, fieldName = null) {
    if (materialType && fieldName) {
      const key = `${materialType}.${fieldName}`;
      return this.fieldUsageStats.get(key) || { usage_count: 0, last_used: null };
    }

    if (materialType) {
      const stats = {};
      for (const [key, value] of this.fieldUsageStats.entries()) {
        if (key.startsWith(`${materialType}.`)) {
          const field = key.split('.')[1];
          stats[field] = value;
        }
      }
      return stats;
    }

    // Return all stats
    const allStats = {};
    for (const [key, value] of this.fieldUsageStats.entries()) {
      allStats[key] = value;
    }
    return allStats;
  }

  // Helper methods
  validateFieldConfiguration(config) {
    if (!config.type || !this.validationRules.field_types.allowed.includes(config.type)) {
      throw new Error(`Invalid field type. Must be one of: ${this.validationRules.field_types.allowed.join(', ')}`);
    }

    if (!config.label || typeof config.label !== 'string') {
      throw new Error('Field must have a valid label');
    }

    if (config.options && config.options.length > this.validationRules.field_limits.max_options_per_select) {
      throw new Error(`Too many options. Maximum allowed: ${this.validationRules.field_limits.max_options_per_select}`);
    }

    return true;
  }

  registerField(materialType, fieldName, config) {
    const key = `${materialType}.${fieldName}`;
    this.fieldRegistry.set(key, {
      material_type: materialType,
      field_name: fieldName,
      config: config,
      registered_at: new Date()
    });
  }

  updateFieldUsageStats(materialType, fieldNames) {
    for (const fieldName of fieldNames) {
      const key = `${materialType}.${fieldName}`;
      const current = this.fieldUsageStats.get(key) || { usage_count: 0, last_used: null };
      this.fieldUsageStats.set(key, {
        usage_count: current.usage_count + 1,
        last_used: new Date()
      });
    }
  }

  suggestSimilarField(fieldName, availableFields) {
    const fieldNames = Object.keys(availableFields);
    const similarities = fieldNames.map(name => ({
      name,
      similarity: this.calculateStringSimilarity(fieldName.toLowerCase(), name.toLowerCase())
    }));

    return similarities
      .filter(item => item.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.name);
  }

  findSimilarValues(input, validValues) {
    const similarities = validValues.map(value => ({
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

  async generateFieldSuggestions(materialType, validatedFields, template) {
    const suggestions = [];

    // Suggest commonly used fields that are missing
    const commonFields = this.getCommonFieldsForType(materialType);
    for (const commonField of commonFields) {
      if (!validatedFields[commonField] && template.fields[commonField]) {
        suggestions.push({
          type: 'missing_common_field',
          field: commonField,
          message: `Consider adding '${commonField}' - it's commonly used for ${materialType} materials`,
          config: template.fields[commonField]
        });
      }
    }

    // Suggest related fields based on provided fields
    for (const fieldName of Object.keys(validatedFields)) {
      const relatedFields = this.getRelatedFields(fieldName, materialType);
      for (const relatedField of relatedFields) {
        if (!validatedFields[relatedField] && template.fields[relatedField]) {
          suggestions.push({
            type: 'related_field',
            field: relatedField,
            message: `Since you're using '${fieldName}', you might also want to add '${relatedField}'`,
            config: template.fields[relatedField]
          });
        }
      }
    }

    return suggestions.slice(0, 5); // Limit suggestions
  }

  getCommonFieldsForType(materialType) {
    // Return commonly used fields based on usage statistics
    const stats = this.getFieldUsageStats(materialType);
    return Object.entries(stats)
      .sort(([,a], [,b]) => b.usage_count - a.usage_count)
      .slice(0, 5)
      .map(([field]) => field);
  }

  getRelatedFields(fieldName, materialType) {
    // Define field relationships
    const relationships = {
      'has_subtitles': ['subtitle_languages'],
      'has_transcript': ['transcript_accuracy'],
      'has_images': ['image_count'],
      'has_code_examples': ['programming_languages'],
      'has_animations': ['has_audio', 'has_video'],
      'interaction_types': ['estimated_completion_time', 'supported_devices']
    };

    return relationships[fieldName] || [];
  }
}

module.exports = CustomFieldManager;