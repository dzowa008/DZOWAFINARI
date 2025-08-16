import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Mic, 
  Upload, 
  Search, 
  Folder, 
  Star, 
  Menu, 
  Plus, 
  Edit3, 
  BookOpen, 
  Youtube, 
  Download, 
  Link, 
  Brain,
  Sparkles,
  Zap,
  Clock,
  Tag,
  Settings,
  User
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, category: string) => void;
  categories?: string[];
  onCreateNote?: () => void;
  recentNotes?: any[];
  onYoutubeNote?: (summary: any) => void;
}

const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: TrendingUp, 
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Overview & insights'
  },
  { 
    id: 'notes', 
    label: 'All Notes', 
    icon: FileText, 
    gradient: 'from-purple-500 to-pink-500',
    description: 'Your note collection'
  },
  { 
    id: 'chat', 
    label: 'AI Chat', 
    icon: MessageSquare, 
    gradient: 'from-green-500 to-emerald-500',
    description: 'Chat with AI assistant'
  },
  { 
    id: 'quiz', 
    label: 'AI Quiz', 
    icon: Brain, 
    gradient: 'from-orange-500 to-red-500',
    description: 'Generate smart quizzes'
  },
  { 
    id: 'youtube', 
    label: 'YouTube Summarizer', 
    icon: Youtube, 
    gradient: 'from-red-500 to-pink-500',
    description: 'Summarize videos'
  },
  { 
    id: 'recorder', 
    label: 'Audio Recorder', 
    icon: Mic, 
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Record & transcribe'
  },
  { 
    id: 'upload', 
    label: 'Upload Files', 
    icon: Upload, 
    gradient: 'from-teal-500 to-blue-500',
    description: 'Process documents'
  },
  { 
    id: 'search', 
    label: 'Smart Search', 
    icon: Search, 
    gradient: 'from-yellow-500 to-orange-500',
    description: 'AI-powered search'
  },
  { 
    id: 'categories', 
    label: 'Categories', 
    icon: Folder, 
    gradient: 'from-pink-500 to-rose-500',
    description: 'Organize by category'
  },
  { 
    id: 'starred', 
    label: 'Starred', 
    icon: Star, 
    gradient: 'from-amber-500 to-yellow-500',
    description: 'Your favorites'
  },
];

function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  onDragOver, 
  onDrop, 
  categories = [],
  onCreateNote,
  recentNotes = []
}: SidebarProps) {
  const { theme } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`${
        isSidebarOpen ? 'w-72' : 'w-20'
      } h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 flex flex-col relative z-20`}
    >
      {/* Premium Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur opacity-30 animate-pulse"></div>
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-2xl font-bold gradient-text">SmaRta</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">AI Notes Dashboard</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
        {/* Quick Create Button */}
        <AnimatePresence>
          {isSidebarOpen && onCreateNote && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={onCreateNote}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mb-6"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Create New Note</span>
              <Sparkles className="w-4 h-4 ml-auto animate-pulse" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navigationItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/30 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }`}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />
              
              {/* Icon */}
              <div className={`relative z-10 w-6 h-6 flex items-center justify-center ${
                activeTab === item.id ? 'text-purple-600 dark:text-purple-400' : ''
              }`}>
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </div>
              
              {/* Label and Description */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 text-left relative z-10"
                  >
                    <div className="font-medium">{item.label}</div>
                    {hoveredItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                      >
                        {item.description}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Indicator */}
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute right-2 w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Recent Notes Section */}
        <AnimatePresence>
          {isSidebarOpen && recentNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <div className="flex items-center space-x-2 px-4 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Notes
                </h4>
              </div>
              <div className="space-y-2">
                {recentNotes.slice(0, 3).map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveTab('notes')}
                    className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {note.type === 'text' && <Edit3 className="w-4 h-4 text-white" />}
                        {note.type === 'audio' && <Mic className="w-4 h-4 text-white" />}
                        {note.type === 'document' && <BookOpen className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {note.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                          {note.content.substring(0, 40)}...
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Section */}
        <AnimatePresence>
          {isSidebarOpen && categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <div className="flex items-center space-x-2 px-4 mb-4">
                <Folder className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categories
                </h4>
              </div>
              <div className="space-y-1">
                {categories.filter(cat => cat !== 'all').slice(0, 5).map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop?.(e, category)}
                    onClick={() => setActiveTab('categories')}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 cursor-pointer group flex items-center space-x-2"
                  >
                    <Folder className="w-4 h-4 group-hover:text-purple-500 transition-colors" />
                    <span className="font-medium">{category}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    User Account
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Premium Plan
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Collapse/Expand Animation */}
      <motion.div
        className="absolute -right-3 top-1/2 transform -translate-y-1/2"
        whileHover={{ scale: 1.1 }}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </button>
      </motion.div>
    </motion.div>
  );
}

export default Sidebar;