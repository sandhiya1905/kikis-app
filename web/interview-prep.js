// Interview Preparation JavaScript
class InterviewPrep {
    constructor() {
        this.currentSession = null;
        this.timer = null;
        this.startTime = null;
        this.messages = [];
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.responses = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInterviewHistory();
    }

    bindEvents() {
        // Interview type selection
        document.querySelectorAll('.interview-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.showSetupModal(type);
            });
        });

        // Setup form
        document.getElementById('interviewSetupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startInterview();
        });

        // Cancel setup
        document.getElementById('cancelSetup').addEventListener('click', () => {
            this.hideSetupModal();
        });

        // Message sending
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // End interview
        document.getElementById('endInterview').addEventListener('click', () => {
            this.endInterview();
        });

        // Results actions
        document.getElementById('retryInterview').addEventListener('click', () => {
            this.retryInterview();
        });

        document.getElementById('newInterview').addEventListener('click', () => {
            this.newInterview();
        });
    }

    showSetupModal(type) {
        const modal = document.getElementById('interviewSetupModal');
        const typeInput = document.getElementById('interviewType');
        
        const typeNames = {
            'technical': 'Technical Interview',
            'behavioral': 'Behavioral Interview',
            'case-study': 'Case Study Interview'
        };
        
        typeInput.value = typeNames[type] || type;
        modal.classList.remove('hidden');
    }

    hideSetupModal() {
        document.getElementById('interviewSetupModal').classList.add('hidden');
    }

    async startInterview() {
        const formData = new FormData(document.getElementById('interviewSetupForm'));
        const interviewType = document.getElementById('interviewType').value;
        const field = document.getElementById('fieldSelect').value;
        const experience = document.getElementById('experienceSelect').value;
        const company = document.getElementById('companySelect').value;

        if (!field || !experience) {
            alert('Please fill in all required fields');
            return;
        }

        this.currentSession = {
            type: interviewType,
            field: field,
            experience: experience,
            company: company,
            startTime: new Date(),
            questions: [],
            responses: []
        };

        this.hideSetupModal();
        this.showInterviewSession();
        this.startTimer();
        
        // Generate questions based on interview type
        await this.generateQuestions();
        this.askNextQuestion();
    }

    showInterviewSession() {
        document.getElementById('interviewSession').classList.remove('hidden');
        document.getElementById('recentInterviews').classList.add('hidden');
        
        // Clear previous messages
        document.getElementById('chatMessages').innerHTML = '';
        this.messages = [];
        this.currentQuestionIndex = 0;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('interviewTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    async generateQuestions() {
        const { type, field, experience, company } = this.currentSession;
        
        // Generate questions based on interview type and parameters
        const questionSets = {
            'Technical Interview': this.getTechnicalQuestions(field, experience),
            'Behavioral Interview': this.getBehavioralQuestions(experience, company),
            'Case Study Interview': this.getCaseStudyQuestions(field, company)
        };

        this.questions = questionSets[type] || [];
    }

    getTechnicalQuestions(field, experience) {
        const questions = {
            'computer-science': [
                "Can you explain the difference between a stack and a queue? When would you use each?",
                "How would you implement a binary search algorithm? What's its time complexity?",
                "Explain the concept of Big O notation and give examples of different complexities.",
                "What are the differences between SQL and NoSQL databases?",
                "Can you walk me through how you would design a simple web application?"
            ],
            'data-science': [
                "Explain the difference between supervised and unsupervised learning.",
                "How would you handle missing data in a dataset?",
                "What is overfitting and how can you prevent it?",
                "Explain the bias-variance tradeoff in machine learning.",
                "How would you evaluate the performance of a classification model?"
            ],
            'artificial-intelligence': [
                "What is the difference between artificial intelligence, machine learning, and deep learning?",
                "Explain how a neural network learns through backpropagation.",
                "What are the main types of machine learning algorithms?",
                "How would you approach a natural language processing problem?",
                "What are some ethical considerations in AI development?"
            ]
        };

        return questions[field] || questions['computer-science'];
    }

    getBehavioralQuestions(experience, company) {
        return [
            "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
            "Describe a situation where you had to learn something new quickly. What was your approach?",
            "Give me an example of a time when you failed at something. What did you learn from it?",
            "Tell me about a project you're particularly proud of. What made it successful?",
            "How do you handle stress and pressure in your work?",
            "Describe a time when you had to make a difficult decision with limited information.",
            "Tell me about a time when you had to give constructive feedback to someone."
        ];
    }

    getCaseStudyQuestions(field, company) {
        return [
            "A company's website traffic has dropped by 30% in the last month. How would you investigate and address this issue?",
            "You're tasked with improving user engagement on a mobile app. What metrics would you track and what strategies would you implement?",
            "A startup wants to enter a competitive market. How would you help them develop a go-to-market strategy?",
            "Design a system to handle 1 million concurrent users for a social media platform.",
            "How would you prioritize features for a new product with limited development resources?"
        ];
    }

    async askNextQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endInterview();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.hideTypingIndicator();
        this.addMessage('ai', question);
        
        // Store question
        this.currentSession.questions.push({
            question: question,
            timestamp: new Date(),
            index: this.currentQuestionIndex
        });
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        
        // Store response
        this.currentSession.responses.push({
            question: this.questions[this.currentQuestionIndex],
            response: message,
            timestamp: new Date(),
            index: this.currentQuestionIndex
        });
        
        this.currentQuestionIndex++;
        
        // Ask next question after a short delay
        setTimeout(() => {
            this.askNextQuestion();
        }, 1000);
    }

    addMessage(sender, text) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const bubbleClass = sender === 'user' ? 'user-message' : 'ai-message';
        const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        
        messageDiv.innerHTML = `
            <div class="message-bubble ${bubbleClass} text-white p-3 rounded-lg">
                <div class="flex items-start space-x-2">
                    <i class="${icon} mt-1"></i>
                    <div class="flex-1">
                        <div class="text-sm opacity-75 mb-1">${sender === 'user' ? 'You' : 'AI Interviewer'}</div>
                        <div>${text}</div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ sender, text, timestamp: new Date() });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex justify-start';
        typingDiv.innerHTML = `
            <div class="bg-gray-200 p-3 rounded-lg">
                <div class="flex items-center space-x-1">
                    <i class="fas fa-robot text-gray-600 mr-2"></i>
                    <div class="typing-indicator"></div>
                    <div class="typing-indicator"></div>
                    <div class="typing-indicator"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    endInterview() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.currentSession.endTime = new Date();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
        
        // Save interview session
        this.saveInterviewSession();
        
        // Show results
        this.showResults();
    }

    showResults() {
        document.getElementById('interviewSession').classList.add('hidden');
        document.getElementById('interviewResults').classList.remove('hidden');
        
        this.generateFeedback();
    }

    generateFeedback() {
        const { responses, duration, type } = this.currentSession;
        const durationMinutes = Math.floor(duration / 60000);
        
        // Calculate basic metrics
        const totalQuestions = responses.length;
        const avgResponseTime = duration / totalQuestions;
        
        // Generate performance metrics
        const metricsHtml = `
            <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span class="font-medium">Questions Answered</span>
                    <span class="text-blue-600 font-bold">${totalQuestions}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span class="font-medium">Interview Duration</span>
                    <span class="text-green-600 font-bold">${durationMinutes} minutes</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span class="font-medium">Avg Response Time</span>
                    <span class="text-purple-600 font-bold">${Math.floor(avgResponseTime / 1000)}s</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span class="font-medium">Interview Type</span>
                    <span class="text-yellow-600 font-bold">${type}</span>
                </div>
            </div>
        `;
        
        // Generate feedback
        const feedbackHtml = `
            <div class="space-y-4">
                <div class="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                    <h4 class="font-semibold text-green-800 mb-2">Strengths</h4>
                    <ul class="text-green-700 space-y-1">
                        <li>• Completed all ${totalQuestions} questions</li>
                        <li>• Maintained good pacing throughout</li>
                        <li>• Showed engagement with detailed responses</li>
                    </ul>
                </div>
                
                <div class="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <h4 class="font-semibold text-blue-800 mb-2">Areas for Improvement</h4>
                    <ul class="text-blue-700 space-y-1">
                        <li>• Practice structuring responses using STAR method</li>
                        <li>• Include more specific examples and metrics</li>
                        <li>• Work on concise yet comprehensive answers</li>
                    </ul>
                </div>
                
                <div class="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                    <h4 class="font-semibold text-purple-800 mb-2">Next Steps</h4>
                    <ul class="text-purple-700 space-y-1">
                        <li>• Practice more ${type.toLowerCase()} questions</li>
                        <li>• Record yourself to improve delivery</li>
                        <li>• Research common questions for your target role</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.getElementById('performanceMetrics').innerHTML = metricsHtml;
        document.getElementById('feedbackSection').innerHTML = feedbackHtml;
    }

    saveInterviewSession() {
        const sessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]');
        sessions.unshift(this.currentSession);
        
        // Keep only last 10 sessions
        if (sessions.length > 10) {
            sessions.splice(10);
        }
        
        localStorage.setItem('interviewSessions', JSON.stringify(sessions));
    }

    loadInterviewHistory() {
        const sessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]');
        const historyContainer = document.getElementById('interviewHistory');
        
        if (sessions.length === 0) {
            historyContainer.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-history text-4xl mb-4"></i>
                    <p>No interview sessions yet. Start your first interview above!</p>
                </div>
            `;
            return;
        }
        
        historyContainer.innerHTML = sessions.map(session => {
            const date = new Date(session.startTime).toLocaleDateString();
            const duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 60000);
            
            return `
                <div class="bg-white p-4 rounded-lg shadow-md">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold text-gray-900">${session.type}</h4>
                        <span class="text-xs text-gray-500">${date}</span>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1">
                        <div><i class="fas fa-briefcase mr-1"></i>${session.field}</div>
                        <div><i class="fas fa-clock mr-1"></i>${duration} minutes</div>
                        <div><i class="fas fa-question-circle mr-1"></i>${session.responses.length} questions</div>
                    </div>
                    <div class="mt-3 flex justify-between items-center">
                        <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            ${session.experience}
                        </span>
                        <button class="text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-eye mr-1"></i>Review
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    retryInterview() {
        // Reset current session and restart with same parameters
        const { type, field, experience, company } = this.currentSession;
        
        document.getElementById('interviewResults').classList.add('hidden');
        document.getElementById('recentInterviews').classList.remove('hidden');
        
        // Restart with same settings
        document.getElementById('interviewType').value = type;
        document.getElementById('fieldSelect').value = field;
        document.getElementById('experienceSelect').value = experience;
        document.getElementById('companySelect').value = company;
        
        this.startInterview();
    }

    newInterview() {
        document.getElementById('interviewResults').classList.add('hidden');
        document.getElementById('recentInterviews').classList.remove('hidden');
        this.loadInterviewHistory();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InterviewPrep();
});