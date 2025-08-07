// Quick API Test
const fs = require('fs');

console.log('🔍 Reading .env file...');

// Read API key from .env file
const envContent = fs.readFileSync('.env', 'utf8');
console.log('📄 .env file read successfully');

const apiKeyLine = envContent.split('\n').find(line => line.startsWith('VITE_OPENROUTER_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : '';

console.log('🔑 API Key found:', apiKey ? 'Yes' : 'No');
console.log('🔑 API Key length:', apiKey.length);

if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
  console.log('❌ Please set a valid OpenRouter API key in .env file');
} else {
  console.log('✅ Valid API key detected');
  console.log('🚀 You can now test the AI chat in your browser!');
}
