import { AI_CONFIG, hasAIService, getBestAPIKey } from '../config/ai';

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  error?: string;
}

class AIService {
  protected apiKey: string;

  constructor() {
    this.apiKey = getBestAPIKey();
    
    if (AI_CONFIG.TEST_MODE) {
      console.log('AI Service in TEST MODE - using enhanced fallback responses');
    } else if (this.apiKey) {
      console.log('AI Service initialized with API key');
    } else {
      console.warn('No API key found. AI will use fallback responses.');
    }
  }

  async generateResponse(
    userInput: string, 
    noteContent: string, 
    isEditing: boolean = false,
    conversationHistory: AIMessage[] = []
  ): Promise<AIResponse> {
    if (!hasAIService()) {
      return this.getFallbackResponse(userInput, noteContent, isEditing);
    }

    // Try OpenRouter first
    if (AI_CONFIG.OPENROUTER_API_KEY) {
      try {
        const response = await this.tryOpenRouter(userInput, noteContent, isEditing, conversationHistory);
        if (response.content) {
          return response;
        }
      } catch (error) {
        console.warn('OpenRouter failed, trying Gemini...', error);
      }
    }

    // Try Gemini as fallback
    if (AI_CONFIG.GEMINI_API_KEY) {
      try {
        const response = await this.tryGemini(userInput, noteContent, isEditing, conversationHistory);
        if (response.content) {
          return response;
        }
      } catch (error) {
        console.warn('Gemini failed, using fallback...', error);
      }
    }

    return this.getFallbackResponse(userInput, noteContent, isEditing);
  }

