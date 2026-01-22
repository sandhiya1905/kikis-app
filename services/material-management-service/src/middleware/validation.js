/**
 * Validation Middleware
 * Handles request validation for the Material Management Service
 */

const validateMetadataCollection = (req, res, next) => {
  const { materialData, userInput, contentType } = req.body;

  if (!userInput) {
    return res.status(400).json({
      success: false,
      error: 'userInput is required'
    });
  }

  if (!contentType) {
    return res.status(400).json({
      success: false,
      error: 'contentType is required'
    });
  }

  const validContentTypes = ['video', 'audio', 'pdf', 'text', 'interactive', 'presentation'];
  if (!validContentTypes.includes(contentType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid contentType. Must be one of: ${validContentTypes.join(', ')}`
    });
  }

  if (!userInput.title || typeof userInput.title !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'userInput.title is required and must be a string'
    });
  }

  if (!userInput.subject || typeof userInput.subject !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'userInput.subject is required and must be a string'
    });
  }

  if (!userInput.difficulty_level || typeof userInput.difficulty_level !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'userInput.difficulty_level is required and must be a string'
    });
  }

  next();
};

const validateMetadataInput = (req, res, next) => {
  const { userInput, contentType } = req.body;

  if (!userInput) {
    return res.status(400).json({
      success: false,
      error: 'userInput is required'
    });
  }

  if (!contentType) {
    return res.status(400).json({
      success: false,
      error: 'contentType is required'
    });
  }

  next();
};

const validateContentAnalysis = (req, res, next) => {
  const { contentType } = req.body;

  if (!contentType) {
    return res.status(400).json({
      success: false,
      error: 'contentType is required'
    });
  }

  if (!req.body.content && !req.body.title) {
    return res.status(400).json({
      success: false,
      error: 'Either content or title is required for analysis'
    });
  }

  next();
};

const validateBulkMetadata = (req, res, next) => {
  const { materials } = req.body;

  if (!materials || !Array.isArray(materials)) {
    return res.status(400).json({
      success: false,
      error: 'materials must be an array'
    });
  }

  if (materials.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'materials array cannot be empty'
    });
  }

  if (materials.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Cannot process more than 100 materials at once'
    });
  }

  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    if (!material.userInput || !material.contentType) {
      return res.status(400).json({
        success: false,
        error: `Material at index ${i} is missing required fields (userInput, contentType)`
      });
    }
  }

  next();
};

const validateCategorizationInput = (req, res, next) => {
  const { metadata } = req.body;

  if (!metadata) {
    return res.status(400).json({
      success: false,
      error: 'metadata is required'
    });
  }

  if (!metadata.subject) {
    return res.status(400).json({
      success: false,
      error: 'metadata.subject is required for categorization'
    });
  }

  next();
};

const validateCategorySearch = (req, res, next) => {
  const { searchType, searchValue } = req.body;

  if (!searchType) {
    return res.status(400).json({
      success: false,
      error: 'searchType is required'
    });
  }

  if (!searchValue) {
    return res.status(400).json({
      success: false,
      error: 'searchValue is required'
    });
  }

  const validSearchTypes = ['subject', 'topic', 'tag'];
  if (!validSearchTypes.includes(searchType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid searchType. Must be one of: ${validSearchTypes.join(', ')}`
    });
  }

  next();
};

const validateCustomFieldsInput = (req, res, next) => {
  const { materialType, customFields } = req.body;

  if (!materialType) {
    return res.status(400).json({
      success: false,
      error: 'materialType is required'
    });
  }

  if (!customFields || typeof customFields !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'customFields must be an object'
    });
  }

  next();
};

const validateCustomFieldCreation = (req, res, next) => {
  const { materialType, fieldName, fieldConfig } = req.body;

  if (!materialType) {
    return res.status(400).json({
      success: false,
      error: 'materialType is required'
    });
  }

  if (!fieldName) {
    return res.status(400).json({
      success: false,
      error: 'fieldName is required'
    });
  }

  if (!fieldConfig) {
    return res.status(400).json({
      success: false,
      error: 'fieldConfig is required'
    });
  }

  if (!fieldConfig.type) {
    return res.status(400).json({
      success: false,
      error: 'fieldConfig.type is required'
    });
  }

  if (!fieldConfig.label) {
    return res.status(400).json({
      success: false,
      error: 'fieldConfig.label is required'
    });
  }

  next();
};

