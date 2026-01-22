// NovaLearn Web Application - Vercel Compatible Version
class NovaLearnApp {
    constructor() {
        // Use relative URLs for Vercel deployment
        this.baseURL = window.location.origin; // Will be your Vercel domain
        this.apiURL = `${this.baseURL}/api`; // Serverless functions
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        // Note: Auth is disabled for demo deployment
        // this.checkAuthStatus();
    }

    loadSampleData() {
        // Load sample data for demo purposes
        if (!localStorage.getItem('studyMaterials')) {
            const sampleMaterials = [
                {
                    id: '1',
                    title: 'Introduction to Machine Learning',
                    description: 'Comprehensive guide covering supervised and unsupervised learning, neural networks, and practical applications.',
                    subject: 'Machine Learning',
                    content_type: 'pdf',
                    metadata: {
                        difficulty_level: 'beginner',
                        topics: ['supervised learning', 'unsupervised learning', 'neural networks'],
                        tags: ['AI', 'ML', 'beginner'],
                        file_size: 2500000
                    },
                    rating: { average: 4.8, count: 125 },
                    access_count: 1250,
                    download_count: 890,
                    upload_date: '2024-01-15T10:00:00Z'
                },
                {
                    id: '2',
                    title: 'Deep Learning with TensorFlow',
                    description: 'Advanced deep learning concepts including CNNs, RNNs, and transformer architectures.',
                    subject: 'Deep Learning',
                    content_type: 'pdf',
                    metadata: {
                        difficulty_level: 'advanced',
                        topics: ['tensorflow', 'neural networks', 'CNN', 'RNN'],
                        tags: ['TensorFlow', 'Deep Learning', 'Google'],
                        file_size: 4200000
                    },
                    rating: { average: 4.9, count: 89 },
                    access_count: 890,
                    download_count: 650,
                    upload_date: '2024-01-10T14:30:00Z'
                }
            ];
            localStorage.setItem('studyMaterials', JSON.stringify(sampleMaterials));
        }
    }

    setupEventListeners() {
        // Navigation buttons - simplified for demo
        document.getElementById('loginBtn').addEventListener('click', () => this.showDemoMessage('Login'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showDemoMessage('Register'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('addContentBtn').addEventListener('click', () => this.showAddContentModal());

        // Modal controls
        document.getElementById('cancelLogin').addEventListener('click', () => this.hideLoginModal());
        document.getElementById('cancelRegister').addEventListener('click', () => this.hideRegisterModal());
        document.getElementById('cancelAddContent').addEventListener('click', () => this.hideAddContentModal());

        // Forms
        document.getElementById('addContentForm').addEventListener('submit', (e) => this.handleAddContent(e));

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Close modals when clicking outside
        document.getElementById('addContentModal').addEventListener('click', (e) => {
            if (e.target.id === 'addContentModal') this.hideAddContentModal();
        });
    }

    showDemoMessage(action) {
        alert(`${action} functionality is disabled in this demo version. This is a static deployment showcasing the UI and search features.`);
    }

    updateUI() {
        // Simplified UI for demo
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        
        // Always show login/register for demo
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }

    showAddContentModal() {
        document.getElementById('addContentModal').classList.remove('hidden');
        document.getElementById('contentTitle').focus();
    }

    hideAddContentModal() {
        document.getElementById('addContentModal').classList.add('hidden');
        document.getElementById('addContentForm').reset();
        document.getElementById('addContentMessage').innerHTML = '';
    }

    hideLoginModal() {
        document.getElementById('loginModal').classList.add('hidden');
    }

    hideRegisterModal() {
        document.getElementById('registerModal').classList.add('hidden');
    }

    async handleAddContent(e) {
        e.preventDefault();
        
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
                metadata: {
                    difficulty_level: difficulty,
                    topics: topics,
                    tags: tags,
                    file_size: Math.floor(Math.random() * 3000000) + 1000000
                },
                rating: { 
                    average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
                    count: Math.floor(Math.random() * 100) + 10 
                },
                access_count: Math.floor(Math.random() * 1000) + 50,
                download_count: Math.floor(Math.random() * 500) + 20,
                upload_date: new Date().toISOString()
            };

            // Store in localStorage for demo
            let materials = JSON.parse(localStorage.getItem('studyMaterials') || '[]');
            materials.push(materialData);
            localStorage.setItem('studyMaterials', JSON.stringify(materials));

            messageDiv.innerHTML = '<p class="text-green-600">Content added successfully!</p>';
            setTimeout(() => {
                this.hideAddContentModal();
                if (document.getElementById('searchInput').value) {
                    this.performSearch();
                }
            }, 1500);

        } catch (error) {
            messageDiv.innerHTML = '<p class="text-red-600">Failed to add content. Please try again.</p>';
            console.error('Add content error:', error);
        }
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.updateUI();
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        const resultsSection = document.getElementById('resultsSection');
        const searchResults = document.getElementById('searchResults');

        if (!query) {
            alert('Please enter a search term');
            return;
        }

        try {
            searchResults.innerHTML = '<p class="text-blue-600">Searching...</p>';
            resultsSection.classList.remove('hidden');

            let allMaterials = [];

            // Try to search using Vercel API
            try {
                const response = await fetch(`${this.apiURL}/search?q=${encodeURIComponent(query)}&limit=10`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        allMaterials = [...data.data];
                    }
                }
            } catch (error) {
                console.log('API search failed, using local data');
            }

            // Also search localStorage materials
            const localMaterials = JSON.parse(localStorage.getItem('studyMaterials') || '[]');
            const localMatches = localMaterials.filter(material => 
                material.title.toLowerCase().includes(query.toLowerCase()) ||
                material.description.toLowerCase().includes(query.toLowerCase()) ||
                material.subject.toLowerCase().includes(query.toLowerCase()) ||
                material.metadata.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase())) ||
                material.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );

