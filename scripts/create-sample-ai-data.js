// Sample Google AI content for localStorage
const sampleAIContent = [
  {
    id: 'ai-1',
    title: 'TensorFlow 2.0 Complete Guide - Google AI',
    description: 'Comprehensive guide to TensorFlow 2.0, covering eager execution, Keras integration, and deployment strategies used at Google.',
    subject: 'Artificial Intelligence',
    content_type: 'pdf',
    file_path: '/uploads/ai/tensorflow-guide.pdf',
    file_url: 'http://localhost:3002/uploads/ai/tensorflow-guide.pdf',
    metadata: {
      semester: 3,
      difficulty_level: 'intermediate',
      topics: ['TensorFlow', 'Deep Learning', 'Keras', 'Neural Networks'],
      tags: ['Google', 'TensorFlow', 'AI', 'Python'],
      file_size: 3200000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.8, count: 156 },
    access_count: 2847,
    download_count: 1923,
    upload_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ai-2',
    title: 'BERT: Bidirectional Encoder Representations from Transformers',
    description: 'Deep dive into BERT architecture, pre-training objectives, and fine-tuning strategies for various NLP tasks.',
    subject: 'Natural Language Processing',
    content_type: 'pdf',
    file_path: '/uploads/ai/bert-transformers.pdf',
    file_url: 'http://localhost:3002/uploads/ai/bert-transformers.pdf',
    metadata: {
      semester: 4,
      difficulty_level: 'advanced',
      topics: ['BERT', 'Transformers', 'NLP', 'Attention Mechanism'],
      tags: ['Google', 'BERT', 'NLP', 'Transformers'],
      file_size: 2800000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.9, count: 203 },
    access_count: 3421,
    download_count: 2156,
    upload_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ai-3',
    title: 'Vision Transformer (ViT) - An Image is Worth 16x16 Words',
    description: 'Revolutionary approach to computer vision using transformer architecture, eliminating the need for CNNs.',
    subject: 'Computer Vision',
    content_type: 'pdf',
    file_path: '/uploads/ai/vision-transformer.pdf',
    file_url: 'http://localhost:3002/uploads/ai/vision-transformer.pdf',
    metadata: {
      semester: 4,
      difficulty_level: 'advanced',
      topics: ['Vision Transformer', 'Computer Vision', 'Attention', 'Image Classification'],
      tags: ['Google', 'ViT', 'Computer Vision', 'Transformers'],
      file_size: 1900000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.8, count: 134 },
    access_count: 2234,
    download_count: 1456,
    upload_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ai-4',
    title: 'Gemini: A Family of Highly Capable Multimodal Models',
    description: 'Latest breakthrough in multimodal AI from Google DeepMind, combining text, image, and code understanding.',
    subject: 'Multimodal AI',
    content_type: 'pdf',
    file_path: '/uploads/ai/gemini-multimodal.pdf',
    file_url: 'http://localhost:3002/uploads/ai/gemini-multimodal.pdf',
    metadata: {
      semester: 6,
      difficulty_level: 'expert',
      topics: ['Gemini', 'Multimodal AI', 'Vision-Language Models', 'Code Generation'],
      tags: ['Google', 'Gemini', 'Multimodal', 'DeepMind'],
      file_size: 3800000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 5.0, count: 89 },
    access_count: 1456,
    download_count: 934,
    upload_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ai-5',
    title: 'AlphaFold: Protein Structure Prediction Revolution',
    description: 'Breakthrough AI system for protein folding prediction, combining deep learning with structural biology.',
    subject: 'AI for Science',
    content_type: 'pdf',
    file_path: '/uploads/ai/alphafold-protein.pdf',
    file_url: 'http://localhost:3002/uploads/ai/alphafold-protein.pdf',
    metadata: {
      semester: 5,
      difficulty_level: 'advanced',
      topics: ['AlphaFold', 'Protein Folding', 'Structural Biology', 'Scientific AI'],
      tags: ['Google', 'AlphaFold', 'DeepMind', 'Biology'],
      file_size: 2700000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.9, count: 145 },
    access_count: 2345,
    download_count: 1567,
    upload_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ai-6',
    title: 'PaLM: Scaling Language Modeling with Pathways',
    description: 'Deep analysis of Google\'s 540B parameter PaLM model, training infrastructure, and emergent capabilities.',
    subject: 'Large Language Models',
    content_type: 'pdf',
    file_path: '/uploads/ai/palm-pathways.pdf',
    file_url: 'http://localhost:3002/uploads/ai/palm-pathways.pdf',
    metadata: {
      semester: 6,
      difficulty_level: 'expert',
      topics: ['PaLM', 'Large Language Models', 'Pathways', 'Scaling Laws'],
      tags: ['Google', 'PaLM', 'LLM', 'Pathways'],
      file_size: 4200000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.9, count: 267 },
    access_count: 4123,
    download_count: 2567,
    upload_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ai-7',
    title: 'Bard: Large Language Model for Conversational AI',
    description: 'Technical deep-dive into Google Bard architecture, training methodology, and safety implementations.',
    subject: 'Conversational AI',
    content_type: 'pdf',
    file_path: '/uploads/ai/bard-conversational.pdf',
    file_url: 'http://localhost:3002/uploads/ai/bard-conversational.pdf',
    metadata: {
      semester: 5,
      difficulty_level: 'advanced',
      topics: ['Bard', 'Conversational AI', 'Safety', 'Human Feedback'],
      tags: ['Google', 'Bard', 'Conversation', 'Safety'],
      file_size: 2900000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.7, count: 167 },
    access_count: 2678,
    download_count: 1789,
    upload_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ai-8',
    title: 'MusicLM: Generating Music from Text Descriptions',
    description: 'Innovative approach to music generation using hierarchical sequence-to-sequence modeling.',
    subject: 'AI Creativity',
    content_type: 'pdf',
    file_path: '/uploads/ai/musiclm-generation.pdf',
    file_url: 'http://localhost:3002/uploads/ai/musiclm-generation.pdf',
    metadata: {
      semester: 4,
      difficulty_level: 'intermediate',
      topics: ['MusicLM', 'Audio Generation', 'Creative AI', 'Sequence Modeling'],
      tags: ['Google', 'MusicLM', 'Audio', 'Creative AI'],
      file_size: 2100000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.6, count: 98 },
    access_count: 1789,
    download_count: 1023,
    upload_date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Function to initialize sample data
function initializeSampleData() {
  if (!localStorage.getItem('studyMaterials')) {
    localStorage.setItem('studyMaterials', JSON.stringify(sampleAIContent));
    console.log('🤖 Sample Google AI content loaded!');
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  initializeSampleData();
}