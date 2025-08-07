import React from 'react';
import { Bell, Settings, User, Download, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  activeTab: string;
  filteredNotesCount: number;
  onExport?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSettingsClick?: () => void;
}

function Header({ activeTab, filteredNotesCount, onExport, searchQuery = '', onSearchChange, onSettingsClick }: HeaderProps) {
  const { theme } = useTheme();

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview of your AI-powered notes';
      case 'notes':
        return `${filteredNotesCount} notes found`;
      case 'chat':
        return 'Conversation with your AI assistant';
      case 'recorder':
        return 'Record and transcribe audio notes';
      default:
        return 'AI-powered note management';
    }
  };

  return (
    <header className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
          <p className="text-gray-600 dark:text-gray-400">{getSubtitle()}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Global search */}
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                id="search-input"
                type="text"
                placeholder="Search all notes... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>
          )}
          
          {onExport && (
            <button 
              onClick={onExport}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Export Notes"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={onSettingsClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;