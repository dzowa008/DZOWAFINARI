# AI Integration Setup - OpenRouter with DeepSeek Chat V3

This document explains how to set up the AI assistant functionality in DzowaAI Notes using OpenRouter to access the DeepSeek Chat V3 model.

## 🤖 AI Model Configuration

The app is configured to use:
- **Model**: `deepseek/deepseek-chat-v3-0324:free`
- **Provider**: OpenRouter API (unified access to multiple AI models)
- **Endpoint**: `https://openrouter.ai/api/v1`
- **Fallback**: Built-in rule-based responses when API is unavailable

## 🔧 Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter Platform](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

**Why OpenRouter?**
- Unified access to multiple AI models including DeepSeek
- Better rate limiting and reliability
- Easy model switching without code changes
- Competitive pricing and free tier options

### 2. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API key:
   ```env
   VITE_OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
   ```

### 3. Restart Development Server

After adding the API key, restart your development server:
```bash
npm run dev
```

## 🎯 AI Features

### Document Viewing Mode
- **Summarize**: Get concise summaries of note content
- **Explain**: Clarify complex concepts and terminology
- **Key Points**: Extract main ideas and highlights
- **Questions**: Generate study questions and quizzes
- **Analysis**: Deep dive into note content

### Document Editing Mode
- **Improve**: Get writing enhancement suggestions
- **Rewrite**: Help with rephrasing and restructuring
- **Expand**: Ideas for adding more detail and context
- **Structure**: Organization and formatting tips
- **Grammar**: Writing quality and style checks

## 🔄 Fallback Behavior

If the API key is not configured or the API is unavailable:
- The AI assistant will still function
- Responses will use built-in rule-based logic
- Users will see helpful suggestions and prompts
- No functionality is lost, just less dynamic responses

## 🛠️ Technical Implementation

### AI Service (`src/services/aiService.ts`)
- Handles DeepSeek API communication
- Manages conversation history
- Provides intelligent fallback responses
- Converts between chat formats

### Integration Points
- **DocumentViewer**: Main AI assistant interface
- **Chat Interface**: Real-time conversation with context
- **Context Awareness**: Knows if user is reading or editing
- **Error Handling**: Graceful degradation when API fails

## 🔒 Security Notes

- API keys are loaded from environment variables
- Keys are not exposed in client-side code
- Fallback ensures app works without API access
- No sensitive data is sent to external APIs beyond note content

## 📊 API Usage

The DeepSeek integration:
- Uses the free tier model
- Sends conversation context for better responses
- Limits response length to 500 tokens
- Uses temperature 0.7 for balanced creativity

## 🚀 Benefits

1. **Intelligent Assistance**: Context-aware help for reading and writing
2. **Seamless Experience**: Works with or without API key
3. **Privacy Focused**: Only sends necessary context
4. **Cost Effective**: Uses free tier model
5. **Enhanced Productivity**: AI-powered note analysis and improvement

## 🔧 Troubleshooting

### API Key Issues
- Ensure `.env` file is in project root
- Check API key format and validity
- Restart development server after changes

### API Errors
- Check console for error messages
- Verify internet connection
- Confirm DeepSeek API status
- Fallback responses will still work

### Response Quality
- Provide clear, specific questions
- Include context in your requests
- Use conversation history for better results
- Try different phrasings for better responses

---

The AI integration enhances the note-taking experience while maintaining full functionality even when the API is unavailable.
