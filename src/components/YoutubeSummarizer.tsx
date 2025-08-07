import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube,
  Download,
  Link,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Copy,
  ExternalLink,
  Trash2,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Undo2,
  Eye,
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface YoutubeSummarizerProps {
  onCreateNote?: (note: any) => void;
}

interface VideoSummary {
  title: string;
  content: string;
  noteContent: string;
  type: string;
  url: string;
  videoId: string;
  timestamp: Date;
  expanded?: boolean;
}

const STORAGE_KEY = 'yt-summarizer-history3';

// Extract YouTube video ID utility
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Toast component for transient messages
function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 max-w-xs px-4 py-2 bg-purple-700 text-white font-bold rounded-xl shadow-lg z-50"
      role="alert"
      aria-live="polite"
    >
      {message}
    </motion.div>
  );
}

export default function YoutubeSummarizer({ onCreateNote }: YoutubeSummarizerProps) {
  // State hooks
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSummary, setLastSummary] = useState<VideoSummary | null>(null);
  const [error, setError] = useState('');
  const [recentSummaries, setRecentSummaries] = useState<VideoSummary[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [denseMode, setDenseMode] = useState(false);
  const [autoCreateNote, setAutoCreateNote] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [justCleared, setJustCleared] = useState<VideoSummary[] | null>(null);

  // Load stored summaries on mount
  useEffect(() => {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) setRecentSummaries(JSON.parse(data));
    } catch {}
  }, []);

  // Persist summaries to localStorage when updated
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSummaries));
  }, [recentSummaries]);

  // Auto-clear undo snackbar after delay
  useEffect(() => {
    if (!justCleared) return;
    const timer = setTimeout(() => setJustCleared(null), 4500);
    return () => clearTimeout(timer);
  }, [justCleared]);

  const validVideoId = extractVideoId(youtubeUrl);

  // Handler for summarization API call using OpenAI client with vision
  const handleSummarize = async () => {
    if (!youtubeUrl.trim() || !validVideoId) {
      setError('Paste a valid YouTube URL');
      return;
    }
    setIsProcessing(true);
    setError('');
    
    try {
      // Dynamic import of OpenAI client
      const { default: OpenAI } = await import('openai');
      
      // Get API key from environment
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
      }
      
      // Create OpenAI client configured for OpenRouter
      const client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey
      });

      // Get YouTube video thumbnail for visual analysis
      const thumbnailUrl = `https://img.youtube.com/vi/${validVideoId}/maxresdefault.jpg`;
      
      const completion = await client.chat.completions.create({
        model: "openrouter/horizon-beta",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this YouTube video thumbnail and create a comprehensive summary based on what you can see:\n\nVideo URL: ${youtubeUrl}\nVideo ID: ${validVideoId}\n\nBased on the thumbnail image, please provide:\n1. A compelling title for the summary\n2. What the video appears to be about\n3. Key topics that might be covered\n4. Target audience and educational value\n5. Actionable insights or takeaways\n\nFormat the response as a detailed, educational summary that would be valuable for note-taking and reference.`
              },
              {
                type: "image_url",
                image_url: {
                  url: thumbnailUrl
                }
              }
            ]
          }
        ]
      }, {
        headers: {
          "HTTP-Referer": "https://dzowa-ai-notes.netlify.app",
          "X-Title": "DzowaAI Notes"
        }
      });

      const aiContent = completion.choices[0]?.message?.content || 'Unable to generate summary';
      
      // Extract title from the content or create a smart title
      const lines = aiContent.split('\n');
      const titleLine = lines.find((line: string) => line.toLowerCase().includes('title') || line.startsWith('#'));
      const extractedTitle = titleLine ? titleLine.replace(/^#+\s*|title:\s*/i, '').trim() : `YouTube Summary: ${validVideoId}`;
      
      const summary: VideoSummary = {
        title: `📹 ${extractedTitle}`,
        content: aiContent,
        noteContent: `# 📹 ${extractedTitle}\n\n**Source:** ${youtubeUrl}\n**Video ID:** ${validVideoId}\n**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n${aiContent}`,
        type: 'educational',
        url: youtubeUrl,
        videoId: validVideoId,
        timestamp: new Date(),
      };
      
      setLastSummary(summary);
      setRecentSummaries(([summary, ...recentSummaries]).slice(0, 10));
      if (autoCreateNote) handleCreateNote(summary);
      setYoutubeUrl('');
    } catch (error) {
      console.error('YouTube summarization error:', error);
      setError('Failed to process video. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Pass summary as note creation
  const handleCreateNote = (summary: VideoSummary) => {
    if (onCreateNote) {
      onCreateNote({
        id: Date.now().toString(),
        title: summary.title,
        content: summary.noteContent,
        category: 'YouTube Summaries',
        type: 'youtube',
        metadata: {
          videoUrl: summary.url,
          videoId: summary.videoId,
          videoType: summary.type,
          processedAt: summary.timestamp,
        },
        timestamp: new Date(),
        tags: ['youtube', 'summary', summary.type],
      });
    }
  };

  // Copy text and show toast
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  // Clear all summaries with undo possibility
  const clearHistory = () => {
    setJustCleared(recentSummaries);
    setRecentSummaries([]);
    setLastSummary(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  // Undo clearing summaries
  const undoClear = () => {
    if (justCleared) setRecentSummaries(justCleared);
    setJustCleared(null);
  };

  // Toggle expand/collapse of summaries
  const toggleExpand = (index: number) => {
    setRecentSummaries(rs =>
      rs.map((item, idx) =>
        idx === index
          ? { ...item, expanded: !item.expanded }
          : { ...item, expanded: denseMode ? false : item.expanded }
      )
    );
  };

  return (
    <div className="relative flex flex-col w-11/12 sm:w-4/5 max-w-7xl mx-auto rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg border border-purple-200 dark:border-gray-800 min-h-[620px]">
      {/* Settings button */}
      <button
        className="absolute z-30 top-4 right-5 p-1.5 rounded-full bg-purple-200/90 dark:bg-purple-900 text-purple-700 dark:text-white shadow hover:bg-purple-300 dark:hover:bg-purple-700"
        aria-label="Open Settings"
        onClick={() => setSettingsOpen(o => !o)}
        title="Settings"
        tabIndex={0}
        type="button"
      >
        <SettingsIcon size={20} />
      </button>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute z-40 top-14 right-5 bg-white dark:bg-gray-800 border dark:border-gray-700 border-gray-200 rounded-xl py-4 px-5 flex flex-col gap-3 shadow-2xl min-w-[230px]"
          >
            <label className="flex items-center gap-2 cursor-pointer text-sm" htmlFor="dense-mode">
              <input
                id="dense-mode"
                type="checkbox"
                className="form-checkbox"
                checked={denseMode}
                onChange={() => setDenseMode(d => !d)}
                aria-checked={denseMode}
              />
              Dense summary list
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm" htmlFor="auto-create-note">
              <input
                id="auto-create-note"
                type="checkbox"
                className="form-checkbox"
                checked={autoCreateNote}
                onChange={() => setAutoCreateNote(a => !a)}
                aria-checked={autoCreateNote}
              />
              Auto create note
            </label>
            <button
              onClick={clearHistory}
              className="flex gap-1 items-center text-red-600 hover:underline text-sm mt-2"
              aria-label="Clear all history"
              type="button"
            >
              <Trash2 size={16} /> Clear all history
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo clear snackbar */}
      <AnimatePresence>
        {justCleared && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-7 left-1/2 -translate-x-1/2 flex gap-4 items-center bg-fuchsia-700 text-white px-5 py-2 rounded-lg shadow-lg z-40 font-semibold"
            role="alert"
          >
            Cleared history.
            <button onClick={undoClear} className="underline underline-offset-2 flex gap-1 items-center px-2" type="button">
              <Undo2 size={17} aria-hidden="true" /> Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-6 bg-gradient-to-r from-fuchsia-700/90 to-purple-800 text-white rounded-t-2xl shadow-inner">
        <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-950/70 shadow-lg" aria-hidden="true">
          <Youtube className="w-7 h-7" />
        </span>
        <div>
          <h1 className="text-xl font-bold leading-tight mb-0.5">YouTube Summarizer</h1>
          <p className="text-sm opacity-90">Turn any YouTube video into a perfect summary note—instantly!</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900/70 space-y-8 overflow-y-auto">
        {/* Input section */}
        <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Paste YouTube Link</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:flex-1">
              <input
                type="text"
                placeholder="e.g. youtube.com/watch?v=…"
                value={youtubeUrl}
                onChange={e => {
                  setYoutubeUrl(e.target.value);
                  setError('');
                }}
                onKeyDown={e => (e.key === 'Enter' && !!validVideoId) && handleSummarize()}
                className="
                  sm:flex-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 font-medium text-gray-900 dark:text-white shadow
                  placeholder-gray-400 dark:placeholder-gray-500 pr-24
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                aria-label="YouTube video URL"
                spellCheck={false}
                autoFocus
              />
              {validVideoId && (
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-purple-600 dark:text-purple-300 opacity-70 flex items-center gap-1 rounded-xl bg-purple-50 dark:bg-purple-900/50 px-2 py-1"
                  aria-label="Detected video ID"
                >
                  <Eye size={14} />
                  {validVideoId}
                </span>
              )}
            </div>
            <button
              onClick={handleSummarize}
              disabled={!validVideoId || isProcessing}
              type="button"
              aria-busy={isProcessing}
              className="flex-shrink-0 px-6 py-3 rounded-lg font-bold bg-gradient-to-tr from-purple-600 to-fuchsia-700 hover:from-purple-700 hover:to-fuchsia-800 text-white shadow-md flex items-center gap-2 justify-center focus:outline-none focus:ring-2 focus:ring-fuchsia-600 disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition"
              aria-label="Summarize YouTube video"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    aria-hidden="true"
                  />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Summarize</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <div
              className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm mt-2"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <AlertCircle size={17} />
              {error}
            </div>
          )}
          <div className="flex gap-3 items-center mt-2 text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
            <span>Formats:</span>
            <span className="bg-white dark:bg-blue-950/40 px-2 py-0.5 rounded cursor-help" title="https://www.youtube.com/watch?v=VIDEO_ID">youtube.com/watch?v=…</span>
            <span className="bg-white dark:bg-blue-950/40 px-2 py-0.5 rounded cursor-help" title="https://youtu.be/VIDEO_ID">youtu.be/…</span>
            <span className="bg-white dark:bg-blue-950/40 px-2 py-0.5 rounded cursor-help" title="https://youtube.com/embed/VIDEO_ID">youtube.com/embed/…</span>
          </div>
        </section>

        {/* Latest summary card */}
        <AnimatePresence>
          {lastSummary && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
              aria-live="polite"
            >
              <div className="flex gap-5 border-b border-gray-100 dark:border-gray-800 p-5 items-center">
                <a
                  href={`https://youtu.be/${lastSummary.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open video in YouTube"
                >
                  <img
                    src={`https://img.youtube.com/vi/${lastSummary.videoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-28 h-20 object-cover rounded shadow border"
                    loading="lazy"
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center mb-1 text-base">
                    <span className="font-bold truncate">{lastSummary.title}</span>
                    <a
                      href={lastSummary.url}
                      className="ml-1 text-purple-700 hover:text-purple-900"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open original video URL"
                    >
                      <ExternalLink size={17} />
                    </a>
                    <button
                      title="Copy video link"
                      onClick={() => handleCopy(lastSummary.url, 'Video Link Copied!')}
                      className="ml-1 text-purple-600 hover:text-purple-900"
                      aria-label="Copy video URL"
                      type="button"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{lastSummary.type}</span>
                    <span>{lastSummary.timestamp.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateNote(lastSummary)}
                  className="px-3 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded font-bold text-xs flex items-center gap-1 ml-2 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  title="Create note from summary"
                  type="button"
                >
                  <FileText size={15} /> Note
                </button>
              </div>
              <div className="prose dark:prose-invert p-5 max-h-56 overflow-y-auto relative whitespace-pre-line">
                {lastSummary.content}
                <button
                  className="absolute right-6 top-5 text-fuchsia-500 hover:text-fuchsia-800 px-1 text-xs bg-white/80 dark:bg-gray-900/70 rounded transition"
                  title="Copy summary"
                  onClick={() => handleCopy(lastSummary.content, 'Summary Copied!')}
                  aria-label="Copy summary text"
                  type="button"
                >
                  <Copy size={13} />
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Summary History List */}
        {recentSummaries.length > 0 && (
          <section
            className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-br from-white/60 via-gray-50/70 to-purple-50 dark:from-purple-950/80 dark:to-gray-900/50 p-5 shadow-inner"
            aria-label="Summary history"
          >
            <div className="flex gap-2 items-center mb-2 text-purple-900 dark:text-purple-400 font-bold">
              <Clock size={17} />
              <span>Summary History</span>
            </div>
            <ul className="flex flex-col gap-3">
              {recentSummaries.map((summary, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={`border border-gray-100 dark:border-gray-700 rounded-lg p-3 shadow-sm group
                    ${denseMode ? 'py-2' : ''} bg-white dark:bg-gray-900/80 hover:ring-2 hover:ring-fuchsia-400 transition relative`}
                >
                  <div className="flex items-center mb-2">
                    <a
                      href={`https://youtu.be/${summary.videoId}`}
                      target="_blank"
                      rel="noopener"
                      className="mr-2 shrink-0"
                      aria-label="Open video in YouTube"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${summary.videoId}/default.jpg`}
                        className="w-12 h-8 rounded border shadow"
                        loading="lazy"
                        alt="YouTube video thumbnail"
                      />
                    </a>
                    <span
                      className="font-semibold text-sm flex-1 truncate"
                      title={summary.title}
                    >
                      {summary.title}
                    </span>
                    <button
                      onClick={() => toggleExpand(i)}
                      title={summary.expanded ? "Collapse" : "Expand"}
                      className="ml-2 text-fuchsia-500 hover:text-fuchsia-800"
                      aria-expanded={summary.expanded || false}
                      aria-label={summary.expanded ? "Collapse summary" : "Expand summary"}
                      type="button"
                    >
                      {summary.expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                    </button>
                    <button
                      onClick={() => handleCopy(summary.content, 'Copied!')}
                      title="Copy summary"
                      className="ml-2 text-fuchsia-500 hover:text-fuchsia-800"
                      type="button"
                      aria-label="Copy summary text"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{summary.type}</span>
                    <span className="mx-1">&bull;</span>
                    <time dateTime={summary.timestamp.toISOString()}>
                      {typeof summary.timestamp === 'string'
                        ? new Date(summary.timestamp).toLocaleString()
                        : summary.timestamp.toLocaleString()}
                    </time>
                  </div>
                  {(summary.expanded || !denseMode) && (
                    <div className="mt-1 whitespace-pre-line max-h-32 overflow-y-auto text-gray-800 dark:text-gray-200 text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                      {summary.content}
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          </section>
        )}

        {/* Copy feedback toast */}
        <AnimatePresence>
          {copyFeedback && <Toast message={copyFeedback} />}
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!settingsOpen && !isProcessing && !justCleared && (
          <motion.button
            key="fab"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            type="button"
            onClick={() => (document.querySelector('input[type="text"]') as HTMLInputElement)?.focus()}
            className="fixed z-40 bottom-10 right-10 h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 shadow-2xl flex items-center justify-center text-white text-3xl font-black hover:scale-110 active:scale-95 focus:outline-none ring-4 ring-fuchsia-400/0 hover:ring-fuchsia-400/40 transition"
            aria-label="Focus YouTube URL input"
            title="Paste a new YouTube link"
          >
            <Youtube className="w-8 h-8" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
