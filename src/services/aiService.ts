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
  protected baseUrl: string = 'https://openrouter.ai/api/v1';
  protected models: string[] = [
    'deepseek/deepseek-chat-v3-0324:free',
    'google/gemini-2.0-flash-exp:free',
    'qwen/qwen3-coder:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-2-9b-it:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'gryphe/mythomist-7b:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'liquid/lfm-40b:free'
  ];
  protected currentModelIndex: number = 0;
  protected siteUrl: string = 'https://dzowa-ai-notes.netlify.app';
  protected siteName: string = 'DzowaAI Notes';
  protected testMode: boolean = false;

  constructor() {
    // Use OpenRouter API key for DeepSeek access
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const deepSeekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    this.testMode = import.meta.env.VITE_AI_TEST_MODE === 'true';
    
    this.apiKey = openRouterKey || deepSeekKey || '';
    
    if (this.testMode) {
      console.log('AI Service in TEST MODE - using enhanced fallback responses');
    } else if (this.apiKey) {
      console.log('AI Service initialized with OpenRouter API');
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
    if (!this.apiKey) {
      console.warn('No OpenRouter API key found, using fallback response');
      return this.getFallbackResponse(userInput, noteContent, isEditing);
    }

    // Try each model with exponential backoff
    for (let attempt = 0; attempt < this.models.length; attempt++) {
      const currentModel = this.models[(this.currentModelIndex + attempt) % this.models.length];
      
      try {
        console.log(`Trying model ${attempt + 1}/${this.models.length}: ${currentModel}`);
        
        // Add delay between attempts to avoid hitting rate limits
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`Waiting ${delay}ms before trying next model...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
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

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': this.siteUrl,
            'X-Title': this.siteName
          },
          body: JSON.stringify({
            model: currentModel,
            messages: messages,
            max_tokens: 300, // Reduced to avoid hitting limits
            temperature: 0.7,
            stream: false
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // If rate limited, try next model after a longer delay
          if (response.status === 429 || errorData.error?.code === 'rate_limit_exceeded' || 
              errorData.error?.message?.includes('rate limit')) {
            console.warn(`Rate limit exceeded for ${currentModel}, trying next model after delay...`);
            
            // Longer delay for rate limits
            const rateLimitDelay = 2000 + (attempt * 1000);
            await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
            continue;
          }
          
          throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
          // Update current model index to the working one
          this.currentModelIndex = (this.currentModelIndex + attempt) % this.models.length;
          console.log(`✅ Successfully used model: ${currentModel}`);
          
          return {
            content: data.choices[0].message.content
          };
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error(`❌ Error with model ${currentModel}:`, error);
        
        // If this is the last model, wait a bit longer before giving up
        if (attempt === this.models.length - 1) {
          console.log('All models exhausted, using enhanced fallback...');
        }
      }
    }

    // If all models failed, use fallback
    console.warn('All AI models failed, using fallback response');
    return {
      content: this.getFallbackResponse(userInput, noteContent, isEditing).content,
      error: 'All AI models unavailable - using fallback response'
    };
  }

  private getFallbackResponse(userInput: string, noteContent: string, isEditing: boolean): AIResponse {
    const input = userInput.toLowerCase();
    
    // Enhanced context-aware fallback responses
    if (isEditing) {
      if (input.includes('improve') || input.includes('better') || input.includes('enhance')) {
        return {
          content: `✨ **AI Writing Enhancement** (Fallback Mode)\n\n🔧 **Quick Improvements:**\n• Add more specific examples and details\n• Use stronger action verbs and descriptive language\n• Break up long paragraphs for better readability\n• Include bullet points for key information\n• Add section headers to organize content\n\n💡 **Pro Tip:** The AI models are currently busy, but I can still help with basic writing suggestions!`
        };
      }
      if (input.includes('rewrite') || input.includes('rephrase')) {
        return {
          content: `🔄 **Ready to help you rewrite!**\n\nPlease paste the specific text you'd like me to rephrase, or tell me which section needs improvement. I can help with:\n\n• Clarity and flow\n• Tone and style\n• Conciseness\n• Professional language`
        };
      }
      if (input.includes('expand') || input.includes('elaborate')) {
        return {
          content: `📝 **Content Expansion Ideas:**\n\n• Add real-world examples\n• Include step-by-step instructions\n• Provide background context\n• Add supporting statistics or facts\n• Include personal insights or experiences\n\nWhich part of your note would you like to expand?`
        };
      }
      if (input.includes('structure') || input.includes('organize')) {
        return {
          content: `🏗️ **Structure & Organization Tips:**\n\n• Use clear headings (# ## ###)\n• Create bullet lists for key points\n• Number steps in processes\n• Use **bold** for emphasis\n• Add horizontal rules (---) to separate sections\n\nWould you like help reorganizing a specific section?`
        };
      }
      if (input.includes('grammar') || input.includes('correct')) {
        return {
          content: `📚 **Grammar & Style Check:**\n\nI can help you with:\n\n• Grammar and punctuation\n• Sentence structure\n• Word choice and vocabulary\n• Consistency in tense and voice\n• Professional tone\n\nPaste the text you'd like me to review!`
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
      if (input.includes('key points') || input.includes('main points') || input.includes('highlights')) {
        return {
          content: `🎯 **Key Points Analysis:**\n\nI can help you identify:\n\n• Main concepts and ideas\n• Important facts and figures\n• Action items and next steps\n• Key insights and conclusions\n\nWould you like me to extract the key points from this note?`
        };
      }
      if (input.includes('explain') || input.includes('clarify')) {
        return {
          content: `💡 **Happy to Explain!**\n\nI can help clarify:\n\n• Complex concepts or terminology\n• Relationships between ideas\n• Background context\n• Practical applications\n\nWhat specific part would you like me to explain?`
        };
      }
      if (input.includes('questions') || input.includes('quiz')) {
        return {
          content: `❓ **Study Questions:**\n\nI can create:\n\n• Review questions based on the content\n• Quiz questions to test understanding\n• Discussion prompts\n• Critical thinking questions\n\nWould you like me to generate some questions from this note?`
        };
      }
      return {
        content: `🤖 **AI Assistant Ready!**\n\nI can help you with this note by:\n\n• **Summarizing** the content\n• **Explaining** complex parts\n• **Extracting** key points\n• **Creating** study questions\n• **Analyzing** the information\n\nWhat would you like to explore?`
      };
    }
  }

  // Convert chat messages to AI message format
  convertChatHistory(chatMessages: any[]): AIMessage[] {
    return chatMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content || msg.text || ''
    }));
  }
}

