import React from 'react';
import { PenTool, Mic, Upload, MessageSquare } from 'lucide-react';

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
      icon: PenTool,
      onClick: onCreateNote,
      colors: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-400',
      disabled: false
    },
    {
      title: 'Record Audio',
      icon: Mic,
      onClick: onStartRecording,
      colors: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400',
      disabled: isRecording
    },
    {
      title: 'Upload File',
      icon: Upload,
      onClick: onFileUpload,
      colors: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400',
      disabled: false
    },
    {
      title: 'Chat with AI',
      icon: MessageSquare,
      onClick: onOpenChat,
      colors: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400',
      disabled: false
    }
  ];

  return (
    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex flex-col items-center p-4 border rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${action.colors}`}
          >
            <action.icon className="w-8 h-8 mb-2" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;