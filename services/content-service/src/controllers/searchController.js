const StudyMaterial = require('../models/StudyMaterial');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Search study materials
 * @route GET /api/search
 * @access Public
 */
const searchMaterials = asyncHandler(async (req, res) => {
  const {
    q: query,
    page = 1,
    limit = 10,
    subject,
    difficulty_level,
    content_type,
    semester,
    sort = 'relevance'
  } = req.query;

  if (!query || query.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters long', 400);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build search filter
  const searchFilter = {
    is_public: true,
    is_approved: true,
    status: 'approved'
  };

  // Add additional filters
  if (subject) searchFilter.subject = new RegExp(subject, 'i');
  if (difficulty_level) searchFilter['metadata.difficulty_level'] = difficulty_level;
  if (content_type) searchFilter.content_type = content_type;
  if (semester) searchFilter['metadata.semester'] = parseInt(semester);

  let materials;
  let total;

  if (sort === 'relevance') {
    // Text search with relevance scoring
    const textSearchFilter = {
      ...searchFilter,
      $text: { $search: query }
    };

    materials = await StudyMaterial.find(textSearchFilter, {
      score: { $meta: 'textScore' }
    })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploaded_by', 'profile.name profile.college');

    total = await StudyMaterial.countDocuments(textSearchFilter);
  } else {
    // Fallback to regex search if text search doesn't work
    const regexQuery = new RegExp(query, 'i');
    const regexFilter = {
      ...searchFilter,
      $or: [
        { title: regexQuery },
        { description: regexQuery },
        { subject: regexQuery },
        { 'metadata.topics': regexQuery },
        { 'metadata.tags': regexQuery }
      ]
    };

    const sortQuery = {};
    switch (sort) {
      case 'date':
        sortQuery.upload_date = -1;
        break;
      case 'rating':
        sortQuery['rating.average'] = -1;
        break;
      case 'popularity':
        sortQuery.access_count = -1;
        break;
      default:
        sortQuery.upload_date = -1;
    }

    materials = await StudyMaterial.find(regexFilter)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploaded_by', 'profile.name profile.college');

    total = await StudyMaterial.countDocuments(regexFilter);
  }

  // Log search query
  logger.info('Search performed', {
    query,
    filters: { subject, difficulty_level, content_type, semester },
    results: materials.length,
    userId: req.user?._id
  });

  res.status(200).json({
    success: true,
    data: {
      query,
      materials,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    }
  });
});

/**
 * Get search suggestions
 * @route GET /api/search/suggestions
 * @access Public
 */
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q: query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(200).json({
      success: true,
      data: {
        suggestions: []
      }
    });
  }

  const regexQuery = new RegExp(query, 'i');

  // Get suggestions from different fields
  const [titleSuggestions, subjectSuggestions, topicSuggestions] = await Promise.all([
    // Title suggestions
    StudyMaterial.find({
      title: regexQuery,
      is_public: true,
      is_approved: true
    })
      .select('title')
      .limit(5)
      .lean(),

    // Subject suggestions
    StudyMaterial.distinct('subject', {
      subject: regexQuery,
      is_public: true,
      is_approved: true
    }).limit(5),

    // Topic suggestions
    StudyMaterial.find({
      'metadata.topics': regexQuery,
      is_public: true,
      is_approved: true
    })
      .select('metadata.topics')
      .limit(10)
      .lean()
  ]);

  // Flatten and deduplicate suggestions
  const suggestions = [];
  
  // Add title suggestions
  titleSuggestions.forEach(material => {
    if (material.title.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        text: material.title,
        type: 'title'
      });
    }
  });

  // Add subject suggestions
  subjectSuggestions.forEach(subject => {
    suggestions.push({
      text: subject,
      type: 'subject'
    });
  });

  // Add topic suggestions
  const topics = new Set();
  topicSuggestions.forEach(material => {
    material.metadata.topics.forEach(topic => {
      if (topic.toLowerCase().includes(query.toLowerCase())) {
        topics.add(topic);
      }
    });
  });

  Array.from(topics).slice(0, 5).forEach(topic => {
    suggestions.push({
      text: topic,
      type: 'topic'
    });
  });

  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    )
    .slice(0, 10);

  res.status(200).json({
    success: true,
    data: {
      query,
      suggestions: uniqueSuggestions
    }
  });
});

