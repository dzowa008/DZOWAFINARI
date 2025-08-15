# AI Services Setup Guide

## 🚀 Quick Setup

To make the AI chat and quiz generator work, you need to set up API keys for AI services.

### 1. Create Environment File

Create a `.env` file in your project root with the following variables:

```bash
# AI Service API Keys
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# AI Service Configuration
VITE_AI_TEST_MODE=false
VITE_SITE_URL=https://your-domain.com
VITE_SITE_NAME=SmaRta AI Notes
```

### 2. Get API Keys

#### Option A: OpenRouter (Recommended - Free tier available)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Set `VITE_OPENROUTER_API_KEY=your_key_here`

#### Option B: Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set `VITE_GEMINI_API_KEY=your_key_here`

#### Option C: DeepSeek
1. Go to [DeepSeek](https://platform.deepseek.com/)
2. Sign up and get your API key
3. Set `VITE_DEEPSEEK_API_KEY=your_key_here`

### 3. Restart Your Development Server

After adding the environment variables:

```bash
npm run dev
```

## 🔧 How It Works

The AI service will automatically:
1. Try OpenRouter first (if API key is available)
2. Fall back to Gemini if OpenRouter fails
3. Use intelligent fallback responses if all AI services fail

## 🧪 Test Mode

If you want to test without API keys, set:

```bash
VITE_AI_TEST_MODE=true
```

This will use enhanced fallback responses that simulate AI behavior.

## 📱 Features That Will Work

### AI Chat
- ✅ Ask questions about your notes
- ✅ Get writing assistance
- ✅ Request summaries and analysis
- ✅ Fallback responses when AI is unavailable

### AI Quiz Generator
- ✅ Create quizzes on any topic
- ✅ Multiple difficulty levels
- ✅ AI-generated questions (when API keys are available)
- ✅ Fallback quiz generation
- ✅ Interactive quiz taking experience

## 🚨 Troubleshooting

### "No API key found" warning
- Check that your `.env` file exists and has the correct variable names
- Ensure the file is in the project root (same level as `package.json`)
- Restart your development server after adding environment variables

### API errors
- Verify your API keys are correct
- Check if you've exceeded rate limits
- Ensure your API keys have sufficient credits/quota

### Fallback mode
- If you see "Fallback Mode" messages, it means the AI services are unavailable
- The app will still work with intelligent fallback responses
- Check your API key configuration

## 💡 Pro Tips

1. **Start with OpenRouter** - They offer a generous free tier
2. **Use multiple services** - The app will automatically fall back if one fails
3. **Test with fallback mode** - Set `VITE_AI_TEST_MODE=true` to see how it works without API keys
4. **Monitor usage** - Keep track of your API usage to avoid unexpected charges

## 🔒 Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are only used on the client side for making requests
- All sensitive data is handled securely through the configured services

## 📞 Support

If you're still having issues:
1. Check the browser console for error messages
2. Verify your API keys are working with a simple test
3. Ensure your environment variables are properly formatted
4. Restart your development server after making changes
