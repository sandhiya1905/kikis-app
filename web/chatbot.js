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
                        <div class="whitespace-pre-wrap text-gray-800 ai-response-content"></div>
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

        // If it's an AI message, start the typing animation
        if (!isUser && animate) {
            this.typeWriterEffect(messageDiv.querySelector('.ai-response-content'), text);
        } else if (!isUser) {
            messageDiv.querySelector('.ai-response-content').innerHTML = this.formatAIResponse(text);
        }

        this.scrollToBottom();
    }

    async typeWriterEffect(element, text) {
        const formattedText = this.formatAIResponse(text);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedText;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        element.innerHTML = '';
        let currentIndex = 0;
        const speed = 30; // milliseconds per character
        
        const typeChar = () => {
            if (currentIndex < plainText.length) {
                const char = plainText[currentIndex];
                element.textContent += char;
                currentIndex++;
                
                // Add some randomness to typing speed
                const delay = speed + Math.random() * 20;
                setTimeout(typeChar, delay);
                
                this.scrollToBottom();
            } else {
                // Replace with formatted HTML after typing is complete
                element.innerHTML = formattedText;
            }
        };
        
        typeChar();
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
        // Simulate AI thinking time with more realistic delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        const lowerMessage = message.toLowerCase();
        const context = this.getConversationContext();
        
        // Enhanced pattern matching with context awareness
        const patterns = [
            // Academic subjects
            { keywords: ['machine learning', 'ml', 'neural network', 'deep learning'], handler: () => this.getMLResponse(message, context) },
            { keywords: ['artificial intelligence', 'ai', 'tensorflow', 'pytorch'], handler: () => this.getAIResponse(message, context) },
            { keywords: ['computer science', 'programming', 'coding', 'software', 'algorithm'], handler: () => this.getCSResponse(message, context) },
            { keywords: ['data science', 'analytics', 'statistics', 'python', 'r programming'], handler: () => this.getDataScienceResponse(message, context) },
            { keywords: ['mathematics', 'math', 'calculus', 'linear algebra', 'statistics'], handler: () => this.getMathResponse(message, context) },
            
            // Academic support
            { keywords: ['study material', 'learning', 'course', 'textbook', 'resource'], handler: () => this.getStudyMaterialResponse(message, context) },
            { keywords: ['scholarship', 'funding', 'financial aid', 'grant', 'fellowship'], handler: () => this.getScholarshipResponse(message, context) },
            { keywords: ['essay', 'writing', 'application', 'personal statement'], handler: () => this.getEssayResponse(message, context) },
            { keywords: ['study tip', 'study habit', 'how to study', 'learning technique'], handler: () => this.getStudyTipsResponse(message, context) },
            
            // Career and academic planning
            { keywords: ['career', 'job', 'internship', 'resume', 'interview'], handler: () => this.getCareerResponse(message, context) },
            { keywords: ['college', 'university', 'admission', 'application'], handler: () => this.getCollegeResponse(message, context) },
            { keywords: ['research', 'thesis', 'dissertation', 'publication'], handler: () => this.getResearchResponse(message, context) },
            
            // Specific help requests
            { keywords: ['help', 'assist', 'support', 'guide'], handler: () => this.getHelpResponse(message, context) },
            { keywords: ['explain', 'what is', 'how does', 'define'], handler: () => this.getExplanationResponse(message, context) },
            
            // Greetings and conversation
            { keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'], handler: () => this.getGreetingResponse(message, context) },
            { keywords: ['thank', 'thanks', 'appreciate'], handler: () => this.getGratitudeResponse(message, context) },
            { keywords: ['bye', 'goodbye', 'see you', 'farewell'], handler: () => this.getFarewellResponse(message, context) }
        ];

        // Find matching pattern
        for (const pattern of patterns) {
            if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
                return await pattern.handler();
            }
        }
        
        // Enhanced default response with context
        return this.getContextualDefaultResponse(message, context);
    }

    getConversationContext() {
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        if (!currentChat || !currentChat.messages) return { previousTopics: [], messageCount: 0 };
        
        const recentMessages = currentChat.messages.slice(-6); // Last 6 messages for context
        const topics = [];
        
        recentMessages.forEach(msg => {
            const text = msg.text.toLowerCase();
            if (text.includes('machine learning') || text.includes('ml')) topics.push('ml');
            if (text.includes('scholarship') || text.includes('funding')) topics.push('scholarship');
            if (text.includes('essay') || text.includes('writing')) topics.push('writing');
            if (text.includes('study') || text.includes('learning')) topics.push('study');
        });
        
        return {
            previousTopics: [...new Set(topics)],
            messageCount: currentChat.messages.length,
            recentMessages: recentMessages.slice(-3)
        };
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

    getMLResponse(message, context) {
        const responses = [
            "🤖 **Machine Learning - Your Complete Guide:**\n\n**📚 Study Resources Available:**\n• Comprehensive ML fundamentals and advanced topics\n• TensorFlow and PyTorch tutorials with hands-on examples\n• Research papers from top conferences (NeurIPS, ICML, ICLR)\n• Interactive Jupyter notebooks and coding exercises\n\n**🎓 Scholarship Opportunities:**\n• Google AI Research Scholarship ($50,000)\n• Microsoft AI for Good Scholarship ($25,000)\n• NVIDIA Graduate Fellowship ($50,000)\n• DeepMind Scholarship Program (£40,000)\n\n**📈 Recommended Learning Path:**\n1. **Foundations** - Statistics, linear algebra, Python programming\n2. **Supervised Learning** - Regression, classification, decision trees\n3. **Unsupervised Learning** - Clustering, PCA, anomaly detection\n4. **Deep Learning** - Neural networks, CNNs, RNNs, Transformers\n5. **Specialized Areas** - Computer vision, NLP, reinforcement learning\n\n**🛠️ Essential Tools & Libraries:**\n• **Python** - Primary programming language\n• **scikit-learn** - Traditional ML algorithms\n• **TensorFlow/PyTorch** - Deep learning frameworks\n• **Pandas/NumPy** - Data manipulation and analysis\n• **Matplotlib/Seaborn** - Data visualization\n\nWhat specific aspect of machine learning interests you most? I can provide more targeted guidance!",
            
            "🧠 **Machine Learning Mastery Path:**\n\n**🎯 Current Industry Trends:**\n• **Large Language Models** - GPT, BERT, T5 architectures\n• **Computer Vision** - Vision Transformers, CLIP, DALL-E\n• **Multimodal AI** - Combining text, image, and audio\n• **Federated Learning** - Privacy-preserving distributed training\n• **AutoML** - Automated machine learning pipelines\n\n**💼 Career Opportunities:**\n• **ML Engineer** ($120k-200k) - Production ML systems\n• **Research Scientist** ($150k-300k) - Algorithm development\n• **Data Scientist** ($100k-180k) - Business insights from data\n• **AI Product Manager** ($130k-220k) - AI product strategy\n\n**📖 Top Learning Resources:**\n• **Andrew Ng's ML Course** - Foundational concepts\n• **Fast.ai** - Practical deep learning approach\n• **Papers With Code** - Latest research implementations\n• **Kaggle** - Competitions and datasets\n\n**🔬 Research Areas to Explore:**\n• **Explainable AI** - Understanding model decisions\n• **Few-shot Learning** - Learning from limited data\n• **Neural Architecture Search** - Automated model design\n• **Continual Learning** - Learning without forgetting\n\nWhich career path or research area would you like to explore further?"
        ];
        
        if (context.previousTopics.includes('ml') && context.messageCount > 2) {
            return "🔄 **Building on Our ML Discussion:**\n\nSince we've been talking about machine learning, let me dive deeper into specific areas:\n\n**🎯 Advanced Topics:**\n• **Transfer Learning** - Leveraging pre-trained models\n• **Ensemble Methods** - Combining multiple models\n• **Hyperparameter Optimization** - Automated tuning\n• **Model Interpretability** - SHAP, LIME, attention visualization\n\n**🚀 Practical Projects to Build:**\n1. **Image Classification** - Using CNNs on custom datasets\n2. **Sentiment Analysis** - NLP with transformer models\n3. **Recommendation System** - Collaborative filtering\n4. **Time Series Forecasting** - LSTM/GRU networks\n\nWhich project type aligns with your learning goals?";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getDataScienceResponse(message, context) {
        return "📊 **Data Science - Complete Roadmap:**\n\n**🔍 Core Skills & Tools:**\n• **Programming** - Python (pandas, numpy), R, SQL\n• **Statistics** - Hypothesis testing, regression, Bayesian methods\n• **Visualization** - Matplotlib, Seaborn, Plotly, Tableau\n• **Machine Learning** - scikit-learn, feature engineering\n• **Big Data** - Spark, Hadoop, cloud platforms (AWS, GCP)\n\n**📈 Data Science Workflow:**\n1. **Problem Definition** - Understanding business objectives\n2. **Data Collection** - APIs, databases, web scraping\n3. **Data Cleaning** - Handling missing values, outliers\n4. **Exploratory Analysis** - Statistical summaries, visualizations\n5. **Feature Engineering** - Creating meaningful variables\n6. **Modeling** - Algorithm selection and validation\n7. **Deployment** - Production systems and monitoring\n\n**💰 Scholarship Opportunities:**\n• **Kaggle Learn Scholarships** - Various amounts\n• **Women in Data Science** ($5,000-15,000)\n• **Diversity in Data Science** ($10,000)\n\n**🎯 Specialization Areas:**\n• **Business Analytics** - KPIs, A/B testing, growth metrics\n• **Healthcare Analytics** - Clinical data, drug discovery\n• **Financial Analytics** - Risk modeling, algorithmic trading\n• **Marketing Analytics** - Customer segmentation, attribution\n\nWhat industry or application area interests you most?";
    }

    getMathResponse(message, context) {
        return "🔢 **Mathematics for STEM Success:**\n\n**📚 Essential Math Areas:**\n• **Calculus** - Derivatives, integrals, multivariable calculus\n• **Linear Algebra** - Matrices, eigenvalues, vector spaces\n• **Statistics & Probability** - Distributions, hypothesis testing\n• **Discrete Mathematics** - Graph theory, combinatorics\n• **Differential Equations** - Modeling dynamic systems\n\n**🎯 Applications by Field:**\n• **Computer Science** - Algorithms, complexity theory\n• **Data Science** - Statistical inference, optimization\n• **Engineering** - Signal processing, control systems\n• **Physics** - Quantum mechanics, relativity\n• **Economics** - Game theory, econometrics\n\n**📖 Study Resources:**\n• **Khan Academy** - Free comprehensive courses\n• **MIT OpenCourseWare** - University-level materials\n• **Wolfram Alpha** - Problem solving and visualization\n• **3Blue1Brown** - Intuitive video explanations\n\n**💡 Study Strategies:**\n• **Practice Problems** - Solve many varied examples\n• **Proof Writing** - Develop logical reasoning\n• **Visual Learning** - Use graphs and geometric intuition\n• **Real Applications** - Connect to practical problems\n\nWhich math area would you like to focus on or need help with?";
    }

    getCareerResponse(message, context) {
        return "🚀 **Career Development Guide:**\n\n**💼 Tech Career Paths:**\n• **Software Engineering** - Frontend, backend, full-stack\n• **Data & AI** - Data scientist, ML engineer, AI researcher\n• **Product & Design** - Product manager, UX designer\n• **DevOps & Infrastructure** - Cloud architect, site reliability\n• **Cybersecurity** - Security analyst, penetration tester\n\n**📝 Resume & Application Tips:**\n• **Technical Skills** - List relevant programming languages, tools\n• **Projects** - Showcase GitHub repositories with clear documentation\n• **Experience** - Quantify impact with metrics and results\n• **Education** - Include relevant coursework, GPA if strong\n• **Certifications** - AWS, Google Cloud, industry-specific certs\n\n**🎯 Interview Preparation:**\n• **Technical Interviews** - LeetCode, system design practice\n• **Behavioral Questions** - STAR method for storytelling\n• **Company Research** - Mission, values, recent news\n• **Questions to Ask** - Growth opportunities, team culture\n\n**🌐 Networking & Opportunities:**\n• **LinkedIn** - Professional profile and connections\n• **GitHub** - Active contribution and portfolio\n• **Conferences** - Industry events and meetups\n• **Mentorship** - Find experienced professionals\n\nWhat specific career area or job search challenge can I help you with?";
    }

    getResearchResponse(message, context) {
        return "🔬 **Academic Research Excellence:**\n\n**📊 Research Process:**\n1. **Literature Review** - Survey existing work thoroughly\n2. **Problem Identification** - Find gaps and opportunities\n3. **Methodology Design** - Experimental or theoretical approach\n4. **Data Collection** - Systematic and reproducible methods\n5. **Analysis & Results** - Statistical significance and interpretation\n6. **Publication** - Conference papers, journal articles\n\n**📚 Research Tools & Resources:**\n• **Literature Search** - Google Scholar, arXiv, IEEE Xplore\n• **Reference Management** - Zotero, Mendeley, EndNote\n• **Data Analysis** - R, Python, MATLAB, SPSS\n• **Writing** - LaTeX, Overleaf for academic formatting\n• **Collaboration** - Git for code, shared documents\n\n**🎓 Funding Opportunities:**\n• **NSF Graduate Research Fellowship** ($37,000/year)\n• **NIH Training Grants** (Various amounts)\n• **Industry Partnerships** - Google, Microsoft, Adobe research\n• **University Grants** - Internal funding programs\n\n**📈 Publication Strategy:**\n• **Conference Papers** - Faster feedback, networking\n• **Journal Articles** - Higher impact, thorough review\n• **Preprints** - Early visibility on arXiv, bioRxiv\n• **Open Access** - Broader reach and citations\n\n**🤝 Collaboration Tips:**\n• **Find Mentors** - Experienced researchers in your field\n• **Join Research Groups** - Active labs with funding\n• **Attend Conferences** - Present work, get feedback\n• **Peer Review** - Contribute to the academic community\n\nWhat stage of research are you in, or what specific research area interests you?";
    }

    getHelpResponse(message, context) {
        const helpAreas = [
            "🎯 **I'm here to help with your academic journey!**\n\nI can assist you with:\n\n**📚 Academic Support:**\n• Study materials and resources for any subject\n• Learning strategies and study techniques\n• Research guidance and methodology\n• Academic writing and essay tips\n\n**💰 Financial Support:**\n• Scholarship opportunities and applications\n• Grant writing and funding strategies\n• Financial aid navigation\n\n**🚀 Career Development:**\n• Career path exploration\n• Resume and interview preparation\n• Networking and professional development\n• Industry insights and trends\n\n**🔬 Subject Expertise:**\n• STEM fields (CS, AI, Math, Engineering)\n• Research methodologies\n• Technical skills development\n\nWhat specific area would you like help with today?",
            
            "💡 **Let me guide you to the right resources!**\n\nBased on what you're looking for, I can provide:\n\n**🎓 Academic Excellence:**\n• Personalized study plans\n• Subject-specific resources\n• Exam preparation strategies\n• Time management techniques\n\n**📝 Writing & Communication:**\n• Essay structure and argumentation\n• Research paper writing\n• Application essays\n• Technical documentation\n\n**🌟 Opportunities & Growth:**\n• Scholarship matching\n• Internship guidance\n• Conference and competition info\n• Skill development roadmaps\n\nTell me more about your specific situation or goals, and I'll provide targeted assistance!"
        ];
        
        return helpAreas[Math.floor(Math.random() * helpAreas.length)];
    }

    getExplanationResponse(message, context) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
            return "🤖 **Machine Learning Explained:**\n\nMachine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario.\n\n**🔍 Key Concepts:**\n• **Training Data** - Examples used to teach the algorithm\n• **Features** - Input variables that help make predictions\n• **Model** - The mathematical representation learned from data\n• **Prediction** - Output generated for new, unseen data\n\n**📊 Types of ML:**\n• **Supervised** - Learning from labeled examples (like email spam detection)\n• **Unsupervised** - Finding patterns in unlabeled data (like customer segmentation)\n• **Reinforcement** - Learning through trial and error with rewards (like game playing)\n\n**🎯 Real-World Applications:**\n• Netflix recommendations\n• Google search results\n• Medical diagnosis assistance\n• Autonomous vehicles\n• Financial fraud detection\n\nWould you like me to explain any specific ML concept in more detail?";
        }
        
        if (lowerMessage.includes('artificial intelligence') || lowerMessage.includes('ai')) {
            return "🧠 **Artificial Intelligence Explained:**\n\nAI is the simulation of human intelligence in machines, enabling them to think, learn, and solve problems like humans do.\n\n**🔬 Core Components:**\n• **Machine Learning** - Learning from data\n• **Natural Language Processing** - Understanding human language\n• **Computer Vision** - Interpreting visual information\n• **Robotics** - Physical interaction with the world\n• **Expert Systems** - Knowledge-based decision making\n\n**📈 AI Evolution:**\n• **Narrow AI** (Current) - Specialized for specific tasks\n• **General AI** (Future) - Human-level intelligence across domains\n• **Super AI** (Theoretical) - Exceeding human capabilities\n\n**🌍 Impact Areas:**\n• Healthcare - Drug discovery, diagnosis\n• Transportation - Autonomous vehicles\n• Education - Personalized learning\n• Environment - Climate modeling, conservation\n• Business - Automation, optimization\n\nWhat aspect of AI would you like to explore further?";
        }
        
        return "🤔 **I'd be happy to explain that concept!**\n\nTo give you the most helpful explanation, could you be more specific about what you'd like to understand?\n\nI can explain:\n• **Technical concepts** - Algorithms, programming, mathematics\n• **Academic topics** - Research methods, study strategies\n• **Career paths** - Job roles, industry trends\n• **Educational processes** - Applications, scholarships, planning\n\nJust let me know what specific topic or concept you'd like me to break down for you!";
    }

    getGratitudeResponse(message, context) {
        const responses = [
            "😊 **You're very welcome!** I'm glad I could help.\n\nIs there anything else you'd like to explore or learn about? I'm here to support your academic journey in any way I can!",
            "🌟 **Happy to help!** That's what I'm here for.\n\nFeel free to ask me anything else about your studies, career goals, or academic planning. I'm always ready to assist!",
            "💙 **My pleasure!** Helping students succeed is what I love doing.\n\nDon't hesitate to reach out whenever you need guidance, resources, or just want to discuss your academic interests!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getFarewellResponse(message, context) {
        const responses = [
            "👋 **Goodbye for now!** It was great helping you today.\n\nRemember, I'm always here when you need academic support, study resources, or career guidance. Best of luck with your studies!",
            "🌟 **Take care!** I hope our conversation was helpful.\n\nKeep pursuing your educational goals, and don't hesitate to come back anytime you need assistance. You've got this!",
            "📚 **See you later!** Thanks for the great conversation.\n\nContinue working hard on your academic journey. I'll be here whenever you need help with studies, scholarships, or career planning!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getContextualDefaultResponse(message, context) {
        if (context.messageCount === 0) {
            return this.getGreetingResponse(message, context);
        }
        
        if (context.previousTopics.length > 0) {
            const topic = context.previousTopics[0];
            return `🤔 **Interesting question!** \n\nI notice we've been discussing ${topic === 'ml' ? 'machine learning' : topic}. While I'd love to help with that specific question, I'm most effective when discussing:\n\n📚 **Academic Topics** - Study materials, research, learning strategies\n🎓 **Educational Planning** - Scholarships, applications, career guidance\n💡 **Skill Development** - Technical skills, programming, mathematics\n✍️ **Academic Writing** - Essays, papers, applications\n\nCould you rephrase your question in relation to your educational goals? I'm here to help you succeed academically!`;
        }
        
        return "🎯 **I'm focused on helping with academic and educational topics.**\n\nI can assist with:\n\n🔍 **Research Guidance** - Finding the right materials\n📝 **Writing Support** - Essays, applications, and more\n🎯 **Study Planning** - Effective learning strategies\n💰 **Financial Aid** - Scholarship and funding options\n\nHow can I help with your educational goals?";
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

    // Enhanced response methods with context awareness
    getStudyMaterialResponse(message, context) {
        const responses = [
            "📚 **Study Materials - Your Learning Hub:**\n\n**🎯 Available Resources:**\n• **AI & Machine Learning** - TensorFlow guides, research papers, tutorials\n• **Computer Science** - Algorithms, data structures, programming languages\n• **Mathematics** - Calculus, linear algebra, statistics\n• **Data Science** - Python, R, statistical analysis, visualization\n• **Research Methods** - Academic writing, methodology, citation styles\n\n**📖 Resource Types:**\n• **Interactive Tutorials** - Step-by-step learning paths\n• **Research Papers** - Latest academic publications\n• **Video Lectures** - University courses and expert talks\n• **Practice Problems** - Coding challenges and exercises\n• **Project Templates** - Real-world application examples\n\n**🔍 Smart Search Features:**\n• Filter by difficulty level (beginner to expert)\n• Sort by ratings and popularity\n• Subject-specific categorization\n• Semester and course alignment\n\n**💡 Study Tips:**\n• Start with fundamentals before advanced topics\n• Practice with real datasets and problems\n• Join study groups and discussion forums\n• Create your own notes and summaries\n\nWhat subject or skill would you like to explore? I can recommend specific materials!",
            
            "🎓 **Personalized Learning Recommendations:**\n\n**📊 Popular Study Areas:**\n• **Artificial Intelligence** (4.8★) - 156 resources\n• **Data Science** (4.7★) - 203 resources  \n• **Computer Vision** (4.6★) - 94 resources\n• **Machine Learning** (4.5★) - 89 resources\n• **Natural Language Processing** (4.3★) - 67 resources\n\n**🚀 Trending Topics:**\n• **Large Language Models** - GPT, BERT, Transformers\n• **Computer Vision** - Vision Transformers, CLIP\n• **MLOps** - Model deployment and monitoring\n• **Ethical AI** - Bias detection and fairness\n\n**📱 Access Options:**\n• **Online Platform** - Browse and search materials\n• **Mobile App** - Study on-the-go\n• **Offline Downloads** - Study without internet\n• **Community Features** - Share and discuss\n\n**🎯 Personalization:**\n• Track your learning progress\n• Get recommendations based on interests\n• Save favorites and create collections\n• Connect with study partners\n\nWhich learning path interests you most?"
        ];
        
        if (context.previousTopics.includes('study')) {
            return "📚 **Building on Your Study Plan:**\n\nSince we've been discussing study materials, let me suggest some advanced strategies:\n\n**🎯 Active Learning Techniques:**\n• **Feynman Technique** - Explain concepts simply\n• **Spaced Repetition** - Review at increasing intervals\n• **Interleaving** - Mix different topics in study sessions\n• **Practice Testing** - Quiz yourself regularly\n\n**📊 Progress Tracking:**\n• Set weekly learning goals\n• Track time spent on each subject\n• Monitor comprehension levels\n• Celebrate milestones achieved\n\nWhat specific subject would you like to focus on next?";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getScholarshipResponse(message, context) {
        const responses = [
            "💰 **Scholarship Opportunities - Your Funding Guide:**\n\n**🏆 Featured Scholarships:**\n• **Google AI Research** ($50,000) - AI/ML research focus\n• **Microsoft Diversity in Tech** ($25,000) - Underrepresented groups\n• **NSF Graduate Fellowship** ($37,000/year) - STEM research\n• **Gates Millennium Scholars** (Full tuition) - Leadership potential\n• **Thiel Fellowship** ($100,000) - Entrepreneurial projects\n\n**📋 Application Requirements:**\n• **Academic Excellence** - Strong GPA and coursework\n• **Personal Essays** - Compelling personal narrative\n• **Letters of Recommendation** - From professors/mentors\n• **Research Experience** - Publications or projects\n• **Community Impact** - Leadership and service\n\n**✍️ Essay Writing Tips:**\n• Tell your unique story authentically\n• Connect experiences to future goals\n• Show impact and leadership potential\n• Address selection criteria directly\n• Proofread carefully for errors\n\n**📅 Application Strategy:**\n• Start early - many deadlines are in fall/winter\n• Apply broadly - don't limit to one scholarship\n• Tailor each application to specific criteria\n• Track deadlines and requirements carefully\n\nWhat field of study are you pursuing? I can suggest targeted scholarships!",
            
            "🎯 **Scholarship Success Strategy:**\n\n**💡 Types of Funding:**\n• **Merit-Based** - Academic achievement and potential\n• **Need-Based** - Financial circumstances\n• **Diversity** - Underrepresented groups in STEM\n• **Research** - Specific projects or fields\n• **International** - Study abroad opportunities\n\n**🔍 Finding Opportunities:**\n• **University Resources** - Financial aid office\n• **Professional Organizations** - IEEE, ACM, etc.\n• **Government Programs** - NSF, NIH, DOE\n• **Corporate Sponsors** - Google, Microsoft, Adobe\n• **Foundation Grants** - Private philanthropic organizations\n\n**📈 Maximizing Success:**\n• **Build Strong Profile** - Research, leadership, service\n• **Network Actively** - Connect with faculty and professionals\n• **Seek Mentorship** - Guidance from successful applicants\n• **Practice Interviews** - Many scholarships include interviews\n\n**🎓 Beyond Money:**\n• **Networking Opportunities** - Connect with other scholars\n• **Mentorship Programs** - Industry professionals\n• **Conference Access** - Present research and learn\n• **Career Support** - Job placement assistance\n\nWould you like help with scholarship essays or finding specific opportunities?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getEssayResponse(message, context) {
        const responses = [
            "✍️ **Essay Writing Mastery:**\n\n**📝 Essay Structure Framework:**\n\n**1. Introduction (10-15%)**\n• **Hook** - Compelling opening that grabs attention\n• **Context** - Background information and relevance\n• **Thesis** - Clear main argument or purpose\n\n**2. Body Paragraphs (70-80%)**\n• **Topic Sentence** - Main point of each paragraph\n• **Evidence** - Examples, data, quotes, experiences\n• **Analysis** - Explain how evidence supports your point\n• **Transition** - Connect to next paragraph smoothly\n\n**3. Conclusion (10-15%)**\n• **Restate Thesis** - Reinforce main argument\n• **Synthesize** - Bring key points together\n• **Call to Action** - What should reader think/do?\n\n**🎯 Writing Process:**\n• **Brainstorm** - Generate ideas without judgment\n• **Outline** - Organize thoughts logically\n• **Draft** - Write without editing initially\n• **Revise** - Improve content and structure\n• **Edit** - Fix grammar, spelling, style\n• **Proofread** - Final check for errors\n\n**💡 Pro Tips:**\n• Show, don't tell - Use specific examples\n• Vary sentence structure for engagement\n• Use active voice for clarity\n• Read aloud to catch awkward phrasing\n\nWhat type of essay are you working on?",
            
            "📚 **Advanced Essay Techniques:**\n\n**🎨 Compelling Storytelling:**\n• **Personal Narrative** - Share meaningful experiences\n• **Character Development** - Show growth and learning\n• **Conflict Resolution** - Overcome challenges\n• **Vivid Details** - Help readers visualize scenes\n\n**🔍 Research & Evidence:**\n• **Primary Sources** - Original documents, interviews\n• **Secondary Sources** - Scholarly articles, books\n• **Statistical Data** - Support claims with numbers\n• **Expert Opinions** - Quotes from authorities\n• **Proper Citation** - APA, MLA, Chicago styles\n\n**✨ Style & Voice:**\n• **Authentic Voice** - Write in your natural style\n• **Appropriate Tone** - Match audience expectations\n• **Varied Vocabulary** - Avoid repetitive language\n• **Smooth Transitions** - Connect ideas seamlessly\n\n**🎯 Common Essay Types:**\n• **Personal Statement** - College/scholarship applications\n• **Research Paper** - Academic investigation\n• **Argumentative** - Persuade with evidence\n• **Analytical** - Examine and interpret\n• **Narrative** - Tell a story with purpose\n\nWhich essay type would you like specific guidance on?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getStudyTipsResponse(message, context) {
        return "💡 **Study Success Strategies:**\n\n**⏰ Time Management:**\n• **Pomodoro Technique** - 25 min focus, 5 min break\n• **Time Blocking** - Dedicate specific hours to subjects\n• **Priority Matrix** - Urgent vs. important tasks\n• **Weekly Planning** - Schedule study sessions in advance\n\n**🧠 Memory & Learning:**\n• **Active Recall** - Test yourself without looking at notes\n• **Spaced Repetition** - Review material at increasing intervals\n• **Elaborative Interrogation** - Ask 'why' and 'how' questions\n• **Dual Coding** - Combine visual and verbal information\n\n**📍 Environment & Focus:**\n• **Dedicated Space** - Consistent study location\n• **Minimize Distractions** - Phone away, clean workspace\n• **Optimal Lighting** - Natural light or bright lamp\n• **Background Sound** - Silence, white noise, or instrumental music\n\n**👥 Social Learning:**\n• **Study Groups** - Explain concepts to peers\n• **Teaching Others** - Best way to solidify understanding\n• **Discussion Forums** - Online academic communities\n• **Office Hours** - Connect with professors and TAs\n\n**📊 Progress Tracking:**\n• **Learning Goals** - Specific, measurable objectives\n• **Regular Assessment** - Weekly self-evaluation\n• **Mistake Analysis** - Learn from errors systematically\n• **Celebration** - Acknowledge achievements\n\n**🎯 Subject-Specific Tips:**\n• **STEM** - Practice problems, visual diagrams\n• **Languages** - Immersion, conversation practice\n• **History** - Timeline creation, cause-effect analysis\n• **Literature** - Close reading, thematic analysis\n\nWhat subject or study challenge would you like specific help with?";
    }

    getGreetingResponse(message, context) {
        const timeOfDay = new Date().getHours();
        let greeting = "Hello";
        
        if (timeOfDay < 12) greeting = "Good morning";
        else if (timeOfDay < 17) greeting = "Good afternoon";
        else greeting = "Good evening";
        
        const greetings = [
            `👋 **${greeting}! Welcome to NovaLearn AI**\n\nI'm your AI learning companion, designed to help you excel in your academic journey. Whether you're looking for study materials, scholarship opportunities, or academic guidance, I'm here to support you.\n\n**🎯 How I Can Help:**\n📚 **Study Resources** - Find materials for any subject\n🎓 **Scholarships** - Discover funding opportunities  \n✍️ **Writing Support** - Essays and applications\n💡 **Learning Strategies** - Effective study techniques\n🚀 **Career Guidance** - Academic and professional planning\n\nWhat brings you here today? I'm excited to help you succeed!`,
            
            `${greeting}! 🌟 **Ready to accelerate your learning?**\n\nI'm here to be your academic partner, helping you navigate everything from coursework to career planning. With access to comprehensive resources and personalized guidance, we can tackle any educational challenge together.\n\n**✨ What Makes Me Different:**\n• **Personalized Recommendations** - Tailored to your goals\n• **Up-to-Date Resources** - Latest materials and opportunities\n• **Comprehensive Support** - From study tips to career advice\n• **Available 24/7** - Learn at your own pace\n\nWhat academic goal can I help you achieve today?`,
            
            `Hey there! 😊 **Welcome to your AI study buddy**\n\nI'm passionate about helping students like you reach their full potential. Whether you're just starting your academic journey or pursuing advanced research, I've got the resources and guidance to support your success.\n\n**🎓 Popular Topics I Help With:**\n• Machine Learning & AI fundamentals\n• Computer Science and programming\n• Research methodology and academic writing\n• Scholarship applications and essays\n• Study strategies and time management\n\nWhat's on your academic mind today? Let's dive in!`
        ];
        
        if (context.messageCount > 0) {
            return `${greeting} again! 😊 Great to continue our conversation.\n\nHow can I further assist with your academic goals today?`;
        }
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
}

// Initialize the chatbot when the page loads
let chatbotApp;
document.addEventListener('DOMContentLoaded', () => {
    chatbotApp = new ChatbotApp();
});