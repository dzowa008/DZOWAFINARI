import { useState, useRef, useEffect } from 'react';
import { 
  X, Bot, Send, Sparkles, Lightbulb, FileText, Zap, Youtube, Download, 
  Save, Eye, EyeOff, Palette, Type, Hash, List, Clock, Star, 
  TrendingUp, BookOpen, Target, CheckCircle, AlertCircle
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: () => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface NoteTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  content: string;
}

function CreateNoteModal({ isOpen, onClose, onCreateNote, title, setTitle, content, setContent }: CreateNoteModalProps) {
  // Core state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiAction, setAiAction] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "✨ Hello! I'm your AI writing companion. I can help you brainstorm, structure, and enhance your notes. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: ['💡 Brainstorm ideas', '✍️ Improve writing', '📋 Structure content', '🔍 Add details']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // UI state
  const [showAiSidebar, setShowAiSidebar] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  
  // YouTube integration
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [showYoutubeSummarizer, setShowYoutubeSummarizer] = useState(false);
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Note templates
  const noteTemplates: NoteTemplate[] = [
    {
      id: 'meeting',
      name: 'Meeting Notes',
      icon: <Clock className="w-4 h-4" />,
      description: 'Structured meeting documentation',
      content: `# Meeting Notes: [Meeting Title]

## 📅 Meeting Details
- **Date:** ${new Date().toLocaleDateString()}
- **Time:** [Start Time] - [End Time]
- **Location:** [Location/Platform]
- **Attendees:** [List of participants]

## 🎯 Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## 📝 Discussion Points
### [Topic 1]
- [Key point 1]
- [Key point 2]

### [Topic 2]
- [Key point 1]
- [Key point 2]

## ✅ Action Items
- [ ] [Action 1] - [Assignee] - [Due Date]
- [ ] [Action 2] - [Assignee] - [Due Date]

## 📋 Next Steps
- [Next step 1]
- [Next step 2]

## 💡 Key Takeaways
- [Takeaway 1]
- [Takeaway 2]`
    },
    {
      id: 'study',
      name: 'Study Notes',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Academic study and learning',
      content: `# Study Notes: [Subject/Topic]

## 📚 Learning Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

## 🔑 Key Concepts
### [Concept 1]
- **Definition:** [Clear definition]
- **Examples:** [Real-world examples]
- **Importance:** [Why this matters]

### [Concept 2]
- **Definition:** [Clear definition]
- **Examples:** [Real-world examples]
- **Importance:** [Why this matters]

## 📖 Important Details
- [Detail 1 with explanation]
- [Detail 2 with explanation]
- [Detail 3 with explanation]

## ❓ Questions to Explore
- [Question 1]
- [Question 2]
- [Question 3]

## 🔗 Related Topics
- [Related topic 1]
- [Related topic 2]

## 📝 Summary
[Key takeaways and main points to remember]`
    },
    {
      id: 'project',
      name: 'Project Plan',
      icon: <Target className="w-4 h-4" />,
      description: 'Project planning and tracking',
      content: `# Project: [Project Name]

## 🎯 Project Overview
**Objective:** [What you want to achieve]
**Scope:** [What's included/excluded]
**Timeline:** [Start Date] - [End Date]

## 📋 Project Phases
### Phase 1: [Phase Name]
- **Duration:** [Timeframe]
- **Deliverables:** [What will be completed]
- **Tasks:**
  - [ ] [Task 1]
  - [ ] [Task 2]
  - [ ] [Task 3]

### Phase 2: [Phase Name]
- **Duration:** [Timeframe]
- **Deliverables:** [What will be completed]
- **Tasks:**
  - [ ] [Task 1]
  - [ ] [Task 2]

## 🚀 Milestones
- [ ] [Milestone 1] - [Date]
- [ ] [Milestone 2] - [Date]
- [ ] [Milestone 3] - [Date]

## 📊 Resources Needed
- **People:** [Team members]
- **Tools:** [Software/hardware]
- **Budget:** [Estimated costs]

## ⚠️ Risks & Mitigation
- **Risk:** [Risk description]
  **Mitigation:** [How to address it]

## 📈 Success Metrics
- [Metric 1]
- [Metric 2]`
    },
    {
      id: 'journal',
      name: 'Personal Journal',
      icon: <Star className="w-4 h-4" />,
      description: 'Personal thoughts and reflections',
      content: `# Journal Entry: ${new Date().toLocaleDateString()}

## 🌅 Morning Reflection
[How I'm feeling this morning]

## 📝 Today's Goals
- [ ] [Goal 1]
- [ ] [Goal 2]
- [ ] [Goal 3]

## 💭 Thoughts & Observations
[What I'm thinking about today]

## 🎯 What I Learned
[New insights or lessons]

## 🌟 Gratitude
- [Grateful for 1]
- [Grateful for 2]
- [Grateful for 3]

## 🔮 Tomorrow's Focus
[What I want to focus on tomorrow]

## 📚 Quotes & Inspiration
"[Meaningful quote]"
- [Author]

## 🎨 Creative Ideas
[Any creative thoughts or projects]

## 📊 Mood Tracker
- **Morning:** [Mood]
- **Afternoon:** [Mood]
- **Evening:** [Mood]

## 💡 Personal Growth
[How I'm growing or what I'm working on]`
    },
    {
      id: 'research',
      name: 'Research Notes',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Academic or professional research',
      content: `# Research: [Topic]

## 🔍 Research Question
[State your main research question or objective]

## 📚 Literature Review
### Source 1: [Title]
- **Author:** [Author Name]
- **Year:** [Publication Year]
- **Key Findings:** [Main points]
- **Relevance:** [Why this source matters]

### Source 2: [Title]
- **Author:** [Author Name]
- **Year:** [Publication Year]
- **Key Findings:** [Main points]
- **Relevance:** [Why this source matters]

## 📊 Methodology
[Describe your research approach]

## 📈 Findings
- [Finding 1]
- [Finding 2]
- [Finding 3]

## 🎯 Conclusions
[Summarize your main conclusions]

## 📝 Notes
[Additional thoughts and observations]`
    }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Auto-resize textarea and update counts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    
    // Update word and character counts
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const readTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute
    
    setWordCount(words);
    setCharCount(chars);
    setEstimatedReadTime(readTime);
  }, [content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (title.trim()) {
          onCreateNote();
        }
      }
      
      // Ctrl+Shift+P to toggle preview
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowPreview(!showPreview);
      }
      
      // Ctrl+Shift+T to toggle templates
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowTemplates(!showTemplates);
      }
      
      // Ctrl+Shift+A to toggle AI sidebar
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAiSidebar(!showAiSidebar);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, title, showPreview, showTemplates, showAiSidebar, onCreateNote]);

  // AI Service integration
  const callAIService = async (userInput: string, conversationHistory: any[] = []) => {
    try {
      const aiMessages = aiService.convertChatHistory(conversationHistory);
      const response = await aiService.generateResponse(
        userInput,
        content,
        true,
        aiMessages
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      return generateFallbackResponse(userInput, title, content);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsAiProcessing(true);

    try {
      const aiResponse = await callAIService(currentInput, chatMessages);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        suggestions: generateSuggestions(currentInput)
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const fallbackResponse = generateFallbackResponse(currentInput, title, content);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `⚠️ API temporarily unavailable. Here's a helpful response:\n\n${fallbackResponse.content}`,
        timestamp: new Date(),
        suggestions: fallbackResponse.suggestions
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Generate contextual suggestions based on user input
  const generateSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();
    
    if (input.includes('brainstorm') || input.includes('idea')) {
      return ['🎯 Focus on main themes', '🔍 Find examples', '✨ Add unique angle', '📝 Start writing'];
    }
    
    if (input.includes('improve') || input.includes('better')) {
      return ['🎨 Improve style', '📊 Fix structure', '✨ Add examples', '🔍 Deepen insights'];
    }
    
    if (input.includes('structure') || input.includes('organize')) {
      return ['📋 Add headings', '🔢 Number points', '📝 Group ideas', '🎯 Prioritize'];
    }
    
    return ['💡 Brainstorm ideas', '✍️ Improve writing', '📋 Structure content', '🔍 Add details'];
  };

  // Fallback response when API is unavailable
  const generateFallbackResponse = (userInput: string, noteTitle: string, noteContent: string) => {
    const input = userInput.toLowerCase();
    const hasContent = noteContent.trim().length > 0;
    const hasTitle = noteTitle.trim().length > 0;
    
    if (input.includes('brainstorm') || input.includes('idea')) {
      const topic = hasTitle ? noteTitle : 'your topic';
      return {
        content: `💡 **Brainstorming for "${topic}"**\n\nLet's generate some creative ideas:\n\n🎯 **Core Concepts:**\n• Key themes and main points\n• Different perspectives to explore\n• Questions to investigate\n\n🔍 **Research Areas:**\n• Supporting evidence needed\n• Examples and case studies\n• Related topics to connect\n\nWhat direction excites you most?`,
        suggestions: ['🎯 Focus on main themes', '🔍 Find examples', '✨ Add unique angle', '📝 Start writing']
      };
    }
    
    if (input.includes('improve') || input.includes('better')) {
      if (!hasContent) {
        return {
          content: `✍️ **Ready to improve your writing!**\n\nI notice you haven't started writing yet. Let's begin:\n\n📝 **Getting Started:**\n• Write a compelling opening line\n• State your main point clearly\n• Add supporting details\n\n💡 **Pro Tips:**\n• Use active voice\n• Keep sentences clear and concise\n• Add specific examples`,
          suggestions: ['📝 Write opening line', '🎯 Define main point', '💡 Add examples', '🔄 Start over']
        };
      }
      
      return {
        content: `✨ **I'm here to help!**\n\nI can assist you with:\n\n💡 **Brainstorming** - Generate new ideas and perspectives\n✍️ **Writing** - Improve style, clarity, and flow\n📋 **Structure** - Organize your thoughts logically\n🔍 **Details** - Add depth and supporting information\n\nWhat would you like to work on? Just let me know!`,
        suggestions: ['💡 Brainstorm ideas', '✍️ Improve writing', '📋 Structure content', '🔍 Add details']
      };
    }
    
    if (input.includes('structure') || input.includes('organize')) {
      return {
        content: `📋 **Structuring your ideas perfectly!**\n\n🏗️ **Recommended Structure:**\n\n1. **🎯 Hook** - Grab attention immediately\n2. **📝 Context** - Set the scene\n3. **💡 Main Points** - Core ideas (3-5 key points)\n4. **🔍 Evidence** - Examples, facts, quotes\n5. **🎯 Conclusion** - Key takeaways\n\n📐 **Organization Tips:**\n• Use clear headings\n• Group related ideas\n• Create logical flow\n• Add transitions between sections\n\nWant me to help restructure your current content?`,
        suggestions: ['🏗️ Restructure content', '📐 Add headings', '🔄 Reorder sections', '➡️ Add transitions']
      };
    }
    
    if (input.includes('🔍') || input.includes('detail') || input.includes('expand')) {
      return {
        content: `🔍 **Adding depth and detail!**\n\n📈 **Ways to expand:**\n\n🎯 **Specific Examples:**\n• Real-world cases\n• Personal experiences\n• Historical references\n\n📊 **Supporting Data:**\n• Statistics and numbers\n• Research findings\n• Expert opinions\n\n🔗 **Connections:**\n• Link to other concepts\n• Show cause and effect\n• Explain implications\n\n💡 **Deeper Analysis:**\n• Ask 'why' and 'how'\n• Explore different viewpoints\n• Consider future implications\n\nWhich area needs more development?`,
        suggestions: ['🎯 Add examples', '📊 Include data', '🔗 Make connections', '💡 Deepen analysis']
      };
    }
    
    // Smart default response based on context
    if (!hasTitle && !hasContent) {
      return {
        content: `🚀 **Let's create something amazing!**\n\nI'm here to help you every step of the way:\n\n📝 **Getting Started:**\n• Choose a compelling title\n• Brainstorm your main ideas\n• Create an outline\n\n✨ **As You Write:**\n• Improve your content\n• Structure your thoughts\n• Add examples and details\n\n🎯 **Finishing Strong:**\n• Polish your writing\n• Add final touches\n• Review and refine\n\nWhat would you like to work on first?`,
        suggestions: ['📝 Choose a title', '💡 Brainstorm ideas', '📋 Create outline', '✍️ Start writing']
      };
    }
    
    return {
      content: `✨ **I'm here to help!**\n\nI can assist you with:\n\n💡 **Brainstorming** - Generate new ideas and perspectives\n✍️ **Writing** - Improve style, clarity, and flow\n📋 **Structure** - Organize your thoughts logically\n🔍 **Details** - Add depth and supporting information\n\nWhat would you like to work on? Just let me know!`,
      suggestions: ['💡 Brainstorm ideas', '✍️ Improve writing', '📋 Structure content', '🔍 Add details']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setChatInput(suggestion);
    chatInputRef.current?.focus();
  };

  const handleQuickAction = async (action: string) => {
    setIsAiProcessing(true);
    setAiAction(action);
    
    try {
      let prompt = '';
      
      switch (action) {
        case 'improve':
          prompt = `Please improve this note by enhancing clarity, flow, and structure. Make it more engaging and well-organized:\n\nTitle: ${title}\nContent: ${content}`;
          break;
        case 'summarize':
          prompt = `Create a concise, informative summary of this note that captures the key points:\n\nTitle: ${title}\nContent: ${content}`;
          break;
        case 'expand':
          prompt = `Expand this note with more details, examples, and relevant context. Add depth while maintaining clarity:\n\nTitle: ${title}\nContent: ${content}`;
          break;
        case 'structure':
          prompt = `Reorganize this note with clear headings, bullet points, and logical structure. Make it easy to scan and understand:\n\nTitle: ${title}\nContent: ${content}`;
          break;
        default:
          prompt = `Help improve this note in any way you think would be beneficial:\n\nTitle: ${title}\nContent: ${content}`;
      }
      
      const aiResponse = await callAIService(prompt, chatMessages);
      
      // For content actions, update the note content directly
      if (['improve', 'expand', 'structure', 'summarize'].includes(action)) {
        setContent(aiResponse);
      }
      
      // Add confirmation message to chat
      const actionMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `✅ I've ${action}d your note! The content has been updated. Feel free to make further adjustments or ask for more help.`,
        timestamp: new Date(),
        suggestions: ['✨ Improve further', '📝 Add examples', '🔄 Try different approach', '✅ Looks good']
      };
      setChatMessages(prev => [...prev, actionMessage]);
      
    } catch (error) {
      console.error('Quick action error:', error);
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `⚠️ I encountered an issue while ${action}ing your note. The AI service might be temporarily unavailable. Try asking me directly what you'd like to improve!`,
        timestamp: new Date(),
        suggestions: ['🔄 Try again', '💬 Ask for help', '✏️ Manual edit', '🤖 Check AI status']
      };
      setChatMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsAiProcessing(false);
      setAiAction('');
    }
  };

  const handleTemplateSelect = (template: NoteTemplate) => {
    if (template.id === 'journal') {
      setTitle(`Journal Entry - ${new Date().toLocaleDateString()}`);
    } else {
      setTitle(template.name);
    }
    setContent(template.content);
    setShowTemplates(false);
  };

  const handleYoutubeSummarize = async () => {
    if (!youtubeUrl.trim()) return;
    
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: '❌ **Invalid YouTube URL**\n\nPlease provide a valid YouTube video URL. Examples:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID',
        timestamp: new Date(),
        suggestions: ['Try another URL', 'Need help with format']
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsProcessingVideo(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `📺 Summarize YouTube video: ${youtubeUrl}`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const summary = await aiService.summarizeYouTubeVideo(youtubeUrl, videoId);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `✅ **Video Summary Generated!**\n\n${summary.content}`,
        timestamp: new Date(),
        suggestions: ['📝 Add to note', '🔍 Ask questions', '💡 Generate quiz', '📋 Create outline']
      };
      setChatMessages(prev => [...prev, aiMessage]);
      
      if (!title.trim()) {
        setTitle(summary.title);
      }
      if (!content.trim()) {
        setContent(summary.noteContent);
      }
      
    } catch (error) {
      console.error('YouTube summarization error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '⚠️ **Unable to process video**\n\nThis could be due to:\n• API rate limits or connectivity issues\n• Video is private or restricted\n• Network connectivity problems\n\nTrying again in a moment might work, or try with a different video.',
        timestamp: new Date(),
        suggestions: ['Try another video', 'Manual summary', 'Ask for help']
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessingVideo(false);
      setYoutubeUrl('');
    }
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl sm:rounded-3xl w-full max-w-7xl h-[95vh] sm:h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl">
          {/* Main Note Creation Form */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Create New Note</h3>
                      <p className="text-sm text-gray-400">Write with AI assistance</p>
                    </div>
                  </div>
                  
                  {/* Stats Display */}
                  <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Type className="w-4 h-4" />
                      <span>{wordCount} words</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>{charCount} chars</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{estimatedReadTime} min read</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Template Button */}
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      showTemplates 
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700'
                    }`}
                    title="Note Templates"
                  >
                    <List className="w-4 h-4" />
                    <span className="text-sm font-medium">Templates</span>
                  </button>
                  
                  {/* Preview Button */}
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      showPreview 
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' 
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700'
                    }`}
                    title="Preview Note"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="text-sm font-medium">{showPreview ? 'Hide' : 'Preview'}</span>
                  </button>
                  
                  {/* AI Assistant Toggle */}
                  <button
                    onClick={() => setShowAiSidebar(!showAiSidebar)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      showAiSidebar 
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700'
                    }`}
                    title="Toggle AI Assistant"
                  >
                    <Bot className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {showAiSidebar ? 'Hide AI' : 'Show AI'}
                    </span>
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Templates Dropdown */}
              {showTemplates && (
                <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                      <List className="w-4 h-4" />
                      <span>Choose a Template</span>
                    </h4>
                    <div className="text-xs text-gray-400">
                      💡 Templates provide structured starting points
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {noteTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="p-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-left transition-all hover:scale-105 hover:border-purple-500/50 group"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="text-purple-400 group-hover:scale-110 transition-transform">{template.icon}</div>
                          <span className="text-sm font-medium text-white">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">{template.description}</p>
                        <div className="mt-2 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to apply template
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Keyboard Shortcuts Help */}
                  <div className="mt-4 pt-3 border-t border-gray-700/50">
                    <div className="text-xs text-gray-400">
                      <strong>Keyboard Shortcuts:</strong> Ctrl+S (Save), Ctrl+Enter (Send AI message), Ctrl+Shift+P (Toggle Preview)
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Title</span>
                    {title.length > 0 && (
                      <span className="text-xs text-gray-500">({title.length} characters)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="Give your note a compelling title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-lg"
                  />
                </div>
                
                {/* Content Textarea or Preview */}
                <div className="flex-1 flex flex-col space-y-2 min-h-0">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Content</span>
                      <span className="text-xs text-gray-500">({content.length} characters)</span>
                    </label>
                    
                    {/* Mobile Stats */}
                    <div className="sm:hidden flex items-center space-x-3 text-xs text-gray-400">
                      <span>{wordCount} words</span>
                      <span>{estimatedReadTime} min</span>
                    </div>
                  </div>
                  
                  {showPreview ? (
                    <div className="min-h-[400px] px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white overflow-y-auto">
                      <div className="prose prose-invert max-w-none">
                        <h1 className="text-2xl font-bold mb-4">{title || 'Untitled Note'}</h1>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {content || 'Start writing your note to see the preview...'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      placeholder="Start writing your note... The AI assistant will help you improve it as you go!"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="flex-1 min-h-[400px] px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all leading-relaxed text-base"
                    />
                  )}
                </div>
                
                {/* Quick AI Actions */}
                <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h5 className="text-sm font-semibold text-white">AI Quick Actions</h5>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleQuickAction('improve')}
                      disabled={isAiProcessing}
                      className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg text-purple-200 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                    >
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                      <span className="text-xs font-medium text-center">
                        {isAiProcessing && aiAction === 'improve' ? 'Improving...' : 'Improve'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('structure')}
                      disabled={isAiProcessing}
                      className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg text-blue-200 hover:from-blue-500/20 hover:to-blue-600/20 hover:border-blue-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                    >
                      <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                      <span className="text-xs font-medium text-center">
                        {isAiProcessing && aiAction === 'structure' ? 'Structuring...' : 'Structure'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('expand')}
                      disabled={isAiProcessing}
                      className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg text-green-200 hover:from-green-500/20 hover:to-green-600/20 hover:border-green-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                    >
                      <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                      <span className="text-xs font-medium text-center">
                        {isAiProcessing && aiAction === 'expand' ? 'Expanding...' : 'Expand'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('summarize')}
                      disabled={isAiProcessing}
                      className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg text-orange-200 hover:from-orange-500/20 hover:to-orange-600/20 hover:border-orange-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                    >
                      <Lightbulb className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                      <span className="text-xs font-medium text-center">
                        {isAiProcessing && aiAction === 'summarize' ? 'Summarizing...' : 'Summarize'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>AI-powered writing assistance</span>
                    </div>
                    
                    {/* Progress Indicator */}
                    {title.trim() && content.trim() && (
                      <div className="flex items-center space-x-2 text-sm text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Ready to save</span>
                      </div>
                    )}
                    
                    {/* Auto-save indicator */}
                    {title.trim() && content.trim() && (
                      <div className="flex items-center space-x-2 text-sm text-blue-400">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Auto-save enabled</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onCreateNote}
                      disabled={!title.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Create Note</span>
                    </button>
                  </div>
                </div>
                
                {/* Status Bar */}
                <div className="mt-4 pt-3 border-t border-gray-700/30">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>📝 {wordCount} words • {charCount} characters</span>
                      <span>⏱️ {estimatedReadTime} min read</span>
                      {showAiSidebar && <span>🤖 AI Assistant active</span>}
                      {showPreview && <span>👁️ Preview mode</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>💡 Press Ctrl+S to save</span>
                      <span>•</span>
                      <span>Ctrl+Shift+P for preview</span>
                      <span>•</span>
                      <span>Ctrl+Shift+A for AI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Assistant Sidebar */}
          {showAiSidebar && (
            <div className="w-96 border-l border-gray-800 flex flex-col bg-gray-900/50">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <h4 className="text-lg font-semibold text-purple-300">AI Assistant</h4>
                  </div>
                  <button
                    onClick={() => setShowYoutubeSummarizer(!showYoutubeSummarizer)}
                    className={`p-2 rounded-lg transition-colors ${
                      showYoutubeSummarizer 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                    title="YouTube Video Summarizer"
                  >
                    <Youtube className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {showYoutubeSummarizer ? 'Summarize YouTube videos' : 'Chat with me to improve your note'}
                </p>
                
                {/* YouTube Summarizer Section */}
                {showYoutubeSummarizer && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Youtube className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">YouTube Video Summarizer</span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Paste YouTube URL here..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 text-sm transition-colors"
                        onKeyPress={(e) => e.key === 'Enter' && handleYoutubeSummarize()}
                      />
                      <button
                        onClick={handleYoutubeSummarize}
                        disabled={!youtubeUrl.trim() || isProcessingVideo}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-700/50 disabled:cursor-not-allowed text-red-300 disabled:text-gray-500 rounded-lg transition-colors text-sm"
                      >
                        {isProcessingVideo ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Summarize Video</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      💡 Supports youtube.com and youtu.be links
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-800 text-gray-100'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isAiProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-gray-100 rounded-lg p-3 max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        <span className="text-sm text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
                                {/* Chat Input */}
                  <div className="p-4 border-t border-gray-800">
                    {/* Quick AI Prompts */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {['💡 Brainstorm ideas', '✍️ Improve writing', '📋 Structure content', '🔍 Add details'].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setChatInput(prompt)}
                          className="px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        ref={chatInputRef}
                        type="text"
                        placeholder="Ask me anything about your note... (Ctrl+Enter to send)"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.ctrlKey ? handleSendMessage() : null)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.ctrlKey && handleSendMessage()}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isAiProcessing}
                        className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        title="Send message (Ctrl+Enter)"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      💡 Try asking: "Help me improve this note" or "What should I add next?"
                    </div>
                  </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CreateNoteModal;