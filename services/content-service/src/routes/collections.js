const express = require('express');
const {
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
} = require('../controllers/collectionController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/content/collections/public
 * @desc    Get public collections
 * @access  Public
 */
router.get('/public', getPublicCollections);

/**
 * @route   POST /api/content/collections
 * @desc    Create a new collection
 * @access  Private
 */
router.post('/', authenticate, createCollection);

/**
 * @route   GET /api/content/collections
 * @desc    Get user's collections
 * @access  Private
 */
router.get('/', authenticate, getUserCollections);

/**
 * @route   GET /api/content/collections/:id
 * @desc    Get collection by ID
 * @access  Private
 */
router.get('/:id', authenticate, getCollectionById);

/**
 * @route   PUT /api/content/collections/:id
 * @desc    Update collection
 * @access  Private
 */
router.put('/:id', authenticate, updateCollection);

/**
 * @route   DELETE /api/content/collections/:id
 * @desc    Delete collection
 * @access  Private
 */
router.delete('/:id', authenticate, deleteCollection);

/**
 * @route   POST /api/content/collections/:id/materials
 * @desc    Add material to collection
 * @access  Private
 */
router.post('/:id/materials', authenticate, addMaterialToCollection);

/**
 * @route   DELETE /api/content/collections/:id/materials/:materialId
 * @desc    Remove material from collection
 * @access  Private
 */
router.delete('/:id/materials/:materialId', authenticate, removeMaterialFromCollection);

/**
 * @route   PUT /api/content/collections/:id/materials/:materialId
 * @desc    Update material notes in collection
 * @access  Private
 */
router.put('/:id/materials/:materialId', authenticate, updateMaterialNotes);

/**
 * @route   POST /api/content/collections/:id/clone
 * @desc    Clone a public collection
 * @access  Private
 */
router.post('/:id/clone', authenticate, cloneCollection);

module.exports = router;