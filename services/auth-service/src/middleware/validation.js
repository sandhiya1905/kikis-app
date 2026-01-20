const Joi = require('joi');
const { AppError } = require('./errorHandler');

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

/**
 * User registration validation schema
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),
  
  profile: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    
    college: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'College name must be at least 2 characters long',
        'string.max': 'College name cannot exceed 200 characters',
        'any.required': 'College is required'
      }),
    
    major: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Major must be at least 2 characters long',
        'string.max': 'Major cannot exceed 100 characters',
        'any.required': 'Major is required'
      }),
    
    year: Joi.number()
      .integer()
      .min(1)
      .max(6)
      .required()
      .messages({
        'number.min': 'Year must be at least 1',
        'number.max': 'Year cannot exceed 6',
        'any.required': 'Academic year is required'
      }),
    
    interests: Joi.array()
      .items(Joi.string().trim().max(50))
      .max(10)
      .default([])
      .messages({
        'array.max': 'Cannot have more than 10 interests',
        'string.max': 'Each interest cannot exceed 50 characters'
      }),
    
    academic_level: Joi.string()
      .valid('undergraduate', 'graduate', 'postgraduate')
      .required()
      .messages({
        'any.only': 'Academic level must be undergraduate, graduate, or postgraduate',
        'any.required': 'Academic level is required'
      })
  }).required()
});

/**
 * User login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

/**
 * Profile update validation schema
 */
const updateProfileSchema = Joi.object({
  profile: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters'
      }),
    
    college: Joi.string()
      .trim()
      .min(2)
      .max(200)
      .messages({
        'string.min': 'College name must be at least 2 characters long',
        'string.max': 'College name cannot exceed 200 characters'
      }),
    
    major: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Major must be at least 2 characters long',
        'string.max': 'Major cannot exceed 100 characters'
      }),
    
    year: Joi.number()
      .integer()
      .min(1)
      .max(6)
      .messages({
        'number.min': 'Year must be at least 1',
        'number.max': 'Year cannot exceed 6'
      }),
    
    interests: Joi.array()
      .items(Joi.string().trim().max(50))
      .max(10)
      .messages({
        'array.max': 'Cannot have more than 10 interests',
        'string.max': 'Each interest cannot exceed 50 characters'
      }),
    
    academic_level: Joi.string()
      .valid('undergraduate', 'graduate', 'postgraduate')
      .messages({
        'any.only': 'Academic level must be undergraduate, graduate, or postgraduate'
      })
  })
});

/**
 * Password change validation schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required'
    }),
  
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'New passwords do not match',
      'any.required': 'New password confirmation is required'
    })
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  refreshTokenSchema
};