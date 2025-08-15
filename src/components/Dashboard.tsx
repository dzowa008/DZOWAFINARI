import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Calendar,
  Tag,
  FileText,
  Mic,
  Camera,
  Upload,
  MessageSquare,
  Settings,
  Download,
  TrendingUp,
  Brain,
  Zap,
  BookOpen,
  Youtube,
  BarChart3,
  Clock,
  Target,
  Lightbulb,
  Users,
  Globe,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Note, ChatMessage } from '../types';
import { speechToTextService } from '../services/speechToTextService';
import { FileProcessor } from '../utils/fileProcessor';
import { aiService } from '../services/aiService';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import StatsCards from './StatsCards';
import QuickActions from './QuickActions';
import CreateNoteModal from './CreateNoteModal';
import DocumentViewer from './DocumentViewer';
import NoteEditor from './NoteEditor';
import ChatInterface from './ChatInterface';
import AudioRecorder from './AudioRecorder';
import FileUpload from './FileUpload';
import SmartSearch from './SmartSearch';
import Categories from './Categories';
import StarredNotes from './StarredNotes';
import SettingsModal from './SettingsModal';
import AIQuiz from './AIQuiz';
import YoutubeSummarizer from './YoutubeSummarizer';
import Spinner from './spinner';

function Dashboard() {
  const { user, notes, saveNote, saveNotes, deleteNote, deleteNotes, signOut } = useAuth();
  const { theme } = useTheme();

  // Core state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Note creation state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [finalTranscription, setFinalTranscription] = useState('');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // File upload state
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  // Refs
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize dashboard
  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'n':
            e.preventDefault();
            setShowCreateModal(true);
            break;
          case '/':
            e.preventDefault();
            setActiveTab('search');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      // Initialize AI chat with welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Welcome to SmaRta AI Notes! I'm your intelligent assistant powered by advanced AI. I can help you:\n\n• Analyze and summarize your notes\n• Answer questions about your content\n• Provide writing assistance\n• Generate insights and suggestions\n\nHow can I help you today?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Note management functions
  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;

    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newNoteTitle,
      content: newNoteContent,
      type: 'text',
      tags: [],
      category: 'Personal',
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false
    };

    try {
      await saveNote(newNote);
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };

  const handleSaveNote = async (updatedNote: Note) => {
    try {
      await saveNote(updatedNote);
      setEditingNote(null);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
        setSelectedNote(null);
        setEditingNote(null);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleToggleStar = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      const updatedNote = { ...note, isStarred: !note.isStarred, updatedAt: new Date() };
      await saveNote(updatedNote);
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setRecordingTime(0);
      setCurrentTranscription('');
      setFinalTranscription('');

      // Start speech recognition if supported
      if (speechToTextService.isWebSpeechSupported()) {
        speechToTextService.startRealTimeTranscription(
          (text, isFinal) => {
            if (isFinal) {
              setFinalTranscription(prev => prev + ' ' + text);
              setCurrentTranscription('');
            } else {
              setCurrentTranscription(text);
            }
          },
          (error) => console.error('Speech recognition error:', error)
        );
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        speechToTextService.stopRealTimeTranscription();
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          await createAudioNote(audioBlob);
        }
      };

      recorder.start();
      setIsRecording(true);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const createAudioNote = async (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const transcription = finalTranscription.trim() || 'Audio recording (transcription not available)';
    
    const audioNote: Note = {
      id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Audio Note - ${new Date().toLocaleDateString()}`,
      content: transcription,
      type: 'audio',
      tags: ['audio', 'recording'],
      category: 'Personal',
      createdAt: new Date(),
      updatedAt: new Date(),
      transcription,
      audioUrl,
      duration: recordingTime,
      isStarred: false
    };

    try {
      await saveNote(audioNote);
    } catch (error) {
      console.error('Error saving audio note:', error);
    }
  };

  // File upload functions
  const handleFileUpload = async (files: FileList) => {
    setIsProcessingFiles(true);
    
    try {
      const processedNotes: Note[] = [];
      
      for (const file of Array.from(files)) {
        const processedFile = await FileProcessor.processFile(file);
        const extractedNotes = FileProcessor.createNotesFromProcessedFile(processedFile, 'Uploads');
        processedNotes.push(...extractedNotes);
      }
      
      if (processedNotes.length > 0) {
        await saveNotes(processedNotes);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // Chat functions
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsAiTyping(true);

    try {
      const conversationHistory = aiService.convertChatHistory(chatMessages);
      const response = await aiService.generateResponse(
        currentInput,
        notes.map(n => `${n.title}: ${n.content.substring(0, 200)}`).join('\n'),
        false,
        conversationHistory
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Export functions
  const handleExportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `smarta_notes_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter and search functions
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(notes.map(note => note.category)))];
  const audioNotes = notes.filter(note => note.type === 'audio');
  const starredNotes = notes.filter(note => note.isStarred);

  // Stats calculation
  const stats = {
    totalNotes: notes.length,
    audioNotes: notes.filter(n => n.type === 'audio').length,
    videoNotes: notes.filter(n => n.type === 'video').length,
    starredNotes: notes.filter(n => n.isStarred).length
  };

  // Recent activity
  const recentNotes = notes
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  if (isLoading) {
    return <Spinner variant="ai" message="Loading your AI-powered dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/10 dark:bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/5 dark:bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Sidebar - Fixed */}
      <div className="fixed left-0 top-0 h-screen z-30" style={{ width: isSidebarOpen ? '16rem' : '4rem' }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          categories={categories}
          onCreateNote={() => setShowCreateModal(true)}
          recentNotes={recentNotes}
        />
      </div>

      {/* Main Content Area with margin-left for sidebar */}
      <div
        className="flex-1 flex flex-col min-h-screen relative z-10"
        style={{ marginLeft: isSidebarOpen ? '16rem' : '4rem' }}
      >
        <Header
          activeTab={activeTab}
          filteredNotesCount={filteredNotes.length}
          onExport={handleExportNotes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSettingsClick={() => setShowSettingsModal(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            <AnimatePresence mode="wait">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Welcome Section */}
                  <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20 backdrop-blur-xl border border-purple-200/30 dark:border-purple-500/30 rounded-3xl p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                          Your AI-powered note-taking dashboard is ready. What would you like to create today?
                        </p>
                      </div>
                      <div className="hidden md:flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                          <Brain className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <StatsCards stats={stats} />

                  {/* Quick Actions */}
                  <QuickActions
                    onCreateNote={() => setShowCreateModal(true)}
                    onStartRecording={startRecording}
                    onFileUpload={() => setActiveTab('upload')}
                    onOpenChat={() => setActiveTab('chat')}
                    isRecording={isRecording}
                  />

                  {/* Recent Activity */}
                  <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('notes')}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    
                    {recentNotes.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes yet</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first note to get started</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Create Note
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentNotes.map(note => (
                          <div
                            key={note.id}
                            onClick={() => handleNoteClick(note)}
                            className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {note.type === 'text' && <FileText className="w-4 h-4 text-blue-500" />}
                                  {note.type === 'audio' && <Mic className="w-4 h-4 text-red-500" />}
                                  {note.type === 'video' && <Camera className="w-4 h-4 text-green-500" />}
                                  {note.type === 'document' && <Upload className="w-4 h-4 text-purple-500" />}
                                  <h4 className="font-medium text-gray-900 dark:text-white">{note.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {note.content.substring(0, 100)}...
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                  <span>{note.updatedAt.toLocaleDateString()}</span>
                                  <span>{note.category}</span>
                                  {note.tags.length > 0 && <span>{note.tags.slice(0, 2).join(', ')}</span>}
                                </div>
                              </div>
                              {note.isStarred && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Insights */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-xl border border-purple-200/30 dark:border-purple-500/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {Math.round((notes.filter(n => n.summary).length / Math.max(notes.length, 1)) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Notes with AI summaries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                          {notes.filter(n => n.type === 'audio' && n.transcription).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Transcribed recordings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Array.from(new Set(notes.flatMap(n => n.tags))).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Unique tags created</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Notes Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Notes</h2>
                      <p className="text-gray-600 dark:text-gray-400">{filteredNotes.length} notes found</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </option>
                        ))}
                      </select>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'grid'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'list'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes Grid/List */}
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-20">
                      <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notes found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchQuery ? 'Try adjusting your search terms' : 'Create your first note to get started'}
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                      >
                        Create Note
                      </button>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-4'
                    }>
                      {filteredNotes.map(note => (
                        <motion.div
                          key={note.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => handleNoteClick(note)}
                          className={`group relative p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-purple-300/50 dark:hover:border-purple-500/50 ${
                            viewMode === 'list' ? 'flex items-center space-x-4' : ''
                          }`}
                        >
                          {/* Note Type Icon */}
                          <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                              {note.type === 'text' && <FileText className="w-6 h-6 text-white" />}
                              {note.type === 'audio' && <Mic className="w-6 h-6 text-white" />}
                              {note.type === 'video' && <Camera className="w-6 h-6 text-white" />}
                              {note.type === 'document' && <Upload className="w-6 h-6 text-white" />}
                            </div>
                          </div>

                          {/* Note Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
                                {note.title}
                              </h3>
                              {note.isStarred && (
                                <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                              )}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                              {note.content}
                            </p>

                            {/* Tags */}
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {note.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {note.tags.length > 3 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    +{note.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{note.updatedAt.toLocaleDateString()}</span>
                              </span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {note.category}
                              </span>
                            </div>
                          </div>

                          {/* Hover Actions */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(note.id);
                              }}
                              className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg hover:scale-110 transition-transform"
                            >
                              <Star className={`w-4 h-4 ${note.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-[calc(100vh-200px)]"
                >
                  <ChatInterface
                    chatMessages={chatMessages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    onSendMessage={handleSendChatMessage}
                    isAiTyping={isAiTyping}
                  />
                </motion.div>
              )}

              {/* Audio Recorder Tab */}
              {activeTab === 'recorder' && (
                <motion.div
                  key="recorder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AudioRecorder
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    audioNotes={audioNotes}
                    onDeleteAudioNote={handleDeleteNote}
                    onEditAudioNote={handleSaveNote}
                    currentTranscription={currentTranscription}
                    finalTranscription={finalTranscription}
                    transcriptionSupported={speechToTextService.isWebSpeechSupported()}
                  />
                </motion.div>
              )}

              {/* File Upload Tab */}
              {activeTab === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    isProcessing={isProcessingFiles}
                  />
                </motion.div>
              )}

              {/* Smart Search Tab */}
              {activeTab === 'search' && (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SmartSearch
                    notes={notes}
                    onNoteClick={handleNoteClick}
                    onToggleStar={handleToggleStar}
                  />
                </motion.div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Categories
                    notes={notes}
                    onNoteClick={handleNoteClick}
                    onToggleStar={handleToggleStar}
                    onCreateCategory={(name) => console.log('Create category:', name)}
                    onDeleteCategory={(name) => console.log('Delete category:', name)}
                  />
                </motion.div>
              )}

              {/* Starred Notes Tab */}
              {activeTab === 'starred' && (
                <motion.div
                  key="starred"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <StarredNotes
                    notes={starredNotes}
                    onNoteClick={handleNoteClick}
                    onToggleStar={handleToggleStar}
                  />
                </motion.div>
              )}

              {/* AI Quiz Tab */}
              {activeTab === 'quiz' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AIQuiz />
                </motion.div>
              )}

              {/* YouTube Summarizer Tab */}
              {activeTab === 'youtube' && (
                <motion.div
                  key="youtube"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <YoutubeSummarizer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateNoteModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreateNote={handleCreateNote}
            title={newNoteTitle}
            setTitle={setNewNoteTitle}
            content={newNoteContent}
            setContent={setNewNoteContent}
          />
        )}

        {selectedNote && !editingNote && (
          <DocumentViewer
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onToggleStar={() => handleToggleStar(selectedNote.id)}
            onEdit={() => handleEditNote(selectedNote)}
            onSave={handleSaveNote}
          />
        )}

        {editingNote && (
          <NoteEditor
            note={editingNote}
            isOpen={!!editingNote}
            onClose={() => setEditingNote(null)}
            onSave={handleSaveNote}
            onDelete={() => handleDeleteNote(editingNote.id)}
          />
        )}

        {showSettingsModal && (
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onLogout={signOut}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </div>
  );
}

export default Dashboard;