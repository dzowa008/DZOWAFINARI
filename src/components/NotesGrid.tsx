import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Star, Calendar, Tag, MoreVertical, Edit, Trash2, Archive, Share } from 'lucide-react';
import { Note } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface NotesGridProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onToggleStar: (noteId: string) => void;
  searchQuery?: string;
  selectedCategory?: string;
  setSearchQuery?: (query: string) => void;
  setSelectedCategory?: (category: string) => void;
  categories?: string[];
  viewMode?: 'grid' | 'list';
  setViewMode?: (mode: 'grid' | 'list') => void;
  onDragStart?: (e: React.DragEvent, note: Note) => void;
  onBulkDelete?: (noteIds: string[]) => void;
}

export const NotesGrid: React.FC<NotesGridProps> = ({
  notes,
  onNoteClick,
  onToggleStar,
  searchQuery = '',
  selectedCategory = 'all',
  setSearchQuery,
  setSelectedCategory,
  categories = [],
  viewMode: propViewMode,
  setViewMode: propSetViewMode,
  onDragStart,
  onBulkDelete
}) => {
  const { theme } = useTheme();
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);

  // Use prop viewMode if provided, otherwise use local state
  const viewMode = propViewMode || localViewMode;
  const setViewMode = propSetViewMode || setLocalViewMode;

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || note.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, selectedCategory]);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleStarToggle = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar(note.id);
  };

  const handleNoteAction = (action: string, noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(null);
    
    switch (action) {
      case 'edit':
        const note = notes.find(n => n.id === noteId);
        if (note) onNoteClick(note);
        break;
      case 'delete':
        if (onBulkDelete) onBulkDelete([noteId]);
        break;
      case 'archive':
        // Archive functionality would need to be implemented
        console.log('Archive note:', noteId);
        break;
      case 'share':
        console.log('Share note:', noteId);
        break;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      work: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      ideas: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      research: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      uploads: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colors[category as keyof typeof colors] || colors.personal;
  };

  if (filteredNotes.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <Search className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No notes found</p>
        <p className="text-sm">Try adjusting your search or create a new note</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {filteredNotes.length} notes
          </span>
          {selectedNotes.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {selectedNotes.length} selected
              </span>
              <button 
                onClick={() => {
                  if (onBulkDelete) onBulkDelete(selectedNotes);
                  setSelectedNotes([]);
                }}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? theme === 'dark' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-600'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? theme === 'dark' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-600'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onNoteClick(note)}
              className={`group relative p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedNotes.includes(note.id)
                  ? theme === 'dark'
                    ? 'bg-purple-900/20 border-purple-500'
                    : 'bg-purple-50 border-purple-300'
                  : theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={selectedNotes.includes(note.id)}
                  onChange={() => handleNoteSelect(note.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>

              {/* Actions Menu */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(showActions === note.id ? null : note.id);
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showActions === note.id && (
                    <div className={`absolute right-0 top-8 w-48 py-2 rounded-lg shadow-lg border z-10 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNoteClick(note);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => handleNoteAction('share', note.id, e)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Share className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={(e) => handleNoteAction('archive', note.id, e)}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archive</span>
                      </button>
                      <button
                        onClick={(e) => handleNoteAction('delete', note.id, e)}
                        className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Star Button */}
              <button
                onClick={(e) => handleStarToggle(note, e)}
                className={`absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-all ${
                  note.isStarred ? 'opacity-100 text-yellow-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <Star className={`w-4 h-4 ${note.isStarred ? 'fill-current' : ''}`} />
              </button>

              {/* Note Content */}
              <div className="mt-8">
                <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {note.title}
                </h3>
                
                <p className={`text-sm mb-4 line-clamp-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {note.content}
                </p>

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getCategoryColor(note.category)}`}>
                    {note.category}
                  </span>
                  
                  <div className={`flex items-center text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onNoteClick(note)}
              className={`group flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                selectedNotes.includes(note.id)
                  ? theme === 'dark'
                    ? 'bg-purple-900/20 border-purple-500'
                    : 'bg-purple-50 border-purple-300'
                  : theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Selection Checkbox */}
              <input
                type="checkbox"
                checked={selectedNotes.includes(note.id)}
                onChange={() => handleNoteSelect(note.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mr-4"
              />

              {/* Star */}
              <button
                onClick={(e) => handleStarToggle(note, e)}
                className={`mr-4 transition-colors ${
                  note.isStarred ? 'text-yellow-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <Star className={`w-4 h-4 ${note.isStarred ? 'fill-current' : ''}`} />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-4 ml-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getCategoryColor(note.category)}`}>
                      {note.category}
                    </span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm mt-1 truncate ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {note.content}
                </p>
              </div>

              {/* Actions */}
              <div className="relative ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(showActions === note.id ? null : note.id);
                  }}
                  className={`p-1 rounded-md transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};