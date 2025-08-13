from flask import Flask, request, jsonify
import yt_dlp
import whisper
import tempfile
import os

app = Flask(__name__)
model = whisper.load_model("base")  # You can use "base", "small", "medium", "large" for more accuracy/compute

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    yt_url = request.json.get("url")
    if not yt_url:
        return jsonify({"error": "Missing YouTube URL"}), 400

    # Download audio to temp file
    with tempfile.TemporaryDirectory() as tmpdir:
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": os.path.join(tmpdir, "%({id})s.%(ext)s"),
            "quiet": True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(yt_url, download=True)
                downloaded_path = ydl.prepare_filename(info)
        except Exception as e:
            return jsonify({"error": f"Failed to download audio: {str(e)}"}), 500

        # Transcribe audio file
        try:
            result = model.transcribe(downloaded_path)
            transcript = result["text"]
        except Exception as e:
            return jsonify({"error": f"Failed to transcribe audio: {str(e)}"}), 500

    return jsonify({"transcript": transcript})

if __name__ == "__main__":
    app.run(port=5174, debug=True)
