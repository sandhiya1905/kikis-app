const express = require('express');
const {
  uploadMaterial,
  getUploadStatus,
  updateMaterial,
  deleteMaterial,
  getMyMaterials,
  bulkUpload
} = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { upload, handleUploadError, validateUploadedFile, generateFileUrl } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/upload
 * @desc    Upload a new study material
 * @access  Private
 */
router.post('/', 
  upload.single('file'),
  handleUploadError,
  validateUploadedFile,
  generateFileUrl,
  uploadMaterial
);

/**
 * @route   GET /api/upload/status/:id
 * @desc    Get upload status
 * @access  Private
 */
router.get('/status/:id', getUploadStatus);

/**
 * @route   PUT /api/upload/:id
 * @desc    Update material metadata
 * @access  Private
 */
router.put('/:id', updateMaterial);

/**
 * @route   DELETE /api/upload/:id
 * @desc    Delete uploaded material
 * @access  Private
 */
router.delete('/:id', deleteMaterial);

/**
 * @route   GET /api/upload/my-materials
 * @desc    Get user's uploaded materials
 * @access  Private
 */
router.get('/my-materials', getMyMaterials);

/**
 * @route   POST /api/upload/bulk
 * @desc    Bulk upload materials
 * @access  Private
 */
router.post('/bulk', bulkUpload);

module.exports = router;