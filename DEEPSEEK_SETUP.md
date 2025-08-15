# DeepSeek API Setup Guide

## 🚀 Quick Setup for Real AI Conversations

### Step 1: Get Your DeepSeek API Key

1. **Visit DeepSeek Platform**: Go to [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. **Sign Up**: Create a free account
3. **Get API Key**: 
   - Go to API Keys section
   - Click "Create New Key"
   - Copy your API key

### Step 2: Add API Key to Your Project

1. **Open your `.env` file**
2. **Edit the `.env` file and add your DeepSeek API key:**
```bash
VITE_DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
```
### Custom Base URL (Optional)
If you need to use a different endpoint:
```bash
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### Step 3: Test the AI Conversations

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open any note** in your app
3. **Click the AI assistant button** (chat icon)
4. **Start chatting!** You'll get real AI responses

## 🤖 What You'll Get

### Real AI Conversations:
- **Intelligent Analysis**: "Analyze the main themes in this note"
- **Smart Summaries**: "Give me a 3-sentence summary"
- **Writing Help**: "Improve the writing style of this paragraph"
- **Questions**: "Create 5 study questions from this content"
- **Explanations**: "Explain this concept in simple terms"

### Context-Aware Responses:
- **Reading Mode**: AI helps you understand and analyze content
- **Writing Mode**: AI helps you improve and expand your writing
- **Memory**: AI remembers your conversation for better context

## 🔧 Technical Details

- **Model**: DeepSeek Chat (latest version)
- **API**: https://api.deepseek.com/v1
- **Fallback**: If API fails, you still get helpful responses
- **Privacy**: Only your note content is sent for context

## ✅ Verification

Once you add your API key, you should see in the browser console:
```
AI Service initialized with DeepSeek API
```

If you see this message, your real AI conversations are ready!

## 🆘 Troubleshooting

- **No API Key**: App works with fallback responses
- **Invalid Key**: Check the key format and try again
- **API Errors**: Check console for error messages
- **No Response**: Verify internet connection and API status

---

**Note**: The app works perfectly even without an API key - you'll just get rule-based responses instead of AI-powered ones.
