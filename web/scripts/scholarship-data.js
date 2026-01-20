// Sample scholarship data
const scholarshipData = [
  {
    id: 'sch-1',
    title: 'Google AI Research Scholarship',
    provider: 'Google LLC',
    amount: '$50,000',
    amountValue: 50000,
    deadline: '2024-03-15',
    field: 'Computer Science',
    level: 'graduate',
    renewable: true,
    description: 'The Google AI Research Scholarship supports outstanding graduate students pursuing research in artificial intelligence, machine learning, and related fields. Recipients will have the opportunity to work with Google researchers and access cutting-edge resources.',
    eligibility: [
      'Currently enrolled in a PhD program in Computer Science, AI, or related field',
      'Minimum GPA of 3.7',
      'Demonstrated research experience in AI/ML',
      'Strong publication record or potential',
      'US citizen or permanent resident'
    ],
    requirements: [
      'Complete online application form',
      'Submit research proposal (5-10 pages)',
      'Provide 3 letters of recommendation',
      'Submit official transcripts',
      'Include CV/Resume',
      'Submit code samples or portfolio'
    ],
    applicationProcess: 'Applications must be submitted through the Google Scholarship Portal. All materials must be uploaded by the deadline. Finalists will be invited for virtual interviews.',
    applicationUrl: 'https://research.google.com/scholarships/',
    tags: ['AI', 'Machine Learning', 'Research', 'Google', 'PhD'],
    status: 'open',
    featured: true
  },
  {
    id: 'sch-2',
    title: 'Microsoft Diversity in Tech Scholarship',
    provider: 'Microsoft Corporation',
    amount: '$25,000',
    amountValue: 25000,
    deadline: '2024-02-28',
    field: 'Computer Science',
    level: 'undergraduate',
    renewable: true,
    description: 'Microsoft is committed to increasing diversity in technology. This scholarship supports underrepresented students pursuing degrees in computer science, software engineering, and related technical fields.',
    eligibility: [
      'Undergraduate student in Computer Science or related field',
      'Member of an underrepresented group in tech',
      'Minimum GPA of 3.0',
      'Demonstrated leadership and community involvement',
      'Financial need'
    ],
    requirements: [
      'Online application',
      'Personal statement (500 words)',
      '2 letters of recommendation',
      'Official transcripts',
      'Resume',
      'Financial aid documentation'
    ],
    applicationProcess: 'Submit application through Microsoft University Relations portal. Selected candidates will participate in mentorship program.',
    applicationUrl: 'https://careers.microsoft.com/students/scholarships',
    tags: ['Diversity', 'Technology', 'Microsoft', 'Undergraduate'],
    status: 'open',
    featured: true
  },
  {
    id: 'sch-3',
    title: 'National Science Foundation Graduate Fellowship',
    provider: 'National Science Foundation',
    amount: '$37,000',
    amountValue: 37000,
    deadline: '2024-10-21',
    field: 'Science',
    level: 'graduate',
    renewable: true,
    description: 'The NSF Graduate Research Fellowship Program recognizes and supports outstanding graduate students in NSF-supported science, technology, engineering, and mathematics disciplines.',
    eligibility: [
      'US citizen, national, or permanent resident',
      'Pursuing research-based graduate degree in eligible field',
      'Early in graduate career (specific restrictions apply)',
      'Strong academic record',
      'Research potential'
    ],
    requirements: [
      'Research proposal (2 pages)',
      'Personal statement (3 pages)',
      '3 reference letters',
      'Official transcripts',
      'Online application'
    ],
    applicationProcess: 'Applications submitted through NSF FastLane system. Review process includes technical merit and broader impacts criteria.',
    applicationUrl: 'https://www.nsfgrfp.org/',
    tags: ['NSF', 'Research', 'STEM', 'Graduate', 'Fellowship'],
    status: 'open',
    featured: true
  },
  {
    id: 'sch-4',
    title: 'Amazon Future Engineer Scholarship',
    provider: 'Amazon',
    amount: '$10,000',
    amountValue: 10000,
    deadline: '2024-01-31',
    field: 'Computer Science',
    level: 'undergraduate',
    renewable: false,
    description: 'Amazon Future Engineer Scholarship supports students from underserved communities pursuing computer science education. Recipients also receive mentorship and internship opportunities.',
    eligibility: [
      'High school senior or undergraduate student',
      'Pursuing computer science or related field',
      'From underserved community',
      'Minimum GPA of 3.0',
      'Demonstrated financial need'
    ],
    requirements: [
      'Complete application form',
      'Essay responses',
      '1 letter of recommendation',
      'Transcripts',
      'FAFSA or financial documentation'
    ],
    applicationProcess: 'Apply through Scholarship America platform. Winners announced in spring.',
    applicationUrl: 'https://www.amazonfutureengineer.com/scholarships',
    tags: ['Amazon', 'Computer Science', 'Underserved', 'Mentorship'],
    status: 'closing_soon',
    featured: false
  },
  {
    id: 'sch-5',
    title: 'Gates Millennium Scholars Program',
    provider: 'Bill & Melinda Gates Foundation',
    amount: 'Full Tuition',
    amountValue: 100000,
    deadline: '2024-01-15',
    field: 'Any',
    level: 'undergraduate',
    renewable: true,
    description: 'The Gates Millennium Scholars Program provides outstanding African American, American Indian/Alaska Native, Asian Pacific Islander American, and Hispanic American students with opportunities to complete undergraduate and graduate education.',
    eligibility: [
      'African American, American Indian/Alaska Native, Asian Pacific Islander American, or Hispanic American',
      'High school senior with minimum 3.3 GPA',
      'Demonstrated leadership abilities',
      'Significant financial need',
      'US citizen, national, or permanent resident'
    ],
    requirements: [
      'Online application',
      'Eight essays',
      'Nominator form',
      'Recommender forms',
      'Transcripts',
      'Financial information'
    ],
    applicationProcess: 'Multi-stage selection process including application review and interviews.',
    applicationUrl: 'https://www.gmsp.org/',
    tags: ['Gates Foundation', 'Full Ride', 'Diversity', 'Leadership'],
    status: 'closing_soon',
    featured: true
  },
  {
    id: 'sch-6',
    title: 'IEEE Computer Society Scholarship',
    provider: 'IEEE Computer Society',
    amount: '$5,000',
    amountValue: 5000,
    deadline: '2024-05-31',
    field: 'Computer Science',
    level: 'undergraduate',
    renewable: false,
    description: 'Supporting undergraduate students pursuing degrees in computer science and computer engineering with demonstrated academic excellence and leadership potential.',
    eligibility: [
      'Undergraduate student in computer science or computer engineering',
      'Minimum GPA of 3.5',
      'IEEE Computer Society student member',
      'Demonstrated leadership in computing',
      'Financial need consideration'
    ],
    requirements: [
      'Online application',
      'Academic transcripts',
      '2 letters of recommendation',
      'Personal statement',
      'Resume',
      'Proof of IEEE membership'
    ],
    applicationProcess: 'Submit through IEEE Computer Society portal. Selection based on academic merit and leadership.',
    applicationUrl: 'https://www.computer.org/education/scholarships',
    tags: ['IEEE', 'Computer Science', 'Engineering', 'Leadership'],
    status: 'open',
    featured: false
  },
  {
    id: 'sch-7',
    title: 'Palantir Women in Technology Scholarship',
    provider: 'Palantir Technologies',
    amount: '$7,000',
    amountValue: 7000,
    deadline: '2024-04-01',
    field: 'Computer Science',
    level: 'undergraduate',
    renewable: false,
    description: 'Palantir is committed to increasing the number of women in technology. This scholarship supports female students pursuing computer science and related technical degrees.',
    eligibility: [
      'Female undergraduate student',
      'Studying computer science, software engineering, or related field',
      'Minimum GPA of 3.5',
      'Demonstrated interest in technology',
      'Leadership experience'
    ],
    requirements: [
      'Online application',
      'Resume',
      'Unofficial transcripts',
      'Short answer questions',
      'Optional: GitHub profile or portfolio'
    ],
    applicationProcess: 'Applications reviewed by Palantir engineering team. Winners invited to company events.',
    applicationUrl: 'https://www.palantir.com/students/scholarship/',
    tags: ['Palantir', 'Women in Tech', 'Computer Science', 'Diversity'],
    status: 'open',
    featured: false
  },
  {
    id: 'sch-8',
    title: 'Adobe Digital Academy Scholarship',
    provider: 'Adobe Inc.',
    amount: '$15,000',
    amountValue: 15000,
    deadline: '2024-03-01',
    field: 'Arts',
    level: 'undergraduate',
    renewable: true,
    description: 'Adobe Digital Academy Scholarship supports students pursuing degrees in digital arts, design, multimedia, and creative technology fields.',
    eligibility: [
      'Undergraduate student in digital arts, design, or related field',
      'Portfolio demonstrating creative and technical skills',
      'Minimum GPA of 3.0',
      'Passion for digital creativity',
      'Financial need'
    ],
    requirements: [
      'Online application',
      'Digital portfolio (10-15 pieces)',
      'Artist statement',
      '2 letters of recommendation',
      'Transcripts',
      'Financial documentation'
    ],
    applicationProcess: 'Portfolio review by Adobe creative professionals. Finalists participate in virtual showcase.',
    applicationUrl: 'https://www.adobe.com/careers/university/digital-academy.html',
    tags: ['Adobe', 'Digital Arts', 'Design', 'Creative Technology'],
    status: 'open',
    featured: false
  },
  {
    id: 'sch-9',
    title: 'Regeneron Science Talent Search',
    provider: 'Regeneron Pharmaceuticals',
    amount: '$250,000',
    amountValue: 250000,
    deadline: '2024-11-15',
    field: 'Science',
    level: 'undergraduate',
    renewable: false,
    description: 'The most prestigious science and math competition for high school seniors. Top prize of $250,000 for exceptional research projects.',
    eligibility: [
      'High school senior in the US',
      'Completed independent research project',
      'Strong academic record in STEM',
      'US citizen or permanent resident',
      'School endorsement required'
    ],
    requirements: [
      'Research report (up to 20 pages)',
      'Research project summary',
      'Transcripts',
      'Standardized test scores',
      'Teacher recommendations',
      'School report'
    ],
    applicationProcess: 'Initial screening, then top 300 scholars selected. Top 40 finalists compete in Washington D.C.',
    applicationUrl: 'https://www.societyforscience.org/regeneron-sts/',
    tags: ['Regeneron', 'Science', 'Research', 'Competition', 'High School'],
    status: 'open',
    featured: true
  },
  {
    id: 'sch-10',
    title: 'Coca-Cola Scholars Program',
    provider: 'The Coca-Cola Foundation',
    amount: '$20,000',
    amountValue: 20000,
    deadline: '2024-10-31',
    field: 'Any',
    level: 'undergraduate',
    renewable: false,
    description: 'The Coca-Cola Scholars Program scholarship is awarded to graduating high school seniors who demonstrate leadership, academic excellence, and a commitment to community service.',
    eligibility: [
      'High school senior',
      'Minimum GPA of 3.0',
      'US citizen or permanent resident',
      'Demonstrated leadership',
      'Community service involvement'
    ],
    requirements: [
      'Online application',
      'Academic transcripts',
      'Leadership and service activities list',
      'Short answer responses',
      'School counselor recommendation'
    ],
    applicationProcess: 'Multi-stage selection process. Semifinalists complete additional requirements.',
    applicationUrl: 'https://www.coca-colascholarsfoundation.org/',
    tags: ['Coca-Cola', 'Leadership', 'Community Service', 'High School'],
    status: 'open',
    featured: false
  },
  {
    id: 'sch-11',
    title: 'Dell Scholars Program',
    provider: 'Dell Technologies',
    amount: '$20,000',
    amountValue: 20000,
    deadline: '2024-12-01',
    field: 'Any',
    level: 'undergraduate',
    renewable: false,
    description: 'Dell Scholars Program recognizes students who have overcome significant obstacles to pursue higher education. Provides financial assistance and ongoing support.',
    eligibility: [
      'High school senior',
      'Minimum GPA of 2.4',
      'Demonstrated need for financial assistance',
      'Participated in college readiness program',
      'Overcome significant obstacles'
    ],
    requirements: [
      'Online application',
      'Essays about challenges overcome',
      'Transcripts',
      'Financial documentation',
      'Program participation verification'
    ],
    applicationProcess: 'Holistic review process focusing on grit and determination rather than just academic achievement.',
    applicationUrl: 'https://www.dellscholars.org/',
    tags: ['Dell', 'Overcoming Obstacles', 'Financial Need', 'Support'],
    status: 'open',
    featured: false
  },
  {
    id: 'sch-12',
    title: 'Thiel Fellowship',
    provider: 'Thiel Foundation',
    amount: '$100,000',
    amountValue: 100000,
    deadline: '2024-12-31',
    field: 'Entrepreneurship',
    level: 'undergraduate',
    renewable: false,
    description: 'The Thiel Fellowship gives $100,000 to young people who want to build new things instead of sitting in a classroom. Fellows skip or stop out of college to focus on their work, their research, and their self-education.',
    eligibility: [
      'Under 23 years old',
      'Innovative project or business idea',
      'Willingness to skip or stop out of college',
      'Entrepreneurial mindset',
      'Potential for significant impact'
    ],
    requirements: [
      'Online application',
      'Project proposal',
      'Video pitch',
      'Letters of recommendation',
      'Resume/CV',
      'Academic transcripts'
    ],
    applicationProcess: 'Highly competitive selection process with multiple rounds of interviews and project evaluation.',
    applicationUrl: 'https://thielfellowship.org/',
    tags: ['Thiel', 'Entrepreneurship', 'Innovation', 'Alternative Education'],
    status: 'open',
    featured: true
  }
];

// Initialize scholarship data in localStorage
function initializeScholarshipData() {
  if (!localStorage.getItem('scholarshipData')) {
    localStorage.setItem('scholarshipData', JSON.stringify(scholarshipData));
    console.log('🎓 Sample scholarship data loaded!');
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  initializeScholarshipData();
}