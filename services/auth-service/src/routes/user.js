const express = require('express');
const {
  updateProfile,
  changePassword,
  getUserStats,
  deleteAccount,
  getPreferences,
  updatePreferences
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate, updateProfileSchema, changePasswordSchema } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', validate(updateProfileSchema), updateProfile);

/**
 * @route   PUT /api/user/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', validate(changePasswordSchema), changePassword);

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', getUserStats);

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', deleteAccount);

/**
 * @route   GET /api/user/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', getPreferences);

/**
 * @route   PUT /api/user/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', updatePreferences);

module.exports = router;