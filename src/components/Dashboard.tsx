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
  Sparkles,
  Menu,
  X
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      // Escape key to close modals
      if (e.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (showSettingsModal) setShowSettingsModal(false);
        if (selectedNote) setSelectedNote(null);
        if (editingNote) setEditingNote(null);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateModal, showSettingsModal, selectedNote, editingNote, isMobileMenuOpen]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    try {
      // Initialize AI chat with welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Welcome to SmaRta AI Notes! 🚀\n\nI'm your intelligent assistant powered by advanced AI. I can help you:\n\n• 📝 Analyze and summarize your notes\n• ❓ Answer questions about your content\n• ✍️ Provide writing assistance\n• 💡 Generate insights and suggestions\n• 🧠 Create quizzes from your notes\n• 📹 Summarize YouTube videos\n\nHow can I help you today?`,
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
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setSelectedNote(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob-morph"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob-morph delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-blob-morph delay-2000"></div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold gradient-text">SmaRta</h1>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-80 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                isSidebarOpen={true}
                setIsSidebarOpen={setIsSidebarOpen}
                categories={categories}
                onCreateNote={() => {
                  setShowCreateModal(true);
                  setIsMobileMenuOpen(false);
                }}
                recentNotes={recentNotes}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <Header
              activeTab={activeTab}
              filteredNotesCount={filteredNotes.length}
              onExport={handleExportNotes}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSettingsClick={() => setShowSettingsModal(true)}
            />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pt-20 lg:pt-0">
            <div className="container-responsive space-premium">
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
                    {/* Welcome Hero Section */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="card-base card-interactive bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20 border-purple-200/30 dark:border-purple-500/30 p-8 rounded-premium-xl"
                    >
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="text-center lg:text-left">
                          <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="hierarchy-1 text-gray-900 dark:text-white mb-4"
                          >
                            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}! 👋
                          </motion.h1>
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-body text-gray-600 dark:text-gray-300 max-w-2xl"
                          >
                            Your AI-powered note-taking dashboard is ready. Create, organize, and interact with your notes using advanced AI capabilities.
                          </motion.p>
                        </div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                          className="hidden lg:flex items-center space-x-4"
                        >
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-premium shadow-glow flex items-center justify-center animate-pulse-glow">
                            <Brain className="w-12 h-12 text-white" />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <StatsCards stats={stats} />
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <QuickActions
                        onCreateNote={() => setShowCreateModal(true)}
                        onStartRecording={startRecording}
                        onFileUpload={() => setActiveTab('upload')}
                        onOpenChat={() => setActiveTab('chat')}
                        isRecording={isRecording}
                      />
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="card-base rounded-premium-xl"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="hierarchy-3 text-gray-900 dark:text-white">Recent Activity</h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('notes')}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                        >
                          View All →
                        </button>
                      </div>
                      
                      {recentNotes.length === 0 ? (
                        <div className="text-center py-16">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          </motion.div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes yet</h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first note to get started with AI-powered note-taking</p>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-base btn-primary hover-lift"
                          >
                            <Plus className="w-5 h-5" />
                            Create Your First Note
                          </button>
                        </div>
                      ) : (
                        <div className="grid-responsive">
                          {recentNotes.map((note, index) => (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => handleNoteClick(note)}
                              className="card-premium hover-lift cursor-pointer group"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    {note.type === 'text' && <FileText className="w-5 h-5 text-white" />}
                                    {note.type === 'audio' && <Mic className="w-5 h-5 text-white" />}
                                    {note.type === 'video' && <Camera className="w-5 h-5 text-white" />}
                                    {note.type === 'document' && <Upload className="w-5 h-5 text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                      {note.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {note.updatedAt.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                {note.isStarred && (
                                  <Star className="w-5 h-5 text-yellow-500 fill-current animate-pulse" />
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                                {note.content.substring(0, 120)}...
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                                  {note.category}
                                </span>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                  {note.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="flex items-center space-x-1">
                                      <Tag className="w-3 h-3" />
                                      <span>{tag}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* AI Insights Dashboard */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="card-base rounded-premium-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border-indigo-200/30 dark:border-indigo-500/30"
                    >
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center animate-neural-pulse">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="hierarchy-3 text-gray-900 dark:text-white">AI Insights</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                          <div className="text-3xl font-bold gradient-text mb-2">
                            {Math.round((notes.filter(n => n.summary).length / Math.max(notes.length, 1)) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Notes with AI summaries</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                          <div className="text-3xl font-bold gradient-text-secondary mb-2">
                            {notes.filter(n => n.type === 'audio' && n.transcription).length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Transcribed recordings</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                            {Array.from(new Set(notes.flatMap(n => n.tags))).length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Unique tags created</div>
                        </div>
                      </div>
                    </motion.div>
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
                    <div className="card-base rounded-premium-xl">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <h2 className="hierarchy-2 text-gray-900 dark:text-white">All Notes</h2>
                          <p className="text-gray-600 dark:text-gray-400">{filteredNotes.length} notes found</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="form-control"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                              </option>
                            ))}
                          </select>
                          
                          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                            <button
                              onClick={() => setViewMode('grid')}
                              className={`p-2 rounded-lg transition-all ${
                                viewMode === 'grid'
                                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              }`}
                            >
                              <Grid className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setViewMode('list')}
                              className={`p-2 rounded-lg transition-all ${
                                viewMode === 'list'
                                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              }`}
                            >
                              <List className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Grid/List */}
                    {filteredNotes.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-base rounded-premium-xl text-center py-20"
                      >
                        <Search className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-float" />
                        <h3 className="hierarchy-3 text-gray-900 dark:text-white mb-4">No notes found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                          {searchQuery ? 'Try adjusting your search terms or filters' : 'Create your first note to get started with AI-powered note-taking'}
                        </p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn-base btn-primary hover-lift"
                        >
                          <Plus className="w-5 h-5" />
                          Create Note
                        </button>
                      </motion.div>
                    ) : (
                      <div className={viewMode === 'grid' 
                        ? 'content-grid'
                        : 'space-y-4'
                      }>
                        {filteredNotes.map((note, index) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleNoteClick(note)}
                            className={`card-premium hover-lift cursor-pointer group ${
                              viewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'p-6'
                            }`}
                          >
                            {/* Note Type Icon */}
                            <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                {note.type === 'text' && <FileText className="w-6 h-6 text-white" />}
                                {note.type === 'audio' && <Mic className="w-6 h-6 text-white" />}
                                {note.type === 'video' && <Camera className="w-6 h-6 text-white" />}
                                {note.type === 'document' && <Upload className="w-6 h-6 text-white" />}
                              </div>
                            </div>

                            {/* Note Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {note.title}
                                </h3>
                                {note.isStarred && (
                                  <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 ml-2 animate-pulse" />
                                )}
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                                {note.content}
                              </p>

                              {/* Tags */}
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {note.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium"
                                    >
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                  {note.tags.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
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
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-medium">
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
                                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:scale-110 transition-transform"
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
                    className="h-[calc(100vh-200px)] lg:h-[calc(100vh-160px)]"
                  >
                    <div className="card-base rounded-premium-xl h-full">
                      <ChatInterface
                        chatMessages={chatMessages}
                        chatInput={chatInput}
                        setChatInput={setChatInput}
                        onSendMessage={handleSendChatMessage}
                        isAiTyping={isAiTyping}
                      />
                    </div>
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
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden mobile-nav">
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'dashboard', icon: TrendingUp, label: 'Home' },
            { id: 'notes', icon: FileText, label: 'Notes' },
            { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
            { id: 'recorder', icon: Mic, label: 'Record' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
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
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-premium hover:shadow-glow transition-all duration-300 flex items-center justify-center z-30 group"
      >
        <Plus className="w-6 h-6 lg:w-8 lg:h-8 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400/30 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-float delay-2000"></div>
      </div>
    </div>
  );
}

export default Dashboard;