// Simple AI Service Test Script
// Run this in your browser console to test AI services

console.log('🧪 Testing AI Services...');

// Test configuration
const testConfig = {
  OPENROUTER_API_KEY: import.meta.env?.VITE_OPENROUTER_API_KEY || 'NOT_SET',
  GEMINI_API_KEY: import.meta.env?.VITE_GEMINI_API_KEY || 'NOT_SET',
  DEEPSEEK_API_KEY: import.meta.env?.VITE_DEEPSEEK_API_KEY || 'NOT_SET'
};

console.log('📋 Configuration:', testConfig);

// Test OpenRouter API
async function testOpenRouter() {
  if (testConfig.OPENROUTER_API_KEY === 'NOT_SET') {
    console.log('❌ OpenRouter API key not set');
    return false;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testConfig.OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmaRta AI Notes'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          { role: 'user', content: 'Hello! Please respond with "AI is working!"' }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenRouter API working:', data.choices?.[0]?.message?.content);
      return true;
    } else {
      console.log('❌ OpenRouter API error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ OpenRouter API failed:', error.message);
    return false;
  }
}

// Test Gemini API
async function testGemini() {
  if (testConfig.GEMINI_API_KEY === 'NOT_SET') {
    console.log('❌ Gemini API key not set');
    return false;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${testConfig.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            { parts: [ { text: 'Hello! Please respond with "AI is working!"' } ] }
          ]
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Gemini API working:', data.candidates?.[0]?.content?.parts?.[0]?.text);
      return true;
    } else {
      console.log('❌ Gemini API error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Gemini API failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('\n🚀 Starting AI Service Tests...\n');
  
  const openRouterResult = await testOpenRouter();
  const geminiResult = await testGemini();
  
  console.log('\n📊 Test Results:');
  console.log('OpenRouter:', openRouterResult ? '✅ Working' : '❌ Failed');
  console.log('Gemini:', geminiResult ? '✅ Working' : '❌ Failed');
  
  if (openRouterResult || geminiResult) {
    console.log('\n🎉 At least one AI service is working! Your chat and quiz features should work.');
  } else {
    console.log('\n⚠️ No AI services are working. Check your API keys and try again.');
    console.log('💡 The app will still work with fallback responses.');
  }
}

// Export for use in browser console
window.testAIServices = runTests;
console.log('💡 Run testAIServices() to test your AI services');
