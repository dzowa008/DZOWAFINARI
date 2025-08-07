import React, { useState } from 'react';
import { Star, Calendar, Tag, FileText, Mic, Camera, Upload, Search, Filter } from 'lucide-react';
import { Note } from '../types';

interface StarredNotesProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onToggleStar: (noteId: string) => void;
}

function StarredNotes({ notes, onNoteClick, onToggleStar }: StarredNotesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const starredNotes = notes.filter(note => note.isStarred);

  const filteredNotes = starredNotes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || note.type === filterType;
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Mic className="w-4 h-4 text-red-400" />;
      case 'video': return <Camera className="w-4 h-4 text-green-400" />;
      case 'image': return <Camera className="w-4 h-4 text-blue-400" />;
      case 'document': return <Upload className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Work: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Research: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Ideas: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Uploads: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Star className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Starred Notes</h2>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
            {starredNotes.length} starred
          </span>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search starred notes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Starred Notes List */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            {starredNotes.length === 0 ? (
              <>
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No starred notes yet</h3>
                <p className="text-gray-400">Star your important notes to find them quickly here</p>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => onNoteClick(note)}
                className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors border border-gray-700/50 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(note.type)}
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {note.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">{note.content}</p>

                    {note.summary && (
                      <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-purple-300 text-xs">
                          <strong>AI Summary:</strong> {note.summary}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{note.updatedAt.toLocaleDateString()}</span>
                        </span>
                        {note.tags.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{note.tags.slice(0, 2).join(', ')}</span>
                            {note.tags.length > 2 && (
                              <span className="text-gray-400">+{note.tags.length - 2}</span>
                            )}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(note.id);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {starredNotes.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Starred Notes Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {starredNotes.length}
              </div>
              <div className="text-sm text-gray-400">Total Starred</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {starredNotes.filter(n => n.type === 'text').length}
              </div>
              <div className="text-sm text-gray-400">Text Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {starredNotes.filter(n => n.type === 'audio').length}
              </div>
              <div className="text-sm text-gray-400">Audio Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {starredNotes.filter(n => n.type === 'document').length}
              </div>
              <div className="text-sm text-gray-400">Documents</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StarredNotes;