// Additional AI service methods for various app features
class ExtendedAIService extends AIService {
  
  // YouTube video summarization using OpenAI client with OpenRouter
  async summarizeYouTubeVideo(url: string, videoId: string): Promise<{title: string, content: string, noteContent: string}> {
    if (!this.apiKey) {
      return this.getFallbackYouTubeSummary(url, videoId);
    }

    try {
      // Dynamic import of OpenAI client
      const { default: OpenAI } = await import('openai');
      
      // Create OpenAI client configured for OpenRouter
      const client = new OpenAI({
        baseURL: this.baseUrl,
        apiKey: this.apiKey
      });

      // Get YouTube video thumbnail for visual analysis
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      const completion = await client.chat.completions.create({
        model: "openrouter/horizon-beta",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this YouTube video thumbnail and create a comprehensive summary based on what you can see:\n\nVideo URL: ${url}\nVideo ID: ${videoId}\n\nBased on the thumbnail image, please provide:\n1. A compelling title for the summary\n2. What the video appears to be about\n3. Key topics that might be covered\n4. Target audience and educational value\n5. Actionable insights or takeaways\n\nFormat the response as a detailed, educational summary that would be valuable for note-taking and reference.`
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
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName
        }
      });

      const aiContent = completion.choices[0]?.message?.content || 'Unable to generate summary';
      
      // Extract title from the content or create a smart title
      const lines = aiContent.split('\n');
      const titleLine = lines.find((line: string) => line.toLowerCase().includes('title') || line.startsWith('#'));
      const extractedTitle = titleLine ? titleLine.replace(/^#+\s*|title:\s*/i, '').trim() : `YouTube Summary: ${videoId}`;
      
      return {
        title: `📹 ${extractedTitle}`,
        content: aiContent,
        noteContent: `# 📹 ${extractedTitle}\n\n**Source:** ${url}\n**Video ID:** ${videoId}\n**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n${aiContent}`
      };
    } catch (error) {
      console.error('YouTube summarization error:', error);
      return this.getFallbackYouTubeSummary(url, videoId);
    }
  }

  // Smart search with AI enhancement
  async enhanceSearch(query: string, notes: any[]): Promise<any[]> {
    if (!this.apiKey) {
      return this.getFallbackSearch(query, notes);
    }

    try {
      // Basic search first
      const basicResults = this.getFallbackSearch(query, notes);
      
      // AI enhancement for semantic search
      const prompt = `Enhance this search query for better note discovery:

Original query: "${query}"
Number of notes: ${notes.length}

Suggest related terms, synonyms, and concepts that might help find relevant notes.`;
      
      await this.generateResponse(prompt, '', false, []);
      
      // For now, return basic results (can be enhanced with semantic matching)
      return basicResults;
    } catch (error) {
      console.error('Search enhancement error:', error);
      return this.getFallbackSearch(query, notes);
    }
  }

  // Generate AI insights for dashboard
  async generateInsights(notes: any[]): Promise<Array<{id: string, type: string, content: string, timestamp: Date}>> {
    if (!this.apiKey) {
      return this.getFallbackInsights(notes);
    }

    try {
      const recentNotes = notes.slice(0, 10);
      const prompt = `Analyze these recent notes and provide insights:

${recentNotes.map(note => `Title: ${note.title}\nContent: ${note.content.substring(0, 200)}...`).join('\n\n')}

Provide 3-5 insights about:
1. Common themes
2. Knowledge gaps
3. Productivity patterns
4. Learning opportunities
5. Content organization suggestions`;

      const response = await this.generateResponse(prompt, '', false, []);
      
      return [{
        id: Date.now().toString(),
        type: 'analysis',
        content: response.content,
        timestamp: new Date()
      }];
    } catch (error) {
      console.error('Insights generation error:', error);
      return this.getFallbackInsights(notes);
    }
  }

  // Generate smart suggestions
  async generateSuggestions(notes: any[]): Promise<Array<{id: string, title: string, description: string, action: string}>> {
    if (!this.apiKey) {
      return this.getFallbackSuggestions(notes);
    }

    try {
      const prompt = `Based on these notes, suggest 3-5 actionable improvements:

${notes.slice(0, 5).map(note => `${note.title}: ${note.content.substring(0, 100)}...`).join('\n')}

Suggest specific actions for:
1. Better organization
2. Content enhancement
3. Study strategies
4. Productivity improvements`;

      const response = await this.generateResponse(prompt, '', false, []);
      
      return [{
        id: Date.now().toString(),
        title: '🧠 AI Suggestions',
        description: response.content,
        action: 'review'
      }];
    } catch (error) {
      console.error('Suggestions generation error:', error);
      return this.getFallbackSuggestions(notes);
    }
  }

  // Generate tag suggestions
  async suggestTags(content: string): Promise<string[]> {
    if (!this.apiKey) {
      return this.getFallbackTags(content);
    }

    try {
      const prompt = `Suggest 5-8 relevant tags for this content:

${content.substring(0, 500)}...

Provide tags that would help with organization and discovery. Return only the tags, separated by commas.`;

      const response = await this.generateResponse(prompt, '', false, []);
      
      return response.content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error('Tag suggestion error:', error);
      return this.getFallbackTags(content);
    }
  }

  // Generate AI-powered quiz from note content
  async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number = 5, noteContent?: string): Promise<any> {
    if (!this.apiKey) {
      return this.getFallbackQuiz(topic, difficulty, questionCount);
    }

    try {
      const difficultyInstructions = {
        easy: 'Create basic questions that test fundamental understanding and recall.',
        medium: 'Create questions that require application of concepts and some analysis.',
        hard: 'Create challenging questions that require critical thinking, synthesis, and deep understanding.'
      };

      const contextInfo = noteContent ? `\n\nBase the questions on this content:\n${noteContent.substring(0, 1000)}...` : '';

      const prompt = `You are an expert educator creating a comprehensive ${difficulty} level quiz about "${topic}". Create exactly ${questionCount} UNIQUE multiple choice questions that test real knowledge and understanding.

${difficultyInstructions[difficulty]}${contextInfo}

CRITICAL REQUIREMENTS:
- ALL questions must be directly related to "${topic}" - no generic or tangentially related questions
- Each question must test a DIFFERENT specific aspect, concept, or detail within ${topic}
- NO question should be similar to or repeat another question in the quiz
- Questions must be factually accurate and based on real information about ${topic}
- Use specific terminology, concepts, and facts related to ${topic}
- Avoid generic placeholder answers - use realistic, topic-specific content
- Include common misconceptions as incorrect options to make questions educational
- Make sure incorrect options are plausible but clearly wrong to knowledgeable users
- Cover different subtopics within ${topic} to ensure variety

For each question, provide:
1. A specific, well-researched question directly about ${topic}
2. Four realistic answer options with actual ${topic}-related content
3. The correct answer (0-3 index)
4. A detailed explanation including why the correct answer is right and why others are wrong

Format your response as a JSON object with this structure:
{
  "questions": [
    {
      "question": "Specific question directly about ${topic}?",
      "options": ["${topic}-specific option 1", "${topic}-specific option 2", "${topic}-specific option 3", "${topic}-specific option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation with real facts about ${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}

Ensure each question covers a different aspect of ${topic} and no two questions are similar or test the same concept.`;

      // Use OpenRouter API directly for quiz generation (with image support and correct message format)
      const apiKey = this.apiKey;
      const siteUrl = this.siteUrl;
      const siteName = this.siteName;
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': siteUrl,
          'X-Title': siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tngtech/deepseek-r1t2-chimera:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      let aiContent = data.choices?.[0]?.message?.content || '';
      // Remove Markdown code block wrappers if present
      aiContent = aiContent.trim()
        .replace(/^```json[\r\n]*/i, '')
        .replace(/^```[\r\n]*/i, '')
        .replace(/```\s*$/i, '');
      // Parse the JSON response
      try {
        const quizData = JSON.parse(aiContent);
        // Validate and format the quiz data
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
          estimatedTime: questionCount * 2 // 2 minutes per question
        };
      } catch (parseError) {
        console.error('Failed to parse AI quiz response:', parseError);
        return this.getFallbackQuiz(topic, difficulty, questionCount);
      }
    } catch (error) {
      console.error('AI quiz generation error:', error);
      return this.getFallbackQuiz(topic, difficulty, questionCount);
    }
  }

  // Fallback methods
  private getFallbackYouTubeSummary(url: string, videoId: string) {
    return {
      title: `📹 YouTube Summary: ${videoId}`,
      content: `🎬 **Video Summary**\n\nURL: ${url}\nVideo ID: ${videoId}\n\n✨ **Key Points:**\n• Educational content captured\n• Main concepts identified\n• Actionable insights extracted\n\n🚀 **Next Steps:**\n• Review and take notes\n• Apply key concepts\n• Share insights with others`,
      noteContent: `# 📹 YouTube Video Summary\n\n**Source:** ${url}\n**Video ID:** ${videoId}\n**Date:** ${new Date().toLocaleDateString()}\n\n## 📝 Summary\n\nThis video contains valuable educational content. Key topics covered include:\n\n• Main concept 1\n• Important insight 2\n• Practical application 3\n\n## 🎯 Action Items\n\n- [ ] Review key concepts\n- [ ] Apply learnings\n- [ ] Take detailed notes`
    };
  }

  private getFallbackSearch(query: string, notes: any[]) {
    return notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  private getFallbackInsights(notes: any[]) {
    return [
      {
        id: Date.now().toString(),
        type: 'productivity',
        content: `📊 **Productivity Insight**\n\nYou have ${notes.length} notes in your collection. Recent activity shows consistent note-taking habits. Consider organizing by themes for better discovery.`,
        timestamp: new Date()
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'learning',
        content: `🧠 **Learning Pattern**\n\nYour notes cover diverse topics. This indicates strong curiosity and learning drive. Consider creating connections between related concepts.`,
        timestamp: new Date()
      }
    ];
  }

  private getFallbackSuggestions(_notes: any[]) {
    return [
      {
        id: Date.now().toString(),
        title: '🏷️ Organize with Tags',
        description: 'Add relevant tags to your notes for better organization and discovery',
        action: 'tag_notes'
      },
      {
        id: (Date.now() + 1).toString(),
        title: '⭐ Star Important Notes',
        description: 'Mark your most valuable notes as favorites for quick access',
        action: 'star_notes'
      },
      {
        id: (Date.now() + 2).toString(),
        title: '📚 Create Study Sessions',
        description: 'Review your notes regularly to reinforce learning',
        action: 'study_session'
      }
    ];
  }

  private getFallbackTags(content: string) {
    const commonTags = ['important', 'learning', 'reference', 'todo', 'idea', 'research', 'notes', 'study'];
    const words = content.toLowerCase().split(/\s+/);
    const suggestedTags = [];
    
    // Simple keyword-based tag suggestion
    if (words.some(w => ['learn', 'study', 'education'].includes(w))) suggestedTags.push('learning');
    if (words.some(w => ['work', 'project', 'task'].includes(w))) suggestedTags.push('work');
    if (words.some(w => ['idea', 'concept', 'thought'].includes(w))) suggestedTags.push('ideas');
    if (words.some(w => ['important', 'critical', 'key'].includes(w))) suggestedTags.push('important');
    
    return suggestedTags.length > 0 ? suggestedTags : commonTags.slice(0, 4);
  }

  private getFallbackQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number) {
    const fallbackQuestions = [];
    
    // Create realistic questions based on common topics
    const topicQuestions = this.getTopicSpecificQuestions(topic.toLowerCase(), difficulty);
    
    // Shuffle questions to ensure variety and prevent predictable patterns
    const shuffledQuestions = [...topicQuestions].sort(() => Math.random() - 0.5);
    
    // Use Set to track used questions and prevent repetition
    const usedQuestions = new Set<string>();
    let questionIndex = 0;
    
    for (let i = 0; i < questionCount; i++) {
      let template = shuffledQuestions[questionIndex % shuffledQuestions.length];
      let attempts = 0;
      
      // Find a unique question (avoid repetition)
      while (usedQuestions.has(template.question) && attempts < shuffledQuestions.length) {
        questionIndex++;
        template = shuffledQuestions[questionIndex % shuffledQuestions.length];
        attempts++;
      }
      
      // If we've exhausted unique questions, create a variation
      if (usedQuestions.has(template.question)) {
        template = this.createQuestionVariation(template, topic, i);
      }
      
      usedQuestions.add(template.question);
      
      fallbackQuestions.push({
        id: `fallback-q-${Date.now()}-${i}`,
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        difficulty: difficulty
      });
      
      questionIndex++;
    }

    return {
      id: `fallback-quiz-${Date.now()}`,
      topic: topic,
      questions: fallbackQuestions,
      createdAt: new Date(),
      difficulty: difficulty,
      estimatedTime: questionCount * 2
    };
  }

  private getTopicSpecificQuestions(topic: string, difficulty: 'easy' | 'medium' | 'hard') {
    // JavaScript/Programming questions
    if (topic.includes('javascript') || topic.includes('js') || topic.includes('programming') || topic.includes('coding')) {
      return difficulty === 'easy' ? [
        {
          question: "What is the correct way to declare a variable in JavaScript?",
          options: ["let myVar = 5;", "variable myVar = 5;", "declare myVar = 5;", "var myVar := 5;"],
          correctAnswer: 0,
          explanation: "'let' is the modern way to declare variables in JavaScript. 'var' also works but has different scoping rules."
        },
        {
          question: "Which of these is NOT a JavaScript data type?",
          options: ["string", "boolean", "integer", "undefined"],
          correctAnswer: 2,
          explanation: "JavaScript doesn't have a separate 'integer' type. Numbers are all of type 'number', whether they're integers or floats."
        },
        {
          question: "What does '===' do in JavaScript?",
          options: ["Assignment", "Loose equality", "Strict equality", "Not equal"],
          correctAnswer: 2,
          explanation: "'===' checks for strict equality, comparing both value and type without type coercion."
        },
        {
          question: "How do you create a function in JavaScript?",
          options: ["function myFunc() {}", "create function myFunc() {}", "def myFunc() {}", "func myFunc() {}"],
          correctAnswer: 0,
          explanation: "Functions in JavaScript are created using the 'function' keyword followed by the function name and parentheses."
        },
        {
          question: "What is the correct way to write a JavaScript comment?",
          options: ["// This is a comment", "# This is a comment", "<!-- This is a comment -->", "/* This is a comment"],
          correctAnswer: 0,
          explanation: "Single-line comments in JavaScript start with '//'. Multi-line comments use /* */."
        },
        {
          question: "Which method is used to add an element to an array?",
          options: ["array.push()", "array.add()", "array.append()", "array.insert()"],
          correctAnswer: 0,
          explanation: "The push() method adds one or more elements to the end of an array."
        },
        {
          question: "What does 'console.log()' do in JavaScript?",
          options: ["Prints to the console", "Creates a log file", "Shows an alert", "Saves to localStorage"],
          correctAnswer: 0,
          explanation: "console.log() outputs information to the browser's console for debugging purposes."
        },
        {
          question: "How do you access the first element of an array called 'arr'?",
          options: ["arr[0]", "arr[1]", "arr.first()", "arr.get(0)"],
          correctAnswer: 0,
          explanation: "Arrays in JavaScript are zero-indexed, so the first element is accessed with arr[0]."
        }
      ] : difficulty === 'medium' ? [
        {
          question: "What is the output of: console.log(typeof null)?",
          options: ["'null'", "'undefined'", "'object'", "'boolean'"],
          correctAnswer: 2,
          explanation: "This is a famous JavaScript quirk. 'typeof null' returns 'object', which is considered a bug but remains for backward compatibility."
        },
        {
          question: "Which method adds an element to the end of an array?",
          options: ["array.append()", "array.push()", "array.add()", "array.insert()"],
          correctAnswer: 1,
          explanation: "The push() method adds one or more elements to the end of an array and returns the new length."
        },
        {
          question: "What is a closure in JavaScript?",
          options: ["A way to close files", "A function with access to outer scope", "A type of loop", "A method to end execution"],
          correctAnswer: 1,
          explanation: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned."
        },
        {
          question: "What is the difference between 'let' and 'var'?",
          options: ["No difference", "'let' has block scope, 'var' has function scope", "'var' is newer", "'let' is faster"],
          correctAnswer: 1,
          explanation: "'let' has block scope and doesn't allow redeclaration, while 'var' has function scope and allows redeclaration."
        },
        {
          question: "What does the 'this' keyword refer to in JavaScript?",
          options: ["The current function", "The global object", "The context object", "The previous function"],
          correctAnswer: 2,
          explanation: "'this' refers to the context object that the function is called on, which can vary depending on how the function is invoked."
        },
        {
          question: "What is event bubbling in JavaScript?",
          options: ["Creating events", "Events propagating up the DOM tree", "Deleting events", "Events moving down the DOM tree"],
          correctAnswer: 1,
          explanation: "Event bubbling is when an event starts from the target element and propagates up through its parent elements in the DOM tree."
        },
        {
          question: "What is the purpose of 'use strict' in JavaScript?",
          options: ["Makes code faster", "Enables strict mode for better error checking", "Compresses code", "Enables new features"],
          correctAnswer: 1,
          explanation: "'use strict' enables strict mode, which catches common coding errors and prevents the use of certain error-prone features."
        }
      ] : [
        {
          question: "What is the difference between call() and apply() methods?",
          options: ["No difference", "call() takes arguments individually, apply() takes an array", "apply() is faster", "call() is deprecated"],
          correctAnswer: 1,
          explanation: "call() takes arguments individually: func.call(this, arg1, arg2), while apply() takes an array: func.apply(this, [arg1, arg2])."
        },
        {
          question: "What does the 'this' keyword refer to in an arrow function?",
          options: ["The function itself", "The global object", "The lexical scope", "undefined"],
          correctAnswer: 2,
          explanation: "Arrow functions don't have their own 'this'. They inherit 'this' from the enclosing lexical scope."
        },
        {
          question: "What is the purpose of the WeakMap in JavaScript?",
          options: ["Store weak references to objects", "Create maps with weak keys", "Improve performance", "Handle memory leaks"],
          correctAnswer: 1,
          explanation: "WeakMap allows garbage collection of keys when there are no other references to them, preventing memory leaks."
        },
        {
          question: "What is the event loop in JavaScript?",
          options: ["A loop for events", "Mechanism for handling asynchronous operations", "A type of for loop", "Event creation system"],
          correctAnswer: 1,
          explanation: "The event loop is JavaScript's mechanism for handling asynchronous operations by managing the call stack and callback queue."
        },
        {
          question: "What is the difference between synchronous and asynchronous code?",
          options: ["No difference", "Sync blocks execution, async doesn't", "Async is faster", "Sync uses more memory"],
          correctAnswer: 1,
          explanation: "Synchronous code blocks execution until completion, while asynchronous code allows other operations to continue."
        },
        {
          question: "What is a Promise in JavaScript?",
          options: ["A guarantee", "An object representing eventual completion of an async operation", "A type of function", "A loop construct"],
          correctAnswer: 1,
          explanation: "A Promise is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value."
        },
        {
          question: "What does 'hoisting' mean in JavaScript?",
          options: ["Lifting variables", "Moving declarations to the top of scope", "Optimizing code", "Compressing functions"],
          correctAnswer: 1,
          explanation: "Hoisting is JavaScript's behavior of moving variable and function declarations to the top of their containing scope during compilation."
        }
      ];
    }
    
    // React questions
    if (topic.includes('react') || topic.includes('jsx')) {
      return difficulty === 'easy' ? [
        {
          question: "What is JSX in React?",
          options: ["A JavaScript library", "A syntax extension for JavaScript", "A CSS framework", "A testing tool"],
          correctAnswer: 1,
          explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files."
        },
        {
          question: "How do you create a functional component in React?",
          options: ["class MyComponent extends React.Component", "function MyComponent() {}", "React.createComponent()", "new React.Component()"],
          correctAnswer: 1,
          explanation: "Functional components are created using regular JavaScript functions that return JSX."
        }
      ] : [
        {
          question: "What is the purpose of useEffect hook?",
          options: ["Handle side effects", "Manage state", "Create components", "Style components"],
          correctAnswer: 0,
          explanation: "useEffect is used to handle side effects like API calls, subscriptions, or manually changing the DOM."
        },
        {
          question: "What is the virtual DOM?",
          options: ["A real DOM copy", "A JavaScript representation of the DOM", "A CSS framework", "A testing environment"],
          correctAnswer: 1,
          explanation: "The virtual DOM is a JavaScript representation of the actual DOM, used by React to optimize updates."
        }
      ];
    }
    
    // Python questions
    if (topic.includes('python') || topic.includes('py')) {
      return difficulty === 'easy' ? [
        {
          question: "How do you create a list in Python?",
          options: ["list = [1, 2, 3]", "list = (1, 2, 3)", "list = {1, 2, 3}", "list = <1, 2, 3>"],
          correctAnswer: 0,
          explanation: "Lists in Python are created using square brackets []. Parentheses create tuples, curly braces create sets or dictionaries."
        },
        {
          question: "What is the correct way to define a function in Python?",
          options: ["function myFunc():", "def myFunc():", "func myFunc():", "define myFunc():"],
          correctAnswer: 1,
          explanation: "Functions in Python are defined using the 'def' keyword followed by the function name and parentheses."
        }
      ] : [
        {
          question: "What is a list comprehension in Python?",
          options: ["A way to understand lists", "A concise way to create lists", "A list method", "A type of loop"],
          correctAnswer: 1,
          explanation: "List comprehensions provide a concise way to create lists: [x*2 for x in range(10)]."
        },
        {
          question: "What is the difference between '==' and 'is' in Python?",
          options: ["No difference", "'==' compares values, 'is' compares identity", "'is' is faster", "'==' is deprecated"],
          correctAnswer: 1,
          explanation: "'==' compares values for equality, while 'is' compares object identity (whether they're the same object in memory)."
        }
      ];
    }
    
    // HTML/CSS questions
    if (topic.includes('html') || topic.includes('css') || topic.includes('web')) {
      return difficulty === 'easy' ? [
        {
          question: "What does HTML stand for?",
          options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
          correctAnswer: 0,
          explanation: "HTML stands for HyperText Markup Language, the standard markup language for creating web pages."
        },
        {
          question: "Which HTML tag is used for the largest heading?",
          options: ["<h6>", "<h1>", "<header>", "<heading>"],
          correctAnswer: 1,
          explanation: "<h1> is the largest heading tag in HTML, with headings going from <h1> (largest) to <h6> (smallest)."
        }
      ] : [
        {
          question: "What is the CSS box model?",
          options: ["A way to create boxes", "Content, padding, border, margin", "A layout method", "A CSS framework"],
          correctAnswer: 1,
          explanation: "The CSS box model describes how elements are structured: content area, padding, border, and margin."
        },
        {
          question: "What is the difference between 'display: none' and 'visibility: hidden'?",
          options: ["No difference", "'display: none' removes from layout, 'visibility: hidden' keeps space", "'visibility: hidden' is faster", "'display: none' is deprecated"],
          correctAnswer: 1,
          explanation: "'display: none' completely removes the element from the layout, while 'visibility: hidden' hides it but keeps its space."
        }
      ];
    }
    
    // Generic fallback questions
    return [
      {
        question: `What is a fundamental concept in ${topic}?`,
        options: [
          `Core principles and foundations of ${topic}`,
          `Advanced techniques only used by experts`,
          `Outdated methods no longer relevant`,
          `Theoretical concepts with no practical use`
        ],
        correctAnswer: 0,
        explanation: `Understanding the fundamental concepts and core principles is essential for mastering ${topic}.`
      },
      {
        question: `Which approach is most effective when learning ${topic}?`,
        options: [
          `Memorizing without understanding`,
          `Hands-on practice with real examples`,
          `Only reading theoretical materials`,
          `Avoiding practical applications`
        ],
        correctAnswer: 1,
        explanation: `Hands-on practice with real examples is the most effective way to learn and understand ${topic}.`
      },
      {
        question: `What is important to consider when working with ${topic}?`,
        options: [
          `Best practices and established standards`,
          `Using only the newest techniques`,
          `Ignoring documentation and guidelines`,
          `Working in isolation without feedback`
        ],
        correctAnswer: 0,
        explanation: `Following best practices and established standards ensures quality and maintainability in ${topic}.`
      }
    ];
  }

  private createQuestionVariation(originalTemplate: any, _topic: string, index: number) {
    // Create variations of questions when we need more unique questions
    const variations = {
      question: `${originalTemplate.question} (Variation ${index + 1})`,
      options: [...originalTemplate.options].sort(() => Math.random() - 0.5), // Shuffle options
      correctAnswer: originalTemplate.options.indexOf(originalTemplate.options[originalTemplate.correctAnswer]), // Find new position of correct answer
      explanation: originalTemplate.explanation
    };
    
    // Update correct answer index after shuffling
    const correctOption = originalTemplate.options[originalTemplate.correctAnswer];
    variations.correctAnswer = variations.options.indexOf(correctOption);
    
    return variations;
  }
}

export const aiService = new ExtendedAIService();
export default aiService;
