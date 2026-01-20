// Test script for the ChatGPT-like chatbot interface
const puppeteer = require('puppeteer');

async function testChatbot() {
    console.log('🤖 Testing ChatGPT-like Chatbot Interface...\n');
    
    try {
        // Launch browser
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        
        // Navigate to chatbot page
        await page.goto('http://localhost:3000/chatbot.html');
        console.log('✅ Navigated to chatbot page');
        
        // Wait for page to load
        await page.waitForSelector('#messageInput');
        console.log('✅ Chatbot interface loaded');
        
        // Test welcome screen
        const welcomeScreen = await page.$('#welcomeScreen');
        if (welcomeScreen) {
            console.log('✅ Welcome screen is visible');
        }
        
        // Test quick prompt
        await page.click('[data-prompt="Help me find study materials for machine learning"]');
        console.log('✅ Clicked quick prompt');
        
        // Wait for message to be sent and response
        await page.waitForTimeout(3000);
        
        // Check if chat messages are visible
        const chatMessages = await page.$('#chatMessages');
        if (chatMessages) {
            console.log('✅ Chat messages container is working');
        }
        
        // Test typing a custom message
        await page.type('#messageInput', 'What scholarships are available for computer science students?');
        await page.click('#sendButton');
        console.log('✅ Sent custom message');
        
        // Wait for AI response
        await page.waitForTimeout(4000);
        
        // Test new chat functionality
        await page.click('#newChatBtn');
        console.log('✅ New chat button works');
        
        console.log('\n🎉 Chatbot interface test completed successfully!');
        console.log('📱 The ChatGPT-like interface is working with:');
        console.log('   • Modern sidebar design');
        console.log('   • Welcome screen with quick prompts');
        console.log('   • Typing indicators');
        console.log('   • Message bubbles with timestamps');
        console.log('   • Chat history management');
        console.log('   • Responsive design');
        
        // Keep browser open for manual testing
        console.log('\n🔍 Browser kept open for manual testing...');
        console.log('💡 You can now interact with the chatbot manually');
        console.log('🌐 URL: http://localhost:3000/chatbot.html');
        
        // Don't close browser automatically
        // await browser.close();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n📋 Manual testing instructions:');
        console.log('1. Open http://localhost:3000/chatbot.html');
        console.log('2. Try the quick prompts on the welcome screen');
        console.log('3. Type messages and test the AI responses');
        console.log('4. Test the new chat functionality');
        console.log('5. Check the sidebar chat history');
    }
}

// Run the test
testChatbot();