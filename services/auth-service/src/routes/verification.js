const express = require('express');
const {
  verifyCollegeCredentials,
  getCollegeSuggestions,
  verifyEmailDomain,
  requestManualVerification,
  getVerificationStatus
} = require('../controllers/verificationController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const verifyCollegeSchema = Joi.object({
  email: Joi.string().email().required(),
  collegeName: Joi.string().trim().min(2).max(200).required()
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

const manualVerificationSchema = Joi.object({
  documents: Joi.array().items(Joi.string()).max(5).default([]),
  additionalInfo: Joi.string().max(1000).allow('')
});

/**
 * @route   POST /api/auth/verify-college
 * @desc    Verify college credentials
 * @access  Private
 */
router.post('/verify-college', 
  authenticate, 
  validate(verifyCollegeSchema), 
  verifyCollegeCredentials
);

/**
 * @route   GET /api/auth/college-suggestions
 * @desc    Get college name suggestions
 * @access  Public
 */
router.get('/college-suggestions', getCollegeSuggestions);

/**
 * @route   POST /api/auth/verify-email-domain
 * @desc    Verify email domain
 * @access  Public
 */
router.post('/verify-email-domain', 
  validate(verifyEmailSchema), 
  verifyEmailDomain
);

/**
 * @route   POST /api/auth/request-manual-verification
 * @desc    Request manual verification
 * @access  Private
 */
router.post('/request-manual-verification', 
  authenticate, 
  validate(manualVerificationSchema), 
  requestManualVerification
);

/**
 * @route   GET /api/auth/verification-status
 * @desc    Get verification status
 * @access  Private
 */
router.get('/verification-status', authenticate, getVerificationStatus);

module.exports = router;