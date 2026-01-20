// ChatGPT-like AI Chatbot functionality
class ChatbotApp {
    constructor() {
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        this.currentChatId = null;
        this.chats = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        this.isTyping = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadChatHistory();
        this.updateChatHistorySidebar();
    }

    setupEventListeners() {
        // Send message
        document.getElementById('sendButton').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        document.getElementById('messageInput').addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
            this.updateSendButton();
            this.updateCharCount();
        });

        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => this.startNewChat());

        // Quick prompts
        document.querySelectorAll('.quick-prompt, .welcome-prompt').forEach(button => {
            button.addEventListener('click', (e) => {
                const prompt = e.target.closest('button').getAttribute('data-prompt');
                this.usePrompt(prompt);
            });
        });

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
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userInfo.classList.remove('hidden');
            userName.textContent = this.currentUser.profile.name;
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userInfo.classList.add('hidden');
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

    startNewChat() {
        this.currentChatId = null;
        this.showWelcomeScreen();
        this.clearInput();
        this.updateChatHistorySidebar();
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('chatMessages').classList.add('hidden');
    }

    hidewelcomeScreen() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('chatMessages').classList.remove('hidden');
    }

    usePrompt(prompt) {
        document.getElementById('messageInput').value = prompt;
        this.updateSendButton();
        this.sendMessage();
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    updateSendButton() {
        const input = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = !input.value.trim();
    }

    updateCharCount() {
        const input = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        const count = input.value.length;
        charCount.textContent = `${count}/2000`;
        
        if (count > 2000) {
            charCount.classList.add('text-red-500');
            input.value = input.value.substring(0, 2000);
        } else {
            charCount.classList.remove('text-red-500');
        }
    }

    clearInput() {
        const input = document.getElementById('messageInput');
        input.value = '';
        input.style.height = 'auto';
        this.updateSendButton();
        this.updateCharCount();
    }

    loadChatHistory() {
        if (this.currentChatId) {
            const chat = this.chats.find(c => c.id === this.currentChatId);
            if (chat) {
                this.displayChatMessages(chat.messages);
            }
        }
    }

    displayChatMessages(messages) {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
        
        messages.forEach(message => {
            this.displayMessage(message.text, message.isUser, false);
        });
        
        this.scrollToBottom();
    }

    updateChatHistorySidebar() {
        const chatHistoryContainer = document.getElementById('chatHistory');
        
        if (this.chats.length === 0) {
            chatHistoryContainer.innerHTML = '<p class="text-sm text-gray-500 px-2">No previous chats</p>';
            return;
        }

        const historyHTML = this.chats.slice(-10).reverse().map(chat => {
            const isActive = chat.id === this.currentChatId;
            const title = chat.title || 'New Chat';
            const time = new Date(chat.lastMessage).toLocaleDateString();
            
            return `
                <div class="chat-history-item ${isActive ? 'active' : ''}" onclick="chatbotApp.loadChat('${chat.id}')">
                    <div class="font-medium text-sm truncate">${title}</div>
                    <div class="text-xs text-gray-500">${time}</div>
                </div>
            `;
        }).join('');
        
        chatHistoryContainer.innerHTML = historyHTML;
    }

    loadChat(chatId) {
        this.currentChatId = chatId;
        const chat = this.chats.find(c => c.id === chatId);
        
        if (chat) {
            this.hidewelcomeScreen();
            this.displayChatMessages(chat.messages);
            this.updateChatHistorySidebar();
        }
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;

        // Clear input and hide welcome screen
        this.clearInput();
        this.hidewelcomeScreen();

        // Create or get current chat
        if (!this.currentChatId) {
            this.currentChatId = Date.now().toString();
            const newChat = {
                id: this.currentChatId,
                title: this.generateChatTitle(message),
                messages: [],
                created: new Date().toISOString(),
                lastMessage: new Date().toISOString()
            };
            this.chats.push(newChat);
        }

        // Display user message
        this.displayMessage(message, true);
        
        // Add to current chat
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        currentChat.messages.push({ text: message, isUser: true, timestamp: Date.now() });
        currentChat.lastMessage = new Date().toISOString();

        // Show typing indicator
        this.showTypingIndicator();

        // Generate AI response
        const response = await this.generateAIResponse(message);
        
        // Hide typing indicator and show response
        this.hideTypingIndicator();
        this.displayMessage(response, false);
        
        // Add response to current chat
        currentChat.messages.push({ text: response, isUser: false, timestamp: Date.now() });
        
        // Save and update UI
        this.saveChatSessions();
        this.updateChatHistorySidebar();
    }

    generateChatTitle(firstMessage) {
        // Generate a short title from the first message
        const words = firstMessage.split(' ').slice(0, 4);
        return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
    }

    displayMessage(text, isUser, animate = true) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-4 mb-6';
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (isUser) {
            messageDiv.innerHTML = `
                <div class="flex-1"></div>
                <div class="flex flex-col items-end max-w-3xl">
                    <div class="message-bubble user-message text-white px-4 py-3 rounded-2xl">
                        <div class="whitespace-pre-wrap">${this.escapeHtml(text)}</div>
                    </div>
                    <div class="message-time mt-1">${timestamp}</div>
                </div>
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-white text-sm"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="flex flex-col max-w-3xl">
                    <div class="message-bubble ai-message px-4 py-3 rounded-2xl">
                        <div class="whitespace-pre-wrap text-gray-800">${this.formatAIResponse(text)}</div>
                    </div>
                    <div class="message-time mt-1">${timestamp}</div>
                </div>
                <div class="flex-1"></div>
            `;
        }

        if (animate) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(20px)';
        }

        messagesContainer.appendChild(messageDiv);

        if (animate) {
            setTimeout(() => {
                messageDiv.style.transition = 'all 0.4s ease-out';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 100);
        }

        this.scrollToBottom();
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex gap-4 mb-6';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="flex flex-col max-w-3xl">
                <div class="ai-message px-4 py-3 rounded-2xl">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full typing-animation"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full typing-animation" style="animation-delay: 0.2s"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full typing-animation" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            </div>
            <div class="flex-1"></div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    async generateAIResponse(message) {
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

        const lowerMessage = message.toLowerCase();
        
        // Study materials related
        if (lowerMessage.includes('study material') || lowerMessage.includes('learning') || lowerMessage.includes('course')) {
            return this.getStudyMaterialResponse(lowerMessage);
        }
        
        // Scholarship related
        if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('financial aid')) {
            return this.getScholarshipResponse(lowerMessage);
        }
        
        // Essay writing
        if (lowerMessage.includes('essay') || lowerMessage.includes('writing') || lowerMessage.includes('application')) {
            return this.getEssayResponse(lowerMessage);
        }
        
        // Study tips
        if (lowerMessage.includes('study tip') || lowerMessage.includes('study habit') || lowerMessage.includes('how to study')) {
            return this.getStudyTipsResponse();
        }
        
        // Specific subjects
        if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
            return this.getMLResponse();
        }
        
        if (lowerMessage.includes('tensorflow') || lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
            return this.getAIResponse();
        }
        
        if (lowerMessage.includes('computer science') || lowerMessage.includes('programming') || lowerMessage.includes('coding')) {
            return this.getCSResponse();
        }
        
        // Greetings
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return this.getGreetingResponse();
        }
        
        // Default response
        return this.getDefaultResponse();
    }

    getStudyMaterialResponse(message) {
        const responses = [
            "📚 I can help you find study materials! Our platform has comprehensive resources on AI, Machine Learning, Computer Science, and more. You can browse materials by subject, difficulty level, or search for specific topics.\n\nWould you like me to recommend materials for a particular subject?",
            "🎯 Looking for study materials? I recommend checking our Study Materials page where you can find resources on TensorFlow, BERT, Machine Learning basics, and many other topics. You can filter by difficulty level and content type.\n\nWhat subject are you interested in?",
            "📖 Great question! Our platform offers various study materials including research papers, tutorials, and guides. Popular topics include:\n\n• Artificial Intelligence\n• Deep Learning\n• Data Science\n• Computer Vision\n• Natural Language Processing\n\nYou can also add your own materials to share with the community!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getScholarshipResponse(message) {
        const responses = [
            "🎓 I'd be happy to help with scholarships! We have comprehensive scholarships available, including:\n\n• Google AI Research ($50,000)\n• Microsoft Diversity in Tech ($25,000)\n• NSF Graduate Fellowship ($37,000)\n• Gates Millennium Scholars (Full Tuition)\n\nYou can filter by field of study, academic level, and amount. What field are you studying?",
            "💰 Looking for funding opportunities? Our scholarship database includes options for various fields and academic levels. Some highlights:\n\n• Thiel Fellowship ($100,000)\n• Amazon Future Engineer ($40,000)\n• Adobe Research Women-in-Technology ($10,000)\n\nI can help you find scholarships that match your profile!",
            "🎯 Scholarship applications can be competitive, but I can help! We have detailed information about:\n\n• Eligibility requirements\n• Application processes\n• Deadlines and timelines\n• Essay writing tips\n\nWould you like tips on writing scholarship essays or finding scholarships for your specific field?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getEssayResponse(message) {
        const responses = [
            "✍️ **Essay Writing Tips:**\n\n**Structure & Planning:**\n• Start with a strong hook to grab attention\n• Create a clear outline before writing\n• Tell your story - be personal and authentic\n• Address the prompt directly\n\n**Writing Process:**\n• Show, don't tell - use specific examples\n• Use active voice for engagement\n• Include evidence to support claims\n• Proofread carefully for grammar and spelling\n\nWould you like more specific advice for scholarship essays or academic writing?",
            "📝 **Key Essay Writing Strategies:**\n\n**Research & Preparation:**\n• Understand your audience thoroughly\n• Read the prompt multiple times\n• Brainstorm ideas without editing\n\n**Writing & Revision:**\n• Write a compelling introduction\n• Develop one main idea per paragraph\n• Revise multiple times - first draft is never final\n• Conclude strongly to leave lasting impression\n\nWhat type of essay are you working on?",
            "🎯 **Essay Success Framework:**\n\n**Before Writing:**\n1. Analyze the prompt requirements\n2. Research the topic thoroughly\n3. Create a detailed outline\n\n**During Writing:**\n4. Write engaging introduction\n5. Support arguments with evidence\n6. Maintain clear paragraph structure\n\n**After Writing:**\n7. Revise for clarity and flow\n8. Edit for grammar and style\n9. Get feedback from others\n\nNeed help with a specific type of essay?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getStudyTipsResponse() {
        const responses = [
            "💡 **Effective Study Habits:**\n\n**Time Management:**\n🕐 Use the Pomodoro Technique (25 min study, 5 min break)\n📅 Create a consistent study schedule\n⏰ Study during your peak energy hours\n\n**Environment & Focus:**\n📍 Find a quiet, dedicated study space\n📱 Minimize distractions (phone, social media)\n🎧 Use background music or white noise if helpful\n\n**Active Learning Techniques:**\n📝 Summarize material in your own words\n👥 Teach concepts to others\n🃏 Create flashcards for key terms\n🎯 Set specific, achievable daily targets\n😴 Get adequate sleep for memory consolidation\n\nWhat subject are you studying?",
            "📚 **Proven Study Strategies:**\n\n**Memory Techniques:**\n• **Spaced repetition** - review material at increasing intervals\n• **Practice testing** - quiz yourself regularly\n• **Elaboration** - explain concepts in your own words\n• **Dual coding** - combine visual and verbal learning\n\n**Study Methods:**\n• **Interleaving** - mix different topics in study sessions\n• **Active recall** - test yourself without looking at notes\n• **Feynman Technique** - explain complex topics simply\n• **Mind mapping** - create visual connections between ideas\n\nWhich technique would you like to know more about?",
            "🎯 **Study Success Framework:**\n\n**Before Studying:**\n1. **Preview material** - skim readings beforehand\n2. **Set clear goals** - what will you accomplish?\n3. **Gather resources** - books, notes, practice problems\n\n**During Study Sessions:**\n4. **Take active notes** - don't just copy, engage\n5. **Use multiple resources** - vary your learning sources\n6. **Take regular breaks** - maintain focus and energy\n\n**After Studying:**\n7. **Review and summarize** - consolidate key points\n8. **Form study groups** - teach and learn from peers\n9. **Regular review** - don't cram, study consistently\n\nNeed help with a specific subject or study challenge?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getMLResponse() {
        return "🤖 **Machine Learning - Your Complete Guide:**\n\n**Study Resources Available:**\n📚 Comprehensive ML resources including basics, algorithms, and practical implementations\n📖 TensorFlow guides and tutorials\n🔬 Research papers and case studies\n💻 Hands-on coding examples\n\n**Scholarship Opportunities:**\n🎓 Google AI Research Scholarship ($50,000)\n🎓 Microsoft AI for Good Scholarship ($25,000)\n🎓 NVIDIA Graduate Fellowship ($50,000)\n\n**Recommended Learning Path:**\n1. **Supervised Learning** - Classification and regression\n2. **Unsupervised Learning** - Clustering and dimensionality reduction\n3. **Reinforcement Learning** - Decision making and optimization\n4. **Deep Learning** - Neural networks and advanced architectures\n\n**Essential Tools:**\n🛠️ **Python** - Primary programming language\n🛠️ **scikit-learn** - Traditional ML algorithms\n🛠️ **TensorFlow/PyTorch** - Deep learning frameworks\n🛠️ **Jupyter Notebooks** - Interactive development\n\nWhat specific ML topic interests you most?";
    }

    getAIResponse() {
        return "🧠 **Artificial Intelligence - Comprehensive Overview:**\n\n**Study Materials:**\n📖 TensorFlow guides and neural network tutorials\n📚 AI research papers and cutting-edge developments\n🎯 Computer Vision and NLP resources\n💡 Ethics in AI and responsible development\n\n**Career Opportunities:**\n🚀 **Research Scientist** - Advancing AI knowledge\n💼 **ML Engineer** - Building AI systems\n🎨 **AI Product Manager** - Bridging tech and business\n🔍 **Data Scientist** - Extracting insights from data\n\n**Scholarship Support:**\n🎓 Multiple AI-focused scholarships available\n💰 Funding for underrepresented groups in tech\n🌟 Research assistantship opportunities\n\n**Key Specializations:**\n• **Machine Learning** - Algorithms and statistical models\n• **Deep Learning** - Neural networks and architectures\n• **Natural Language Processing** - Understanding human language\n• **Computer Vision** - Image and video analysis\n• **Robotics** - Intelligent physical systems\n\nAre you interested in a particular AI specialization?";
    }

    getCSResponse() {
        return "💻 **Computer Science - Your Gateway to Tech:**\n\n**Study Materials Available:**\n📚 Programming tutorials (Python, Java, C++, JavaScript)\n🔧 Data structures and algorithms guides\n🏗️ Software engineering best practices\n🔐 Cybersecurity fundamentals\n🌐 Web development resources\n\n**Scholarship Opportunities:**\n🎓 **Google Computer Science Scholarships** - Various amounts\n🎓 **Microsoft Diversity in Tech** ($25,000)\n🎓 **Adobe Research Women-in-Technology** ($10,000)\n🎓 **Palantir Women in Technology** ($7,000)\n\n**Core Skills to Master:**\n• **Programming Languages** - Start with Python or Java\n• **Data Structures** - Arrays, trees, graphs, hash tables\n• **Algorithms** - Sorting, searching, dynamic programming\n• **System Design** - Scalable architecture principles\n• **Database Management** - SQL and NoSQL systems\n\n**Career Paths:**\n🚀 **Software Engineer** - Building applications and systems\n🔍 **Data Scientist** - Analyzing data for insights\n🛡️ **Cybersecurity Specialist** - Protecting digital assets\n🎮 **Game Developer** - Creating interactive experiences\n☁️ **Cloud Architect** - Designing scalable infrastructure\n\nWhat area of computer science interests you most?";
    }

    getGreetingResponse() {
        const greetings = [
            "👋 **Hello! Welcome to NovaLearn AI**\n\nI'm your AI learning assistant, here to help with:\n\n📚 **Study Materials** - Find resources for your courses\n🎓 **Scholarships** - Discover funding opportunities\n✍️ **Essay Writing** - Get tips and guidance\n💡 **Study Strategies** - Learn effective techniques\n\nWhat can I help you with today?",
            "Hi there! 🎓 **Welcome to your AI learning companion**\n\nI'm ready to assist you with:\n\n🔍 **Academic Research** - Find the right resources\n💰 **Financial Aid** - Scholarship opportunities\n📝 **Writing Support** - Essays and applications\n🧠 **Learning Optimization** - Study tips and methods\n\nHow can I support your educational journey?",
            "Hey! 😊 **Great to see you here**\n\nI'm your dedicated AI assistant for:\n\n🎯 **Personalized Learning** - Tailored to your needs\n🌟 **Academic Success** - Study strategies that work\n💼 **Career Preparation** - Skills and opportunities\n🤝 **Community Support** - Connect with resources\n\nWhat educational challenge can I help you tackle today?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    getDefaultResponse() {
        const responses = [
            "🤔 **That's an interesting question!**\n\nWhile I specialize in educational topics, I'd be happy to help you with:\n\n📚 **Study Materials** - Find resources for any subject\n🎓 **Scholarship Information** - Funding opportunities\n✍️ **Essay Writing Tips** - Academic and application essays\n💡 **Learning Strategies** - Effective study techniques\n\nCould you tell me more about what you're looking for?",
            "💭 **I'm focused on helping with academic and educational topics.**\n\nI can assist with:\n\n🔍 **Research Guidance** - Finding the right materials\n📝 **Writing Support** - Essays, applications, and more\n🎯 **Study Planning** - Effective learning strategies\n💰 **Financial Aid** - Scholarship and funding options\n\nHow can I help with your educational goals?",
            "🎯 **I'm here to support your learning journey!**\n\nMy expertise includes:\n\n📖 **Academic Resources** - Study materials and guides\n🏆 **Achievement Support** - Scholarships and opportunities\n🧠 **Learning Optimization** - Study techniques and tips\n✨ **Skill Development** - Academic and professional growth\n\nWhat educational topic would you like to explore?",
            "📚 **I specialize in educational assistance!**\n\nWhether you need:\n\n🎓 **Study Resources** - Materials for any subject\n💡 **Learning Guidance** - Effective study methods\n✍️ **Writing Help** - Essays and academic papers\n🌟 **Opportunity Discovery** - Scholarships and programs\n\nI'm here to help! What academic challenge can I tackle with you today?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    formatAIResponse(text) {
        // Convert markdown-like formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    saveChatSessions() {
        // Keep only last 20 chat sessions to prevent storage overflow
        if (this.chats.length > 20) {
            this.chats = this.chats.slice(-20);
        }
        localStorage.setItem('chatSessions', JSON.stringify(this.chats));
    }
}

// Initialize the chatbot when the page loads
let chatbotApp;
document.addEventListener('DOMContentLoaded', () => {
    chatbotApp = new ChatbotApp();
});