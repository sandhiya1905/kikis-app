const mongoose = require('mongoose');

const materialMetadataSchema = new mongoose.Schema({
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  difficulty_level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  topics: [{
    type: String,
    trim: true
  }],
  file_size: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes for videos
    default: 0
  }
});

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content_type: {
    type: String,
    enum: ['pdf', 'video', 'document', 'presentation', 'audio'],
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  metadata: {
    type: materialMetadataSchema,
    required: true
  },
  upload_date: {
    type: Date,
    default: Date.now
  },
  access_count: {
    type: Number,
    default: 0
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
studyMaterialSchema.index({ subject: 1 });
studyMaterialSchema.index({ 'metadata.topics': 1 });
studyMaterialSchema.index({ 'metadata.difficulty_level': 1 });
studyMaterialSchema.index({ title: 'text', 'metadata.topics': 'text' });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);