/**
 * Advanced search with multiple criteria
 * @route POST /api/search/advanced
 * @access Public
 */
const advancedSearch = asyncHandler(async (req, res) => {
  const {
    keywords,
    subjects,
    difficulty_levels,
    content_types,
    semesters,
    tags,
    date_range,
    rating_min,
    file_size_max,
    page = 1,
    limit = 10,
    sort = 'relevance'
  } = req.body;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build advanced search filter
  const filter = {
    is_public: true,
    is_approved: true,
    status: 'approved'
  };

  // Keywords search
  if (keywords && keywords.trim()) {
    const keywordRegex = new RegExp(keywords, 'i');
    filter.$or = [
      { title: keywordRegex },
      { description: keywordRegex },
      { 'metadata.topics': keywordRegex },
      { 'metadata.tags': keywordRegex }
    ];
  }

  // Subject filter
  if (subjects && subjects.length > 0) {
    filter.subject = { $in: subjects };
  }

  // Difficulty level filter
  if (difficulty_levels && difficulty_levels.length > 0) {
    filter['metadata.difficulty_level'] = { $in: difficulty_levels };
  }

  // Content type filter
  if (content_types && content_types.length > 0) {
    filter.content_type = { $in: content_types };
  }

  // Semester filter
  if (semesters && semesters.length > 0) {
    filter['metadata.semester'] = { $in: semesters.map(s => parseInt(s)) };
  }

  // Tags filter
  if (tags && tags.length > 0) {
    filter['metadata.tags'] = { $in: tags };
  }

  // Date range filter
  if (date_range) {
    const dateFilter = {};
    if (date_range.from) dateFilter.$gte = new Date(date_range.from);
    if (date_range.to) dateFilter.$lte = new Date(date_range.to);
    if (Object.keys(dateFilter).length > 0) {
      filter.upload_date = dateFilter;
    }
  }

  // Rating filter
  if (rating_min) {
    filter['rating.average'] = { $gte: parseFloat(rating_min) };
  }

  // File size filter
  if (file_size_max) {
    filter['metadata.file_size'] = { $lte: parseInt(file_size_max) };
  }

  // Build sort query
  const sortQuery = {};
  switch (sort) {
    case 'date':
      sortQuery.upload_date = -1;
      break;
    case 'rating':
      sortQuery['rating.average'] = -1;
      break;
    case 'popularity':
      sortQuery.access_count = -1;
      break;
    case 'size':
      sortQuery['metadata.file_size'] = 1;
      break;
    default:
      sortQuery.upload_date = -1;
  }

  const materials = await StudyMaterial.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('uploaded_by', 'profile.name profile.college');

  const total = await StudyMaterial.countDocuments(filter);

  logger.info('Advanced search performed', {
    filters: req.body,
    results: materials.length,
    userId: req.user?._id
  });

  res.status(200).json({
    success: true,
    data: {
      materials,
      filters: req.body,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    }
  });
});

/**
 * Get search filters/facets
 * @route GET /api/search/filters
 * @access Public
 */
const getSearchFilters = asyncHandler(async (req, res) => {
  const [subjects, difficultyLevels, contentTypes, semesters] = await Promise.all([
    StudyMaterial.distinct('subject', { is_public: true, is_approved: true }),
    StudyMaterial.distinct('metadata.difficulty_level', { is_public: true, is_approved: true }),
    StudyMaterial.distinct('content_type', { is_public: true, is_approved: true }),
    StudyMaterial.distinct('metadata.semester', { is_public: true, is_approved: true })
  ]);

  res.status(200).json({
    success: true,
    data: {
      filters: {
        subjects: subjects.sort(),
        difficulty_levels: difficultyLevels.sort(),
        content_types: contentTypes.sort(),
        semesters: semesters.filter(s => s).sort((a, b) => a - b)
      }
    }
  });
});

module.exports = {
  searchMaterials,
  getSearchSuggestions,
  advancedSearch,
  getSearchFilters
};