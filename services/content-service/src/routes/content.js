const express = require('express');
const {
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
} = require('../controllers/contentController');
const { optionalAuth, authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/content/materials
 * @desc    Get all study materials with filtering
 * @access  Public
 */
router.get('/materials', optionalAuth, getMaterials);

/**
 * @route   GET /api/content/materials/:id
 * @desc    Get material by ID
 * @access  Public
 */
router.get('/materials/:id', optionalAuth, getMaterialById);

/**
 * @route   GET /api/content/subjects/:subject
 * @desc    Get materials by subject
 * @access  Public
 */
router.get('/subjects/:subject', optionalAuth, getMaterialsBySubject);

/**
 * @route   GET /api/content/popular
 * @desc    Get popular materials
 * @access  Public
 */
router.get('/popular', getPopularMaterials);

/**
 * @route   GET /api/content/recent
 * @desc    Get recent materials
 * @access  Public
 */
router.get('/recent', getRecentMaterials);

/**
 * @route   GET /api/content/top-rated
 * @desc    Get top rated materials
 * @access  Public
 */
router.get('/top-rated', getTopRatedMaterials);

/**
 * @route   GET /api/content/download/:id
 * @desc    Download material
 * @access  Public
 */
router.get('/download/:id', optionalAuth, downloadMaterial);

/**
 * @route   POST /api/content/rate/:id
 * @desc    Rate material
 * @access  Private
 */
router.post('/rate/:id', authenticate, rateMaterial);

/**
 * @route   GET /api/content/subjects
 * @desc    Get available subjects
 * @access  Public
 */
router.get('/subjects', getSubjects);

/**
 * @route   GET /api/content/stats
 * @desc    Get content statistics
 * @access  Public
 */
router.get('/stats', getContentStats);

module.exports = router;