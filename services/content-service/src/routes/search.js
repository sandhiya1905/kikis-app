const express = require('express');
const {
  searchMaterials,
  getSearchSuggestions,
  advancedSearch,
  getSearchFilters
} = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search study materials
 * @access  Public
 */
router.get('/', optionalAuth, searchMaterials);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions
 * @access  Public
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @route   POST /api/search/advanced
 * @desc    Advanced search with multiple criteria
 * @access  Public
 */
router.post('/advanced', optionalAuth, advancedSearch);

/**
 * @route   GET /api/search/filters
 * @desc    Get available search filters
 * @access  Public
 */
router.get('/filters', getSearchFilters);

module.exports = router;