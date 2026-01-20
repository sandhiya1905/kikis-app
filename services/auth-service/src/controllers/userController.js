const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Update user profile
 * @route PUT /api/user/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { profile } = req.body;
  const userId = req.user._id;

  // Find and update user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update profile fields
  if (profile) {
    Object.keys(profile).forEach(key => {
      if (profile[key] !== undefined) {
        user.profile[key] = profile[key];
      }
    });
  }

  await user.save();

  logger.info('User profile updated', {
    userId: user._id,
    email: user.email,
    updatedFields: Object.keys(profile || {})
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON()
    }
  });
});

/**
 * Change user password
 * @route PUT /api/user/password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Find user with password
  const user = await User.findById(userId).select('+password_hash');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password_hash = newPassword; // Will be hashed by pre-save middleware
  await user.save();

  logger.info('User password changed', {
    userId: user._id,
    email: user.email
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Get user statistics
 * @route GET /api/user/stats
 * @access Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // This would typically aggregate data from other services
  // For now, return basic user information
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const stats = {
    accountCreated: user.createdAt,
    lastLogin: user.last_login,
    profileCompleteness: calculateProfileCompleteness(user.profile),
    isVerified: user.is_verified
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

/**
 * Delete user account
 * @route DELETE /api/user/account
 * @access Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { password } = req.body;

  if (!password) {
    throw new AppError('Password is required to delete account', 400);
  }

  // Find user with password
  const user = await User.findById(userId).select('+password_hash');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Password is incorrect', 400);
  }

  // Delete user account
  await User.findByIdAndDelete(userId);

  logger.info('User account deleted', {
    userId: user._id,
    email: user.email
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

/**
 * Get user preferences
 * @route GET /api/user/preferences
 * @access Private
 */
const getPreferences = asyncHandler(async (req, res) => {
  const user = req.user;

  // Extract preferences from user profile
  const preferences = {
    interests: user.profile.interests || [],
    academic_level: user.profile.academic_level,
    major: user.profile.major,
    year: user.profile.year
  };

  res.status(200).json({
    success: true,
    data: {
      preferences
    }
  });
});

/**
 * Update user preferences
 * @route PUT /api/user/preferences
 * @access Private
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const { interests } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update interests
  if (interests !== undefined) {
    user.profile.interests = interests;
  }

  await user.save();

  logger.info('User preferences updated', {
    userId: user._id,
    email: user.email
  });

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: {
        interests: user.profile.interests,
        academic_level: user.profile.academic_level,
        major: user.profile.major,
        year: user.profile.year
      }
    }
  });
});

/**
 * Helper function to calculate profile completeness
 */
const calculateProfileCompleteness = (profile) => {
  const requiredFields = ['name', 'college', 'major', 'year', 'academic_level'];
  const optionalFields = ['interests'];
  
  let completedRequired = 0;
  let completedOptional = 0;

  requiredFields.forEach(field => {
    if (profile[field] && profile[field] !== '') {
      completedRequired++;
    }
  });

  optionalFields.forEach(field => {
    if (profile[field] && profile[field].length > 0) {
      completedOptional++;
    }
  });

  const requiredPercentage = (completedRequired / requiredFields.length) * 80; // 80% weight
  const optionalPercentage = (completedOptional / optionalFields.length) * 20; // 20% weight

  return Math.round(requiredPercentage + optionalPercentage);
};

module.exports = {
  updateProfile,
  changePassword,
  getUserStats,
  deleteAccount,
  getPreferences,
  updatePreferences
};