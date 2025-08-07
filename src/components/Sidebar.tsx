import React, { useState } from 'react';
import { Bot, TrendingUp, FileText, MessageSquare, Mic, Upload, Search, Folder, Star, Menu, Plus, Edit3, BookOpen, Youtube, Download, Link, Brain } from 'lucide-react';
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
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'notes', label: 'All Notes', icon: FileText },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'quiz', label: 'AI Quiz', icon: Brain },
  { id: 'youtube', label: 'YouTube Summarizer', icon: Youtube },
  { id: 'recorder', label: 'Audio Recorder', icon: Mic },
  { id: 'upload', label: 'Upload Files', icon: Upload },
  { id: 'search', label: 'Smart Search', icon: Search },
  { id: 'categories', label: 'Categories', icon: Folder },
  { id: 'starred', label: 'Starred', icon: Star },
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

  return (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} h-screen bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col`}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SmaRta
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Notes Dashboard</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Make nav scrollable, flex-1 ensures it fills available space */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {/* Quick Actions */}
        {isSidebarOpen && onCreateNote && (
          <div className="mb-6">
            <button
              onClick={onCreateNote}
              className="w-full flex items-center space-x-3 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </div>
        
        {/* Recent Notes */}
        {isSidebarOpen && recentNotes.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">Recent Notes</h4>
            <div className="space-y-1">
              {recentNotes.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer text-sm group"
                >
                  <div className="flex items-center space-x-2">
                    {note.type === 'text' && <Edit3 className="w-3 h-3" />}
                    {note.type === 'audio' && <Mic className="w-3 h-3" />}
                    {note.type === 'document' && <BookOpen className="w-3 h-3" />}
                    <span className="truncate">{note.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                    {note.content.substring(0, 30)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories with drag and drop */}
        {isSidebarOpen && categories.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">Categories</h4>
            <div className="space-y-1">
              {categories.filter(cat => cat !== 'all').map((category) => (
                <div
                  key={category}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop?.(e, category)}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  <Folder className="w-4 h-4 inline mr-2" />
                  {category}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;