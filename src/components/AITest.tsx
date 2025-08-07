import React, { useState } from 'react';
import { aiService } from '../services/aiService';

const AITest: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAI = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      console.log('🧪 Testing AI with input:', input);
      
      const result = await aiService.generateResponse(
        input,
        'Test note content for AI integration testing',
        false,
        []
      );
      
      console.log('🧪 AI Response:', result);
      setResponse(result.content);
      
      if (result.error) {
        setError(`Warning: ${result.error}`);
      }
    } catch (err) {
      console.error('🧪 AI Test Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl">
      <h3 className="text-xl font-bold text-white mb-4">🧪 AI Integration Test</h3>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a test message for AI..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && testAI()}
          />
        </div>
        
        <button
          onClick={testAI}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {loading ? '🤖 Testing AI...' : '🚀 Test AI'}
        </button>
        {/* AI is thinking indicator */}
        {loading && (
          <div className="flex justify-start mb-2 mt-4">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 max-w-[85%] flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <span className="text-sm text-gray-400 ml-2">AI is thinking...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300">
            ⚠️ {error}
          </div>
        )}
        
        {response && (
          <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
            <strong>✅ AI Response:</strong>
            <div className="mt-2 whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITest;
