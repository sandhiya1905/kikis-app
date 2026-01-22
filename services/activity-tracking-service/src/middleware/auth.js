const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Add user context for activity logging
    req.userContext = {
      userId: decoded.id || decoded.userId,
      sessionId: req.header('X-Session-ID') || `session_${Date.now()}_${Math.random()}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.header('User-Agent'),
      referrer: req.header('Referer')
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }

    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;