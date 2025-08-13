import React, { useState } from "react";
// IMPORTANT: Never commit your key. Load from Vite env (see .env: VITE_GEMINI_API_KEY)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

  // Fallback: ask our backend to transcribe the audio!
  try {
    const res = await fetch("http://localhost:5174/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl }),
    });
    if (!res.ok) return "";
    const json = await res.json();
    return json.transcript || "";
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

  const summarize = async (inputText?: string) => {
    setError("");
    setSummary("");
    setSaved(false);
    setLoading(true);
    try {
      let summaryInput = "";
      let reason = "";
      if (inputText) {
        // Manual input provided by user
        summaryInput = `Summarize the following as a YouTube video: \n${inputText}`;
        reason = "Manual text provided by user.";
      } else {
        const transcript = await fetchTranscript(url);
        if (!transcript || transcript.length < 80) {
          // Fallback: get metadata (title, description)
          reason = "Transcript not found or too short. Using video metadata.";
          let videoId = url.includes("v=")
            ? url.split("v=")[1].split("&")[0]
            : url.split("/").at(-1)?.split("?")[0];
          try {
            const r = await fetch(`https://yt.lemnoslife.com/noKey/videos?part=snippet&id=${videoId}`);
            const json = await r.json();
            const info = json?.videos?.[0]?.snippet;
            if (info) {
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
      // Google Gemini REST API Mode
      let summaryText = "";
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
        summaryText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned.";
      } catch (e) {
        setError("Gemini API call failed. Check API key and quota.");
        setLoading(false);
        return;
      }
      setSummary(summaryText + (reason ? `\n\n(_${reason}_)` : ""));
      setShowManual(false);
      setManualText("");
    } catch (err: any) {
      setError(err?.message || "Error occurred while summarizing");
    }
    setLoading(false);
  };

  // Dummy save to note handler for demo, connect to your app's note save logic as needed
  const handleSaveAsNote = () => {
    // Usually: pass to parent, context, or trigger HTTP API, etc.
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="max-w-lg mx-auto my-10 p-0 z-50 relative animate-fadein scale-95 md:scale-100 bg-gradient-to-br from-purple-200/60 via-white dark:from-gray-900/80 dark:via-gray-800/95 to-pink-100/60 shadow-2xl rounded-3xl border border-purple-200 dark:border-gray-700 overflow-hidden">
      <div className="p-0">
        <div className="bg-gradient-to-r from-purple-500/70 to-pink-400/70 dark:from-purple-800/70 dark:to-pink-700/70 px-8 py-6 rounded-b-lg -mb-4">
          <h2 className="text-3xl font-extrabold text-white text-center tracking-tight drop-shadow-sm animate-slide-in">🎬 YouTube Video Summarizer</h2>
        </div>
        <div className="px-7 md:px-10 pb-8 pt-8 flex flex-col gap-1">
          <label className="block font-semibold text-gray-700 dark:text-purple-200 mb-1 tracking-wide text-base" htmlFor="yt-url">Paste YouTube URL</label>
          <input
            id="yt-url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full mb-3 p-3 bg-white/70 dark:bg-gray-800/80 border-2 border-transparent hover:border-purple-400/70 focus:border-purple-600 dark:focus:border-purple-500 focus:ring-1 focus:ring-purple-200/80 dark:focus:ring-purple-600/80 rounded-xl shadow-sm focus:outline-none text-gray-900 dark:text-white text-lg transition-all duration-200"
            disabled={loading}
            autoFocus
          />
          <button
            onClick={() => summarize()}
            disabled={loading || !url.trim()}
            className="mt-1 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-600 hover:to-pink-500 hover:from-purple-700 dark:bg-gradient-to-r dark:from-purple-800 dark:to-pink-600 text-white py-3 rounded-xl font-bold text-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 mr-2 text-white"> <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 14h.01M16 10h.01M21 12.64A9 9 0 1111.99 3c1.27 0 2.5.24 3.61.7"/> </svg> 
                Summarize
              </>
            )}
          </button>
          {error && (
            <div className="text-red-600 my-3 font-semibold text-center animate-shake">
              {error}
              {showManual && (
                <div className="mt-5 bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-600 rounded-xl p-4 transition shadow-md animate-in fade-in flex flex-col gap-2">
                  <label htmlFor="manual-text" className="block text-purple-700 dark:text-purple-300 font-semibold mb-1">Enter Text to Summarize</label>
                  <textarea
                    id="manual-text"
                    rows={5}
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    placeholder="Describe the video topic, main message, or paste a transcript."
                    className="w-full p-3 rounded-lg border-2 border-purple-200 dark:border-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2 text-base focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 resize-y"
                  />
                  <button
                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 hover:from-purple-500 hover:to-pink-600 text-white font-bold rounded-lg shadow transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-purple-400 disabled:opacity-60"
                    disabled={loading || !manualText.trim()}
                    onClick={() => summarize(manualText)}
                  >
                    Summarize This Text
                  </button>
                </div>
              )}
            </div>
          )}
          {summary && (
            <div className="mt-7 animate-in fade-in zoom-in rounded-2xl border-2 border-purple-200 dark:border-purple-700 shadow-xl bg-gradient-to-bl from-white/80 to-purple-50/80 dark:from-gray-900/80 dark:to-purple-900/70 p-5 flex flex-col gap-2">
              <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-300 text-lg">Summary:</h3>
              <pre className="whitespace-pre-wrap text-gray-900 dark:text-white rounded-xl px-2 pb-2 pt-1 text-base leading-relaxed transition-all duration-300 max-h-96 sm:max-h-80 overflow-y-auto bg-transparent border-none shadow-none">{summary}</pre>
              <button
                onClick={handleSaveAsNote}
                className={`mt-4 w-full px-3 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-semibold rounded-lg shadow transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-green-400 ${saved && 'animate-bounce'} disabled:opacity-60`}
                disabled={saved}
              >
                {saved ? (
                  <>
                    <svg className="inline-block w-5 h-5 mr-2 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Note Saved
                  </>
                ) : (
                  <>
                    <svg className="inline-block w-5 h-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    Save as Note
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
