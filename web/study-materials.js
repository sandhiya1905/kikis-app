// Study Materials page functionality
class StudyMaterialsApp {
    constructor() {
        this.materials = [];
        this.filteredMaterials = [];
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.displayedCount = 12;
        
        this.init();
    }

    init() {
        this.loadMaterials();
        this.setupEventListeners();
        this.checkAuthStatus();
        this.displayMaterials();
        this.updateStatistics();
    }

    loadMaterials() {
        // Load materials from localStorage (both AI data and user-added content)
        const aiMaterials = JSON.parse(localStorage.getItem('aiStudyMaterials') || '[]');
        const userMaterials = JSON.parse(localStorage.getItem('studyMaterials') || '[]');
        
        // Combine both sources
        this.materials = [...aiMaterials, ...userMaterials];
        this.filteredMaterials = [...this.materials];
        
        console.log(`📚 Loaded ${this.materials.length} study materials`);
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchMaterials').addEventListener('click', () => this.searchMaterials());
        document.getElementById('materialSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchMaterials();
        });

        // Filter functionality
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Sort functionality
        document.getElementById('sortBy').addEventListener('change', () => this.sortMaterials());

        // Load more
        document.getElementById('loadMore').addEventListener('click', () => this.loadMore());

        // Modal functionality
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('materialModal').addEventListener('click', (e) => {
            if (e.target.id === 'materialModal') this.closeModal();
        });

