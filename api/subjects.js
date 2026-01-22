// Vercel serverless function for subjects
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const subjects = [
    {
      name: 'Machine Learning',
      count: 15,
      description: 'Algorithms and statistical models for computer systems'
    },
    {
      name: 'Deep Learning',
      count: 12,
      description: 'Neural networks with multiple layers'
    },
    {
      name: 'Data Science',
      count: 18,
      description: 'Extracting insights from structured and unstructured data'
    },
    {
      name: 'Computer Vision',
      count: 8,
      description: 'Teaching computers to interpret visual information'
    },
    {
      name: 'Natural Language Processing',
      count: 10,
      description: 'Processing and analyzing human language'
    },
    {
      name: 'Artificial Intelligence',
      count: 20,
      description: 'Creating intelligent machines and systems'
    },
    {
      name: 'Quantum Computing',
      count: 5,
      description: 'Computing using quantum mechanical phenomena'
    },
    {
      name: 'Blockchain',
      count: 7,
      description: 'Distributed ledger technology and cryptocurrencies'
    },
    {
      name: 'Cybersecurity',
      count: 9,
      description: 'Protecting systems and data from digital attacks'
    },
    {
      name: 'Software Engineering',
      count: 14,
      description: 'Systematic approach to software development'
    }
  ];

  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects
  });
}