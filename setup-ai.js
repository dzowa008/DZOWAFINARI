#!/usr/bin/env node

/**
 * AI Services Setup Script for SmaRta AI Notes
 * This script helps you set up your AI services configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 SmaRta AI Notes - AI Services Setup\n');

// Check if .env file already exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env file already exists. This script will help you update it.\n');
} else {
  console.log('📝 Creating new .env file...\n');
}

// Function to ask for input
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Function to update or create .env file
function updateEnvFile(envVars) {
  let envContent = '';
  
  // Add AI service keys
  envContent += `# AI Service API Keys\n`;
  envContent += `VITE_OPENROUTER_API_KEY=${envVars.openRouter || ''}\n`;
  envContent += `VITE_DEEPSEEK_API_KEY=${envVars.deepSeek || ''}\n`;
  envContent += `VITE_GEMINI_API_KEY=${envVars.gemini || ''}\n\n`;
  
  // Add Supabase config
  envContent += `# Supabase Configuration\n`;
  envContent += `VITE_SUPABASE_URL=${envVars.supabaseUrl || ''}\n`;
  envContent += `VITE_SUPABASE_ANON_KEY=${envVars.supabaseKey || ''}\n\n`;
  
  // Add AI service config
  envContent += `# AI Service Configuration\n`;
  envContent += `VITE_AI_TEST_MODE=${envVars.testMode || 'false'}\n`;
  envContent += `VITE_SITE_URL=${envVars.siteUrl || 'http://localhost:5173'}\n`;
  envContent += `VITE_SITE_NAME=${envVars.siteName || 'SmaRta AI Notes'}\n`;
  
  // Add instructions
  envContent += `\n# Instructions:\n`;
  envContent += `# 1. Restart your development server after making changes\n`;
  envContent += `# 2. Test AI features in your app\n`;
  envContent += `# 3. Check browser console for any errors\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully!');
}

// Main setup function
async function main() {
  try {
    console.log('🔑 Let\'s set up your AI services. You can skip any service you don\'t want to use.\n');
    
    const envVars = {};
    
    // OpenRouter setup
    console.log('📡 OpenRouter (Recommended - Free tier available)');
    console.log('   Get your API key from: https://openrouter.ai/\n');
    envVars.openRouter = await ask('Enter your OpenRouter API key (or press Enter to skip): ');
    
    // DeepSeek setup
    console.log('\n🔍 DeepSeek');
    console.log('   Get your API key from: https://platform.deepseek.com/\n');
    envVars.deepSeek = await ask('Enter your DeepSeek API key (or press Enter to skip): ');
    
    // Gemini setup
    console.log('\n🤖 Google Gemini');
    console.log('   Get your API key from: https://makersuite.google.com/app/apikey\n');
    envVars.gemini = await ask('Enter your Gemini API key (or press Enter to skip): ');
    
    // Supabase setup
    console.log('\n🗄️  Supabase Configuration');
    console.log('   If you already have Supabase set up, you can skip this.\n');
    envVars.supabaseUrl = await ask('Enter your Supabase URL (or press Enter to skip): ');
    envVars.supabaseKey = await ask('Enter your Supabase anon key (or press Enter to skip): ');
    
    // Test mode
    console.log('\n🧪 Test Mode');
    console.log('   Enable this to test without API keys (uses fallback responses)\n');
    const testMode = await ask('Enable test mode? (y/n, default: n): ');
    envVars.testMode = testMode.toLowerCase() === 'y' ? 'true' : 'false';
    
    // Site configuration
    console.log('\n🌐 Site Configuration');
    envVars.siteUrl = await ask('Enter your site URL (default: http://localhost:5173): ') || 'http://localhost:5173';
    envVars.siteName = await ask('Enter your site name (default: SmaRta AI Notes): ') || 'SmaRta AI Notes';
    
    // Update .env file
    console.log('\n📝 Updating .env file...');
    updateEnvFile(envVars);
    
    // Summary
    console.log('\n📊 Setup Summary:');
    console.log(`   OpenRouter: ${envVars.openRouter ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   DeepSeek: ${envVars.deepSeek ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Gemini: ${envVars.gemini ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Supabase: ${envVars.supabaseUrl && envVars.supabaseKey ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Test Mode: ${envVars.testMode === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
    
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test the AI chat feature in your app');
    console.log('3. Try creating a quiz with the AI quiz generator');
    console.log('4. Check the browser console for any errors');
    
    if (!envVars.openRouter && !envVars.deepSeek && !envVars.gemini) {
      console.log('\n⚠️  No AI services configured. The app will work with fallback responses.');
      console.log('   To enable full AI features, add at least one API key and restart.');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup
main();