        // Modal buttons
        document.getElementById('viewMaterialBtn').addEventListener('click', () => this.viewMaterial());
        document.getElementById('downloadMaterialBtn').addEventListener('click', () => this.downloadMaterial());
        document.getElementById('saveMaterialBtn').addEventListener('click', () => this.saveMaterial());
        document.getElementById('shareMaterialBtn').addEventListener('click', () => this.shareMaterial());

        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.redirectToLogin());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Add content functionality
        document.getElementById('addContentBtn').addEventListener('click', () => this.showAddContentModal());
        document.getElementById('cancelAddContent').addEventListener('click', () => this.hideAddContentModal());
        document.getElementById('addContentForm').addEventListener('submit', (e) => this.handleAddContent(e));
        document.getElementById('addContentModal').addEventListener('click', (e) => {
            if (e.target.id === 'addContentModal') this.hideAddContentModal();
        });
    }

    async checkAuthStatus() {
        if (this.authToken) {
            try {
                const response = await fetch('http://localhost:3001/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.data.user;
                    this.updateAuthUI();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            loginBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userName.textContent = `Welcome, ${this.currentUser.profile.name}!`;
        } else {
            loginBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    redirectToLogin() {
        window.location.href = 'index.html';
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.updateAuthUI();
    }

    searchMaterials() {
        const query = document.getElementById('materialSearch').value.toLowerCase().trim();
        
        if (!query) {
            this.filteredMaterials = [...this.materials];
        } else {
            this.filteredMaterials = this.materials.filter(material => 
                material.title.toLowerCase().includes(query) ||
                material.description.toLowerCase().includes(query) ||
                material.subject.toLowerCase().includes(query) ||
                (material.metadata.topics && material.metadata.topics.some(topic => topic.toLowerCase().includes(query))) ||
                (material.metadata.tags && material.metadata.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        this.displayedCount = 12;
        this.displayMaterials();
        this.updateStatistics();
    }

    applyFilters() {
        const subjectFilter = document.getElementById('subjectFilter').value;
        const difficultyFilter = document.getElementById('difficultyFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const ratingFilter = document.getElementById('ratingFilter').value;

        this.filteredMaterials = this.materials.filter(material => {
            // Subject filter
            if (subjectFilter && material.subject !== subjectFilter) return false;
            
            // Difficulty filter
            if (difficultyFilter && material.metadata.difficulty_level !== difficultyFilter) return false;
            
            // Type filter
            if (typeFilter && material.content_type !== typeFilter) return false;
            
            // Rating filter
            if (ratingFilter) {
                const minRating = parseFloat(ratingFilter);
                if (!material.rating || material.rating.average < minRating) return false;
            }
            
            return true;
        });

        this.displayedCount = 12;
        this.displayMaterials();
        this.updateStatistics();
    }

    clearFilters() {
        document.getElementById('subjectFilter').value = '';
        document.getElementById('difficultyFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('ratingFilter').value = '';
        document.getElementById('materialSearch').value = '';
        
        this.filteredMaterials = [...this.materials];
        this.displayedCount = 12;
        this.displayMaterials();
        this.updateStatistics();
    }

    sortMaterials() {
        const sortBy = document.getElementById('sortBy').value;
        
        this.filteredMaterials.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.rating?.average || 0) - (a.rating?.average || 0);
                case 'downloads':
                    return (b.download_count || 0) - (a.download_count || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'date':
                    return new Date(b.upload_date || 0) - new Date(a.upload_date || 0);
                default:
                    return 0;
            }
        });

        this.displayMaterials();
    }

    displayMaterials() {
        const container = document.getElementById('materialCards');
        const materialsToShow = this.filteredMaterials.slice(0, this.displayedCount);
        
        if (materialsToShow.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No study materials found</h3>
                    <p class="text-gray-500 mb-4">Try adjusting your search or filters</p>
                    ${this.currentUser ? '<button onclick="studyMaterialsApp.showAddContentModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"><i class="fas fa-plus mr-2"></i>Add First Material</button>' : ''}
                </div>
            `;
        } else {
            container.innerHTML = materialsToShow.map(material => this.createMaterialCard(material)).join('');
        }
        
        // Update result count
        document.getElementById('resultCount').textContent = 
            `Showing ${materialsToShow.length} of ${this.filteredMaterials.length} materials`;
        
        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMore');
        if (this.displayedCount >= this.filteredMaterials.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    createMaterialCard(material) {
        const rating = material.rating || { average: 0, count: 0 };
        const downloads = material.download_count || 0;
        const views = material.access_count || 0;
        
        // Generate star rating display
        const stars = this.generateStarRating(rating.average);
        
        // Format file size
        const fileSize = this.formatFileSize(material.metadata?.file_size || 0);
        
        return `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-900 mb-2">${material.title}</h3>
                            <p class="text-blue-600 font-semibold">${material.subject}</p>
                        </div>
                        <span class="bg-${this.getDifficultyColor(material.metadata?.difficulty_level)}-100 text-${this.getDifficultyColor(material.metadata?.difficulty_level)}-800 px-2 py-1 rounded-full text-sm font-semibold">
                            ${this.capitalizeFirst(material.metadata?.difficulty_level || 'Unknown')}
                        </span>
                    </div>
                    
                    <p class="text-gray-600 mb-4 line-clamp-3">${material.description}</p>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            ${material.content_type?.toUpperCase() || 'PDF'}
                        </span>
                        ${material.metadata?.topics ? material.metadata.topics.slice(0, 2).map(topic => 
                            `<span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">${topic}</span>`
                        ).join('') : ''}
                    </div>
                    
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            ${stars}
                            <span class="ml-2 text-sm text-gray-600">${rating.average.toFixed(1)} (${rating.count})</span>
                        </div>
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-download mr-1"></i>${downloads}
                            <i class="fas fa-eye ml-3 mr-1"></i>${views}
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button 
                            onclick="studyMaterialsApp.showMaterialDetails('${material.id || Date.now()}')"
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition font-semibold"
                        >
                            <i class="fas fa-info-circle mr-2"></i>View Details
                        </button>
                        <button 
                            onclick="studyMaterialsApp.quickDownload('${material.id || Date.now()}')"
                            class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition font-semibold"
                        >
                            <i class="fas fa-download mr-2"></i>Download
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-yellow-400"></i>';
        }
        return stars;
    }

    getDifficultyColor(difficulty) {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'green';
            case 'intermediate': return 'yellow';
            case 'advanced': return 'orange';
            case 'expert': return 'red';
            default: return 'gray';
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showMaterialDetails(materialId) {
        const material = this.materials.find(m => (m.id || Date.now().toString()) === materialId);
        if (!material) return;

        // Populate modal
        document.getElementById('modalTitle').textContent = material.title;
        document.getElementById('modalSubject').textContent = material.subject;
        document.getElementById('modalDescription').textContent = material.description;
        document.getElementById('modalType').textContent = material.content_type?.toUpperCase() || 'PDF';
        document.getElementById('modalDifficulty').textContent = this.capitalizeFirst(material.metadata?.difficulty_level || 'Unknown');
        
        const rating = material.rating || { average: 0, count: 0 };
        document.getElementById('modalRating').textContent = `${rating.average.toFixed(1)} ⭐ (${rating.count} reviews)`;
        document.getElementById('modalDownloads').textContent = material.download_count || 0;
        document.getElementById('modalViews').textContent = material.access_count || 0;
        document.getElementById('modalSize').textContent = this.formatFileSize(material.metadata?.file_size || 0);

        // Populate topics
        const topicsContainer = document.getElementById('modalTopics');
        if (material.metadata?.topics) {
            topicsContainer.innerHTML = material.metadata.topics.map(topic => 
                `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${topic}</span>`
            ).join('');
        } else {
            topicsContainer.innerHTML = '<span class="text-gray-500">No topics specified</span>';
        }

        // Populate tags
        const tagsContainer = document.getElementById('modalTags');
        if (material.metadata?.tags) {
            tagsContainer.innerHTML = material.metadata.tags.map(tag => 
                `<span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">${tag}</span>`
            ).join('');
        } else {
            tagsContainer.innerHTML = '<span class="text-gray-500">No tags specified</span>';
        }

        // Store current material for modal actions
        this.currentMaterial = material;

        // Show modal
        document.getElementById('materialModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('materialModal').classList.add('hidden');
        this.currentMaterial = null;
    }

    viewMaterial() {
        if (this.currentMaterial && this.currentMaterial.file_url) {
            window.open(this.currentMaterial.file_url, '_blank');
        } else {
            alert('Material file not available for viewing.');
        }
    }

    quickDownload(materialId) {
        const material = this.materials.find(m => (m.id || Date.now().toString()) === materialId);
        this.downloadMaterial(material);
    }

    downloadMaterial(material = this.currentMaterial) {
        if (material) {
            // Create actual downloadable content based on material type
            let content, filename, mimeType;
            
            if (material.title.toLowerCase().includes('tensorflow')) {
                content = this.generateTensorFlowContent();
                filename = 'tensorflow-guide.txt';
                mimeType = 'text/plain';
            } else if (material.title.toLowerCase().includes('machine learning')) {
                content = this.generateMLContent();
                filename = 'machine-learning-basics.txt';
                mimeType = 'text/plain';
            } else if (material.title.toLowerCase().includes('bert')) {
                content = this.generateBERTContent();
                filename = 'bert-documentation.txt';
                mimeType = 'text/plain';
            } else {
                content = this.generateGenericContent(material);
                filename = material.title.toLowerCase().replace(/\s+/g, '-') + '.txt';
                mimeType = 'text/plain';
            }
            
            // Create blob and download
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Update download count
            material.download_count = (material.download_count || 0) + 1;
            this.updateMaterialInStorage(material);
            
            // Show success message
            this.showDownloadSuccess(filename);
        } else {
            alert('Download not available for this material.');
        }
    }

    generateTensorFlowContent() {
        return `# TensorFlow Complete Guide

## Introduction to TensorFlow
TensorFlow is an open-source machine learning framework developed by Google. It provides a comprehensive ecosystem of tools, libraries, and community resources.

## Key Features
- Flexible ecosystem of tools and libraries
- Easy model building with high-level APIs
- Robust ML production anywhere
- Powerful experimentation for research

## Getting Started
1. Install TensorFlow: pip install tensorflow
2. Import the library: import tensorflow as tf
3. Create your first model
4. Train and evaluate

## Basic Example
\`\`\`python
import tensorflow as tf

# Create a simple sequential model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(10)
])

# Compile the model
model.compile(optimizer='adam',
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])
\`\`\`

## Advanced Topics
- Custom layers and models
- Distributed training
- TensorFlow Serving
- TensorFlow Lite for mobile
- TensorFlow.js for web

Downloaded from NovaLearn Platform - ${new Date().toLocaleDateString()}`;
    }

    generateMLContent() {
        return `# Machine Learning Basics

## What is Machine Learning?
Machine Learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience.

## Types of Machine Learning

### 1. Supervised Learning
- Uses labeled training data
- Examples: Classification, Regression
- Algorithms: Linear Regression, Decision Trees, SVM

### 2. Unsupervised Learning
- Uses unlabeled data
- Examples: Clustering, Association
- Algorithms: K-Means, Hierarchical Clustering

### 3. Reinforcement Learning
- Learning through interaction with environment
- Examples: Game playing, Robotics
- Algorithms: Q-Learning, Policy Gradient

## Key Concepts
- Training Data
- Features and Labels
- Model Training
- Validation and Testing
- Overfitting and Underfitting

## Popular Libraries
- Scikit-learn
- TensorFlow
- PyTorch
- Keras

Downloaded from NovaLearn Platform - ${new Date().toLocaleDateString()}`;
    }

    generateBERTContent() {
        return `# BERT: Bidirectional Encoder Representations from Transformers

## Overview
BERT is a transformer-based machine learning technique for natural language processing (NLP) pre-training developed by Google.

## Key Features
- Bidirectional training of Transformer
- Pre-trained on large corpus
- Fine-tunable for specific tasks
- State-of-the-art results on many NLP tasks

## Architecture
- Multi-layer bidirectional Transformer encoder
- Attention mechanism
- Position embeddings
- Segment embeddings

## Applications
- Question Answering
- Sentiment Analysis
- Named Entity Recognition
- Text Classification
- Language Translation

## Usage Example
\`\`\`python
from transformers import BertTokenizer, BertModel

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

inputs = tokenizer("Hello, my dog is cute", return_tensors="pt")
outputs = model(**inputs)
\`\`\`

Downloaded from NovaLearn Platform - ${new Date().toLocaleDateString()}`;
    }

    generateGenericContent(material) {
        return `# ${material.title}

## Description
${material.description}

## Subject
${material.subject}

## Difficulty Level
${this.capitalizeFirst(material.metadata?.difficulty_level || 'Unknown')}

## Topics Covered
${material.metadata?.topics ? material.metadata.topics.join(', ') : 'Not specified'}

## Tags
${material.metadata?.tags ? material.metadata.tags.join(', ') : 'Not specified'}

## Content Type
${material.content_type?.toUpperCase() || 'PDF'}

## Additional Information
This study material is part of the NovaLearn educational platform. 
For more resources and interactive learning, visit our platform.

Rating: ${material.rating?.average || 0}/5 (${material.rating?.count || 0} reviews)
Downloads: ${material.download_count || 0}
Views: ${material.access_count || 0}

Downloaded from NovaLearn Platform - ${new Date().toLocaleDateString()}`;
    }

    showDownloadSuccess(filename) {
        // Create and show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>Successfully downloaded: ${filename}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveMaterial() {
        if (!this.currentUser) {
            alert('Please login to save materials to your collection');
            return;
        }
        
        // In a real app, this would save to the backend
        alert('Material saved to your collection!');
    }

    shareMaterial() {
        if (navigator.share && this.currentMaterial) {
            navigator.share({
                title: this.currentMaterial.title,
                text: 'Check out this study material!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Material link copied to clipboard!');
        }
    }

    loadMore() {
        this.displayedCount += 12;
        this.displayMaterials();
    }

    updateStatistics() {
        const totalMaterials = this.materials.length;
        const subjects = [...new Set(this.materials.map(m => m.subject))].length;
        const totalDownloads = this.materials.reduce((sum, m) => sum + (m.download_count || 0), 0);
        const avgRating = this.materials.length > 0 
            ? this.materials.reduce((sum, m) => sum + (m.rating?.average || 0), 0) / this.materials.length 
            : 0;
        
        document.getElementById('totalMaterials').textContent = totalMaterials;
        document.getElementById('totalSubjects').textContent = subjects;
        document.getElementById('totalDownloads').textContent = totalDownloads.toLocaleString();
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    }

    updateMaterialInStorage(material) {
        // Update in localStorage
        const aiMaterials = JSON.parse(localStorage.getItem('aiStudyMaterials') || '[]');
        const userMaterials = JSON.parse(localStorage.getItem('studyMaterials') || '[]');
        
        // Find and update in appropriate storage
        const aiIndex = aiMaterials.findIndex(m => m.id === material.id);
        const userIndex = userMaterials.findIndex(m => m.id === material.id);
        
        if (aiIndex !== -1) {
            aiMaterials[aiIndex] = material;
            localStorage.setItem('aiStudyMaterials', JSON.stringify(aiMaterials));
        } else if (userIndex !== -1) {
            userMaterials[userIndex] = material;
            localStorage.setItem('studyMaterials', JSON.stringify(userMaterials));
        }
    }

    // Add content functionality (similar to main page)
    showAddContentModal() {
        if (!this.currentUser) {
            alert('Please login first to add content');
            return;
        }
        document.getElementById('addContentModal').classList.remove('hidden');
        document.getElementById('contentTitle').focus();
    }

    hideAddContentModal() {
        document.getElementById('addContentModal').classList.add('hidden');
        document.getElementById('addContentForm').reset();
        document.getElementById('addContentMessage').innerHTML = '';
    }

    async handleAddContent(e) {
        e.preventDefault();
        
        if (!this.authToken) {
            alert('Please login first');
            return;
        }

        const title = document.getElementById('contentTitle').value;
        const description = document.getElementById('contentDescription').value;
        const subject = document.getElementById('contentSubject').value;
        const difficulty = document.getElementById('contentDifficulty').value;
        const topics = document.getElementById('contentTopics').value.split(',').map(t => t.trim()).filter(t => t);
        const tags = document.getElementById('contentTags').value.split(',').map(t => t.trim()).filter(t => t);
        const messageDiv = document.getElementById('addContentMessage');

        try {
            messageDiv.innerHTML = '<p class="text-blue-600">Adding content...</p>';

            // Create the study material object
            const materialData = {
                id: Date.now().toString(),
                title,
                description,
                subject,
                content_type: 'pdf',
                file_path: `/uploads/${subject.toLowerCase().replace(/\s+/g, '-')}/${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                file_url: `http://localhost:3002/uploads/${subject.toLowerCase().replace(/\s+/g, '-')}/${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                metadata: {
                    semester: 3,
                    difficulty_level: difficulty,
                    topics: topics,
                    tags: tags,
                    file_size: Math.floor(Math.random() * 3000000) + 1000000, // Random size between 1-4MB
                    duration: 0,
                    language: 'English'
                },
                is_public: true,
                is_approved: true,
                status: 'approved',
                rating: { 
                    average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Random rating 3.5-5.0
                    count: Math.floor(Math.random() * 100) + 10 
                },
                access_count: Math.floor(Math.random() * 1000) + 50,
                download_count: Math.floor(Math.random() * 500) + 20,
                upload_date: new Date().toISOString(),
                uploaded_by: this.currentUser._id
            };

            // Add to localStorage
            let materials = JSON.parse(localStorage.getItem('studyMaterials') || '[]');
            materials.push(materialData);
            localStorage.setItem('studyMaterials', JSON.stringify(materials));

            // Reload materials and refresh display
            this.loadMaterials();
            this.displayMaterials();
            this.updateStatistics();

            messageDiv.innerHTML = '<p class="text-green-600">Content added successfully!</p>';
            setTimeout(() => {
                this.hideAddContentModal();
            }, 1500);

        } catch (error) {
            messageDiv.innerHTML = '<p class="text-red-600">Failed to add content. Please try again.</p>';
            console.error('Add content error:', error);
        }
    }
}

// Initialize the app when the page loads
let studyMaterialsApp;
document.addEventListener('DOMContentLoaded', () => {
    studyMaterialsApp = new StudyMaterialsApp();
});