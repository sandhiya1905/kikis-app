const MetadataCollector = require('../services/metadataCollector');
const CategorizationSystem = require('../services/categorizationSystem');
const CustomFieldManager = require('../services/customFieldManager');

describe('Enhanced Metadata Collection System', () => {
  let metadataCollector;
  let categorizationSystem;
  let customFieldManager;

  beforeEach(() => {
    metadataCollector = new MetadataCollector();
    categorizationSystem = new CategorizationSystem();
    customFieldManager = new CustomFieldManager();
  });

  describe('MetadataCollector', () => {
    describe('collectMetadata', () => {
      test('should collect and validate comprehensive metadata for video content', async () => {
        const materialData = {
          duration: 1800, // 30 minutes
          format: 'mp4',
          height: 1080
        };

        const userInput = {
          title: 'Introduction to Machine Learning',
          description: 'A comprehensive introduction to machine learning concepts and algorithms',
          subject: 'computer_science',
          difficulty_level: 'intermediate',
          learning_objectives: [
            'Understand basic ML concepts',
            'Learn about supervised learning',
            'Implement simple algorithms'
          ],
          target_audience: ['undergraduate', 'graduate'],
          estimated_study_time: 45,
          language: 'en',
          topics: ['machine_learning', 'algorithms', 'data_science'],
          tags: ['ml', 'ai', 'programming'],
          customFields: {
            video_quality: '1080p',
            has_subtitles: true,
            subtitle_languages: ['en', 'es']
          }
        };

        const result = await metadataCollector.collectMetadata(
          materialData,
          userInput,
          'video'
        );

        expect(result.success).toBe(true);
        expect(result.metadata).toBeDefined();
        expect(result.metadata.title).toBe(userInput.title);
        expect(result.metadata.subject).toBe(userInput.subject);
        expect(result.metadata.difficulty_level).toBe(userInput.difficulty_level);
        expect(result.metadata.learning_objectives).toEqual(userInput.learning_objectives);
        expect(result.metadata.target_audience).toEqual(userInput.target_audience);
        expect(result.metadata.estimated_study_time).toBe(userInput.estimated_study_time);
        expect(result.metadata.video_duration).toBe(30); // converted from seconds to minutes
        expect(result.metadata.video_quality).toBe('1080p');
        expect(result.suggestions).toBeDefined();
        expect(Array.isArray(result.suggestions.tags)).toBe(true);
      });

      test('should validate required fields and return errors for missing data', async () => {
        const materialData = {};
        const userInput = {
          title: 'Test Material'
          // Missing required fields
        };

        const result = await metadataCollector.collectMetadata(
          materialData,
          userInput,
          'text'
        );

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.field).toBeDefined();
      });

      test('should generate intelligent suggestions based on content analysis', async () => {
        const materialData = {
          content: 'This material covers linear algebra, matrix operations, eigenvalues, and eigenvectors. It includes practical examples using Python and NumPy.'
        };

        const userInput = {
          title: 'Linear Algebra Fundamentals',
          subject: 'mathematics',
          difficulty_level: 'intermediate',
          learning_objectives: ['Understand matrix operations'],
          target_audience: ['undergraduate'],
          estimated_study_time: 60,
          language: 'en',
          topics: ['linear_algebra']
        };

        const result = await metadataCollector.collectMetadata(
          materialData,
          userInput,
          'text'
        );

        expect(result.success).toBe(true);
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.tags).toContain('py