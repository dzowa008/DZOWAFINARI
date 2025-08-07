// Simple OpenRouter API Test (CommonJS)
const fs = require('fs');

// Read API key from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const apiKeyLine = envContent.split('\n').find(line => line.startsWith('VITE_OPENROUTER_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : '';

console.log('🔑 API Key found:', apiKey ? 'Yes' : 'No');
console.log('🔑 API Key length:', apiKey.length);
console.log('🔑 API Key starts with sk-or:', apiKey.startsWith('sk-or'));

if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
  console.log('❌ Please set a valid OpenRouter API key in .env file');
  process.exit(1);
}

// Test the API
async function testAPI() {
  try {
    console.log('\n🚀 Testing OpenRouter API...');
    
    // Use dynamic import for fetch
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://dzowa-ai-notes.netlify.app',
        'X-Title': 'DzowaAI Notes'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'user',
            content: 'Hello! Just say "API working!" to test the connection.'
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', data.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
