import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Mic, Upload, MessageSquare, Sparkles, Zap, Brain, FileText } from 'lucide-react';

interface QuickActionsProps {
  onCreateNote: () => void;
  onStartRecording: () => void;
  onFileUpload: () => void;
  onOpenChat: () => void;
  isRecording: boolean;
}

function QuickActions({ onCreateNote, onStartRecording, onFileUpload, onOpenChat, isRecording }: QuickActionsProps) {
  const actions = [
    {
      title: 'New Note',
      description: 'Create with AI assistance',
      icon: PenTool,
      onClick: onCreateNote,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderGradient: 'border-purple-500/30',
      disabled: false,
      pulse: false
    },
    {
      title: 'Record Audio',
      description: isRecording ? 'Recording in progress...' : 'Voice to text magic',
      icon: Mic,
      onClick: onStartRecording,
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-500/10 to-pink-500/10',
      borderGradient: 'border-red-500/30',
      disabled: isRecording,
      pulse: isRecording
    },
    {
      title: 'Upload Files',
      description: 'AI document processing',
      icon: Upload,
      onClick: onFileUpload,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      borderGradient: 'border-blue-500/30',
      disabled: false,
      pulse: false
    },
    {
      title: 'Chat with AI',
      description: 'Intelligent conversations',
      icon: MessageSquare,
      onClick: onOpenChat,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderGradient: 'border-green-500/30',
      disabled: false,
      pulse: false
    }
  ];

  return (
    <div className="card-base rounded-premium-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center animate-pulse-glow">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="hierarchy-3 text-gray-900 dark:text-white">Quick Actions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Start creating with AI power</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`relative group flex flex-col items-center p-6 bg-gradient-to-br ${action.bgGradient} border ${action.borderGradient} rounded-premium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
              action.pulse ? 'animate-pulse-glow' : ''
            }`}
          >
            {/* Background Animation */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Icon Container */}
            <motion.div
              className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}
              whileHover={{ rotate: 5 }}
            >
              <action.icon className="w-7 h-7 text-white" />
              
              {/* Sparkle Effect */}
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="text-center relative z-10">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {action.description}
              </p>
            </div>

            {/* Recording Indicator */}
            {action.pulse && (
              <motion.div
                className="absolute inset-0 border-2 border-red-500 rounded-premium"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`}></div>
          </motion.button>
        ))}
      </div>

      {/* AI Features Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200/30 dark:border-indigo-500/30 rounded-xl"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">AI-Powered Features</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Smart transcription</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
            <span>Auto summarization</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300"></div>
            <span>Intelligent search</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-500"></div>
            <span>Content analysis</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default StatsCards;