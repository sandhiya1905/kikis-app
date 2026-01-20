const collegeVerificationService = require('../services/collegeVerification');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Verify college credentials
 * @route POST /api/auth/verify-college
 * @access Private
 */
const verifyCollegeCredentials = asyncHandler(async (req, res) => {
  const { email, collegeName } = req.body;
  const userId = req.user._id;

  if (!email || !collegeName) {
    throw new AppError('Email and college name are required', 400);
  }

  // Perform comprehensive verification
  const verificationResult = await collegeVerificationService.comprehensiveVerification(
    email,
    collegeName
  );

  // Update user verification status if verification passes
  if (verificationResult.isVerified && verificationResult.overallConfidence >= 0.7) {
    await User.findByIdAndUpdate(userId, {
      is_verified: true,
      'profile.verification_status': 'verified',
      'profile.verification_date': new Date(),
      'profile.verification_confidence': verificationResult.overallConfidence
    });

    logger.info('User college credentials verified', {
      userId,
      email,
      collegeName,
      confidence: verificationResult.overallConfidence
    });
  }

  res.status(200).json({
    success: true,
    message: verificationResult.isVerified ? 
      'College credentials verified successfully' : 
      'College credentials could not be verified',
    data: {
      verification: verificationResult,
      userVerified: verificationResult.isVerified && verificationResult.overallConfidence >= 0.7
    }
  });
});

/**
 * Get college suggestions
 * @route GET /api/auth/college-suggestions
 * @access Public
 */
const getCollegeSuggestions = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    throw new AppError('Query must be at least 2 characters long', 400);
  }

  const suggestions = collegeVerificationService.getSuggestions(query);

  res.status(200).json({
    success: true,
    data: {
      suggestions,
      query
    }
  });
});

/**
 * Verify email domain
 * @route POST /api/auth/verify-email-domain
 * @access Public
 */
const verifyEmailDomain = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const verificationResult = await collegeVerificationService.verifyCollegeEmail(email);

  res.status(200).json({
    success: true,
    data: {
      verification: verificationResult
    }
  });
});

/**
 * Request manual verification
 * @route POST /api/auth/request-manual-verification
 * @access Private
 */
const requestManualVerification = asyncHandler(async (req, res) => {
  const { documents, additionalInfo } = req.body;
  const userId = req.user._id;

  // In a production environment, this would:
  // 1. Store uploaded documents securely
  // 2. Create a verification request ticket
  // 3. Notify administrators for manual review
  // 4. Send confirmation email to user

  // For now, we'll just log the request and update user status
  await User.findByIdAndUpdate(userId, {
    'profile.verification_status': 'pending_manual_review',
    'profile.manual_verification_requested': new Date(),
    'profile.verification_documents': documents || [],
    'profile.additional_verification_info': additionalInfo
  });

  logger.info('Manual verification requested', {
    userId,
    email: req.user.email,
    documentsCount: documents?.length || 0,
    additionalInfo: !!additionalInfo
  });

  res.status(200).json({
    success: true,
    message: 'Manual verification request submitted successfully. You will be notified once the review is complete.',
    data: {
      status: 'pending_manual_review',
      estimatedReviewTime: '2-3 business days'
    }
  });
});

/**
 * Get verification status
 * @route GET /api/auth/verification-status
 * @access Private
 */
const getVerificationStatus = asyncHandler(async (req, res) => {
  const user = req.user;

  const verificationStatus = {
    isVerified: user.is_verified,
    verificationStatus: user.profile.verification_status || 'unverified',
    verificationDate: user.profile.verification_date,
    verificationConfidence: user.profile.verification_confidence,
    manualVerificationRequested: user.profile.manual_verification_requested,
    canRequestManualVerification: !user.is_verified && 
      !user.profile.manual_verification_requested &&
      user.profile.verification_status !== 'pending_manual_review'
  };

  res.status(200).json({
    success: true,
    data: {
      verificationStatus
    }
  });
});

module.exports = {
  verifyCollegeCredentials,
  getCollegeSuggestions,
  verifyEmailDomain,
  requestManualVerification,
  getVerificationStatus
};