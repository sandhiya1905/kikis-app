const User = require('../models/User');
const jwtService = require('../utils/jwt');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const securityLogger = require('../utils/securityLogger');
const { validatePasswordStrength } = require('../middleware/security');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, profile } = req.body;

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    securityLogger.logAuthEvent('registration_failed', {
      email,
      reason: 'weak_password',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    throw new AppError('Password does not meet security requirements. Must contain uppercase, lowercase, and number.', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    securityLogger.logAuthEvent('registration_failed', {
      email,
      reason: 'email_exists',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    throw new AppError('User with this email already exists', 409);
  }

  // Create new user
  const user = new User({
    email,
    password_hash: password, // Will be hashed by pre-save middleware
    profile
  });

  await user.save();

  // Generate tokens
  const tokens = jwtService.generateTokenPair(user);

  // Log successful registration
  securityLogger.logAuthEvent('registration_success', {
    userId: user._id,
    email: user.email,
    college: user.profile.college,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info('User registered successfully', {
    userId: user._id,
    email: user.email,
    college: user.profile.college
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      ...tokens
    }
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password_hash');
  
  if (!user) {
    securityLogger.logAuthEvent('login_failed', {
      email,
      reason: 'user_not_found',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is locked
  if (user.isAccountLocked()) {
    securityLogger.logAuthEvent('login_locked', {
      userId: user._id,
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    throw new AppError('Account is temporarily locked due to multiple failed login attempts. Please try again later.', 423);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment failed attempts
    await user.incrementFailedAttempts();
    
    securityLogger.logAuthEvent('login_failed', {
      userId: user._id,
      email,
      reason: 'invalid_password',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      failedAttempts: user.failed_login_attempts + 1
    });
    
    logger.warn('Failed login attempt', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    throw new AppError('Invalid email or password', 401);
  }

  // Reset failed attempts on successful login
  if (user.failed_login_attempts > 0) {
    await user.resetFailedAttempts();
  }

  // Update last login
  user.last_login = new Date();
  await user.save();

  // Generate tokens
  const tokens = jwtService.generateTokenPair(user);

  // Log successful login
  securityLogger.logAuthEvent('login_success', {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info('User logged in successfully', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      ...tokens
    }
  });
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    // Verify refresh token
    const decoded = jwtService.verifyToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      throw new AppError('Account is temporarily locked', 423);
    }

    // Generate new token pair
    const tokens = jwtService.generateTokenPair(user);

    logger.info('Token refreshed successfully', {
      userId: user._id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens
    });
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    throw new AppError('Invalid or expired refresh token', 401);
  }
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a production environment, you might want to blacklist the token
  // For now, we'll just return a success response
  
  logger.info('User logged out', {
    userId: req.user._id,
    email: req.user.email
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user.toJSON()
    }
  });
});

/**
 * Verify token
 * @route GET /api/auth/verify
 * @access Private
 */
const verifyToken = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user.toJSON(),
      tokenInfo: {
        isValid: true,
        expiresAt: req.tokenExpiry
      }
    }
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  verifyToken
};