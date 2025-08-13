import React, { useState } from "react";
import { Youtube, Download, Sparkles, AlertCircle, CheckCircle, Copy, Save } from 'lucide-react';
import { aiService } from '../services/aiService';

// IMPORTANT: Never commit your key. Load from Vite env (see .env: VITE_GEMINI_API_KEY)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

async function fetchTranscript(youtubeUrl: string): Promise<string> {
  // Try public API for transcript (if captions already exist)
  try {
    const videoId = youtubeUrl.includes("v=")
      ? youtubeUrl.split("v=")[1].split("&")[0]
      : youtubeUrl.split("/").at(-1)?.split("?")[0];
    const r = await fetch(`https://yt.lemnoslife.com/noKey/videos?part=transcript&id=${videoId}`);
    const json = await r.json();
    const parts = json?.videos?.[0]?.transcript?.segments?.map((seg: any) => seg.text);
    if (parts && parts.join(" ").length > 30) {
      return parts.join(" ");
    }
  } catch {}

  return "";
}

export default function YouTubeSummarizer() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");

  const summarize = async (inputText?: string) => {
    setError("");
    setSummary("");
    setSaved(false);
    setLoading(true);
    setVideoTitle("");
    setVideoThumbnail("");
    
    try {
      let summaryInput = "";
      let reason = "";
      let videoId = "";
      
      if (inputText) {
        // Manual input provided by user
        summaryInput = `Summarize the following as a YouTube video: \n${inputText}`;
        reason = "Manual text provided by user.";
      } else {
        // Extract video ID
        videoId = url.includes("v=")
          ? url.split("v=")[1].split("&")[0]
          : url.split("/").at(-1)?.split("?")[0] || "";
          
        if (!videoId) {
          setError("Invalid YouTube URL. Please check the format.");
          setLoading(false);
          return;
        }
        
        // Set thumbnail
        setVideoThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        
        const transcript = await fetchTranscript(url);
        if (!transcript || transcript.length < 80) {
          // Fallback: get metadata (title, description)
          reason = "Transcript not found or too short. Using video metadata.";
          try {
            const r = await fetch(`https://yt.lemnoslife.com/noKey/videos?part=snippet&id=${videoId}`);
            const json = await r.json();
            const info = json?.videos?.[0]?.snippet;
            if (info) {
              setVideoTitle(info.title);
              summaryInput = `Summarize this YouTube video. Title: ${info.title}\nDescription: ${info.description}\nGive a concise summary of the video’s topic and likely content, focusing on what a viewer would expect to learn or see.`;
            } else {
              // Both transcript and metadata failed; allow manual entry
              setShowManual(true);
              setError("Could not get transcript or metadata. Enter text to summarize.");
              setLoading(false);
              return;
            }
          } catch {
            setShowManual(true);
            setError("Could not get transcript or metadata. Enter text to summarize.");
            setLoading(false);
            return;
          }
        } else {
          summaryInput = `Summarize the following YouTube video transcript as concisely as possible, focusing on key points, in a clear list.\n\n${transcript}`;
        }
      }
      
      // Try OpenRouter first, then Gemini as fallback
      let summaryText = "";
      
      // Try OpenRouter API first
      if (OPENROUTER_API_KEY) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": window.location.origin,
              "X-Title": "SmaRta AI Notes"
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-chat-v3-0324:free",
              messages: [
                { role: "user", content: summaryInput }
              ],
              max_tokens: 500,
              temperature: 0.7
            })
          });
          
          if (response.ok) {
            const resJson = await response.json();
            summaryText = resJson?.choices?.[0]?.message?.content || "";
          }
        } catch (e) {
          console.warn("OpenRouter API failed, trying Gemini...");
        }
      }
      
      // Fallback to Gemini if OpenRouter failed or not available
      if (!summaryText && GEMINI_API_KEY) {
        try {
          const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                contents: [
                  { parts: [ { text: summaryInput } ] }
                ]
              })
            }
          );
          const resJson = await response.json();
          summaryText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (e) {
          console.warn("Gemini API also failed");
        }
      }
      
      // Final fallback
      if (!summaryText) {
        summaryText = `📹 **Video Summary**\n\n**URL:** ${url}\n**Video ID:** ${videoId}\n\n**Summary:** This video contains valuable content that couldn't be automatically processed. Please watch the video and add your own notes.\n\n**Suggested Actions:**\n• Watch the video and take manual notes\n• Use the transcript if available\n• Break down into key points\n• Add timestamps for important sections`;
        reason = "AI summarization unavailable - manual summary template provided.";
      }
      
      try {
      setSummary(summaryText + (reason ? `\n\n(_${reason}_)` : ""));
      setShowManual(false);
      setManualText("");
      } catch (e) {
        setError("All AI services are currently unavailable. Please try again later or use manual text input.");
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err?.message || "Error occurred while summarizing");
    }
    setLoading(false);
  };

  // Save summary as a note
  const handleSaveAsNote = () => {
    if (!summary) return;
    
    // Create a note object and trigger save
    const noteContent = `# 📹 ${videoTitle || 'YouTube Video Summary'}\n\n**Source:** ${url}\n**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n${summary}`;
    
    // Dispatch custom event to parent component
    const event = new CustomEvent('saveYouTubeNote', {
      detail: {
        title: videoTitle || 'YouTube Video Summary',
        content: noteContent,
        url: url,
        thumbnail: videoThumbnail
      }
    });
    window.dispatchEvent(event);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const handleCopySummary = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20 backdrop-blur-xl border border-red-200/30 dark:border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Youtube className="w-8 h-8 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube Video Summarizer</h2>
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Transform any YouTube video into structured notes with AI-powered summarization
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8">
        <div className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-3 text-lg" htmlFor="yt-url">
              YouTube Video URL
            </label>
          <input
            id="yt-url"
            value={url}
            onChange={e => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
          </div>
          
          <button
            onClick={() => summarize()}
            disabled={loading || !url.trim()}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Video...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Generate Summary</span>
              </>
            )}
          </button>
          
          {/* Video Preview */}
          {videoThumbnail && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <img 
                src={videoThumbnail} 
                alt="Video thumbnail" 
                className="w-24 h-18 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{videoTitle}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ready for AI analysis</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-700 dark:text-red-300">Error</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
              {showManual && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <label htmlFor="manual-text" className="block text-blue-700 dark:text-blue-300 font-semibold mb-2">
                    Manual Text Input
                  </label>
                  <textarea
                    id="manual-text"
                    rows={4}
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    placeholder="Describe the video content, paste a transcript, or enter any text you'd like summarized..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                  <button
                    className="w-full mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    disabled={loading || !manualText.trim()}
                    onClick={() => summarize(manualText)}
                  >
                    Summarize Text
                  </button>
                </div>
              )}
            </div>
          )}
          
          {summary && (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="font-semibold text-green-700 dark:text-green-300 text-lg">Summary Generated</h3>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-gray-900 dark:text-white text-sm leading-relaxed max-h-80 overflow-y-auto">
                  {summary}
                </pre>
              </div>
              
              <div className="flex space-x-3">
              <button
                onClick={handleSaveAsNote}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all duration-200 ${saved ? 'bg-green-600' : ''} disabled:opacity-50`}
                disabled={saved}
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save as Note</span>
                  </>
                )}
              </button>
                
                <button
                  onClick={handleCopySummary}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">How to Use</h4>
        <ol className="list-decimal list-inside space-y-2 text-blue-600 dark:text-blue-400 text-sm">
          <li>Paste any YouTube video URL (supports youtube.com and youtu.be links)</li>
          <li>Click "Generate Summary" to let AI analyze the video content</li>
          <li>Review the generated summary and save it as a note for future reference</li>
          <li>If automatic processing fails, you can manually enter text to summarize</li>
        </ol>
      </div>
    </div>
  );
}
