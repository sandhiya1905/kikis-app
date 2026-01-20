// NovaLearn Web Application
class NovaLearnApp {
    constructor() {
        this.baseURL = 'http://localhost:3001'; // Auth service
        this.contentURL = 'http://localhost:3002'; // Content service
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('registerBtn').addEventListener('click', () => this.showRegisterModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('addContentBtn').addEventListener('click', () => this.showAddContentModal());

        // Modal controls
        document.getElementById('cancelLogin').addEventListener('click', () => this.hideLoginModal());
        document.getElementById('cancelRegister').addEventListener('click', () => this.hideRegisterModal());
        document.getElementById('cancelAddContent').addEventListener('click', () => this.hideAddContentModal());

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('addContentForm').addEventListener('submit', (e) => this.handleAddContent(e));

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Close modals when clicking outside
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') this.hideLoginModal();
        });
        document.getElementById('registerModal').addEventListener('click', (e) => {
            if (e.target.id === 'registerModal') this.hideRegisterModal();
        });
        document.getElementById('addContentModal').addEventListener('click', (e) => {
            if (e.target.id === 'addContentModal') this.hideAddContentModal();
        });
    }

    async checkAuthStatus() {
        if (this.authToken) {
            try {
                const response = await fetch(`${this.baseURL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.data.user;
                    this.updateUI();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const dashboardSection = document.getElementById('dashboardSection');
        const profileInfo = document.getElementById('profileInfo');

        if (this.currentUser) {
            // Hide login/register buttons
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            
            // Show user menu
            userMenu.classList.remove('hidden');
            userName.textContent = `Welcome, ${this.currentUser.profile.name}!`;
            
            // Show dashboard
            dashboardSection.classList.remove('hidden');
            
            // Update profile info
            profileInfo.innerHTML = `
                <div class="space-y-2">
                    <p><strong>Name:</strong> ${this.currentUser.profile.name}</p>
                    <p><strong>Email:</strong> ${this.currentUser.email}</p>
                    <p><strong>College:</strong> ${this.currentUser.profile.college}</p>
                    <p><strong>Major:</strong> ${this.currentUser.profile.major}</p>
                    <p><strong>Year:</strong> ${this.currentUser.profile.year}</p>
                    <p><strong>Level:</strong> ${this.currentUser.profile.academic_level}</p>
                    <p><strong>Status:</strong> <span class="text-green-600">${this.currentUser.is_verified ? 'Verified' : 'Pending Verification'}</span></p>
                </div>
            `;
        } else {
            // Show login/register buttons
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            
            // Hide user menu and dashboard
            userMenu.classList.add('hidden');
            dashboardSection.classList.add('hidden');
        }
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('loginEmail').focus();
    }

    hideLoginModal() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('loginForm').reset();
        document.getElementById('loginMessage').innerHTML = '';
    }

    showRegisterModal() {
        document.getElementById('registerModal').classList.remove('hidden');
        document.getElementById('registerEmail').focus();
    }

    hideRegisterModal() {
        document.getElementById('registerModal').classList.add('hidden');
        document.getElementById('registerForm').reset();
        document.getElementById('registerMessage').innerHTML = '';
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');

        try {
            messageDiv.innerHTML = '<p class="text-blue-600">Logging in...</p>';

            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.authToken = data.data.accessToken;
                this.currentUser = data.data.user;
                localStorage.setItem('authToken', this.authToken);
                
                messageDiv.innerHTML = '<p class="text-green-600">Login successful!</p>';
                setTimeout(() => {
                    this.hideLoginModal();
                    this.updateUI();
                }, 1000);
            } else {
                messageDiv.innerHTML = `<p class="text-red-600">${data.message}</p>`;
            }
        } catch (error) {
            messageDiv.innerHTML = '<p class="text-red-600">Login failed. Please check if the server is running.</p>';
            console.error('Login error:', error);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('registerName').value;
        const college = document.getElementById('registerCollege').value;
        const major = document.getElementById('registerMajor').value;
        const year = parseInt(document.getElementById('registerYear').value);
        const academic_level = document.getElementById('registerLevel').value;
        const messageDiv = document.getElementById('registerMessage');

        if (password !== confirmPassword) {
            messageDiv.innerHTML = '<p class="text-red-600">Passwords do not match!</p>';
            return;
        }

        try {
            messageDiv.innerHTML = '<p class="text-blue-600">Creating account...</p>';

            const response = await fetch(`${this.baseURL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    confirmPassword,
                    profile: {
                        name,
                        college,
                        major,
                        year,
                        academic_level,
                        interests: []
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                messageDiv.innerHTML = '<p class="text-green-600">Registration successful! You can now login.</p>';
                setTimeout(() => {
                    this.hideRegisterModal();
                    this.showLoginModal();
                    document.getElementById('loginEmail').value = email;
                }, 2000);
            } else {
                messageDiv.innerHTML = `<p class="text-red-600">${data.message}</p>`;
            }
        } catch (error) {
            messageDiv.innerHTML = '<p class="text-red-600">Registration failed. Please check if the server is running.</p>';
            console.error('Registration error:', error);
        }
    }

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
                download_count: Math.floor(Math.random() * 500) + 20
            };

            // For now, we'll simulate adding to database by storing in localStorage
            // In a real app, this would be a POST request to the content service
            let materials = JSON.parse(localStorage.getItem('studyMaterials') || '[]');
            materialData.id = Date.now().toString();
            materialData.upload_date = new Date().toISOString();
            materialData.uploaded_by = this.currentUser._id;
            
            materials.push(materialData);
            localStorage.setItem('studyMaterials', JSON.stringify(materials));

            messageDiv.innerHTML = '<p class="text-green-600">Content added successfully!</p>';
            setTimeout(() => {
                this.hideAddContentModal();
                // Refresh search to show new content
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

            // Search both API and localStorage
            let allMaterials = [];

            // Search API
            try {
                const response = await fetch(`${this.contentURL}/api/search?q=${encodeURIComponent(query)}&limit=10`);
                const data = await response.json();
                if (data.success) {
                    allMaterials = [...data.data.materials];
                }
            } catch (error) {
                console.log('API search failed, using local data only');
            }

            // Search localStorage materials
            const localMaterials = JSON.parse(localStorage.getItem('studyMaterials') || '[]');
            const localMatches = localMaterials.filter(material => 
                material.title.toLowerCase().includes(query.toLowerCase()) ||
                material.description.toLowerCase().includes(query.toLowerCase()) ||
                material.subject.toLowerCase().includes(query.toLowerCase()) ||
                material.metadata.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase())) ||
                material.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );

            // Combine results
            allMaterials = [...allMaterials, ...localMatches];

            if (allMaterials.length === 0) {
                searchResults.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600">No study materials found for "${query}"</p>
                        <p class="text-sm text-gray-500 mt-2">Try different keywords or add some content first</p>
                        ${this.currentUser ? '<button onclick="document.getElementById(\'addContentBtn\').click()" class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"><i class="fas fa-plus mr-2"></i>Add Content</button>' : ''}
                    </div>
                `;
            } else {
                const resultsHTML = allMaterials.map(material => `
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
                                        ${material.metadata.difficulty_level}
                                    </span>
                                    <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                                        ${material.content_type.toUpperCase()}
                                    </span>
                                    ${material.metadata.tags.slice(0, 3).map(tag => 
                                        `<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">${tag}</span>`
                                    ).join('')}
                                </div>
                                <div class="flex items-center text-sm text-gray-500">
                                    <i class="fas fa-star text-yellow-400 mr-1"></i>
                                    <span class="mr-4">${material.rating.average} (${material.rating.count} reviews)</span>
                                    <i class="fas fa-eye mr-1"></i>
                                    <span class="mr-4">${material.access_count} views</span>
                                    <i class="fas fa-download mr-1"></i>
                                    <span>${material.download_count} downloads</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">
                                    <i class="fas fa-eye mr-1"></i>View
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');

                searchResults.innerHTML = `
                    <div class="mb-4">
                        <p class="text-gray-600">Found ${allMaterials.length} result(s) for "${query}"</p>
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