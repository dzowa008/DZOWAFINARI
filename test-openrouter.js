// Test script for OpenRouter API integration
// Run with: node test-openrouter.js

const testOpenRouterAPI = async () => {
  const API_KEY = process.env.VITE_OPENROUTER_API_KEY || 'your_openrouter_api_key_here';
  
  if (!API_KEY || API_KEY === 'your_openrouter_api_key_here') {
    console.log('❌ Please set your OpenRouter API key in .env file');
    return;
  }

  try {
    console.log('🚀 Testing OpenRouter API with DeepSeek model...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://dzowa-ai-notes.netlify.app',
        'X-Title': 'DzowaAI Notes'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with "OpenRouter + DeepSeek integration successful!" to confirm the connection works.'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('✅ OpenRouter API Test Successful!');
      console.log('🤖 AI Response:', data.choices[0].message.content);
      console.log('📊 Model used:', data.model || 'deepseek/deepseek-chat-v3-0324:free');
      console.log('💰 Usage:', data.usage || 'No usage data');
    } else {
      console.log('❌ Unexpected response format:', data);
    }

  } catch (error) {
    console.error('❌ OpenRouter API Test Failed:', error.message);
    console.log('🔧 Check your API key and internet connection');
  }
};

testOpenRouterAPI();
