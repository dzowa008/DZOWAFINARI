import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  X, Star, Edit3, Download, Copy, ZoomIn, ZoomOut, FileText,
  Calendar, Tag, MessageCircle, Send, Bot, Minimize2,
  Maximize2, Save
} from 'lucide-react';
import { Note, ChatMessage } from '../types';
import { generateNotePDF } from '../utils/pdfGenerator';
import { aiService } from '../services/aiService';

interface DocumentViewerProps {
  note: Note;
  onClose: () => void;
  onToggleStar?: () => void;
  onEdit?: () => void;
  onSave?: (updatedNote: Note) => void;
}

function DocumentViewer({ note, onClose, onToggleStar, onEdit, onSave }: DocumentViewerProps) {
  const [fontSize, setFontSize] = useState(16);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiMinimized, setAiMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  // Text-to-speech state
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  // PDF upload & display
  const [uploadedPDF, setUploadedPDF] = useState<File|null>(null);
  const [pdfData, setPdfData] = useState<string|ArrayBuffer|null>(null);
  const [numPages, setNumPages] = useState<number|null>(null);
  const [pdfPage, setPdfPage] = useState<number>(1);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  }, []);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const handleReadAloud = () => {
    if (!isReading) {
      if (synthRef.current) synthRef.current.cancel();
      const utterance = new window.SpeechSynthesisUtterance(note.content);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      utteranceRef.current = utterance;
      setIsReading(true);
      setIsPaused(false);
      synthRef.current?.speak(utterance);
    } else {
      // Stop reading
      synthRef.current?.cancel();
      setIsReading(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isReading && !isPaused) {
      synthRef.current?.pause();
      setIsPaused(true);
    }
  };
  const handleResume = () => {
    if (isReading && isPaused) {
      synthRef.current?.resume();
      setIsPaused(false);
    }
  };
  const handleStop = () => {
    synthRef.current?.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(note.content);
  };

  const handleDownloadPDF = () => {
    generateNotePDF(note);
  };

  const handleSave = () => {
    if (onSave) {
      const updatedNote: Note = {
        ...note,
        title: editedTitle,
        content: editedContent,
        updatedAt: new Date()
      };
      onSave(updatedNote);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(false);
  };

  const toggleEditMode = () => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      setIsEditing(true);
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      type: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsAiTyping(true);

    try {
      // Convert chat history for AI service
      const conversationHistory = aiService.convertChatHistory(chatMessages);
      
      // Get AI response using DeepSeek model
      const response = await aiService.generateResponse(
        currentInput,
        isEditing ? editedContent : note.content,
        isEditing,
        conversationHistory
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: 'ai',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Show error if API failed but fallback was used
      if (response.error) {
        console.warn('AI API error, using fallback:', response.error);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '🚫 Sorry, I\'m having trouble responding right now. Please try again in a moment.',
        type: 'ai',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Add this helper to get the last AI message
  const getLastAIMessage = () => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].type === 'ai') return chatMessages[i];
    }
    return null;
  };

  // Handler to apply AI suggestion to note content
  const handleApplyAISuggestion = () => {
    const lastAI = getLastAIMessage();
    if (!lastAI) return;
    let content = lastAI.content.trim();
    // Check if content is already organized (headers, lists)
    const hasStructure = /(^#|^\d+\.|^- |\* )/m.test(content);
    if (!hasStructure) {
      // Try to split into lines and make a list
      const lines = content.split(/\n+/).map(l => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        content = '## AI Suggestions\n' + lines.map(line => `- ${line}`).join('\n');
      } else {
        content = '## AI Suggestions\n' + content;
      }
    }
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const formattedElements: JSX.Element[] = [];
    let currentList: JSX.Element[] = [];
    let listType: 'bullet' | 'number' | null = null;

    const flushList = () => {
      if (currentList.length > 0) {
        const ListComponent = listType === 'number' ? 'ol' : 'ul';
        const listClass = listType === 'number' 
          ? 'list-decimal list-inside space-y-2 mb-4 ml-4 text-gray-700 dark:text-gray-300'
          : 'list-disc list-inside space-y-2 mb-4 ml-4 text-gray-700 dark:text-gray-300';
        
        formattedElements.push(
          <ListComponent key={`list-${formattedElements.length}`} className={listClass}>
            {currentList}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Headers with enhanced styling
      if (line.startsWith('# ')) {
        flushList();
        formattedElements.push(
          <h1 key={index} className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-8 pb-2 border-b-2 border-purple-500">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        formattedElements.push(
          <h2 key={index} className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6 pb-1 border-b border-gray-300 dark:border-gray-600">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        formattedElements.push(
          <h3 key={index} className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-3 mt-5">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        flushList();
        formattedElements.push(
          <h4 key={index} className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2 mt-4">
            {line.substring(5)}
          </h4>
        );
      }
      // Enhanced bullet points
      else if (line.startsWith('- ') || line.startsWith('• ')) {
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        currentList.push(
          <li key={index} className="leading-relaxed">
            {formatInlineContent(line.substring(2))}
          </li>
        );
      }
      // Numbered lists
      else if (/^\d+\. /.test(line)) {
        if (listType !== 'number') {
          flushList();
          listType = 'number';
        }
        currentList.push(
          <li key={index} className="leading-relaxed">
            {formatInlineContent(line.replace(/^\d+\. /, ''))}
          </li>
        );
      }
      // Code blocks
      else if (line.startsWith('```')) {
        flushList();
        formattedElements.push(
          <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 font-mono text-sm overflow-x-auto">
            <code className="text-gray-800 dark:text-gray-200">{line.substring(3)}</code>
          </div>
        );
      }
      // Inline code
      else if (line.includes('`') && line.split('`').length > 2) {
        flushList();
        formattedElements.push(
          <p key={index} className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            {formatInlineContent(line)}
          </p>
        );
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        flushList();
        formattedElements.push(
          <blockquote key={index} className="border-l-4 border-purple-500 pl-4 py-2 mb-4 bg-gray-50 dark:bg-gray-800/50 italic text-gray-600 dark:text-gray-400">
            {line.substring(2)}
          </blockquote>
        );
      }
      // Horizontal rules
      else if (trimmedLine === '---' || trimmedLine === '***') {
        flushList();
        formattedElements.push(
          <hr key={index} className="my-6 border-gray-300 dark:border-gray-600" />
        );
      }
      // Empty lines
      else if (trimmedLine === '') {
        flushList();
        formattedElements.push(<div key={index} className="mb-3" />);
      }
      // Regular paragraphs
      else {
        flushList();
        formattedElements.push(
          <p key={index} className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
            {formatInlineContent(line)}
          </p>
        );
      }
    });

    flushList(); // Flush any remaining list
    return formattedElements;
  };

  const formatInlineContent = (text: string) => {
    // Handle bold text **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
    
    // Handle italic text *text*
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>');
    
    // Handle inline code `code`
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-purple-600 dark:text-purple-400">$1</code>');
    
    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Document Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 py-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {/* PDF Upload Button */}
            <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    setUploadedPDF(file);
                    const reader = new FileReader();
                    reader.onload = () => setPdfData(reader.result);
                    reader.readAsArrayBuffer(file);
                  }
                }}
              />
              <span role="img" aria-label="Upload PDF">📄</span>
            </label>
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
                    style={{ fontSize: `${fontSize}px` }}
                  />
                ) : (
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white" style={{ fontSize: `${fontSize}px` }}>
                    {note.title}
                  </h1>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {note.createdAt 
                        ? new Date(note.createdAt).toLocaleDateString() 
                        : note.timestamp 
                          ? new Date(note.timestamp).toLocaleDateString()
                          : 'Unknown date'
                      }
                    </span>
                  </span>
                  {note.category && (
                    <span className="flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span>{note.category}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Document Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={decreaseFontSize}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Decrease font size"
            >
              <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {fontSize}px
            </span>
            
            <button
              onClick={increaseFontSize}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Increase font size"
            >
              <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

            {onToggleStar && (
              <button
                onClick={onToggleStar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={note.isStarred ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`w-5 h-5 ${note.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-600 dark:text-gray-400'}`} />
              </button>
            )}

            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Save changes"
                >
                  <Save className="w-5 h-5 text-green-600 dark:text-green-400" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Cancel editing"
                >
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleEditMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit note"
              >
                <Edit3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            <button
              onClick={handleCopyContent}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy content"
            >
              <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={handleDownloadPDF}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Download as PDF"
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                showAIAssistant ? 'bg-purple-100 dark:bg-purple-900' : ''
              }`}
              title="Toggle AI assistant"
            >
              <MessageCircle className={`w-5 h-5 ${
                showAIAssistant ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
            </button>

            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              className={`p-2 rounded-lg transition-colors ${isReading ? 'bg-purple-100 dark:bg-purple-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title={isReading ? 'Stop Reading' : 'Read Aloud'}
            >
              <span role="img" aria-label="Read Aloud">🔊</span>
            </button>
            {isReading && (
              <>
                <button onClick={isPaused ? handleResume : handlePause} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={isPaused ? 'Resume' : 'Pause'}>
                  {isPaused ? <span role="img" aria-label="Resume">▶️</span> : <span role="img" aria-label="Pause">⏸️</span>}
                </button>
                <button onClick={handleStop} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Stop">
                  <span role="img" aria-label="Stop">⏹️</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col w-full ${showAIAssistant && !aiMinimized ? 'md:w-2/3' : 'md:w-full'} transition-all duration-300`}>
          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-8">
              {/* Metadata Panel */}
              {showMetadata && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Document Information</h3>
                    <button
                      onClick={() => setShowMetadata(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {note.createdAt 
                          ? new Date(note.createdAt).toLocaleString()
                          : note.timestamp 
                            ? new Date(note.timestamp).toLocaleString()
                            : 'Unknown date'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : 'Not updated'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{note.category || 'Uncategorized'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white capitalize">{note.type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Tags:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {note.tags && note.tags.length > 0 ? note.tags.join(', ') : 'No tags'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Content (PDF or Note) */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {uploadedPDF && pdfData ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="mb-4 truncate text-center w-full px-2">Viewing: <strong>{uploadedPDF.name}</strong></div>
                    <div className="w-full flex justify-center">
                      <Document
                        file={pdfData}
                        onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPdfPage(1); }}
                        onLoadError={err => <div className="text-red-500">Error loading PDF: {err.message}</div>}
                        onSourceError={err => <div className="text-red-500">PDF source error: {err.message}</div>}
                      >
                        <Page
                          pageNumber={pdfPage}
                          width={typeof window !== "undefined" ? Math.min(window.innerWidth-32, 650) : 320}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          onRenderError={err => <div className="text-red-500">Error rendering page: {err.message}</div>}
                        />
                      </Document>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center justify-center mt-2 text-sm">
                      <button 
                        className="px-2 py-1 border rounded disabled:opacity-60"
                        disabled={pdfPage <= 1} onClick={() => setPdfPage(p => Math.max(p - 1, 1))}>Previous</button>
                      <span>Page {pdfPage} of {numPages}</span>
                      <button 
                        className="px-2 py-1 border rounded disabled:opacity-60"
                        disabled={pdfPage >= (numPages || 1)} onClick={() => setPdfPage(p => Math.min(p + 1, numPages || 1))}>Next</button>
                      <input
                        type="number"
                        min={1}
                        max={numPages || 1}
                        value={pdfPage}
                        onChange={e => {
                          let page = Number(e.target.value);
                          if (page >= 1 && page <= (numPages || 1)) setPdfPage(page);
                        }}
                        className="ml-2 w-16 p-1 border rounded text-center"
                        title="Jump to page"
                      />
                    </div>
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                    placeholder="Start writing your note..."
                  />
                ) : (
                  <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}>
                    {formatContent(note.content)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAIAssistant && (
          <div className={`bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 w-full ${
            aiMinimized ? 'md:w-12' : 'md:w-1/3'
          }`}>
            {/* AI Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              {!aiMinimized && (
                <>
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {isEditing ? 'Writing Assistant' : 'Reading Assistant'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setAiMinimized(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </>
              )}
              {aiMinimized && (
                <button
                  onClick={() => setAiMinimized(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg w-full"
                >
                  <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
              )}
            </div>

            {!aiMinimized && (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">
                        {isEditing 
                          ? "I'm here to help you write better content. Ask me anything!"
                          : "I'm here to help you understand this note. What would you like to know?"
                        }
                      </p>
                    </div>
                  )}
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white dark:bg-purple-700'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Apply AI Suggestion Button */}
                {chatMessages.length > 0 && getLastAIMessage() && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={handleApplyAISuggestion}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                      title="Apply the last AI suggestion to the note"
                    >
                      Apply AI Suggestion
                    </button>
                  </div>
                )}
                {/* AI is thinking indicator */}
                {isAiTyping && (
                  <div className="flex justify-start mb-2">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 max-w-[85%] flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <span className="text-sm text-gray-400 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isEditing ? "Ask for writing help..." : "Ask me about this note..."}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      disabled={isAiTyping}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isAiTyping}
                      className="px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Document Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            Document created with DzowaAI Notes
          </div>
          <div>
            {note.content.split(/\s+/).filter(word => word.length > 0).length} words • {note.content.length} characters
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
