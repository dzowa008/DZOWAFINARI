export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'audio' | 'video' | 'image' | 'document';
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
  transcription?: string;
  isStarred: boolean;
  audioUrl?: string; // URL for recorded audio playback
  duration?: number; // duration in seconds for audio notes
  fileUrl?: string; // URL for preview/download of uploaded files
  sourceFile?: string; // Original filename for extracted notes
  extractedFrom?: string; // Description of extraction source
  pinned?: boolean; // For pinning important notes
  metadata?: Record<string, any>; // Additional metadata
  timestamp?: Date; // Legacy support
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}