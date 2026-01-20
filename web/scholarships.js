// Scholarship page functionality
class ScholarshipApp {
    constructor() {
        this.scholarships = JSON.parse(localStorage.getItem('scholarshipData') || '[]');
        this.filteredScholarships = [...this.scholarships];
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.displayedCount = 8;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.displayScholarships();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchScholarships').addEventListener('click', () => this.searchScholarships());
        document.getElementById('scholarshipSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchScholarships();
        });

        // Filter functionality
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Sort functionality
        document.getElementById('sortBy').addEventListener('change', () => this.sortScholarships());

        // Load more
        document.getElementById('loadMore').addEventListener('click', () => this.loadMore());

        // Modal functionality
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('scholarshipModal').addEventListener('click', (e) => {
            if (e.target.id === 'scholarshipModal') this.closeModal();
        });

        // Modal buttons
        document.getElementById('applyNowBtn').addEventListener('click', () => this.showApplicationForm());
        document.getElementById('saveScholarshipBtn').addEventListener('click', () => this.saveScholarship());
        document.getElementById('shareScholarshipBtn').addEventListener('click', () => this.shareScholarship());

        // Application form
        document.getElementById('closeApplicationModal').addEventListener('click', () => this.closeApplicationModal());
        document.getElementById('cancelApplication').addEventListener('click', () => this.closeApplicationModal());
        document.getElementById('scholarshipApplicationForm').addEventListener('submit', (e) => this.handleApplicationSubmit(e));
        document.getElementById('applicationModal').addEventListener('click', (e) => {
            if (e.target.id === 'applicationModal') this.closeApplicationModal();
        });

