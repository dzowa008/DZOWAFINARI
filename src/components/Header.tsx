import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  User, 
  Download, 
  Search, 
  Filter,
  Sparkles,
  Brain,
  Zap,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  activeTab: string;
  filteredNotesCount: number;
  onExport?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSettingsClick?: () => void;
}

function Header({ 
  activeTab, 
  filteredNotesCount, 
  onExport, 
  searchQuery = '', 
  onSearchChange, 
  onSettingsClick 
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const getTabInfo = () => {
    const tabConfig = {
      dashboard: {
        title: 'Dashboard',
        subtitle: 'AI-powered overview of your notes',
        icon: Brain,
        gradient: 'from-blue-500 to-cyan-500'
      },
      notes: {
        title: 'All Notes',
        subtitle: `${filteredNotesCount} notes in your collection`,
        icon: Brain,
        gradient: 'from-purple-500 to-pink-500'
      },
      chat: {
        title: 'AI Assistant',
        subtitle: 'Intelligent conversation with your notes',
        icon: Brain,
        gradient: 'from-green-500 to-emerald-500'
      },
      recorder: {
        title: 'Audio Recorder',
        subtitle: 'Record and transcribe with AI',
        icon: Brain,
        gradient: 'from-indigo-500 to-purple-500'
      },
      upload: {
        title: 'File Processor',
        subtitle: 'AI-powered document analysis',
        icon: Brain,
        gradient: 'from-teal-500 to-blue-500'
      },
      search: {
        title: 'Smart Search',
        subtitle: 'AI-enhanced content discovery',
        icon: Brain,
        gradient: 'from-yellow-500 to-orange-500'
      },
      quiz: {
        title: 'AI Quiz Generator',
        subtitle: 'Create intelligent quizzes',
        icon: Brain,
        gradient: 'from-orange-500 to-red-500'
      },
      youtube: {
        title: 'YouTube Summarizer',
        subtitle: 'AI video content extraction',
        icon: Brain,
        gradient: 'from-red-500 to-pink-500'
      },
      categories: {
        title: 'Categories',
        subtitle: 'Organize your knowledge',
        icon: Brain,
        gradient: 'from-pink-500 to-rose-500'
      },
      starred: {
        title: 'Starred Notes',
        subtitle: 'Your most important content',
        icon: Brain,
        gradient: 'from-amber-500 to-yellow-500'
      }
    };

    return tabConfig[activeTab as keyof typeof tabConfig] || tabConfig.dashboard;
  };

  const currentTab = getTabInfo();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 relative z-10"
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Tab Info */}
        <motion.div 
          className="flex items-center space-x-4"
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`w-12 h-12 bg-gradient-to-br ${currentTab.gradient} rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow`}>
            <currentTab.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="hierarchy-2 text-gray-900 dark:text-white">{currentTab.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{currentTab.subtitle}</p>
          </div>
        </motion.div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-4">
          {/* Global Search */}
          {onSearchChange && (
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
            >
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                isSearchFocused ? 'text-purple-500' : 'text-gray-400'
              }`} />
              <input
                id="search-input"
                type="text"
                placeholder="Search everything... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`pl-11 pr-4 py-3 w-80 form-premium focus-premium transition-all duration-300 ${
                  isSearchFocused ? 'w-96' : ''
                }`}
              />
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{searchQuery.length}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Export Button */}
            {onExport && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onExport}
                className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                title="Export Notes"
              >
                <Download className="w-5 h-5" />
              </motion.button>
            )}
            
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSettingsClick}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-full left-6 mt-2 flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium border border-green-500/30"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>AI Services Online</span>
        <Sparkles className="w-3 h-3" />
      </motion.div>
    </motion.header>
  );
}

export default Header;