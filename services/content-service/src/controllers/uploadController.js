const StudyMaterial = require('../models/StudyMaterial');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { cleanupFile } = require('../middleware/upload');
const path = require('path');

/**
 * Upload a new study material
 * @route POST /api/upload
 * @access Private
 */
const uploadMaterial = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    subject,
    content_type,
    semester,
    difficulty_level,
    topics,
    tags,
    language,
    duration
  } = req.body;

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  try {
    // Parse topics and tags if they're strings
    const parsedTopics = typeof topics === 'string' ? 
      topics.split(',').map(t => t.trim()).filter(t => t) : 
      (topics || []);
    
    const parsedTags = typeof tags === 'string' ? 
      tags.split(',').map(t => t.trim()).filter(t => t) : 
      (tags || []);

    // Create study material record
    const studyMaterial = new StudyMaterial({
      title,
      description,
      subject,
      content_type,
      file_path: req.file.path,
      file_url: req.file.url,
      metadata: {
        semester: semester ? parseInt(semester) : undefined,
        difficulty_level,
        topics: parsedTopics,
        tags: parsedTags,
        file_size: req.file.size,
        duration: duration ? parseInt(duration) : 0,
        language: language || 'English'
      },
      uploaded_by: req.user._id
    });

    await studyMaterial.save();

    logger.info('Study material uploaded successfully', {
      materialId: studyMaterial._id,
      title: studyMaterial.title,
      subject: studyMaterial.subject,
      uploadedBy: req.user._id,
      fileSize: req.file.size
    });

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      data: {
        material: studyMaterial.toJSON()
      }
    });
  } catch (error) {
    // Clean up uploaded file if database save fails
    cleanupFile(req.file.path);
    throw error;
  }
});

/**
 * Get upload progress/status
 * @route GET /api/upload/status/:id
 * @access Private
 */
const getUploadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const material = await StudyMaterial.findById(id);
  
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Check if user owns the material or is admin
  if (material.uploaded_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      status: material.status,
      is_approved: material.is_approved,
      upload_date: material.upload_date,
      approval_date: material.approval_date
    }
  });
});

/**
 * Update material metadata
 * @route PUT /api/upload/:id
 * @access Private
 */
const updateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    subject,
    semester,
    difficulty_level,
    topics,
    tags,
    language,
    duration
  } = req.body;

  const material = await StudyMaterial.findById(id);
  
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Check if user owns the material or is admin
  if (material.uploaded_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  // Update fields
  if (title) material.title = title;
  if (description !== undefined) material.description = description;
  if (subject) material.subject = subject;
  
  // Update metadata
  if (semester) material.metadata.semester = parseInt(semester);
  if (difficulty_level) material.metadata.difficulty_level = difficulty_level;
  if (language) material.metadata.language = language;
  if (duration) material.metadata.duration = parseInt(duration);
  
  if (topics) {
    material.metadata.topics = typeof topics === 'string' ? 
      topics.split(',').map(t => t.trim()).filter(t => t) : 
      topics;
  }
  
  if (tags) {
    material.metadata.tags = typeof tags === 'string' ? 
      tags.split(',').map(t => t.trim()).filter(t => t) : 
      tags;
  }

  await material.save();

  logger.info('Study material updated', {
    materialId: material._id,
    updatedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Material updated successfully',
    data: {
      material: material.toJSON()
    }
  });
});

/**
 * Delete uploaded material
 * @route DELETE /api/upload/:id
 * @access Private
 */
const deleteMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const material = await StudyMaterial.findById(id);
  
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Check if user owns the material or is admin
  if (material.uploaded_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  // Clean up file
  cleanupFile(material.file_path);

  // Delete from database
  await StudyMaterial.findByIdAndDelete(id);

  logger.info('Study material deleted', {
    materialId: id,
    deletedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Material deleted successfully'
  });
});

/**
 * Get user's uploaded materials
 * @route GET /api/upload/my-materials
 * @access Private
 */
const getMyMaterials = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const materials = await StudyMaterial.find({ uploaded_by: req.user._id })
    .sort({ upload_date: -1 })
    .skip(skip)
    .limit(limit)
    .populate('uploaded_by', 'profile.name profile.college');

  const total = await StudyMaterial.countDocuments({ uploaded_by: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      materials,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit
      }
    }
  });
});

/**
 * Bulk upload materials
 * @route POST /api/upload/bulk
 * @access Private
 */
const bulkUpload = asyncHandler(async (req, res) => {
  // This would handle multiple file uploads
  // For now, return not implemented
  res.status(501).json({
    success: false,
    message: 'Bulk upload not yet implemented'
  });
});

module.exports = {
  uploadMaterial,
  getUploadStatus,
  updateMaterial,
  deleteMaterial,
  getMyMaterials,
  bulkUpload
};