        // Essay character counters
        document.getElementById('appEssay1').addEventListener('input', () => this.updateCharCount('appEssay1', 'essay1Count'));
        document.getElementById('appEssay2').addEventListener('input', () => this.updateCharCount('appEssay2', 'essay2Count'));

        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.redirectToLogin());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
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

    searchScholarships() {
        const query = document.getElementById('scholarshipSearch').value.toLowerCase().trim();
        
        if (!query) {
            this.filteredScholarships = [...this.scholarships];
        } else {
            this.filteredScholarships = this.scholarships.filter(scholarship => 
                scholarship.title.toLowerCase().includes(query) ||
                scholarship.provider.toLowerCase().includes(query) ||
                scholarship.field.toLowerCase().includes(query) ||
                scholarship.description.toLowerCase().includes(query) ||
                scholarship.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        this.displayedCount = 8;
        this.displayScholarships();
        this.updateStatistics();
    }

    applyFilters() {
        const fieldFilter = document.getElementById('fieldFilter').value;
        const levelFilter = document.getElementById('levelFilter').value;
        const amountFilter = document.getElementById('amountFilter').value;
        const deadlineFilter = document.getElementById('deadlineFilter').value;

        this.filteredScholarships = this.scholarships.filter(scholarship => {
            // Field filter
            if (fieldFilter && scholarship.field !== fieldFilter) return false;
            
            // Level filter
            if (levelFilter && scholarship.level !== levelFilter) return false;
            
            // Amount filter
            if (amountFilter) {
                const amount = scholarship.amountValue;
                
                if (amountFilter === '0-5000' && amount > 5000) return false;
                if (amountFilter === '5000-15000' && (amount < 5000 || amount > 15000)) return false;
                if (amountFilter === '15000-50000' && (amount < 15000 || amount > 50000)) return false;
                if (amountFilter === '50000+' && amount < 50000) return false;
            }
            
            // Deadline filter
            if (deadlineFilter) {
                const deadlineDate = new Date(scholarship.deadline);
                const now = new Date();
                const daysDiff = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
                
                const filterDays = parseInt(deadlineFilter);
                if (daysDiff > filterDays) return false;
            }
            
            return true;
        });

        this.displayedCount = 8;
        this.displayScholarships();
        this.updateStatistics();
    }

    clearFilters() {
        document.getElementById('fieldFilter').value = '';
        document.getElementById('levelFilter').value = '';
        document.getElementById('amountFilter').value = '';
        document.getElementById('deadlineFilter').value = '';
        document.getElementById('scholarshipSearch').value = '';
        
        this.filteredScholarships = [...this.scholarships];
        this.displayedCount = 8;
        this.displayScholarships();
        this.updateStatistics();
    }

    sortScholarships() {
        const sortBy = document.getElementById('sortBy').value;
        
        this.filteredScholarships.sort((a, b) => {
            switch (sortBy) {
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                case 'amount':
                    return b.amountValue - a.amountValue;
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        this.displayScholarships();
    }

    displayScholarships() {
        const container = document.getElementById('scholarshipCards');
        const scholarshipsToShow = this.filteredScholarships.slice(0, this.displayedCount);
        
        container.innerHTML = scholarshipsToShow.map(scholarship => this.createScholarshipCard(scholarship)).join('');
        
        // Update result count
        document.getElementById('resultCount').textContent = 
            `Showing ${scholarshipsToShow.length} of ${this.filteredScholarships.length} scholarships`;
        
        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMore');
        if (this.displayedCount >= this.filteredScholarships.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    createScholarshipCard(scholarship) {
        const deadlineDate = new Date(scholarship.deadline);
        const now = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        
        let statusBadge = '';
        if (scholarship.status === 'closing_soon' || daysUntilDeadline <= 30) {
            statusBadge = '<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">Closing Soon</span>';
        } else if (scholarship.featured) {
            statusBadge = '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-semibold">Featured</span>';
        }

        return `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-900 mb-2">${scholarship.title}</h3>
                            <p class="text-blue-600 font-semibold">${scholarship.provider}</p>
                        </div>
                        ${statusBadge}
                    </div>
                    
                    <p class="text-gray-600 mb-4 line-clamp-3">${scholarship.description}</p>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${scholarship.field}</span>
                        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">${scholarship.level}</span>
                        ${scholarship.renewable ? '<span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Renewable</span>' : ''}
                    </div>
                    
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-2xl font-bold text-green-600">${scholarship.amount}</div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500">Deadline</div>
                            <div class="font-semibold ${daysUntilDeadline <= 30 ? 'text-red-600' : 'text-gray-900'}">
                                ${this.formatDate(scholarship.deadline)}
                            </div>
                            <div class="text-sm text-gray-500">${daysUntilDeadline} days left</div>
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button 
                            onclick="scholarshipApp.showScholarshipDetails('${scholarship.id}')"
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition font-semibold"
                        >
                            <i class="fas fa-info-circle mr-2"></i>View Details
                        </button>
                        <button 
                            onclick="scholarshipApp.quickApply('${scholarship.id}')"
                            class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition font-semibold"
                        >
                            <i class="fas fa-external-link-alt mr-2"></i>Apply
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showScholarshipDetails(scholarshipId) {
        const scholarship = this.scholarships.find(s => s.id === scholarshipId);
        if (!scholarship) return;

        // Populate modal
        document.getElementById('modalTitle').textContent = scholarship.title;
        document.getElementById('modalProvider').textContent = scholarship.provider;
        document.getElementById('modalDescription').textContent = scholarship.description;
        document.getElementById('modalAmount').textContent = scholarship.amount;
        document.getElementById('modalDeadline').textContent = this.formatDate(scholarship.deadline);
        document.getElementById('modalLevel').textContent = scholarship.level.charAt(0).toUpperCase() + scholarship.level.slice(1);
        document.getElementById('modalField').textContent = scholarship.field;
        document.getElementById('modalRenewable').textContent = scholarship.renewable ? 'Yes' : 'No';

        // Populate eligibility
        const eligibilityList = document.getElementById('modalEligibility');
        eligibilityList.innerHTML = scholarship.eligibility.map(item => `<li>${item}</li>`).join('');

        // Populate requirements
        const requirementsList = document.getElementById('modalRequirements');
        requirementsList.innerHTML = scholarship.requirements.map(item => `<li>${item}</li>`).join('');

        // Populate application process
        document.getElementById('modalApplication').innerHTML = `<p>${scholarship.applicationProcess}</p>`;

        // Set up apply button
        document.getElementById('applyNowBtn').onclick = () => this.showApplicationForm();
        this.currentScholarship = scholarship;

        // Show modal
        document.getElementById('scholarshipModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('scholarshipModal').classList.add('hidden');
    }

    quickApply(scholarshipId) {
        const scholarship = this.scholarships.find(s => s.id === scholarshipId);
        this.applyToScholarship(scholarship);
    }

    applyToScholarship(scholarship) {
        if (scholarship && scholarship.applicationUrl) {
            window.open(scholarship.applicationUrl, '_blank');
        } else {
            alert('Application link not available. Please check the scholarship provider\'s website.');
        }
    }

    showApplicationForm() {
        if (!this.currentUser) {
            alert('Please login first to apply for scholarships');
            return;
        }

        if (this.currentScholarship) {
            // Pre-fill form with user data if available
            if (this.currentUser.profile) {
                document.getElementById('appFullName').value = this.currentUser.profile.name || '';
                document.getElementById('appEmail').value = this.currentUser.email || '';
                document.getElementById('appInstitution').value = this.currentUser.profile.college || '';
                document.getElementById('appFieldOfStudy').value = this.currentUser.profile.major || '';
                document.getElementById('appAcademicLevel').value = this.currentUser.profile.academic_level || '';
            }

            // Set scholarship title
            document.getElementById('applicationScholarshipTitle').textContent = this.currentScholarship.title;
            
            // Show modal
            document.getElementById('applicationModal').classList.remove('hidden');
        }
    }

    closeApplicationModal() {
        document.getElementById('applicationModal').classList.add('hidden');
        document.getElementById('scholarshipApplicationForm').reset();
        document.getElementById('applicationMessage').innerHTML = '';
        document.getElementById('essay1Count').textContent = '0';
        document.getElementById('essay2Count').textContent = '0';
    }

    updateCharCount(textareaId, counterId) {
        const textarea = document.getElementById(textareaId);
        const counter = document.getElementById(counterId);
        counter.textContent = textarea.value.length;
    }

    async handleApplicationSubmit(e) {
        e.preventDefault();
        
        const messageDiv = document.getElementById('applicationMessage');
        messageDiv.innerHTML = '<p class="text-blue-600">Submitting application...</p>';

        try {
            // Collect form data
            const formData = {
                scholarshipId: this.currentScholarship.id,
                scholarshipTitle: this.currentScholarship.title,
                personalInfo: {
                    fullName: document.getElementById('appFullName').value,
                    email: document.getElementById('appEmail').value,
                    phone: document.getElementById('appPhone').value,
                    dateOfBirth: document.getElementById('appDOB').value
                },
                academicInfo: {
                    institution: document.getElementById('appInstitution').value,
                    fieldOfStudy: document.getElementById('appFieldOfStudy').value,
                    academicLevel: document.getElementById('appAcademicLevel').value,
                    gpa: parseFloat(document.getElementById('appGPA').value),
                    expectedGraduation: document.getElementById('appGraduation').value
                },
                essays: {
                    whyDeserve: document.getElementById('appEssay1').value,
                    careerGoals: document.getElementById('appEssay2').value
                },
                additionalInfo: {
                    activities: document.getElementById('appActivities').value,
                    financialNeed: document.getElementById('appFinancialNeed').value
                },
                documents: {
                    transcript: document.getElementById('appTranscript').files[0]?.name || '',
                    resume: document.getElementById('appResume').files[0]?.name || '',
                    recommendations: Array.from(document.getElementById('appRecommendations').files).map(f => f.name)
                },
                submittedAt: new Date().toISOString(),
                userId: this.currentUser._id
            };

            // Simulate application submission (in real app, this would be sent to backend)
            await this.simulateApplicationSubmission(formData);

            messageDiv.innerHTML = `
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle mr-2"></i>
                        <div>
                            <strong>Application Submitted Successfully!</strong>
                            <p class="text-sm mt-1">Your application for "${this.currentScholarship.title}" has been received. You will receive a confirmation email shortly.</p>
                        </div>
                    </div>
                </div>
            `;

            // Store application locally
            this.saveApplicationLocally(formData);

            // Close modal after 3 seconds
            setTimeout(() => {
                this.closeApplicationModal();
            }, 3000);

        } catch (error) {
            messageDiv.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <div>
                            <strong>Submission Failed</strong>
                            <p class="text-sm mt-1">There was an error submitting your application. Please try again.</p>
                        </div>
                    </div>
                </div>
            `;
            console.error('Application submission error:', error);
        }
    }

    async simulateApplicationSubmission(formData) {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Application submitted:', formData);
                resolve();
            }, 2000);
        });
    }

    saveApplicationLocally(formData) {
        // Save application to localStorage for demo purposes
        let applications = JSON.parse(localStorage.getItem('scholarshipApplications') || '[]');
        applications.push({
            ...formData,
            id: Date.now().toString(),
            status: 'submitted'
        });
        localStorage.setItem('scholarshipApplications', JSON.stringify(applications));
    }

    saveScholarship() {
        if (!this.currentUser) {
            alert('Please login to save scholarships');
            return;
        }
        
        // In a real app, this would save to the backend
        alert('Scholarship saved to your favorites!');
    }

    shareScholarship() {
        if (navigator.share) {
            navigator.share({
                title: document.getElementById('modalTitle').textContent,
                text: 'Check out this scholarship opportunity!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Scholarship link copied to clipboard!');
        }
    }

    loadMore() {
        this.displayedCount += 8;
        this.displayScholarships();
    }

    updateStatistics() {
        const totalScholarships = this.scholarships.length;
        const openScholarships = this.scholarships.filter(s => s.status === 'open').length;
        
        document.getElementById('totalScholarships').textContent = totalScholarships;
        document.getElementById('openScholarships').textContent = openScholarships;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Initialize the app when the page loads
let scholarshipApp;
document.addEventListener('DOMContentLoaded', () => {
    scholarshipApp = new ScholarshipApp();
});