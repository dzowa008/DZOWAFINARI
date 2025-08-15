// AI Service Configuration
export const AI_CONFIG = {
  // API Keys - these should be set in your environment variables
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Service URLs
  OPENROUTER_URL: 'https://openrouter.ai/api/v1',
  GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  
  // Site Configuration
  SITE_URL: import.meta.env.VITE_SITE_URL || window.location.origin,
  SITE_NAME: import.meta.env.VITE_SITE_NAME || 'SmaRta AI Notes',
  
  // Test Mode
  TEST_MODE: import.meta.env.VITE_AI_TEST_MODE === 'true',
  
  // Model Configuration
  MODELS: [
    'deepseek/deepseek-chat-v3-0324:free',
    'google/gemini-2.0-flash-exp:free',
    'qwen/qwen3-coder:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-2-9b-it:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'gryphe/mythomist-7b:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'liquid/lfm-40b:free'
  ],
  
  // Rate Limiting
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7
};

// Check if any AI service is available
export const hasAIService = () => {
  return !!(AI_CONFIG.OPENROUTER_API_KEY || AI_CONFIG.DEEPSEEK_API_KEY || AI_CONFIG.GEMINI_API_KEY);
};

// Get the best available API key
export const getBestAPIKey = () => {
  return AI_CONFIG.OPENROUTER_API_KEY || AI_CONFIG.DEEPSEEK_API_KEY || AI_CONFIG.GEMINI_API_KEY;
};
