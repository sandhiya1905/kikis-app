const StudyMaterial = require('../models/StudyMaterial');
const UserCollection = require('../models/UserCollection');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Get all study materials with filtering and pagination
 * @route GET /api/content/materials
 * @access Public
 */
const getMaterials = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    subject,
    difficulty_level,
    content_type,
    semester,
    sort = 'upload_date',
    order = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build filter query
  const filter = {
    is_public: true,
    is_approved: true,
    status: 'approved'
  };

  if (subject) filter.subject = new RegExp(subject, 'i');
  if (difficulty_level) filter['metadata.difficulty_level'] = difficulty_level;
  if (content_type) filter.content_type = content_type;
  if (semester) filter['metadata.semester'] = parseInt(semester);

  // Build sort query
  const sortQuery = {};
  sortQuery[sort] = order === 'desc' ? -1 : 1;

  const materials = await StudyMaterial.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('uploaded_by', 'profile.name profile.college');

  const total = await StudyMaterial.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
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
 * Get material by ID
 * @route GET /api/content/materials/:id
 * @access Public
 */
const getMaterialById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const material = await StudyMaterial.findById(id)
    .populate('uploaded_by', 'profile.name profile.college profile.academic_level');

  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Check if material is public or user owns it
  if (!material.is_public && (!req.user || material.uploaded_by._id.toString() !== req.user._id.toString())) {
    throw new AppError('Access denied', 403);
  }

  // Increment access count
  await material.incrementAccessCount();

  res.status(200).json({
    success: true,
    data: {
      material: material.toJSON()
    }
  });
});

/**
 * Get materials by subject
 * @route GET /api/content/subjects/:subject
 * @access Public
 */
const getMaterialsBySubject = asyncHandler(async (req, res) => {
  const { subject } = req.params;
  const {
    page = 1,
    limit = 10,
    difficulty_level,
    semester,
    sort = 'rating.average',
    order = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const filter = {
    subject: new RegExp(subject, 'i'),
    is_public: true,
    is_approved: true,
    status: 'approved'
  };

  if (difficulty_level) filter['metadata.difficulty_level'] = difficulty_level;
  if (semester) filter['metadata.semester'] = parseInt(semester);

  const sortQuery = {};
  sortQuery[sort] = order === 'desc' ? -1 : 1;

  const materials = await StudyMaterial.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('uploaded_by', 'profile.name profile.college');

  const total = await StudyMaterial.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      subject,
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
 * Get popular materials
 * @route GET /api/content/popular
 * @access Public
 */
const getPopularMaterials = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const materials = await StudyMaterial.getPopular(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      materials
    }
  });
});

/**
 * Get recent materials
 * @route GET /api/content/recent
 * @access Public
 */
const getRecentMaterials = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const materials = await StudyMaterial.getRecent(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      materials
    }
  });
});

/**
 * Get top rated materials
 * @route GET /api/content/top-rated
 * @access Public
 */
const getTopRatedMaterials = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const materials = await StudyMaterial.getTopRated(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      materials
    }
  });
});

/**
 * Download material
 * @route GET /api/content/download/:id
 * @access Public
 */
const downloadMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const material = await StudyMaterial.findById(id);

  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Check if material is public or user owns it
  if (!material.is_public && (!req.user || material.uploaded_by.toString() !== req.user._id.toString())) {
    throw new AppError('Access denied', 403);
  }

  // Increment download count
  await material.incrementDownloadCount();

  // Log download
  logger.info('Material downloaded', {
    materialId: material._id,
    title: material.title,
    downloadedBy: req.user?._id || 'anonymous',
    ip: req.ip
  });

  // Redirect to file URL or serve file directly
  res.redirect(material.file_url);
});

/**
 * Rate material
 * @route POST /api/content/rate/:id
 * @access Private
 */
const rateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const material = await StudyMaterial.findById(id);

  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Update rating
  await material.updateRating(rating);

  logger.info('Material rated', {
    materialId: material._id,
    rating,
    ratedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Rating submitted successfully',
    data: {
      rating: {
        average: material.rating.average,
        count: material.rating.count
      }
    }
  });
});

/**
 * Get available subjects
 * @route GET /api/content/subjects
 * @access Public
 */
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await StudyMaterial.distinct('subject', {
    is_public: true,
    is_approved: true,
    status: 'approved'
  });

  // Get material count for each subject
  const subjectsWithCounts = await Promise.all(
    subjects.map(async (subject) => {
      const count = await StudyMaterial.countDocuments({
        subject,
        is_public: true,
        is_approved: true,
        status: 'approved'
      });
      return { subject, count };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      subjects: subjectsWithCounts.sort((a, b) => b.count - a.count)
    }
  });
});

/**
 * Get content statistics
 * @route GET /api/content/stats
 * @access Public
 */
const getContentStats = asyncHandler(async (req, res) => {
  const [
    totalMaterials,
    totalSubjects,
    totalDownloads,
    contentTypes
  ] = await Promise.all([
    StudyMaterial.countDocuments({ is_public: true, is_approved: true }),
    StudyMaterial.distinct('subject', { is_public: true, is_approved: true }).then(subjects => subjects.length),
    StudyMaterial.aggregate([
      { $match: { is_public: true, is_approved: true } },
      { $group: { _id: null, total: { $sum: '$download_count' } } }
    ]).then(result => result[0]?.total || 0),
    StudyMaterial.aggregate([
      { $match: { is_public: true, is_approved: true } },
      { $group: { _id: '$content_type', count: { $sum: 1 } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        total_materials: totalMaterials,
        total_subjects: totalSubjects,
        total_downloads: totalDownloads,
        content_types: contentTypes
      }
    }
  });
});

module.exports = {
  getMaterials,
  getMaterialById,
  getMaterialsBySubject,
  getPopularMaterials,
  getRecentMaterials,
  getTopRatedMaterials,
  downloadMaterial,
  rateMaterial,
  getSubjects,
  getContentStats
};