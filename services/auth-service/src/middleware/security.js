const crypto = require('crypto');
const { logger } = require('../utils/logger');
const { AppError } = require('./errorHandler');

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove potential XSS patterns
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Request fingerprinting for security monitoring
 */
const generateRequestFingerprint = (req) => {
  const fingerprint = {
    ip: req.ip,
    userAgent: req.get('User-Agent') || '',
    acceptLanguage: req.get('Accept-Language') || '',
    acceptEncoding: req.get('Accept-Encoding') || '',
    timestamp: Date.now()
  };

  // Generate hash of fingerprint
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(fingerprint))
    .digest('hex');

  return {
    ...fingerprint,
    hash
  };
};

/**
 * Security monitoring middleware
 */
const securityMonitoring = (req, res, next) => {
  // Generate request fingerprint
  req.fingerprint = generateRequestFingerprint(req);

  // Log security-relevant requests
  const securityEndpoints = ['/login', '/register', '/refresh', '/password'];
  const isSecurityEndpoint = securityEndpoints.some(endpoint => 
    req.path.includes(endpoint)
  );

  if (isSecurityEndpoint) {
    logger.info('Security endpoint accessed', {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      fingerprint: req.fingerprint.hash
    });
  }

  next();
};

/**
 * Password strength validator
 */
const validatePasswordStrength = (password) => {
  const minLength = 6;
  const maxLength = 128;
  
  const checks = {
    length: password.length >= minLength && password.length <= maxLength,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    isValid: checks.length && checks.lowercase && checks.uppercase && checks.number,
    score,
    checks,
    strength: score < 3 ? 'weak' : score < 4 ? 'medium' : 'strong'
  };
};

/**
 * Encryption utilities
 */
class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  /**
   * Generate encryption key from password
   */
  generateKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text, password) {
    try {
      const salt = crypto.randomBytes(16);
      const key = this.generateKey(password, salt);
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(salt);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      logger.error('Encryption failed', { error: error.message });
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData, password) {
    try {
      const { encrypted, salt, iv, tag } = encryptedData;
      const key = this.generateKey(password, Buffer.from(salt, 'hex'));
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from(salt, 'hex'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed', { error: error.message });
      throw new Error('Decryption failed');
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data, salt = null) {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha256').toString('hex');
    
    return {
      hash,
      salt: actualSalt
    };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data, hash, salt) {
    const { hash: computedHash } = this.hash(data, salt);
    return computedHash === hash;
  }
}

/**
 * Suspicious activity detection
 */
class SuspiciousActivityDetector {
  constructor() {
    this.suspiciousPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /<script/i,
      /javascript:/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /window\.location/i
    ];
  }

  /**
   * Check for suspicious patterns in request
   */
  detectSuspiciousActivity(req) {
    const suspicious = [];
    
    // Check request body
    const bodyString = JSON.stringify(req.body || {});
    this.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(bodyString)) {
        suspicious.push({
          type: 'malicious_payload',
          pattern: pattern.toString(),
          location: 'body',
          severity: 'high'
        });
      }
    });

    // Check query parameters
    const queryString = JSON.stringify(req.query || {});
    this.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(queryString)) {
        suspicious.push({
          type: 'malicious_payload',
          pattern: pattern.toString(),
          location: 'query',
          severity: 'high'
        });
      }
    });

    // Check for unusual request patterns
    if (req.get('User-Agent') === '') {
      suspicious.push({
        type: 'missing_user_agent',
        severity: 'medium'
      });
    }

    // Check for rapid requests (would need session storage in production)
    // This is a simplified version
    if (req.headers['x-forwarded-for']) {
      suspicious.push({
        type: 'proxy_usage',
        severity: 'low'
      });
    }

    return suspicious;
  }
}

const encryptionService = new EncryptionService();
const suspiciousActivityDetector = new SuspiciousActivityDetector();

/**
 * Security middleware that combines all security checks
 */
const securityMiddleware = (req, res, next) => {
  // Detect suspicious activity
  const suspicious = suspiciousActivityDetector.detectSuspiciousActivity(req);
  
  if (suspicious.length > 0) {
    const highSeverity = suspicious.filter(s => s.severity === 'high');
    
    if (highSeverity.length > 0) {
      logger.warn('Suspicious activity detected', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        suspicious,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({
        success: false,
        message: 'Request blocked due to security policy'
      });
    }
    
    // Log medium/low severity issues but allow request
    logger.info('Potential security issue detected', {
      ip: req.ip,
      path: req.path,
      suspicious: suspicious.filter(s => s.severity !== 'high')
    });
  }

  next();
};

module.exports = {
  sanitizeInput,
  securityMonitoring,
  validatePasswordStrength,
  encryptionService,
  suspiciousActivityDetector,
  securityMiddleware,
  generateRequestFingerprint
};