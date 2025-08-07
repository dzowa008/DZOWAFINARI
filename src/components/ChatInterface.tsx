import React, { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  onSendMessage: () => void;
  isAiTyping?: boolean;
}

function ChatInterface({
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
  isAiTyping = false,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Handle Enter key to send or add new lines with Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.trim()) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-2xl border border-gray-800 shadow-lg overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-gray-800 flex items-center space-x-4 bg-gray-900/80 backdrop-blur-md">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
          <p className="text-gray-400 text-sm">Ask questions about your notes</p>
        </div>
      </header>

      {/* Messages container with z-index 2 and relative positioning */}
      <main
        className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-gray-800 relative z-20"
        aria-live="polite"
        aria-atomic="false"
      >
        {chatMessages.length === 0 ? (
          <div className="text-center py-20 select-none">
            <Bot className="w-20 h-20 text-purple-400 mx-auto mb-6" aria-hidden="true" />
            <h3 className="text-2xl font-semibold text-white mb-3">Start a conversation</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Ask me anything about your notes, or request summaries and insights.
            </p>
          </div>
        ) : (
          chatMessages.map(message => {
            const isUser = message.type === 'user';
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                aria-live={isUser ? undefined : 'polite'}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-md break-words whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-300 rounded-bl-none'
                  }`}
                  tabIndex={0}
                  aria-label={`${isUser ? 'You' : 'AI'}: ${message.content}`}
                >
                  <p className="mb-1">{message.content}</p>
                  <time
                    dateTime={message.timestamp.toISOString()}
                    className="text-xs opacity-60 select-none"
                    title={message.timestamp.toLocaleString()}
                  >
                    {message.timestamp.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* AI is typing indicator */}
      {isAiTyping && (
        <div
          className="flex justify-start p-4 bg-gray-900/80 border-t border-gray-800"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg py-2 px-4 max-w-[85%] flex items-center space-x-3 shadow-lg">
            <span className="flex space-x-1">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-400" />
            </span>
            <span className="text-sm text-gray-400 ml-2 select-none">AI is thinking...</span>
          </div>
        </div>
      )}

      {/* Input area */}
      <footer className="p-6 border-t border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (chatInput.trim()) {
              onSendMessage();
            }
          }}
          className="flex space-x-4"
          aria-label="Send message form"
        >
          <textarea
            rows={1}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your notes..."
            className="flex-1 resize-none rounded-lg bg-gray-800/70 border border-gray-700 text-white px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow shadow-inner"
            aria-label="Chat input"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            aria-disabled={!chatInput.trim()}
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default ChatInterface;