const validateCustomFieldUpdate = (req, res, next) => {
  const { updates } = req.body;

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'updates object is required'
    });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'updates object cannot be empty'
    });
  }

  next();
};

const validateBulkCustomFields = (req, res, next) => {
  const { materials } = req.body;

  if (!materials || !Array.isArray(materials)) {
    return res.status(400).json({
      success: false,
      error: 'materials must be an array'
    });
  }

  if (materials.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'materials array cannot be empty'
    });
  }

  if (materials.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Cannot process more than 100 materials at once'
    });
  }

  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    if (!material.materialType || !material.customFields) {
      return res.status(400).json({
        success: false,
        error: `Material at index ${i} is missing required fields (materialType, customFields)`
      });
    }
  }

  next();
};

const validateTemplateImport = (req, res, next) => {
  const { templateData } = req.body;

  if (!templateData) {
    return res.status(400).json({
      success: false,
      error: 'templateData is required'
    });
  }

  if (!templateData.templates || typeof templateData.templates !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'templateData.templates must be an object'
    });
  }

  if (Object.keys(templateData.templates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'templateData.templates cannot be empty'
    });
  }

  next();
};

const validateMaterialCreation = (req, res, next) => {
  const { materialData, userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({
      success: false,
      error: 'userInput is required'
    });
  }

  if (!userInput.title) {
    return res.status(400).json({
      success: false,
      error: 'userInput.title is required'
    });
  }

  if (!userInput.content_type) {
    return res.status(400).json({
      success: false,
      error: 'userInput.content_type is required'
    });
  }

  if (!userInput.subject) {
    return res.status(400).json({
      success: false,
      error: 'userInput.subject is required'
    });
  }

  if (!userInput.difficulty_level) {
    return res.status(400).json({
      success: false,
      error: 'userInput.difficulty_level is required'
    });
  }

  if (!userInput.learning_objectives || !Array.isArray(userInput.learning_objectives)) {
    return res.status(400).json({
      success: false,
      error: 'userInput.learning_objectives must be an array'
    });
  }

  if (!userInput.target_audience || !Array.isArray(userInput.target_audience)) {
    return res.status(400).json({
      success: false,
      error: 'userInput.target_audience must be an array'
    });
  }

  if (!userInput.estimated_study_time || typeof userInput.estimated_study_time !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'userInput.estimated_study_time must be a number'
    });
  }

  next();
};

const validateMetadataUpdate = (req, res, next) => {
  const { metadataUpdates } = req.body;

  if (!metadataUpdates || typeof metadataUpdates !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'metadataUpdates object is required'
    });
  }

  if (Object.keys(metadataUpdates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'metadataUpdates object cannot be empty'
    });
  }

  next();
};

const validateBulkMaterialProcessing = (req, res, next) => {
  const { materials } = req.body;

  if (!materials || !Array.isArray(materials)) {
    return res.status(400).json({
      success: false,
      error: 'materials must be an array'
    });
  }

  if (materials.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'materials array cannot be empty'
    });
  }

  if (materials.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Cannot process more than 50 materials at once'
    });
  }

  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    if (!material.userInput || !material.contentType) {
      return res.status(400).json({
        success: false,
        error: `Material at index ${i} is missing required fields (userInput, contentType)`
      });
    }
  }

  next();
};

module.exports = {
  validateMetadataCollection,
  validateMetadataInput,
  validateContentAnalysis,
  validateBulkMetadata,
  validateCategorizationInput,
  validateCategorySearch,
  validateCustomFieldsInput,
  validateCustomFieldCreation,
  validateCustomFieldUpdate,
  validateBulkCustomFields,
  validateTemplateImport,
  validateMaterialCreation,
  validateMetadataUpdate,
  validateBulkMaterialProcessing
};