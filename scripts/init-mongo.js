// MongoDB initialization script
db = db.getSiblingDB('nova_learn');

// Create collections
db.createCollection('users');
db.createCollection('study_materials');
db.createCollection('scholarships');
db.createCollection('interview_sessions');
db.createCollection('interview_questions');
db.createCollection('user_collections');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "profile.college": 1 });
db.users.createIndex({ "profile.major": 1 });

db.study_materials.createIndex({ "subject": 1 });
db.study_materials.createIndex({ "metadata.topics": 1 });
db.study_materials.createIndex({ "metadata.difficulty_level": 1 });
db.study_materials.createIndex({ "title": "text", "metadata.topics": "text" });

db.scholarships.createIndex({ "eligibility_criteria.majors": 1 });
db.scholarships.createIndex({ "eligibility_criteria.academic_year": 1 });
db.scholarships.createIndex({ "application_deadline": 1 });
db.scholarships.createIndex({ "title": "text", "description": "text" });

db.interview_sessions.createIndex({ "user_id": 1 });
db.interview_sessions.createIndex({ "domain": 1 });
db.interview_sessions.createIndex({ "start_time": 1 });

db.interview_questions.createIndex({ "domain": 1 });
db.interview_questions.createIndex({ "difficulty_level": 1 });

db.user_collections.createIndex({ "user_id": 1 });

print('Database initialized successfully with collections and indexes');