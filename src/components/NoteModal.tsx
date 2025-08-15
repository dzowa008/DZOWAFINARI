import React from 'react';
import { X, Star, Edit3, Share2, Download, Copy } from 'lucide-react';
import { Note } from '../types';

interface NoteModalProps {
  note: Note;
  onClose: () => void;
  onToggleStar?: () => void;
}

function NoteModal({ note, onClose, onToggleStar }: NoteModalProps) {
  const handleCopyContent = () => {
    navigator.clipboard.writeText(note.content);
    // You could add a notification here
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.content,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">{note.title}</h3>
          <div className="flex items-center space-x-2">
            {onToggleStar && (
              <button
                onClick={onToggleStar}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Star className={`w-5 h-5 ${note.isStarred ? 'text-yellow-400 fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={handleCopyContent}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Copy content"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Share note"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
              {note.type}
            </span>
            <span className="text-gray-400 text-sm">{note.createdAt.toLocaleDateString()}</span>
            <span className="text-gray-400 text-sm">{note.category}</span>
          </div>
          {note.summary && (
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-2">AI Summary</h4>
              <p className="text-gray-300">{note.summary}</p>
            </div>
          )}
          {note.transcription && (
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-2">Transcription</h4>
              <p className="text-gray-300">{note.transcription}</p>
            </div>
          )}
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Content</h4>
            <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {note.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteModal;