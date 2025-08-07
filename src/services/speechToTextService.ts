// Extend window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
  confidence?: number;
}

interface SpeechToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

class SpeechToTextService {
  private recognition: any | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private apiKey: string = '';

  constructor() {
    // Check for Web Speech API support
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    // Get OpenAI API key for Whisper fallback
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  /**
   * Start real-time speech recognition
   */
  startRealTimeTranscription(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    options: SpeechToTextOptions = {}
  ): boolean {
    if (!this.isSupported || !this.recognition) {
      onError('Speech recognition not supported in this browser');
      return false;
    }

    if (this.isListening) {
      this.stopRealTimeTranscription();
    }

    // Apply options
    if (options.language) this.recognition.lang = options.language;
    if (options.continuous !== undefined) this.recognition.continuous = options.continuous;
    if (options.interimResults !== undefined) this.recognition.interimResults = options.interimResults;
    if (options.maxAlternatives) this.recognition.maxAlternatives = options.maxAlternatives;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      onError(`Speech recognition error: ${event.error}`);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError('Failed to start speech recognition');
      return false;
    }
  }

  /**
   * Stop real-time speech recognition
   */
  stopRealTimeTranscription() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   */
  async transcribeAudioFile(audioBlob: Blob): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      return this.fallbackTranscription(audioBlob);
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        text: result.text,
        confidence: 0.9 // Whisper doesn't provide confidence scores
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      return this.fallbackTranscription(audioBlob);
    }
  }

  /**
   * Transcribe audio file using Web Speech API (for shorter recordings)
   */
  async transcribeAudioWithWebAPI(audioBlob: Blob): Promise<TranscriptionResult> {
    return new Promise((resolve) => {
      if (!this.isSupported) {
        resolve(this.fallbackTranscription(audioBlob));
        return;
      }

      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      audio.src = audioUrl;

      let transcriptionText = '';
      let hasResult = false;

      const cleanup = () => {
        URL.revokeObjectURL(audioUrl);
        if (this.recognition) {
          this.recognition.onresult = null;
          this.recognition.onerror = null;
          this.recognition.onend = null;
        }
      };

      if (this.recognition) {
        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcriptionText += event.results[i][0].transcript;
              hasResult = true;
            }
          }
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          cleanup();
          resolve({
            success: false,
            error: `Speech recognition error: ${event.error}`
          });
        };

        this.recognition.onend = () => {
          cleanup();
          if (hasResult) {
            resolve({
              success: true,
              text: transcriptionText,
              confidence: 0.8
            });
          } else {
            resolve(this.fallbackTranscription(audioBlob));
          }
        };

        // Play audio and start recognition
        audio.play().then(() => {
          this.recognition?.start();
        }).catch(() => {
          cleanup();
          resolve(this.fallbackTranscription(audioBlob));
        });
      } else {
        resolve(this.fallbackTranscription(audioBlob));
      }
    });
  }

  /**
   * Fallback transcription when APIs are not available
   */
  private fallbackTranscription(audioBlob: Blob): TranscriptionResult {
    const duration = this.estimateAudioDuration(audioBlob);
    const timestamp = new Date().toLocaleString();
    
    return {
      success: true,
      text: `[Audio Recording - ${timestamp}]\n\nThis is an audio recording that was captured but could not be automatically transcribed. The recording is approximately ${Math.round(duration)} seconds long.\n\nTo add transcription:\n1. Play the audio and manually type what you hear\n2. Use an external transcription service\n3. Configure OpenAI API key for automatic transcription`,
      confidence: 0.1
    };
  }

  /**
   * Estimate audio duration from blob size (rough approximation)
   */
  private estimateAudioDuration(audioBlob: Blob): number {
    // Very rough estimation: WebM audio is typically 16-32 kbps
    // This is just for fallback display purposes
    const avgBitrate = 24000; // 24 kbps average
    const durationSeconds = (audioBlob.size * 8) / avgBitrate;
    return Math.max(1, Math.min(durationSeconds, 3600)); // Between 1 second and 1 hour
  }

  /**
   * Get supported languages for speech recognition
   */
  getSupportedLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
      'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT',
      'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN',
      'ar-SA', 'hi-IN', 'nl-NL', 'sv-SE', 'da-DK'
    ];
  }

  /**
   * Check if speech recognition is supported
   */
  isWebSpeechSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get transcription method info
   */
  getTranscriptionInfo(): { method: string; supported: boolean; apiAvailable: boolean } {
    return {
      method: this.apiKey ? 'OpenAI Whisper + Web Speech API' : 'Web Speech API only',
      supported: this.isSupported,
      apiAvailable: !!this.apiKey
    };
  }
}



export const speechToTextService = new SpeechToTextService();
export default speechToTextService;
