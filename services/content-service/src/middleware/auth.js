const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Authentication middleware that verifies tokens with auth service
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.get(`${authServiceUrl}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.data.success && response.data.data.user) {
      req.user = response.data.data.user;
      req.token = token;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    logger.error('Authentication error:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: error.response.data?.message || 'Authentication failed'
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Authentication service unavailable'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    
    const response = await axios.get(`${authServiceUrl}/api/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    });

    if (response.data.success && response.data.data.user) {
      req.user = response.data.data.user;
      req.token = token;
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed:', { error: error.message });
  }
  
  next();
};

/**
 * Authorization middleware to check user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed:', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
const checkOwnership = (resourceUserField = 'uploaded_by') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if resource exists and user owns it
    // This will be used in conjunction with resource loading middleware
    if (req.resource && req.resource[resourceUserField]) {
      const resourceUserId = req.resource[resourceUserField].toString();
      const currentUserId = req.user._id.toString();
      
      if (resourceUserId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership
};