            // Combine and deduplicate results
            const combinedMaterials = [...allMaterials];
            localMatches.forEach(local => {
                if (!combinedMaterials.find(api => api.id === local.id)) {
                    combinedMaterials.push(local);
                }
            });

            if (combinedMaterials.length === 0) {
                searchResults.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600">No study materials found for "${query}"</p>
                        <p class="text-sm text-gray-500 mt-2">Try different keywords or add some content first</p>
                        <button onclick="document.getElementById('addContentBtn').click()" class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                            <i class="fas fa-plus mr-2"></i>Add Content
                        </button>
                    </div>
                `;
            } else {
                const resultsHTML = combinedMaterials.map(material => `
                    <div class="border-b border-gray-200 py-4 last:border-b-0">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="text-lg font-semibold text-blue-600 mb-2">${material.title}</h4>
                                <p class="text-gray-600 mb-2">${material.description}</p>
                                <div class="flex flex-wrap gap-2 mb-2">
                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                        ${material.subject}
                                    </span>
                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                        ${material.difficulty || material.metadata?.difficulty_level || 'N/A'}
                                    </span>
                                    <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                                        PDF
                                    </span>
                                    ${(material.tags || material.metadata?.tags || []).slice(0, 3).map(tag => 
                                        `<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">${tag}</span>`
                                    ).join('')}
                                </div>
                                <div class="flex items-center text-sm text-gray-500">
                                    <i class="fas fa-star text-yellow-400 mr-1"></i>
                                    <span class="mr-4">${material.rating?.average || 'N/A'} (${material.rating?.count || 0} reviews)</span>
                                    <i class="fas fa-eye mr-1"></i>
                                    <span class="mr-4">${material.downloads || material.access_count || 0} views</span>
                                    <i class="fas fa-download mr-1"></i>
                                    <span>${material.downloads || material.download_count || 0} downloads</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm" onclick="alert('View functionality is disabled in demo mode')">
                                    <i class="fas fa-eye mr-1"></i>View
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');

                searchResults.innerHTML = `
                    <div class="mb-4">
                        <p class="text-gray-600">Found ${combinedMaterials.length} result(s) for "${query}"</p>
                        <p class="text-sm text-gray-500">This is a demo version with sample data and API integration</p>
                    </div>
                    ${resultsHTML}
                `;
            }
        } catch (error) {
            searchResults.innerHTML = '<p class="text-red-600">Search failed. Please try again.</p>';
            console.error('Search error:', error);
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NovaLearnApp();
});