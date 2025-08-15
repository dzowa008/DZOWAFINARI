import React, { useState } from 'react';
import {
  Folder, Plus, Edit3, Trash2, MoreVertical, FileText,
  Mic, Camera, Upload
} from 'lucide-react';
import { Note } from '../types';

interface CategoriesProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onToggleStar: (noteId: string) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
}

function Categories({
  notes,
  onNoteClick,
  onToggleStar,
  onCreateCategory,
  onDeleteCategory,
}: CategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);

  const categories = Array.from(new Set(notes.map(note => note.category)));

  const getCategoryStats = (category: string) => {
    const categoryNotes = notes.filter(note => note.category === category);
    return {
      total: categoryNotes.length,
      text: categoryNotes.filter(n => n.type === 'text').length,
      audio: categoryNotes.filter(n => n.type === 'audio').length,
      video: categoryNotes.filter(n => n.type === 'video').length,
      document: categoryNotes.filter(n => n.type === 'document').length,
      starred: categoryNotes.filter(n => n.isStarred).length,
    };
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCreatingCategory(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic className="w-4 h-4 text-red-400" />;
      case 'video':
        return <Camera className="w-4 h-4 text-green-400" />;
      case 'document':
        return <Upload className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Personal: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      Work: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      Research: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      Ideas: 'from-green-500/20 to-green-600/20 border-green-500/30',
      Uploads: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
    };
    return colors[category as keyof typeof colors] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Folder className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Categories</h2>
          </div>
          <button
            onClick={() => setIsCreatingCategory(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>

        {isCreatingCategory && (
          <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingCategory(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => {
            const stats = getCategoryStats(category);
            return (
              <div
                key={category}
                className={`relative p-4 bg-gradient-to-br ${getCategoryColor(category)} border rounded-xl hover:scale-105 transition-all duration-200 cursor-pointer`}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Folder className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">{category}</h3>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(showActions === category ? null : category);
                      }}
                      className="p-1 text-white/70 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showActions === category && (
                      <div className="absolute right-0 top-8 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(category);
                            setShowActions(null);
                          }}
                          className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 rounded-lg flex items-center space-x-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-white/90">
                    <span>Total Notes</span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>

                  {stats.starred > 0 && (
                    <div className="flex justify-between text-yellow-400">
                      <span>Starred</span>
                      <span className="font-semibold">{stats.starred}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center space-x-2 text-sm text-white/70">
                    {stats.text > 0 && (
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>{stats.text}</span>
                      </div>
                    )}
                    {stats.audio > 0 && (
                      <div className="flex items-center space-x-1">
                        <Mic className="w-3 h-3" />
                        <span>{stats.audio}</span>
                      </div>
                    )}
                    {stats.video > 0 && (
                      <div className="flex items-center space-x-1">
                        <Camera className="w-3 h-3" />
                        <span>{stats.video}</span>
                      </div>
                    )}
                    {stats.document > 0 && (
                      <div className="flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>{stats.document}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCategory && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Notes in "{selectedCategory}" ({notes.filter(n => n.category === selectedCategory).length})
          </h3>

          <div className="space-y-3">
            {notes
              .filter(note => note.category === selectedCategory)
              .map(note => (
                <div
                  key={note.id}
                  onClick={() => onNoteClick(note)}
                  className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors border border-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(note.type)}
                        <h4 className="font-semibold text-white">{note.title}</h4>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-2">{note.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {/* ✅ Safe updatedAt rendering */}
                        <span>
                          {note.updatedAt
                            ? new Date(note.updatedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        {note.tags.length > 0 && (
                          <span>{note.tags.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(note.id);
                      }}
                      className={`ml-4 ${note.isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                    >
                      <svg className={`w-5 h-5 ${note.isStarred ? 'fill-current' : ''}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
