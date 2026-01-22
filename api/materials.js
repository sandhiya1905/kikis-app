// Vercel serverless function for materials
// This provides sample study materials without requiring a database

const sampleMaterials = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'Comprehensive guide covering supervised and unsupervised learning, neural networks, and practical applications.',
    subject: 'Machine Learning',
    difficulty: 'beginner',
    topics: ['supervised learning', 'unsupervised learning', 'neural networks', 'regression', 'classification'],
    tags: ['AI', 'ML', 'beginner', 'fundamentals'],
    author: 'Dr. Sarah Johnson',
    college: 'Stanford University',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    rating: 4.8,
    downloads: 1250,
    fileType: 'PDF',
    fileSize: '2.5 MB'
  },
  {
    id: '2',
    title: 'Deep Learning with TensorFlow',
    description: 'Advanced deep learning concepts including CNNs, RNNs, and transformer architectures with TensorFlow implementations.',
    subject: 'Deep Learning',
    difficulty: 'advanced',
    topics: ['tensorflow', 'neural networks', 'CNN', 'RNN', 'transformers', 'backpropagation'],
    tags: ['TensorFlow', 'Deep Learning', 'Google', 'advanced'],
    author: 'Prof. Michael Chen',
    college: 'MIT',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    rating: 4.9,
    downloads: 890,
    fileType: 'PDF',
    fileSize: '4.2 MB'
  },
  {
    id: '3',
    title: 'Data Science Fundamentals',
    description: 'Essential concepts for data science including statistics, Python programming, pandas, and data visualization.',
    subject: 'Data Science',
    difficulty: 'intermediate',
    topics: ['statistics', 'python', 'pandas', 'matplotlib', 'seaborn', 'data cleaning'],
    tags: ['Data Science', 'Python', 'Statistics', 'Visualization'],
    author: 'Dr. Emily Rodriguez',
    college: 'UC Berkeley',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    rating: 4.7,
    downloads: 1100,
    fileType: 'PDF',
    fileSize: '3.1 MB'
  },
  {
    id: '4',
    title: 'Computer Vision Basics',
    description: 'Introduction to image processing, feature detection, and computer vision algorithms using OpenCV.',
    subject: 'Computer Vision',
    difficulty: 'intermediate',
    topics: ['image processing', 'OpenCV', 'feature detection', 'edge detection', 'object recognition'],
    tags: ['Computer Vision', 'OpenCV', 'Images', 'Processing'],
    author: 'Dr. James Wilson',
    college: 'Carnegie Mellon',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    rating: 4.6,
    downloads: 750,
    fileType: 'PDF',
    fileSize: '3.8 MB'
  },
  {
    id: '5',
    title: 'Natural Language Processing',
    description: 'Text processing, sentiment analysis, and modern NLP techniques including transformers and BERT.',
    subject: 'Natural Language Processing',
    difficulty: 'advanced',
    topics: ['text processing', 'sentiment analysis', 'transformers', 'BERT', 'tokenization'],
    tags: ['NLP', 'Text', 'AI', 'BERT', 'Transformers'],
    author: 'Dr. Lisa Park',
    college: 'Harvard University',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    rating: 4.8,
    downloads: 920,
    fileType: 'PDF',
    fileSize: '2.9 MB'
  },
  {
    id: '6',
    title: 'Artificial Intelligence Ethics',
    description: 'Exploring ethical considerations in AI development, bias, fairness, and responsible AI practices.',
    subject: 'Artificial Intelligence',
    difficulty: 'intermediate',
    topics: ['AI ethics', 'bias', 'fairness', 'responsible AI', 'algorithmic accountability'],
    tags: ['AI', 'Ethics', 'Bias', 'Fairness', 'Responsibility'],
    author: 'Prof. David Kumar',
    college: 'Oxford University',
    createdAt: '2024-01-22T13:10:00Z',
    updatedAt: '2024-01-22T13:10:00Z',
    rating: 4.5,
    downloads: 680,
    fileType: 'PDF',
    fileSize: '2.2 MB'
  },
  {
    id: '7',
    title: 'Quantum Computing Fundamentals',
    description: 'Introduction to quantum computing principles, quantum gates, and quantum algorithms.',
    subject: 'Quantum Computing',
    difficulty: 'advanced',
    topics: ['quantum gates', 'quantum algorithms', 'superposition', 'entanglement', 'quantum circuits'],
    tags: ['Quantum', 'Computing', 'Physics', 'Advanced'],
    author: 'Dr. Anna Thompson',
    college: 'Caltech',
    createdAt: '2024-01-14T08:30:00Z',
    updatedAt: '2024-01-14T08:30:00Z',
    rating: 4.7,
    downloads: 540,
    fileType: 'PDF',
    fileSize: '3.5 MB'
  },
  {
    id: '8',
    title: 'Blockchain Technology',
    description: 'Understanding blockchain fundamentals, cryptocurrencies, smart contracts, and decentralized applications.',
    subject: 'Blockchain',
    difficulty: 'intermediate',
    topics: ['blockchain', 'cryptocurrency', 'smart contracts', 'DApps', 'consensus algorithms'],
    tags: ['Blockchain', 'Crypto', 'Smart Contracts', 'DeFi'],
    author: 'Prof. Robert Lee',
    college: 'NYU',
    createdAt: '2024-01-16T15:20:00Z',
    updatedAt: '2024-01-16T15:20:00Z',
    rating: 4.4,
    downloads: 820,
    fileType: 'PDF',
    fileSize: '2.8 MB'
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

  if (req.method === 'GET') {
    const { limit = 10, offset = 0, subject, difficulty } = req.query;
    
    let results = [...sampleMaterials];
    
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
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);
    
    return res.status(200).json({
      success: true,
      count: paginatedResults.length,
      total: results.length,
      data: paginatedResults,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < results.length
      }
    });
  }

  if (req.method === 'POST') {
    // For demo purposes, just return success
    // In a real app, you'd save to a database
    const newMaterial = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: 0,
      downloads: 0
    };
    
    return res.status(201).json({
      success: true,
      message: 'Material created successfully (demo mode)',
      data: newMaterial
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}