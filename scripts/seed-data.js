const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../services/auth-service/src/models/User');
const StudyMaterial = require('../services/content-service/src/models/StudyMaterial');
const UserCollection = require('../services/content-service/src/models/UserCollection');

// Sample users data
const sampleUsers = [
  {
    email: 'john.doe@harvard.edu',
    password: 'SecurePass123',
    profile: {
      name: 'John Doe',
      college: 'Harvard University',
      major: 'Computer Science',
      year: 3,
      interests: ['Machine Learning', 'Web Development', 'Data Science'],
      academic_level: 'undergraduate'
    },
    is_verified: true
  },
  {
    email: 'jane.smith@stanford.edu',
    password: 'SecurePass123',
    profile: {
      name: 'Jane Smith',
      college: 'Stanford University',
      major: 'Mathematics',
      year: 2,
      interests: ['Statistics', 'Calculus', 'Linear Algebra'],
      academic_level: 'undergraduate'
    },
    is_verified: true
  },
  {
    email: 'mike.johnson@mit.edu',
    password: 'SecurePass123',
    profile: {
      name: 'Mike Johnson',
      college: 'Massachusetts Institute of Technology',
      major: 'Physics',
      year: 4,
      interests: ['Quantum Physics', 'Thermodynamics', 'Research'],
      academic_level: 'undergraduate'
    },
    is_verified: true
  },
  {
    email: 'sarah.wilson@berkeley.edu',
    password: 'SecurePass123',
    profile: {
      name: 'Sarah Wilson',
      college: 'University of California Berkeley',
      major: 'Biology',
      year: 1,
      interests: ['Molecular Biology', 'Genetics', 'Research'],
      academic_level: 'graduate'
    },
    is_verified: true
  },
  {
    email: 'alex.brown@yale.edu',
    password: 'SecurePass123',
    profile: {
      name: 'Alex Brown',
      college: 'Yale University',
      major: 'Economics',
      year: 3,
      interests: ['Microeconomics', 'Finance', 'Statistics'],
      academic_level: 'undergraduate'
    },
    is_verified: true
  }
];

// Sample study materials data
const sampleMaterials = [
  {
    title: 'Introduction to Machine Learning',
    description: 'Comprehensive guide covering basic ML concepts, algorithms, and applications.',
    subject: 'Computer Science',
    content_type: 'pdf',
    file_path: '/uploads/pdf/ml-intro.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/ml-intro.pdf',
    metadata: {
      semester: 5,
      difficulty_level: 'intermediate',
      topics: ['Machine Learning', 'Algorithms', 'Data Science'],
      tags: ['ML', 'AI', 'Python'],
      file_size: 2048000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.5, count: 12 },
    access_count: 156,
    download_count: 89
  },
  {
    title: 'Calculus I - Derivatives and Limits',
    description: 'Complete notes on derivatives, limits, and their applications in real-world problems.',
    subject: 'Mathematics',
    content_type: 'pdf',
    file_path: '/uploads/pdf/calculus-derivatives.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/calculus-derivatives.pdf',
    metadata: {
      semester: 1,
      difficulty_level: 'beginner',
      topics: ['Calculus', 'Derivatives', 'Limits'],
      tags: ['Math', 'Calculus', 'Derivatives'],
      file_size: 1536000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.8, count: 25 },
    access_count: 234,
    download_count: 145
  },
  {
    title: 'Quantum Mechanics Fundamentals',
    description: 'Introduction to quantum mechanics principles, wave functions, and quantum states.',
    subject: 'Physics',
    content_type: 'pdf',
    file_path: '/uploads/pdf/quantum-mechanics.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/quantum-mechanics.pdf',
    metadata: {
      semester: 6,
      difficulty_level: 'advanced',
      topics: ['Quantum Mechanics', 'Wave Functions', 'Quantum States'],
      tags: ['Physics', 'Quantum', 'Advanced'],
      file_size: 3072000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.2, count: 8 },
    access_count: 98,
    download_count: 67
  },
  {
    title: 'Cell Biology and Genetics',
    description: 'Comprehensive study of cell structure, function, and genetic principles.',
    subject: 'Biology',
    content_type: 'pdf',
    file_path: '/uploads/pdf/cell-biology.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/cell-biology.pdf',
    metadata: {
      semester: 2,
      difficulty_level: 'intermediate',
      topics: ['Cell Biology', 'Genetics', 'Molecular Biology'],
      tags: ['Biology', 'Cells', 'Genetics'],
      file_size: 2560000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.6, count: 18 },
    access_count: 187,
    download_count: 112
  },
  {
    title: 'Microeconomics Principles',
    description: 'Study of individual economic behavior, market structures, and price theory.',
    subject: 'Economics',
    content_type: 'pdf',
    file_path: '/uploads/pdf/microeconomics.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/microeconomics.pdf',
    metadata: {
      semester: 3,
      difficulty_level: 'intermediate',
      topics: ['Microeconomics', 'Market Theory', 'Supply and Demand'],
      tags: ['Economics', 'Markets', 'Theory'],
      file_size: 1792000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.3, count: 15 },
    access_count: 143,
    download_count: 78
  },
  {
    title: 'Data Structures and Algorithms',
    description: 'Complete guide to fundamental data structures and algorithmic problem solving.',
    subject: 'Computer Science',
    content_type: 'pdf',
    file_path: '/uploads/pdf/data-structures.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/data-structures.pdf',
    metadata: {
      semester: 3,
      difficulty_level: 'intermediate',
      topics: ['Data Structures', 'Algorithms', 'Programming'],
      tags: ['CS', 'Algorithms', 'Programming'],
      file_size: 2304000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.7, count: 32 },
    access_count: 298,
    download_count: 189
  },
  {
    title: 'Linear Algebra Applications',
    description: 'Practical applications of linear algebra in engineering and computer science.',
    subject: 'Mathematics',
    content_type: 'pdf',
    file_path: '/uploads/pdf/linear-algebra.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/linear-algebra.pdf',
    metadata: {
      semester: 4,
      difficulty_level: 'intermediate',
      topics: ['Linear Algebra', 'Matrices', 'Vector Spaces'],
      tags: ['Math', 'Linear Algebra', 'Applications'],
      file_size: 1920000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.4, count: 21 },
    access_count: 176,
    download_count: 95
  },
  {
    title: 'Organic Chemistry Reactions',
    description: 'Comprehensive guide to organic chemistry reactions and mechanisms.',
    subject: 'Chemistry',
    content_type: 'pdf',
    file_path: '/uploads/pdf/organic-chemistry.pdf',
    file_url: 'http://localhost:3002/uploads/pdf/organic-chemistry.pdf',
    metadata: {
      semester: 4,
      difficulty_level: 'advanced',
      topics: ['Organic Chemistry', 'Reactions', 'Mechanisms'],
      tags: ['Chemistry', 'Organic', 'Reactions'],
      file_size: 2816000,
      duration: 0,
      language: 'English'
    },
    is_public: true,
    is_approved: true,
    status: 'approved',
    rating: { average: 4.1, count: 14 },
    access_count: 132,
    download_count: 73
  }
];

