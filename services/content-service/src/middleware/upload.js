const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on content type
    const contentType = req.body.content_type || 'general';
    const subDir = path.join(uploadDir, contentType);
    
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
    
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'pdf': ['application/pdf'],
    'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
    'document': [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ],
    'presentation': [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  };

  // Get all allowed MIME types
  const allAllowedTypes = Object.values(allowedTypes).flat();
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`File type ${file.mimetype} is not allowed`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
    files: 1 // Only one file at a time
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer upload error:', {
      code: error.code,
      message: error.message,
      field: error.field
    });

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 50MB.',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one file allowed per upload.',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
          code: 'UNEXPECTED_FILE'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error.',
          code: 'UPLOAD_ERROR'
        });
    }
  }

  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
};

// Middleware to validate file after upload
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
      code: 'NO_FILE'
    });
  }

  // Additional validation
  const file = req.file;
  
  // Check if file actually exists
  if (!fs.existsSync(file.path)) {
    logger.error('Uploaded file not found:', { path: file.path });
    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      code: 'FILE_NOT_FOUND'
    });
  }

  // Get actual file size
  const stats = fs.statSync(file.path);
  req.file.actualSize = stats.size;

  // Validate file size matches
  if (Math.abs(file.size - stats.size) > 1024) { // Allow 1KB difference
    logger.warn('File size mismatch:', {
      reportedSize: file.size,
      actualSize: stats.size,
      path: file.path
    });
  }

  logger.info('File uploaded successfully:', {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path
  });

  next();
};

// Cleanup function for failed uploads
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('Cleaned up file:', { path: filePath });
    }
  } catch (error) {
    logger.error('Failed to cleanup file:', {
      path: filePath,
      error: error.message
    });
  }
};

// Middleware to generate file URL
const generateFileUrl = (req, res, next) => {
  if (req.file) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = path.relative(
      path.join(__dirname, '../../'),
      req.file.path
    ).replace(/\\/g, '/'); // Convert Windows paths to URL format
    
    req.file.url = `${baseUrl}/${relativePath}`;
  }
  next();
};

module.exports = {
  upload,
  handleUploadError,
  validateUploadedFile,
  cleanupFile,
  generateFileUrl
};