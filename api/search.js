// Vercel serverless function for search functionality
// This is a simplified version that works without MongoDB

const sampleMaterials = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'Comprehensive guide to ML fundamentals',
    subject: 'Machine Learning',
    difficulty: 'beginner',
    topics: ['supervised learning', 'unsupervised learning', 'neural networks'],
    tags: ['AI', 'ML', 'beginner'],
    author: 'NovaLearn Team',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Deep Learning with TensorFlow',
    description: 'Advanced deep learning concepts and implementations',
    subject: 'Deep Learning',
    difficulty: 'advanced',
    topics: ['tensorflow', 'neural networks', 'CNN', 'RNN'],
    tags: ['TensorFlow', 'Deep Learning', 'Google'],
    author: 'AI Research Team',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Data Science Fundamentals',
    description: 'Essential concepts for data science beginners',
    subject: 'Data Science',
    difficulty: 'intermediate',
    topics: ['statistics', 'python', 'pandas', 'visualization'],
    tags: ['Data Science', 'Python', 'Statistics'],
    author: 'Data Team',
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    title: 'Computer Vision Basics',
    description: 'Introduction to image processing and computer vision',
    subject: 'Computer Vision',
    difficulty: 'intermediate',
    topics: ['image processing', 'OpenCV', 'feature detection'],
    tags: ['Computer Vision', 'OpenCV', 'Images'],
    author: 'Vision Lab',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Natural Language Processing',
    description: 'Text processing and NLP techniques',
    subject: 'Natural Language Processing',
    difficulty: 'advanced',
    topics: ['text processing', 'sentiment analysis', 'transformers'],
    tags: ['NLP', 'Text', 'AI'],
    author: 'NLP Team',
    createdAt: '2024-01-18'
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, subject, difficulty, limit = 10 } = req.query;

  let results = [...sampleMaterials];

  // Filter by search query
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(material => 
      material.title.toLowerCase().includes(query) ||
      material.description.toLowerCase().includes(query) ||
      material.topics.some(topic => topic.toLowerCase().includes(query)) ||
      material.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Filter by subject
  if (subject) {
    results = results.filter(material => 
      material.subject.toLowerCase() === subject.toLowerCase()
    );
  }

  // Filter by difficulty
  if (difficulty) {
    results = results.filter(material => 
      material.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  // Limit results
  results = results.slice(0, parseInt(limit));

  res.status(200).json({
    success: true,
    count: results.length,
    data: results,
    query: { q, subject, difficulty, limit }
  });
}