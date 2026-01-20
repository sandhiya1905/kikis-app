// Shared constants across all services

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // User Roles
  USER_ROLES: {
    STUDENT: 'student',
    ADMIN: 'admin',
    MODERATOR: 'moderator'
  },

  // Academic Levels
  ACADEMIC_LEVELS: {
    UNDERGRADUATE: 'undergraduate',
    GRADUATE: 'graduate',
    POSTGRADUATE: 'postgraduate'
  },

  // Academic Years
  ACADEMIC_YEARS: {
    FRESHMAN: 'freshman',
    SOPHOMORE: 'sophomore',
    JUNIOR: 'junior',
    SENIOR: 'senior',
    GRADUATE: 'graduate',
    POSTGRADUATE: 'postgraduate'
  },

  // Content Types
  CONTENT_TYPES: {
    PDF: 'pdf',
    VIDEO: 'video',
    DOCUMENT: 'document',
    PRESENTATION: 'presentation',
    AUDIO: 'audio'
  },

  // Difficulty Levels
  DIFFICULTY_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
  },

  // Interview Session Status
  SESSION_STATUS: {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ABANDONED: 'abandoned'
  },

  // File Upload Limits
  FILE_LIMITS: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov']
  },

  // Rate Limiting
  RATE_LIMITS: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },

  // JWT Configuration
  JWT: {
    EXPIRES_IN: '24h',
    REFRESH_EXPIRES_IN: '7d'
  },

  // Interview Domains
  INTERVIEW_DOMAINS: {
    SOFTWARE_ENGINEERING: 'software_engineering',
    DATA_SCIENCE: 'data_science',
    PRODUCT_MANAGEMENT: 'product_management',
    MARKETING: 'marketing',
    FINANCE: 'finance',
    CONSULTING: 'consulting',
    GENERAL: 'general'
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid or expired token',
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    INVALID_FILE_TYPE: 'Invalid file type',
    INTERNAL_ERROR: 'Internal server error'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    FILE_UPLOADED: 'File uploaded successfully',
    SESSION_STARTED: 'Interview session started',
    SESSION_COMPLETED: 'Interview session completed'
  }
};