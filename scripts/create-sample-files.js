const fs = require('fs');
const path = require('path');

// Create sample PDF content (mock files)
const sampleFiles = [
  {
    name: 'ml-intro.pdf',
    content: `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Introduction to Machine Learning) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`
  },
  {
    name: 'calculus-derivatives.pdf',
    content: `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Calculus I - Derivatives and Limits) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`
  }
];

function createSampleFiles() {
  console.log('📁 Creating sample files...');
  
  // Create upload directories
  const uploadDirs = [
    'services/content-service/uploads',
    'services/content-service/uploads/pdf',
    'services/content-service/uploads/document',
    'services/content-service/uploads/video',
    'services/content-service/uploads/presentation'
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✓ Created directory: ${dir}`);
    }
  });

  // Create sample PDF files
  sampleFiles.forEach(file => {
    const filePath = path.join('services/content-service/uploads/pdf', file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`   ✓ Created sample file: ${file.name}`);
  });

  // Create additional sample files with generic content
  const additionalFiles = [
    'quantum-mechanics.pdf',
    'cell-biology.pdf',
    'microeconomics.pdf',
    'data-structures.pdf',
    'linear-algebra.pdf',
    'organic-chemistry.pdf'
  ];

  additionalFiles.forEach(fileName => {
    const filePath = path.join('services/content-service/uploads/pdf', fileName);
    const content = sampleFiles[0].content.replace('Introduction to Machine Learning', fileName.replace('.pdf', '').replace('-', ' '));
    fs.writeFileSync(filePath, content);
    console.log(`   ✓ Created sample file: ${fileName}`);
  });

  console.log('✅ Sample files created successfully!');
}

if (require.main === module) {
  createSampleFiles();
}

module.exports = { createSampleFiles };