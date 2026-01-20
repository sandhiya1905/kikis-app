const UserCollection = require('../models/UserCollection');
const StudyMaterial = require('../models/StudyMaterial');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Create a new collection
 * @route POST /api/content/collections
 * @access Private
 */
const createCollection = asyncHandler(async (req, res) => {
  const { name, description, is_public, tags, color, icon } = req.body;

  // Check if collection name already exists for this user
  const existingCollection = await UserCollection.findOne({
    user_id: req.user._id,
    name: name.trim()
  });

  if (existingCollection) {
    throw new AppError('Collection with this name already exists', 409);
  }

  const collection = new UserCollection({
    user_id: req.user._id,
    name: name.trim(),
    description: description?.trim(),
    is_public: is_public || false,
    tags: tags || [],
    color: color || '#3B82F6',
    icon: icon || 'folder'
  });

  await collection.save();

  logger.info('Collection created', {
    collectionId: collection._id,
    name: collection.name,
    userId: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Collection created successfully',
    data: {
      collection: collection.toJSON()
    }
  });
});

/**
 * Get user's collections
 * @route GET /api/content/collections
 * @access Private
 */
const getUserCollections = asyncHandler(async (req, res) => {
  const collections = await UserCollection.getUserCollections(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      collections
    }
  });
});

/**
 * Get collection by ID
 * @route GET /api/content/collections/:id
 * @access Private
 */
const getCollectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const collection = await UserCollection.findById(id)
    .populate('materials.material_id', 'title subject content_type metadata upload_date rating')
    .populate('user_id', 'profile.name profile.college');

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Check if user owns the collection or it's public
  if (collection.user_id._id.toString() !== req.user._id.toString() && !collection.is_public) {
    throw new AppError('Access denied', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      collection: collection.toJSON()
    }
  });
});

/**
 * Update collection
 * @route PUT /api/content/collections/:id
 * @access Private
 */
const updateCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, is_public, tags, color, icon } = req.body;

  const collection = await UserCollection.findById(id);

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Check ownership
  if (collection.user_id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  // Check if new name conflicts with existing collections
  if (name && name.trim() !== collection.name) {
    const existingCollection = await UserCollection.findOne({
      user_id: req.user._id,
      name: name.trim(),
      _id: { $ne: id }
    });

    if (existingCollection) {
      throw new AppError('Collection with this name already exists', 409);
    }
  }

  // Update fields
  if (name) collection.name = name.trim();
  if (description !== undefined) collection.description = description?.trim();
  if (is_public !== undefined) collection.is_public = is_public;
  if (tags) collection.tags = tags;
  if (color) collection.color = color;
  if (icon) collection.icon = icon;

  await collection.save();

  logger.info('Collection updated', {
    collectionId: collection._id,
    userId: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Collection updated successfully',
    data: {
      collection: collection.toJSON()
    }
  });
});

/**
 * Delete collection
 * @route DELETE /api/content/collections/:id
 * @access Private
 */
const deleteCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const collection = await UserCollection.findById(id);

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Check ownership
  if (collection.user_id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  await UserCollection.findByIdAndDelete(id);

  logger.info('Collection deleted', {
    collectionId: id,
    userId: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Collection deleted successfully'
  });
});

/**
 * Add material to collection
 * @route POST /api/content/collections/:id/materials
 * @access Private
 */
const addMaterialToCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { material_id, notes } = req.body;

  const collection = await UserCollection.findById(id);

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Check ownership
  if (collection.user_id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  // Verify material exists
  const material = await StudyMaterial.findById(material_id);
  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Check if material is accessible
  if (!material.is_public && material.uploaded_by.toString() !== req.user._id.toString()) {
    throw new AppError('Material not accessible', 403);
  }

  try {
    await collection.addMaterial(material_id, notes);

    logger.info('Material added to collection', {
      collectionId: collection._id,
      materialId: material_id,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Material added to collection successfully'
    });
  } catch (error) {
    if (error.message === 'Material already exists in this collection') {
      throw new AppError(error.message, 409);
    }
    throw error;
  }
});

/**
 * Remove material from collection
 * @route DELETE /api/content/collections/:id/materials/:materialId
 * @access Private
 */
const removeMaterialFromCollection = asyncHandler(async (req, res) => {
  const { id, materialId } = req.params;

  const collection = await UserCollection.findById(id);

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Check ownership
  if (collection.user_id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  await collection.removeMaterial(materialId);

  logger.info('Material removed from collection', {
    collectionId: collection._id,
    materialId,
    userId: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Material removed from collection successfully'
  });
});

/**
 * Update material notes in collection
 * @route PUT /api/content/collections/:id/materials/:materialId
 * @access Private
 */
const updateMaterialNotes = asyncHandler(async (req, res) => {
  const { id, materialId } = req.params;
  const { notes } = req.body;

  const collection = await UserCollection.findById(id);

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  // Check ownership
  if (collection.user_id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  try {
    await collection.updateMaterialNotes(materialId, notes);

    logger.info('Material notes updated in collection', {
      collectionId: collection._id,
      materialId,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Material notes updated successfully'
    });
  } catch (error) {
    if (error.message === 'Material not found in collection') {
      throw new AppError(error.message, 404);
    }
    throw error;
  }
});

/**
 * Get public collections
 * @route GET /api/content/collections/public
 * @access Public
 */
const getPublicCollections = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const collections = await UserCollection.find({ is_public: true })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user_id', 'profile.name profile.college')
    .populate('materials.material_id', 'title subject content_type');

  const total = await UserCollection.countDocuments({ is_public: true });

  res.status(200).json({
    success: true,
    data: {
      collections,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    }
  });
});

/**
 * Clone a public collection
 * @route POST /api/content/collections/:id/clone
 * @access Private
 */
const cloneCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const originalCollection = await UserCollection.findById(id)
    .populate('materials.material_id');

  if (!originalCollection) {
    throw new AppError('Collection not found', 404);
  }

  if (!originalCollection.is_public) {
    throw new AppError('Collection is not public', 403);
  }

  // Check if user already has a collection with this name
  const existingCollection = await UserCollection.findOne({
    user_id: req.user._id,
    name: name || `${originalCollection.name} (Copy)`
  });

  if (existingCollection) {
    throw new AppError('Collection with this name already exists', 409);
  }

  // Create cloned collection
  const clonedCollection = new UserCollection({
    user_id: req.user._id,
    name: name || `${originalCollection.name} (Copy)`,
    description: originalCollection.description,
    is_public: false, // Cloned collections are private by default
    tags: [...originalCollection.tags],
    color: originalCollection.color,
    icon: originalCollection.icon,
    materials: originalCollection.materials.filter(material => 
      material.material_id && material.material_id.is_public
    )
  });

  await clonedCollection.save();

  logger.info('Collection cloned', {
    originalCollectionId: originalCollection._id,
    clonedCollectionId: clonedCollection._id,
    userId: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Collection cloned successfully',
    data: {
      collection: clonedCollection.toJSON()
    }
  });
});

module.exports = {
  createCollection,
  getUserCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addMaterialToCollection,
  removeMaterialFromCollection,
  updateMaterialNotes,
  getPublicCollections,
  cloneCollection
};