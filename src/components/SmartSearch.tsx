import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, Calendar, Tag, FileText, Mic, Camera, Upload, Brain, Zap } from 'lucide-react';
import { Note } from '../types';
import { aiService } from '../services/aiService';

interface SmartSearchProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onToggleStar: (noteId: string) => void;
}

function SmartSearch({ notes, onNoteClick, onToggleStar }: SmartSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    starred: false
  });
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filters, sortBy, notes]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      // Basic text filtering first
      let results = notes.filter(note => {
        const matchesQuery = searchQuery === '' || 
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (note.summary && note.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (note.transcription && note.transcription.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = filters.type === 'all' || note.type === filters.type;
        const matchesCategory = filters.category === 'all' || note.category === filters.category;
        const matchesStarred = !filters.starred || note.isStarred;

        return matchesQuery && matchesType && matchesCategory && matchesStarred;
      });

      // If we have results and a meaningful search query, enhance with AI
      if (searchQuery.trim().length > 3 && results.length > 0) {
        try {
          const enhancedResults = await aiService.enhanceSearch(searchQuery, results, filters);
          if (enhancedResults && enhancedResults.length > 0) {
            results = enhancedResults;
          }
        } catch (aiError) {
          console.warn('AI search enhancement failed, using basic results:', aiError);
          // Continue with basic results
        }
      }

      // Sort results
      if (sortBy === 'date') {
        results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      } else if (sortBy === 'title') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'relevance' && searchQuery.trim()) {
        // AI-enhanced relevance sorting
        results.sort((a, b) => {
          const aScore = calculateRelevanceScore(a, searchQuery);
          const bScore = calculateRelevanceScore(b, searchQuery);
          return bScore - aScore;
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRelevanceScore = (note: any, query: string) => {
    const queryLower = query.toLowerCase();
    let score = 0;
    
    // Title matches get highest score
    if (note.title.toLowerCase().includes(queryLower)) score += 10;
    
    // Content matches
    const contentMatches = (note.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 2;
    
    // Tag matches
    const tagMatches = note.tags.filter((tag: string) => tag.toLowerCase().includes(queryLower)).length;
    score += tagMatches * 5;
    
    // Summary matches
    if (note.summary && note.summary.toLowerCase().includes(queryLower)) score += 3;
    
    // Starred notes get bonus
    if (note.isStarred) score += 1;
    
    return score;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Mic className="w-4 h-4 text-red-400" />;
      case 'video': return <Camera className="w-4 h-4 text-green-400" />;
      case 'image': return <Camera className="w-4 h-4 text-blue-400" />;
      case 'document': return <Upload className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Smart Search</h2>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all your notes with AI..."
            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-lg"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Categories</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Research">Research</option>
            <option value="Ideas">Ideas</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>

          <label className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
            <input
              type="checkbox"
              checked={filters.starred}
              onChange={(e) => setFilters(prev => ({ ...prev, starred: e.target.checked }))}
              className="text-purple-600"
            />
            <span>Starred only</span>
          </label>
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            {searchQuery ? `Search Results (${searchResults.length})` : 'Start typing to search...'}
          </h3>
          {searchQuery && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Zap className="w-4 h-4" />
              <span>AI-powered search</span>
            </div>
          )}
        </div>

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No results found for "{searchQuery}"</p>
            <p className="text-sm mt-2">Try different keywords or adjust your filters</p>
          </div>
        )}

        <div className="space-y-3">
          {searchResults.map(note => (
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
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      {note.category}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-2">{note.content}</p>
                  {note.summary && (
                    <p className="text-gray-400 text-xs line-clamp-1 mb-2">
                      <strong>AI Summary:</strong> {note.summary}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{note.updatedAt.toLocaleDateString()}</span>
                    </span>
                    {note.tags.length > 0 && (
                      <span className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{note.tags.slice(0, 2).join(', ')}</span>
                      </span>
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
    </div>
  );
}

export default SmartSearch;