// Sample collections data
const sampleCollections = [
  {
    name: 'Computer Science Fundamentals',
    description: 'Essential CS topics for undergraduate students',
    is_public: true,
    tags: ['CS', 'Programming', 'Fundamentals'],
    color: '#3B82F6',
    icon: 'code'
  },
  {
    name: 'Mathematics for Engineers',
    description: 'Mathematical concepts important for engineering applications',
    is_public: true,
    tags: ['Math', 'Engineering', 'Applications'],
    color: '#10B981',
    icon: 'calculator'
  },
  {
    name: 'My Study Materials',
    description: 'Personal collection of study materials',
    is_public: false,
    tags: ['Personal', 'Study'],
    color: '#F59E0B',
    icon: 'bookmark'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/nova_learn?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await StudyMaterial.deleteMany({});
    await UserCollection.deleteMany({});

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password_hash: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`   ✓ Created user: ${userData.profile.name} (${userData.email})`);
    }

    // Create study materials
    console.log('📚 Creating sample study materials...');
    const createdMaterials = [];
    for (let i = 0; i < sampleMaterials.length; i++) {
      const materialData = sampleMaterials[i];
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const material = new StudyMaterial({
        ...materialData,
        uploaded_by: randomUser._id,
        upload_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
      
      const savedMaterial = await material.save();
      createdMaterials.push(savedMaterial);
      console.log(`   ✓ Created material: ${materialData.title}`);
    }

    // Create collections
    console.log('📁 Creating sample collections...');
    for (let i = 0; i < sampleCollections.length; i++) {
      const collectionData = sampleCollections[i];
      const randomUser = createdUsers[i % createdUsers.length];
      
      // Select random materials for each collection
      const shuffledMaterials = [...createdMaterials].sort(() => 0.5 - Math.random());
      const selectedMaterials = shuffledMaterials.slice(0, Math.floor(Math.random() * 4) + 2); // 2-5 materials per collection
      
      const collection = new UserCollection({
        ...collectionData,
        user_id: randomUser._id,
        materials: selectedMaterials.map(material => ({
          material_id: material._id,
          added_date: new Date(),
          notes: `Added to ${collectionData.name} collection`
        }))
      });
      
      await collection.save();
      console.log(`   ✓ Created collection: ${collectionData.name} (${selectedMaterials.length} materials)`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   📚 Study Materials: ${createdMaterials.length}`);
    console.log(`   📁 Collections: ${sampleCollections.length}`);
    
    console.log('\n🔐 Sample Login Credentials:');
    sampleUsers.forEach(user => {
      console.log(`   📧 ${user.email} | 🔑 ${user.password}`);
    });

    console.log('\n🌐 Test the APIs at:');
    console.log('   🔐 Auth Service: http://localhost:3001');
    console.log('   📚 Content Service: http://localhost:3002');
    console.log('   🔍 Search: http://localhost:3002/api/search?q=computer');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };