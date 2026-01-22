// Enhanced ChatGPT-like AI Assistant
class EnhancedChatbot {
    constructor() {
        this.conversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
        this.currentConversationId = null;
        this.isTyping = false;
        this.messageHistory = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChatHistory();
        this.setupAutoResize();
    }

    bindEvents() {
        // Input handling
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        messageInput.addEventListener('input', () => {
            this.handleInputChange();
        });

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.startNewConversation();
        });

        // Quick prompts
        document.querySelectorAll('.quick-prompt').forEach(button => {
            button.addEventListener('click', (e) => {
                const prompt = e.currentTarget.dataset.prompt;
                this.useQuickPrompt(prompt);
            });
        });

        // Login functionality
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        document.getElementById('cancelLogin').addEventListener('click', () => {
            this.hideLoginModal();
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Check if user is logged in
        this.checkAuthStatus();
    }

    handleInputChange() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const charCount = document.getElementById('charCount');
        
        const text = messageInput.value.trim();
        const length = messageInput.value.length;
        
        sendButton.disabled = !text || this.isTyping;
        charCount.textContent = `${length} / 4000`;
        
        if (length > 4000) {
            charCount.classList.add('text-red-500');
        } else {
            charCount.classList.remove('text-red-500');
        }
    }

    setupAutoResize() {
        const messageInput = document.getElementById('messageInput');
        
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        });
    }

    useQuickPrompt(prompt) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value = prompt;
        this.handleInputChange();
        messageInput.focus();
    }

    startNewConversation() {
        this.currentConversationId = this.generateId();
        this.messageHistory = [];
        
        // Hide welcome screen and show messages container
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('messagesContainer').classList.remove('hidden');
        
        // Clear messages
        document.getElementById('messages').innerHTML = '';
        
        // Update chat history
        this.updateChatHistory();
        
        // Focus input
        document.getElementById('messageInput').focus();
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Start new conversation if needed
        if (!this.currentConversationId) {
            this.startNewConversation();
        }
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.handleInputChange();
        
        // Add user message
        this.addMessage('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Get AI response
        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage('ai', response);
            
            // Save conversation
            this.saveConversation();
            this.updateChatHistory();
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('ai', 'I apologize, but I encountered an error. Please try again.');
            console.error('AI Response Error:', error);
        }
    }

    addMessage(sender, content) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-bubble user-message rounded-2xl px-4 py-3 max-w-2xl">
                    <div class="flex items-start space-x-3">
                        <div class="flex-1">
                            <div class="text-white">${this.formatMessage(content)}</div>
                            <div class="text-xs text-blue-100 mt-2">${timestamp}</div>
                        </div>
                        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-white text-sm"></i>
                        </div>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-bubble ai-message rounded-2xl px-4 py-3 max-w-4xl">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-gray-900">${this.formatMessage(content)}</div>
                            <div class="flex items-center justify-between mt-3">
                                <div class="text-xs text-gray-500">${timestamp}</div>
                                <div class="message-actions flex items-center space-x-2">
                                    <button class="copy-btn text-gray-400 hover:text-gray-600 p-1" title="Copy message">
                                        <i class="fas fa-copy text-xs"></i>
                                    </button>
                                    <button class="regenerate-btn text-gray-400 hover:text-gray-600 p-1" title="Regenerate response">
                                        <i class="fas fa-redo text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners for message actions
            const copyBtn = messageDiv.querySelector('.copy-btn');
            const regenerateBtn = messageDiv.querySelector('.regenerate-btn');
            
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(content);
                this.showToast('Message copied to clipboard');
            });
            
            regenerateBtn.addEventListener('click', () => {
                this.regenerateResponse(messageDiv);
            });
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store in message history
        this.messageHistory.push({
            sender,
            content,
            timestamp: new Date().toISOString()
        });
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content;
        
        // Code blocks
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="code-block"><pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre></div>`;
        });
        
        // Inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<span class="inline-code">$1</span>');
        
        // Bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Lists
        formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Numbered lists
        formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('messages');
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex justify-start';
        typingDiv.innerHTML = `
            <div class="thinking-indicator max-w-xs">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div class="flex items-center space-x-1">
                        <span class="text-sm text-gray-600">Thinking</span>
                        <div class="typing-dots"></div>
                        <div class="typing-dots"></div>
                        <div class="typing-dots"></div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Update send button state
        this.handleInputChange();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Update send button state
        this.handleInputChange();
    }

    async getAIResponse(message) {
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Enhanced AI responses based on context
        const responses = this.generateContextualResponse(message);
        return responses;
    }

    generateContextualResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Programming/Coding questions
        if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('algorithm')) {
            return this.generateCodingResponse(message);
        }
        
        // Math/Science questions
        if (lowerMessage.includes('math') || lowerMessage.includes('equation') || lowerMessage.includes('formula')) {
            return this.generateMathResponse(message);
        }
        
        // Study help
        if (lowerMessage.includes('study') || lowerMessage.includes('exam') || lowerMessage.includes('learn')) {
            return this.generateStudyResponse(message);
        }
        
        // Machine Learning/AI
        if (lowerMessage.includes('machine learning') || lowerMessage.includes('neural network') || lowerMessage.includes('ai')) {
            return this.generateMLResponse(message);
        }
        
        // Default comprehensive response
        return this.generateGeneralResponse(message);
    }

    generateCodingResponse(message) {
        const responses = [
            `I'd be happy to help you with coding! Here's a comprehensive approach:

**Understanding the Problem:**
Let me break down what you're asking about and provide a structured solution.

**Code Example:**
\`\`\`python
def example_function(input_data):
    # Process the input
    result = process_data(input_data)
    return result
\`\`\`

**Key Concepts:**
- **Algorithm Design**: Think about the problem step by step
- **Time Complexity**: Consider how your solution scales
- **Best Practices**: Write clean, readable code

**Next Steps:**
1. Try implementing the solution
2. Test with different inputs
3. Optimize if needed

Would you like me to explain any specific part in more detail?`,

            `Great coding question! Let me help you approach this systematically:

**Problem Analysis:**
First, let's understand what we're trying to achieve and identify the key requirements.

**Solution Strategy:**
\`\`\`javascript
// Example implementation
function solveProblem(data) {
    // Step 1: Validate input
    if (!data) return null;
    
    // Step 2: Process data
    const processed = data.map(item => transform(item));
    
    // Step 3: Return result
    return processed;
}
\`\`\`

**Important Considerations:**
- **Error Handling**: Always validate inputs
- **Performance**: Consider edge cases and optimization
- **Maintainability**: Write self-documenting code

Feel free to share your specific code, and I'll provide more targeted feedback!`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateMathResponse(message) {
        return `I'm here to help with your math problem! Let me provide a clear explanation:

**Problem Breakdown:**
Let's identify the key components and what we need to solve.

**Step-by-Step Solution:**
1. **Identify Given Information**: What do we know?
2. **Determine What to Find**: What's the question asking?
3. **Choose the Right Method**: Which formula or approach applies?
4. **Solve Systematically**: Work through each step carefully
5. **Verify the Answer**: Does our result make sense?

**Mathematical Concepts:**
- Understanding the underlying principles
- Recognizing patterns and relationships
- Applying appropriate formulas

**Practice Tips:**
- Work through similar problems
- Check your work at each step
- Understand the 'why' behind each operation

Would you like me to work through a specific problem with you? Please share the details!`;
    }

    generateStudyResponse(message) {
        return `I'm excited to help you with your studies! Here's a comprehensive study strategy:

**Effective Study Techniques:**

**1. Active Learning Methods:**
- **Summarization**: Write key points in your own words
- **Teaching Others**: Explain concepts to friends or family
- **Practice Testing**: Quiz yourself regularly
- **Spaced Repetition**: Review material at increasing intervals

**2. Study Planning:**
- Break large topics into smaller, manageable chunks
- Set specific, achievable goals for each study session
- Use the Pomodoro Technique (25-minute focused sessions)
- Schedule regular review sessions

**3. Memory Enhancement:**
- Create visual aids (mind maps, diagrams)
- Use mnemonics for complex information
- Connect new information to what you already know
- Practice retrieval without looking at notes

**4. Exam Preparation:**
- Start early and avoid cramming
- Practice with past papers or sample questions
- Form study groups for discussion and clarification
- Get adequate sleep and maintain good nutrition

What specific subject or topic would you like help with? I can provide more targeted study strategies!`;
    }

    generateMLResponse(message) {
        return `Excellent question about machine learning! Let me provide a comprehensive explanation:

**Machine Learning Fundamentals:**

**Core Concepts:**
- **Supervised Learning**: Learning from labeled examples
- **Unsupervised Learning**: Finding patterns in unlabeled data
- **Reinforcement Learning**: Learning through interaction and feedback

**Key Algorithms:**
\`\`\`python
# Example: Simple Linear Regression
from sklearn.linear_model import LinearRegression
import numpy as np

# Create and train model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)
\`\`\`

**Important Steps in ML Projects:**
1. **Data Collection & Preprocessing**: Clean and prepare your data
2. **Feature Engineering**: Select and create relevant features
3. **Model Selection**: Choose appropriate algorithms
4. **Training & Validation**: Fit models and evaluate performance
5. **Deployment**: Implement in production environment

**Best Practices:**
- Always validate your models properly
- Understand your data before modeling
- Start simple, then increase complexity
- Monitor for overfitting and bias

What specific aspect of machine learning would you like to explore further?`;
    }

    generateGeneralResponse(message) {
        const responses = [
            `Thank you for your question! I'm here to help you learn and understand complex topics.

**Let me address your query:**

Based on what you've asked, I can provide insights and explanations to help you better understand the subject matter. Learning is most effective when we break down complex ideas into manageable parts and build understanding step by step.

**Key Points to Consider:**
- Understanding the fundamentals is crucial
- Practice and application reinforce learning
- Asking questions shows intellectual curiosity
- Different perspectives can enhance comprehension

**How I Can Help:**
- Explain concepts in simple terms
- Provide examples and analogies
- Suggest learning resources
- Help with problem-solving strategies

Would you like me to elaborate on any specific aspect of your question? I'm here to support your learning journey!`,

            `Great question! I appreciate your curiosity and desire to learn.

**Understanding Your Question:**
Let me provide a thoughtful response that addresses the core of what you're asking about.

**Comprehensive Explanation:**
When approaching any topic, it's important to consider multiple angles and build a solid foundation of understanding. I'll help you explore this subject thoroughly.

**Learning Approach:**
- Start with basic concepts
- Build complexity gradually
- Use real-world examples
- Practice application
- Seek clarification when needed

**Additional Resources:**
I can suggest further reading, practice exercises, or related topics that might enhance your understanding.

Is there a particular aspect you'd like me to focus on or expand upon?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async regenerateResponse(messageDiv) {
        // Get the last user message
        const lastUserMessage = this.messageHistory
            .filter(msg => msg.sender === 'user')
            .pop();
        
        if (!lastUserMessage) return;
        
        // Remove the current AI response
        messageDiv.remove();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Generate new response
            const newResponse = await this.getAIResponse(lastUserMessage.content);
            this.hideTypingIndicator();
            this.addMessage('ai', newResponse);
            
            // Update conversation
            this.saveConversation();
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('ai', 'I apologize, but I encountered an error while regenerating the response.');
        }
    }

    saveConversation() {
        if (!this.currentConversationId || this.messageHistory.length === 0) return;
        
        const conversation = {
            id: this.currentConversationId,
            title: this.generateConversationTitle(),
            messages: this.messageHistory,
            lastUpdated: new Date().toISOString()
        };
        
        // Update or add conversation
        const existingIndex = this.conversations.findIndex(c => c.id === this.currentConversationId);
        if (existingIndex >= 0) {
            this.conversations[existingIndex] = conversation;
        } else {
            this.conversations.unshift(conversation);
        }
        
        // Keep only last 20 conversations
        if (this.conversations.length > 20) {
            this.conversations = this.conversations.slice(0, 20);
        }
        
        localStorage.setItem('chatConversations', JSON.stringify(this.conversations));
    }

    generateConversationTitle() {
        const firstUserMessage = this.messageHistory.find(msg => msg.sender === 'user');
        if (!firstUserMessage) return 'New Conversation';
        
        let title = firstUserMessage.content.substring(0, 50);
        if (firstUserMessage.content.length > 50) {
            title += '...';
        }
        
        return title;
    }

    loadChatHistory() {
        const historyContainer = document.getElementById('chatHistory');
        
        if (this.conversations.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center py-4 text-gray-500 text-sm">
                    No conversations yet
                </div>
            `;
            return;
        }
        
        historyContainer.innerHTML = this.conversations.map(conversation => {
            const date = new Date(conversation.lastUpdated).toLocaleDateString();
            const isActive = conversation.id === this.currentConversationId;
            
            return `
                <div class="chat-history-item ${isActive ? 'active' : ''}" data-id="${conversation.id}">
                    <div class="text-sm font-medium text-gray-900 truncate">${conversation.title}</div>
                    <div class="text-xs text-gray-500 mt-1">${date}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        historyContainer.querySelectorAll('.chat-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.dataset.id;
                this.loadConversation(conversationId);
            });
        });
    }

    loadConversation(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        
        this.currentConversationId = conversationId;
        this.messageHistory = conversation.messages;
        
        // Show messages container
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('messagesContainer').classList.remove('hidden');
        
        // Clear and reload messages
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';
        
        conversation.messages.forEach(msg => {
            this.addMessage(msg.sender, msg.content);
        });
        
        // Update history display
        this.updateChatHistory();
    }

    updateChatHistory() {
        this.loadChatHistory();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Authentication methods
    showLoginModal() {
        document.getElementById('loginModal').classList.remove('hidden');
    }

    hideLoginModal() {
        document.getElementById('loginModal').classList.add('hidden');
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');
        
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.updateAuthUI(data.user);
                this.hideLoginModal();
                messageDiv.innerHTML = '';
            } else {
                messageDiv.innerHTML = `<div class="text-red-600">${data.message}</div>`;
            }
        } catch (error) {
            messageDiv.innerHTML = `<div class="text-red-600">Connection error. Please try again.</div>`;
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateAuthUI(null);
    }

    checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        this.updateAuthUI(user);
    }

    updateAuthUI(user) {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        
        if (user) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userInfo.classList.remove('hidden');
            userName.textContent = user.name;
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userInfo.classList.add('hidden');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedChatbot();
});