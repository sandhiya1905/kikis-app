const { logger } = require('./logger');
const fs = require('fs');
const path = require('path');

/**
 * Security-focused logging utility
 */
class SecurityLogger {
  constructor() {
    this.securityLogDir = path.join(__dirname, '../../logs/security');
    this.ensureSecurityLogDirectory();
  }

  ensureSecurityLogDirectory() {
    if (!fs.existsSync(this.securityLogDir)) {
      fs.mkdirSync(this.securityLogDir, { recursive: true });
    }
  }

  /**
   * Log authentication events
   */
  logAuthEvent(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ...details,
      severity: this.getEventSeverity(event)
    };

    logger.info(`Auth Event: ${event}`, logEntry);
    this.writeSecurityLog('auth', logEntry);
  }

  /**
   * Log security violations
   */
  logSecurityViolation(violation, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      violation,
      ...details,
      severity: 'high'
    };

    logger.warn(`Security Violation: ${violation}`, logEntry);
    this.writeSecurityLog('violations', logEntry);
  }

  /**
   * Log suspicious activities
   */
  logSuspiciousActivity(activity, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      activity,
      ...details,
      severity: 'medium'
    };

    logger.warn(`Suspicious Activity: ${activity}`, logEntry);
    this.writeSecurityLog('suspicious', logEntry);
  }

  /**
   * Log access attempts
   */
  logAccessAttempt(endpoint, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      ...details,
      severity: 'low'
    };

    logger.info(`Access Attempt: ${endpoint}`, logEntry);
    this.writeSecurityLog('access', logEntry);
  }

  /**
   * Write to security-specific log files
   */
  writeSecurityLog(category, logEntry) {
    if (process.env.NODE_ENV === 'test') return;

    const filename = `${category}-${new Date().toISOString().split('T')[0]}.log`;
    const filepath = path.join(this.securityLogDir, filename);
    
    try {
      fs.appendFileSync(filepath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      logger.error('Failed to write security log', { error: error.message });
    }
  }

  /**
   * Get severity level for different events
   */
  getEventSeverity(event) {
    const severityMap = {
      'login_success': 'low',
      'login_failed': 'medium',
      'login_locked': 'high',
      'registration_success': 'low',
      'registration_failed': 'medium',
      'password_changed': 'medium',
      'profile_updated': 'low',
      'token_refresh': 'low',
      'token_expired': 'low',
      'invalid_token': 'medium',
      'account_deleted': 'high',
      'verification_requested': 'low',
      'verification_completed': 'medium'
    };

    return severityMap[event] || 'medium';
  }

  /**
   * Generate security report
   */
  generateSecurityReport(startDate, endDate) {
    // This would analyze security logs and generate a report
    // For now, return a basic structure
    return {
      period: { startDate, endDate },
      summary: {
        totalEvents: 0,
        authEvents: 0,
        violations: 0,
        suspiciousActivities: 0
      },
      topThreats: [],
      recommendations: []
    };
  }

  /**
   * Check for security patterns that might indicate attacks
   */
  detectSecurityPatterns(timeWindow = 3600000) { // 1 hour default
    // This would analyze recent logs for patterns like:
    // - Multiple failed login attempts from same IP
    // - Rapid registration attempts
    // - Unusual access patterns
    // - Token manipulation attempts
    
    return {
      patterns: [],
      alerts: [],
      recommendations: []
    };
  }
}

module.exports = new SecurityLogger();