// Enhanced speech-to-text service with AI-powered transcription and analysis
import { aiService } from './aiService';

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
  language?: string;
  analysis?: AudioAnalysis;
}

interface AudioAnalysis {
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
  actionItems: string[];
  summary: string;
  duration: number;
  wordCount: number;
  speakingRate: number;
}

interface SpeechToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  enableAnalysis?: boolean;
}

class EnhancedSpeechToTextService {
  private recognition: any | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private apiKey: string = '';
  private currentLanguage: string = 'en-US';

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
    this.recognition.lang = this.currentLanguage;
    this.recognition.maxAlternatives = 1;
  }

  /**
   * Start real-time speech recognition with enhanced features
   */
  startRealTimeTranscription(
    onResult: (text: string, isFinal: boolean, confidence?: number) => void,
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
    if (options.language) {
      this.currentLanguage = options.language;
      this.recognition.lang = options.language;
    }
    if (options.continuous !== undefined) this.recognition.continuous = options.continuous;
    if (options.interimResults !== undefined) this.recognition.interimResults = options.interimResults;
    if (options.maxAlternatives) this.recognition.maxAlternatives = options.maxAlternatives;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          onResult(transcript, true, confidence);
        } else {
          interimTranscript += transcript;
          onResult(transcript, false, confidence);
        }
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
   * Enhanced audio transcription with AI analysis
   */
  async transcribeAudioFile(audioBlob: Blob, enableAnalysis: boolean = true): Promise<TranscriptionResult> {
    try {
      // First try to get transcription
      let transcription = '';
      
      if (this.apiKey) {
        const whisperResult = await this.transcribeWithWhisper(audioBlob);
        if (whisperResult.success) {
          transcription = whisperResult.text || '';
        }
      }
      
      // Fallback to Web Speech API if Whisper fails
      if (!transcription) {
        const webAPIResult = await this.transcribeAudioWithWebAPI(audioBlob);
        transcription = webAPIResult.text || '';
      }

      if (!transcription) {
        return this.fallbackTranscription(audioBlob);
      }

      // Enhanced AI analysis if enabled
      let analysis: AudioAnalysis | undefined;
      if (enableAnalysis && transcription.length > 10) {
        analysis = await this.analyzeAudioContent(transcription, audioBlob);
      }

      return {
        success: true,
        text: transcription,
        confidence: 0.9,
        language: this.detectLanguage(transcription),
        analysis
      };

    } catch (error) {
      console.error('Enhanced transcription error:', error);
      return this.fallbackTranscription(audioBlob);
    }
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   */
  private async transcribeWithWhisper(audioBlob: Blob): Promise<TranscriptionResult> {
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
        confidence: 0.9
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * AI-powered audio content analysis
   */
  private async analyzeAudioContent(transcription: string, audioBlob: Blob): Promise<AudioAnalysis> {
    try {
      // Use AI service to analyze the transcription
      const analysisPrompt = `Analyze this audio transcription and provide insights:

Transcription: "${transcription}"

Please provide:
1. Main topics discussed (3-5 key topics)
2. Overall sentiment (positive/negative/neutral)
3. Key points made (bullet points)
4. Action items mentioned (if any)
5. A concise summary (2-3 sentences)
6. Estimated speaking rate and word count

Format as JSON with these fields: topics, sentiment, keyPoints, actionItems, summary, speakingRate, wordCount`;

      const aiResponse = await aiService.generateResponse(analysisPrompt, transcription);
      
      if (aiResponse.content) {
        try {
          // Try to parse AI response as JSON
          const aiAnalysis = JSON.parse(aiResponse.content);
          return {
            topics: aiAnalysis.topics || ['General discussion'],
            sentiment: aiAnalysis.sentiment || 'neutral',
            keyPoints: aiAnalysis.keyPoints || ['Content analyzed'],
            actionItems: aiAnalysis.actionItems || [],
            summary: aiAnalysis.summary || 'Audio content analyzed and summarized.',
            duration: this.estimateAudioDuration(audioBlob),
            wordCount: transcription.split(' ').length,
            speakingRate: aiAnalysis.speakingRate || this.calculateSpeakingRate(transcription, audioBlob)
          };
        } catch (parseError) {
          // If AI response isn't valid JSON, create structured analysis
          return this.createStructuredAnalysis(transcription, audioBlob, aiResponse.content);
        }
      } else {
        // Fallback to basic analysis
        return this.createStructuredAnalysis(transcription, audioBlob);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.createStructuredAnalysis(transcription, audioBlob);
    }
  }

  /**
   * Create structured analysis from transcription
   */
  private createStructuredAnalysis(transcription: string, audioBlob: Blob, aiInsight?: string): AudioAnalysis {
    const words = transcription.split(' ');
    const wordCount = words.length;
    const duration = this.estimateAudioDuration(audioBlob);
    const speakingRate = this.calculateSpeakingRate(transcription, audioBlob);

    // Basic topic extraction
    const topics = this.extractTopics(transcription);
    
    // Basic sentiment analysis
    const sentiment = this.analyzeSentiment(transcription);
    
    // Extract key points
    const keyPoints = this.extractKeyPoints(transcription);
    
    // Extract action items
    const actionItems = this.extractActionItems(transcription);

    return {
      topics,
      sentiment,
      keyPoints,
      actionItems,
      summary: aiInsight || `Audio recording analyzed with ${wordCount} words over ${Math.round(duration)} seconds.`,
      duration,
      wordCount,
      speakingRate
    };
  }

  /**
   * Extract topics from transcription
   */
  private extractTopics(transcription: string): string[] {
    const commonTopics = [
      'meeting', 'project', 'work', 'business', 'discussion', 'planning',
      'review', 'analysis', 'strategy', 'development', 'research', 'study',
      'presentation', 'training', 'interview', 'conversation', 'brainstorming'
    ];

    const foundTopics = commonTopics.filter(topic => 
      transcription.toLowerCase().includes(topic)
    );

    return foundTopics.length > 0 ? foundTopics.slice(0, 3) : ['General discussion'];
  }

  /**
   * Basic sentiment analysis
   */
  private analyzeSentiment(transcription: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'success', 'achieve', 'improve'];
    const negativeWords = ['bad', 'terrible', 'awful', 'problem', 'issue', 'fail', 'difficult', 'challenge'];

    const text = transcription.toLowerCase();
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract key points from transcription
   */
  private extractKeyPoints(transcription: string): string[] {
    const sentences = transcription.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, 5).map(s => s.trim());
    return keyPoints.length > 0 ? keyPoints : ['Content analyzed for key insights'];
  }

  /**
   * Extract action items from transcription
   */
  private extractActionItems(transcription: string): string[] {
    const actionPatterns = [
      /need to\s+(\w+)/gi,
      /should\s+(\w+)/gi,
      /must\s+(\w+)/gi,
      /will\s+(\w+)/gi,
      /going to\s+(\w+)/gi
    ];

    const actionItems: string[] = [];
    actionPatterns.forEach(pattern => {
      const matches = transcription.match(pattern);
      if (matches) {
        actionItems.push(...matches.slice(0, 3));
      }
    });

    return actionItems.length > 0 ? actionItems : ['No specific action items identified'];
  }

  /**
   * Calculate speaking rate
   */
  private calculateSpeakingRate(transcription: string, audioBlob: Blob): number {
    const wordCount = transcription.split(' ').length;
    const duration = this.estimateAudioDuration(audioBlob);
    return duration > 0 ? Math.round(wordCount / (duration / 60)) : 0;
  }

  /**
   * Detect language from transcription
   */
  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const languages = {
      'en': ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'will'],
      'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es'],
      'fr': ['le', 'la', 'de', 'et', 'en', 'un', 'est', 'pour'],
      'de': ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'mit']
    };

    const textLower = text.toLowerCase();
    let bestMatch = 'en';
    let bestScore = 0;

    Object.entries(languages).forEach(([lang, words]) => {
      const score = words.filter(word => textLower.includes(word)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = lang;
      }
    });

    return bestMatch;
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
   * Enhanced fallback transcription with better formatting
   */
  private fallbackTranscription(audioBlob: Blob): TranscriptionResult {
    const duration = this.estimateAudioDuration(audioBlob);
    const timestamp = new Date().toLocaleString();
    const fileSize = (audioBlob.size / 1024).toFixed(1);
    
    return {
      success: true,
      text: `[Audio Recording - ${timestamp}]\n\n📹 **Recording Details:**\n• Duration: ${Math.round(duration)} seconds\n• File Size: ${fileSize} KB\n• Format: ${audioBlob.type || 'Unknown'}\n\n⚠️ **Transcription Note:**\nThis audio recording could not be automatically transcribed. To add transcription:\n\n1. 🎧 Play the audio and manually type what you hear\n2. 🔗 Use an external transcription service\n3. ⚙️ Configure OpenAI API key for automatic transcription\n4. 🧠 Enable AI analysis for enhanced insights\n\n💡 **Tips for Better Transcription:**\n• Speak clearly and at a moderate pace\n• Minimize background noise\n• Use proper audio equipment\n• Ensure good internet connection for cloud services`,
      confidence: 0.1
    };
  }

  /**
   * Estimate audio duration from blob size (improved approximation)
   */
  private estimateAudioDuration(audioBlob: Blob): number {
    // Improved estimation based on common audio formats
    const format = audioBlob.type;
    let avgBitrate = 24000; // Default 24 kbps

    if (format.includes('webm')) avgBitrate = 32000; // WebM typically 32 kbps
    else if (format.includes('mp3')) avgBitrate = 128000; // MP3 typically 128 kbps
    else if (format.includes('wav')) avgBitrate = 1411000; // WAV typically 1411 kbps
    else if (format.includes('m4a')) avgBitrate = 256000; // M4A typically 256 kbps

    const durationSeconds = (audioBlob.size * 8) / avgBitrate;
    return Math.max(1, Math.min(durationSeconds, 7200)); // Between 1 second and 2 hours
  }

  /**
   * Get supported languages for speech recognition
   */
  getSupportedLanguages(): Array<{code: string, name: string, region: string}> {
    return [
      { code: 'en-US', name: 'English', region: 'United States' },
      { code: 'en-GB', name: 'English', region: 'United Kingdom' },
      { code: 'en-AU', name: 'English', region: 'Australia' },
      { code: 'en-CA', name: 'English', region: 'Canada' },
      { code: 'en-IN', name: 'English', region: 'India' },
      { code: 'es-ES', name: 'Spanish', region: 'Spain' },
      { code: 'es-MX', name: 'Spanish', region: 'Mexico' },
      { code: 'fr-FR', name: 'French', region: 'France' },
      { code: 'de-DE', name: 'German', region: 'Germany' },
      { code: 'it-IT', name: 'Italian', region: 'Italy' },
      { code: 'pt-BR', name: 'Portuguese', region: 'Brazil' },
      { code: 'ru-RU', name: 'Russian', region: 'Russia' },
      { code: 'ja-JP', name: 'Japanese', region: 'Japan' },
      { code: 'ko-KR', name: 'Korean', region: 'South Korea' },
      { code: 'zh-CN', name: 'Chinese', region: 'China' },
      { code: 'ar-SA', name: 'Arabic', region: 'Saudi Arabia' },
      { code: 'hi-IN', name: 'Hindi', region: 'India' },
      { code: 'nl-NL', name: 'Dutch', region: 'Netherlands' },
      { code: 'sv-SE', name: 'Swedish', region: 'Sweden' },
      { code: 'da-DK', name: 'Danish', region: 'Denmark' }
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
   * Get current language setting
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Set language for speech recognition
   */
  setLanguage(languageCode: string): boolean {
    if (this.recognition) {
      this.currentLanguage = languageCode;
      this.recognition.lang = languageCode;
      return true;
    }
    return false;
  }

  /**
   * Get transcription method info
   */
  getTranscriptionInfo(): { method: string; supported: boolean; apiAvailable: boolean; features: string[] } {
    const features = ['Real-time transcription', 'Language detection', 'AI analysis', 'Sentiment analysis'];
    
    if (this.apiKey) {
      features.push('Whisper API', 'Enhanced accuracy');
    }
    
    return {
      method: this.apiKey ? 'OpenAI Whisper + Web Speech API + AI Analysis' : 'Web Speech API + AI Analysis',
      supported: this.isSupported,
      apiAvailable: !!this.apiKey,
      features
    };
  }

  /**
   * Get audio analysis capabilities
   */
  getAnalysisCapabilities(): string[] {
    return [
      'Topic extraction',
      'Sentiment analysis',
      'Key point identification',
      'Action item detection',
      'Speaking rate calculation',
      'Content summarization',
      'Language detection',
      'Word count analysis'
    ];
  }
}

export const speechToTextService = new EnhancedSpeechToTextService();
export default speechToTextService;
