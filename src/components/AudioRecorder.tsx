import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Edit,
  Trash2,
  BookOpen,
  User,
  CheckCircle2,
  Download,
  XCircle,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Note } from '../types';
import { speechToTextService } from '../services/speechToTextService';

const glass = "bg-gradient-to-br from-slate-950/85 via-indigo-900/85 to-fuchsia-900/95 backdrop-blur-xl border border-indigo-900/40";

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const Waveform = ({ color = "from-fuchsia-600 to-indigo-400" }) => (
  <div className="flex gap-0.5 w-full h-8 items-end my-1 select-none">
    {Array.from({ length: 28 }).map((_, i) =>
      <div
        key={i}
        className={`rounded-full bg-gradient-to-t ${color}`}
        style={{
          height: `${70 + Math.abs(Math.sin(i * 2)) * 25}%`,
          width: '3px'
        }}
      />
    )}
  </div>
);

interface AudioRecorderProps {
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  audioNotes: Note[];
  onDeleteAudioNote?: (id: string) => void;
  onEditAudioNote?: (note: Note) => void;
  isTranscribing?: boolean;
  currentTranscription?: string;
  finalTranscription?: string;
  transcriptionSupported?: boolean;
}

export default function AudioRecorder({
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  audioNotes,
  onDeleteAudioNote,
  onEditAudioNote,
  isTranscribing,
  currentTranscription,
  finalTranscription,
  transcriptionSupported
}: AudioRecorderProps) {
  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTrans, setEditTrans] = useState('');
  const [editTags, setEditTags] = useState('');
  // State for playing audio
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  // State for UI
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  // Undo delete
  const [lastDeleted, setLastDeleted] = useState<Note | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  // View mode: recordings or transcriptions
  const [viewMode, setViewMode] = useState<'recordings' | 'transcriptions'>('recordings');

  const audioRefs = useRef<{ [id: string]: HTMLAudioElement | null }>({});

  // Live playback redraw to update progress UI
  const [, setRerender] = useState({});
  useEffect(() => {
    if (!playingId) return;
    const interval = setInterval(() => setRerender({}), 250);
    return () => clearInterval(interval);
  }, [playingId]);

  // Sync playback rate on all audio elements
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.playbackRate = playbackRate;
      }
    });
  }, [playbackRate, playingId]);

  // Undo delete timer
  useEffect(() => {
    if (!showUndo) return;
    const timeout = setTimeout(() => {
      setShowUndo(false);
      setLastDeleted(null);
    }, 6000);
    return () => clearTimeout(timeout);
  }, [showUndo]);

  // Filter and sort notes, pinned notes first
  const filteredNotes = useMemo(() => {
    const filterLower = filter.toLowerCase();
    return [...audioNotes]
      .filter(note =>
        note.title.toLowerCase().includes(filterLower) ||
        (note.tags?.some(tag => tag.toLowerCase().includes(filterLower)) ?? false)
      )
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [audioNotes, filter]);

  // Handle editing note
  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditTrans(note.transcription || '');
    setEditTags(note.tags?.join(', ') || '');
  };

  const handleSaveEdit = (note: Note) => {
    if (onEditAudioNote) {
      const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const updatedNote = { 
        ...note, 
        title: editTitle, 
        transcription: editTrans,
        content: editTrans, // Update content with transcription
        tags,
        updatedAt: new Date()
      };
      onEditAudioNote(updatedNote);
    }
    setEditingId(null);
  };

  // Play or pause audio
  const handlePlayPause = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;

    if (playingId === id && !audio.paused) {
      audio.pause();
      setPlayingId(null);
    } else {
      Object.values(audioRefs.current).forEach(a => {
        if (a && !a.paused) a.pause();
      });
      audio.play();
      setPlayingId(id);
    }
  };

  // Delete a note and enable undo
  const handleDelete = (id: string) => {
    const note = audioNotes.find(n => n.id === id);
    if (!note) return;
    onDeleteAudioNote && onDeleteAudioNote(id);
    setLastDeleted(note);
    setShowUndo(true);
  };

  // Undo last deletion
  const handleUndo = () => {
    if (lastDeleted && onEditAudioNote) {
      onEditAudioNote(lastDeleted);
    }
    setShowUndo(false);
    setLastDeleted(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-5 space-y-12 min-h-screen relative">
      {/* Undo snackbar */}
      {showUndo && lastDeleted && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-700 text-white rounded-lg shadow-lg px-5 py-3 flex items-center gap-6 z-50"
          role="alert"
          aria-live="assertive"
        >
          <span>Recording "{lastDeleted.title}" deleted.</span>
          <button
            onClick={handleUndo}
            className="underline underline-offset-2 font-semibold hover:text-indigo-300 focus:outline-none focus-visible:ring ring-indigo-400 rounded"
            type="button"
          >
            Undo
          </button>
          <button
            title="Dismiss"
            aria-label="Dismiss"
            onClick={() => setShowUndo(false)}
            className="flex items-center justify-center hover:text-indigo-300 focus:outline-none focus-visible:ring ring-indigo-400 rounded ml-6"
            type="button"
          >
            <XCircle size={20} />
          </button>
        </motion.div>
      )}

      {/* Recorder control section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-10 flex flex-col items-center gap-4 shadow-xl relative ${glass}`}
      >
        {/* Main record/stop button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`absolute right-10 top-8 rounded-full p-4 shadow-xl
            ${isRecording
            ? "bg-pink-600 hover:bg-pink-700"
            : "bg-gradient-to-tr from-fuchsia-500 to-indigo-700 hover:from-fuchsia-700 hover:to-indigo-600"
            } text-white`}
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          type="button"
        >
          {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </motion.button>

        {/* Icon and title */}
        <div className="flex flex-col items-center mb-2">
          <span className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg bg-gradient-to-br from-fuchsia-900/70 to-indigo-800/70 mb-2`}>
            <Mic className={`w-10 h-10 ${isRecording ? 'text-pink-400 animate-pulse' : 'text-gray-300'}`} />
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">Audio Recorder</h2>
          <div className="mt-1 text-slate-300 text-base">Minimal. Beautiful. Fast.</div>
        </div>

        {/* Live recording info */}
        {isRecording && (
          <div className="w-full flex flex-col items-center pt-2">
            <div className="text-xl font-mono text-pink-300 mb-1">{formatTime(recordingTime)}</div>
            <div className="w-2/3 h-2 bg-slate-800 rounded-full mb-3">
              <div className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-400 animate-pulse" style={{ width: '100%' }} />
            </div>
            {transcriptionSupported && (
              <div className="bg-slate-900/90 p-3 rounded text-slate-100 w-full max-w-sm shadow-inner text-base">
                {finalTranscription && <div className="mb-1"><span className="text-green-400 font-bold">Final:</span> {finalTranscription}</div>}
                {currentTranscription && <div className="italic"><span className="text-yellow-400">Live:</span> {currentTranscription}</div>}
                {!finalTranscription && !currentTranscription && <div className="text-slate-400">Speak to see transcription…</div>}
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* View mode toggle buttons */}
      <div className="max-w-md mx-auto flex justify-center gap-4 mb-6 select-none">
        <button
          onClick={() => setViewMode('recordings')}
          className={`px-5 py-2 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-600 transition ${
            viewMode === 'recordings'
              ? 'bg-fuchsia-600 text-white shadow-lg'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
          aria-pressed={viewMode === 'recordings'}
          aria-label="Show Recordings"
          type="button"
        >
          Recordings
        </button>
        <button
          onClick={() => setViewMode('transcriptions')}
          className={`px-5 py-2 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-600 transition ${
            viewMode === 'transcriptions'
              ? 'bg-fuchsia-600 text-white shadow-lg'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
          aria-pressed={viewMode === 'transcriptions'}
          aria-label="Show Transcriptions"
          type="button"
        >
          Transcriptions
        </button>
      </div>

      {/* Filter/Search Bar */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by title or tag..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-lg bg-slate-900/85 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 transition"
          aria-label="Search recordings by title or tag"
        />
      </div>

      {/* Audio Notes or Transcriptions Section */}
      <section className={`${glass} rounded-3xl p-8`}>
        <div className="text-xl text-white font-bold mb-5 select-none">
          {viewMode === 'recordings' ? "Recordings" : "Transcriptions"}
        </div>

        {/* Recordings Grid */}
        {viewMode === 'recordings' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-9">
            {filteredNotes.length === 0 && (
              <p className="text-slate-400 col-span-full text-center py-10 select-none">
                No recordings found matching your search.
              </p>
            )}

            {filteredNotes.map(note => {
              const audio = audioRefs.current[note.id];
              const progress = (playingId === note.id && audio) ? (audio.currentTime || 0) / (audio.duration || 1) : 0;
              const isEditing = editingId === note.id;

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-slate-950/80 border border-fuchsia-900/20 rounded-2xl shadow-lg p-5 flex flex-col gap-2 group relative min-h-[230px] hover:scale-105 transition"
                  tabIndex={-1}
                  aria-label={`Audio note: ${note.title}`}
                >
                  {/* Pinned Badge */}
                  {note.pinned && (
                    <div
                      className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 font-bold text-xs rounded-full px-2 py-0.5 select-none"
                      title="Pinned Note"
                      aria-label="Pinned Note"
                    >
                      PINNED
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-base mb-1">
                    <span className="w-9 h-9 bg-gradient-to-br from-fuchsia-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <User size={19} className="text-white" />
                    </span>
                    <span className="text-white font-bold truncate flex-1" title={note.title}>
                      {note.title}
                    </span>
                    {note.createdAt && (
                      <span className="text-xs text-slate-400 select-none">
                        {typeof note.createdAt === "string" ? note.createdAt : new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Play/waveform + playback speed */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayPause(note.id)}
                      className="w-11 h-11 rounded-full bg-gradient-to-br from-fuchsia-600 to-indigo-500 shadow hover:scale-110 transition flex items-center justify-center"
                      aria-label={playingId === note.id ? "Pause" : "Play"}
                      type="button"
                    >
                      {playingId === note.id ? <Pause className="text-white" /> : <Play className="text-white" />}
                    </button>
                    <div className="flex-1">
                      <Waveform />
                    </div>
                    {/* Playback speed selector (show only for playing audio) */}
                    {playingId === note.id && (
                      <select
                        aria-label="Playback speed"
                        className="rounded bg-slate-800 text-slate-100 px-2 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                        value={playbackRate}
                        onChange={e => setPlaybackRate(Number(e.target.value))}
                      >
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    )}
                  </div>

                  {note.audioUrl && (
                    <audio
                      ref={el => (audioRefs.current[note.id] = el)}
                      src={note.audioUrl}
                      className="hidden"
                      onEnded={() => setPlayingId(null)}
                    />
                  )}

                  {/* Transcription */}
                  <div className="bg-slate-900/60 rounded p-2 font-mono text-slate-100 flex items-center text-sm mt-2 mb-0.5">
                    <span className="truncate" title={note.transcription || ''}>
                      {note.transcription
                        ? note.transcription.length > 110 ? note.transcription.slice(0, 110) + '…' : note.transcription
                        : "Transcribing…"
                      }
                    </span>
                    {!!note.transcription && (
                      <button
                        className="ml-2 text-fuchsia-300 hover:text-white transition"
                        aria-label="Copy transcription"
                        title="Copy transcription"
                        type="button"
                        onClick={() => navigator.clipboard.writeText(note.transcription)}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Tags */}
                  {note.tags?.length > 0 && (
                    <div className="mb-1 flex flex-wrap gap-1 mt-1" aria-label="Tags">
                      {note.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block bg-indigo-700/70 rounded-full px-2 py-0.5 text-xs font-semibold text-indigo-100 select-none"
                        >
                          <Tag size={12} className="inline mb-0.5 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {note.summary && (
                    <div
                      className="mt-1 bg-slate-900/90 rounded p-2 text-fuchsia-200 text-xs font-mono cursor-pointer hover:bg-indigo-900/80 select-text"
                      onClick={() => setExpandedSummaryId(expandedSummaryId === note.id ? null : note.id)}
                      title="Click to expand/collapse"
                    >
                      <BookOpen size={12} className="inline mb-0.5 mr-1 text-fuchsia-300" />
                      {expandedSummaryId === note.id
                        ? note.summary
                        : note.summary.length > 50
                          ? note.summary.slice(0, 50) + "…"
                          : note.summary
                      }
                      <button
                        className="ml-1 text-fuchsia-300 hover:text-white inline align-middle"
                        aria-label="Copy summary"
                        title="Copy summary"
                        type="button"
                        onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(note.summary); }}
                      >
                        <CheckCircle2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(note)}
                      className="flex-1 px-2 py-1 bg-indigo-600/80 hover:bg-indigo-800 text-white rounded text-xs flex items-center gap-1 justify-center"
                      aria-label={`Edit recording: ${note.title}`}
                      type="button"
                    >
                      <Edit size={13} />Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="flex-1 px-2 py-1 bg-pink-600/80 hover:bg-pink-800 text-white rounded text-xs flex items-center gap-1 justify-center"
                      aria-label={`Delete recording: ${note.title}`}
                      type="button"
                    >
                      <Trash2 size={13} />Delete
                    </button>
                    {note.audioUrl && (
                      <a
                        href={note.audioUrl}
                        download={note.title ? `${note.title}.mp3` : `audio-note.mp3`}
                        className="flex-1 px-2 py-1 bg-slate-700/80 hover:bg-slate-900 text-white rounded text-xs flex items-center gap-1 justify-center"
                        aria-label={`Download recording: ${note.title}`}
                        title="Download recording"
                      >
                        <Download size={13} />Download
                      </a>
                    )}
                  </div>

                  {/* Edit overlay modal */}
                  {isEditing && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/95 rounded-2xl z-30 p-6">
                      <input
                        className="w-full mb-2 px-3 py-2 rounded bg-slate-900 text-white border border-slate-700 font-sans text-base shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        aria-label="Edit title"
                        autoFocus
                      />
                      <textarea
                        className="w-full mb-2 px-3 py-2 rounded bg-slate-900 text-white border border-slate-700 font-sans shadow resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                        value={editTrans}
                        onChange={e => setEditTrans(e.target.value)}
                        rows={3}
                        aria-label="Edit transcription"
                      />
                      <input
                        type="text"
                        className="w-full mb-4 px-3 py-2 rounded bg-slate-900 text-white border border-slate-700 font-sans text-sm shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                        placeholder="Tags (comma separated)"
                        value={editTags}
                        onChange={e => setEditTags(e.target.value)}
                        aria-label="Edit tags"
                      />
                      <div className="flex gap-2">
                        <button
                          className="px-5 py-1.5 bg-fuchsia-700 text-white rounded font-bold hover:bg-fuchsia-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                          onClick={() => handleSaveEdit(note)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="px-5 py-1.5 bg-slate-700 text-white rounded font-bold hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
                          onClick={() => setEditingId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Transcriptions View */
          <div className="max-w-4xl mx-auto space-y-6 text-sm text-slate-300">
            {filteredNotes.length === 0 ? (
              <p className="text-center text-slate-500 select-none">No transcriptions found matching your search.</p>
            ) : (
              filteredNotes.map(note => (
                <div key={note.id} className="bg-slate-900/70 p-5 rounded-lg shadow-md select-text">
                  <h4 className="text-white font-semibold mb-1">{note.title}</h4>
                  <p className="whitespace-pre-wrap max-h-52 overflow-y-auto leading-relaxed">
                    {note.transcription || <em className="text-slate-500">Transcription not available.</em>}
                  </p>
                  {note.transcription && (
                    <button
                      onClick={() => navigator.clipboard.writeText(note.transcription!)}
                      className="mt-2 text-fuchsia-400 hover:text-fuchsia-600 transition text-xs"
                      aria-label={`Copy transcription for ${note.title}`}
                      type="button"
                    >
                      Copy Transcription
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