  private async tryOpenRouter(
    userInput: string, 
    noteContent: string, 
    isEditing: boolean, 
    conversationHistory: AIMessage[]
  ): Promise<AIResponse> {
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant helping with note-taking and writing. 
        The user is currently ${isEditing ? 'editing' : 'reading'} a note.
        Note content: "${noteContent.slice(0, 500)}..."
        
        Provide helpful, concise responses. If editing, focus on writing assistance.
        If reading, focus on comprehension and analysis.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userInput
      }
    ];

    const response = await fetch(`${AI_CONFIG.OPENROUTER_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENROUTER_API_KEY}`,
        'HTTP-Referer': AI_CONFIG.SITE_URL,
        'X-Title': AI_CONFIG.SITE_NAME
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODELS[0],
        messages: messages,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return {
        content: data.choices[0].message.content
      };
    }
    
    throw new Error('Invalid OpenRouter response format');
  }

  private async tryGemini(
    userInput: string, 
    noteContent: string, 
    isEditing: boolean, 
    conversationHistory: AIMessage[]
  ): Promise<AIResponse> {
    const systemPrompt = `You are an AI assistant helping with note-taking and writing. 
    The user is currently ${isEditing ? 'editing' : 'reading'} a note.
    Note content: "${noteContent.slice(0, 500)}..."
    
    Provide helpful, concise responses. If editing, focus on writing assistance.
    If reading, focus on comprehension and analysis.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${userInput}`;

    const response = await fetch(
      `${AI_CONFIG.GEMINI_URL}?key=${AI_CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            { parts: [ { text: fullPrompt } ] }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return {
        content: data.candidates[0].content.parts[0].text
      };
    }
    
    throw new Error('Invalid Gemini response format');
  }

  private getFallbackResponse(userInput: string, noteContent: string, isEditing: boolean): AIResponse {
    const input = userInput.toLowerCase();
    
    if (isEditing) {
      if (input.includes('improve') || input.includes('better') || input.includes('enhance')) {
        return {
          content: `✨ **AI Writing Enhancement** (Fallback Mode)\n\n🔧 **Quick Improvements:**\n• Add more specific examples and details\n• Use stronger action verbs and descriptive language\n• Break up long paragraphs for better readability\n• Include bullet points for key information\n• Add section headers to organize content\n\n💡 **Pro Tip:** The AI models are currently busy, but I can still help with basic writing suggestions!`
        };
      }
      return {
        content: `✍️ **Writing Assistant Ready!**\n\nI'm here to help you improve your note. I can:\n\n• **Enhance** your writing style\n• **Rewrite** sections for clarity\n• **Expand** on ideas\n• **Organize** content structure\n• **Check** grammar and flow\n\nWhat would you like help with?`
      };
    } else {
      if (input.includes('summary') || input.includes('summarize')) {
        const wordCount = noteContent.split(/\s+/).filter(word => word.length > 0).length;
        return {
          content: `📝 **Quick Summary:**\n\nThis note contains ${wordCount} words and covers several key topics. Would you like me to:\n\n• Provide a detailed summary\n• Extract the main points\n• Identify key takeaways\n• Create an outline\n\nJust let me know what type of summary would be most helpful!`
        };
      }
      return {
        content: `🤖 **AI Assistant Ready!**\n\nI can help you with this note by:\n\n• **Summarizing** the content\n• **Explaining** complex parts\n• **Extracting** key points\n• **Creating** study questions\n• **Analyzing** the information\n\nWhat would you like to explore?`
      };
    }
  }

  convertChatHistory(chatMessages: any[]): AIMessage[] {
    return chatMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content || msg.text || ''
    }));
  }

  async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number = 5): Promise<any> {
    if (!hasAIService()) {
      return this.getFallbackQuiz(topic, difficulty, questionCount);
    }

    try {
      const prompt = `Create a ${difficulty} level quiz about "${topic}" with exactly ${questionCount} multiple choice questions. Each question should test different aspects of ${topic}. Format as JSON with this structure:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of the answer"
    }
  ]
}`;

      // Try OpenRouter first
      if (AI_CONFIG.OPENROUTER_API_KEY) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AI_CONFIG.OPENROUTER_API_KEY}`,
              'HTTP-Referer': AI_CONFIG.SITE_URL,
              'X-Title': AI_CONFIG.SITE_NAME,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'tngtech/deepseek-r1t2-chimera:free',
              messages: [{ role: 'user', content: prompt }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            let aiContent = data.choices?.[0]?.message?.content || '';
            aiContent = aiContent.trim().replace(/^```json[\r\n]*/i, '').replace(/^```[\r\n]*/i, '').replace(/```\s*$/i, '');
            
            try {
              const quizData = JSON.parse(aiContent);
              const formattedQuestions = quizData.questions.map((q: any, index: number) => ({
                id: `ai-q-${Date.now()}-${index}`,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                difficulty: difficulty
              }));
              
              return {
                id: `ai-quiz-${Date.now()}`,
                topic: topic,
                questions: formattedQuestions,
                createdAt: new Date(),
                difficulty: difficulty,
                estimatedTime: questionCount * 2
              };
            } catch (parseError) {
              console.error('Failed to parse AI quiz response:', parseError);
            }
          }
        } catch (error) {
          console.error('OpenRouter quiz generation failed:', error);
        }
      }

      // If AI failed, use fallback
      return this.getFallbackQuiz(topic, difficulty, questionCount);
    } catch (error) {
      console.error('AI quiz generation error:', error);
      return this.getFallbackQuiz(topic, difficulty, questionCount);
    }
  }

  private getFallbackQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number) {
    const questions = [];
    
    for (let i = 0; i < questionCount; i++) {
      questions.push({
        id: `fallback-q-${Date.now()}-${i}`,
        question: `What is a fundamental concept in ${topic}? (Question ${i + 1})`,
        options: [
          `Core principle ${i + 1} of ${topic}`,
          `Advanced technique ${i + 1} of ${topic}`,
          `Basic method ${i + 1} of ${topic}`,
          `Fundamental approach ${i + 1} of ${topic}`
        ],
        correctAnswer: 0,
        explanation: `This is a fundamental concept that forms the foundation of ${topic}.`,
        difficulty: difficulty
      });
    }

    return {
      id: `fallback-quiz-${Date.now()}`,
      topic: topic,
      questions: questions,
      createdAt: new Date(),
      difficulty: difficulty,
      estimatedTime: questionCount * 2
    };
  }
}

export const aiService = new AIService();
export default aiService;
