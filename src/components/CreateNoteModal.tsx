import { useState, useRef, useEffect } from 'react';
import { X, Bot, Send, Sparkles, Lightbulb, FileText, Zap, Youtube, Download } from 'lucide-react';
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

function CreateNoteModal({ isOpen, onClose, onCreateNote, title, setTitle, content, setContent }: CreateNoteModalProps) {
  // Core state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiAction, setAiAction] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "✨ Hello! I'm your AI writing companion powered by DeepSeek. I can help you brainstorm, structure, and enhance your notes. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: ['💡 Brainstorm ideas', '✍️ Improve writing', '📋 Structure content', '🔍 Add details']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // UI state
  const [showAiSidebar, setShowAiSidebar] = useState(false); // Start with sidebar closed on mobile
  
  // YouTube integration
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [showYoutubeSummarizer, setShowYoutubeSummarizer] = useState(false);
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  


  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // AI Service integration
  const callAIService = async (userInput: string, conversationHistory: any[] = []) => {
    try {
      // Convert chat messages to the format expected by aiService
      const aiMessages = aiService.convertChatHistory(conversationHistory);

      const response = await aiService.generateResponse(
        userInput,
        content, // Current note content
        true, // isEditing = true since we're in create mode
        aiMessages
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      // Return a fallback response
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
      // Use AI service with conversation history
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
      // Fallback to mock response if API fails
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

  const improveContent = (content: string, title: string) => {
    if (!content.trim()) {
      return `# ${title}\n\n## Introduction\n\nThis note covers important information about ${title.toLowerCase()}.\n\n## Key Points\n\n• [Add your main points here]\n• [Include supporting details]\n• [Provide examples]\n\n## Conclusion\n\n[Summarize the key takeaways]`;
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    return `# ${title}\n\n## Overview\n\n${lines[0] || 'Main content overview'}\n\n## Details\n\n${lines.slice(1).map(line => line.startsWith('•') ? line : `• ${line}`).join('\n')}\n\n## Enhanced Notes\n\n*This content has been improved for clarity and structure.*`;
  };

  const generateSummary = (content: string, title: string) => {
    if (!content.trim()) {
      return `Key topic: ${title}\n\nMain focus: [To be developed]\n\nImportant points: [Add your key insights]`;
    }
    
    const wordCount = content.split(' ').length;
    const lineCount = content.split('\n').filter(line => line.trim()).length;
    
    return `**Topic:** ${title}\n**Length:** ${wordCount} words, ${lineCount} lines\n**Key Focus:** ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
  };

  const expandContent = (content: string, title: string) => {
    if (!content.trim()) {
      return `# ${title}\n\n## Background\n\nThis topic is important because [explain significance].\n\n## Main Content\n\n[Your original content will go here]\n\n## Additional Context\n\n• Related concepts and ideas\n• Practical applications\n• Further considerations\n\n## Examples\n\n[Specific examples that illustrate the main points]\n\n## Next Steps\n\n[What to do with this information]`;
    }
    
    return `${content}\n\n## Additional Context\n\n• **Background:** Understanding the broader context of ${title.toLowerCase()}\n• **Applications:** How this information can be applied practically\n• **Related Topics:** Connected concepts worth exploring\n\n## Examples\n\n[Specific examples that support the main points above]\n\n## Further Reading\n\n[Resources for deeper exploration of this topic]`;
  };

  const structureContent = (content: string, title: string) => {
    if (!content.trim()) {
      return `# ${title}\n\n## Table of Contents\n1. Introduction\n2. Main Points\n3. Examples\n4. Conclusion\n\n## 1. Introduction\n\n[Brief overview of the topic]\n\n## 2. Main Points\n\n• Point 1: [Description]\n• Point 2: [Description]\n• Point 3: [Description]\n\n## 3. Examples\n\n[Supporting examples and evidence]\n\n## 4. Conclusion\n\n[Summary and key takeaways]`;
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    const structured = `# ${title}\n\n## Overview\n\n${lines[0] || 'Main topic overview'}\n\n## Key Points\n\n${lines.slice(1, Math.ceil(lines.length/2)).map(line => line.startsWith('•') ? line : `• ${line}`).join('\n')}\n\n## Additional Details\n\n${lines.slice(Math.ceil(lines.length/2)).map(line => line.startsWith('•') ? line : `• ${line}`).join('\n')}\n\n## Summary\n\nThis note has been organized with clear sections for better readability and understanding.`;
    
    return structured;
  };

  const handleYoutubeSummarize = async () => {
    if (!youtubeUrl.trim()) return;
    
    // Extract video ID from YouTube URL
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
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `📺 Summarize YouTube video: ${youtubeUrl}`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Use the AI service to summarize the YouTube video with vision analysis
      const summary = await aiService.summarizeYouTubeVideo(youtubeUrl, videoId);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `✅ **Video Summary Generated!**\n\n${summary.content}`,
        timestamp: new Date(),
        suggestions: ['📝 Add to note', '🔍 Ask questions', '💡 Generate quiz', '📋 Create outline']
      };
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Auto-fill the note with the summary
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

  const generateVideoSummary = (url: string) => {
    // Simulate different types of video content
    const videoTypes = ['educational', 'tutorial', 'presentation'] as const;
    const type = videoTypes[Math.floor(Math.random() * videoTypes.length)];
    
    const summaries = {
      educational: {
        title: 'Educational Video Summary',
        content: '🎓 **Video Summary Generated**\n\n📺 **Source:** YouTube Video\n🔗 **URL:** ' + url + '\n⏱️ **Processed:** ' + new Date().toLocaleString() + '\n\n## 📋 Key Points\n\n• **Main Topic:** Core concepts and learning objectives\n• **Key Insights:** Important takeaways and explanations\n• **Examples:** Practical demonstrations and case studies\n• **Conclusions:** Summary of main findings\n\n## 🎯 Action Items\n\n• Review and expand on key concepts\n• Research related topics mentioned\n• Apply learnings to practical scenarios\n\n*This summary was automatically generated from the video content.*',
        noteContent: '# Educational Video Summary\n\n## Video Information\n- **Source:** YouTube\n- **URL:** ' + url + '\n- **Date Processed:** ' + new Date().toLocaleDateString() + '\n\n## Key Learning Points\n\n### Main Concepts\n• [Key concept 1]\n• [Key concept 2]\n• [Key concept 3]\n\n### Important Details\n• [Detail 1]\n• [Detail 2]\n• [Detail 3]\n\n### Examples and Applications\n• [Example 1]\n• [Example 2]\n\n## Personal Notes\n\n[Add your own thoughts and reflections here]\n\n## Action Items\n\n- [ ] Review key concepts\n- [ ] Research related topics\n- [ ] Apply learnings',
        suggestions: ['📝 Add personal notes', '🔍 Research related topics', '💡 Generate quiz questions', '📋 Create action plan']
      },
      tutorial: {
        title: 'Tutorial Video Notes',
        content: '🛠️ **Tutorial Summary Generated**\n\n📺 **Source:** YouTube Tutorial\n🔗 **URL:** ' + url + '\n⏱️ **Processed:** ' + new Date().toLocaleString() + '\n\n## 📋 Step-by-Step Process\n\n• **Setup:** Initial requirements and preparation\n• **Implementation:** Core steps and procedures\n• **Tips & Tricks:** Best practices and shortcuts\n• **Troubleshooting:** Common issues and solutions\n\n## 🎯 Next Steps\n\n• Practice the demonstrated techniques\n• Adapt steps to your specific use case\n• Explore advanced variations\n\n*Ready to implement what you learned!*',
        noteContent: '# Tutorial: [Video Title]\n\n## Video Information\n- **Source:** YouTube Tutorial\n- **URL:** ' + url + '\n- **Date:** ' + new Date().toLocaleDateString() + '\n\n## Prerequisites\n• [Requirement 1]\n• [Requirement 2]\n\n## Step-by-Step Instructions\n\n### Step 1: [Title]\n[Description and details]\n\n### Step 2: [Title]\n[Description and details]\n\n### Step 3: [Title]\n[Description and details]\n\n## Tips and Best Practices\n• [Tip 1]\n• [Tip 2]\n\n## Common Issues\n• **Problem:** [Issue description]\n  **Solution:** [How to fix]\n\n## My Progress\n- [ ] Completed tutorial\n- [ ] Practiced techniques\n- [ ] Applied to project',
        suggestions: ['✅ Mark steps completed', '🔧 Add troubleshooting notes', '💡 Note improvements', '🚀 Plan next project']
      },
      presentation: {
        title: 'Presentation Summary',
        content: '📊 **Presentation Summary**\n\n📺 **Source:** YouTube Presentation\n🔗 **URL:** ' + url + '\n⏱️ **Processed:** ' + new Date().toLocaleString() + '\n\n## 📋 Main Topics Covered\n\n• **Introduction:** Context and objectives\n• **Key Arguments:** Main points and evidence\n• **Data & Insights:** Statistics and findings\n• **Conclusions:** Final recommendations\n\n## 🎯 Key Takeaways\n\n• Important insights for decision making\n• Actionable recommendations\n• Areas for further investigation\n\n*Professional insights captured and organized.*',
        noteContent: '# Presentation Notes: [Title]\n\n## Presentation Details\n- **Source:** YouTube\n- **URL:** ' + url + '\n- **Date:** ' + new Date().toLocaleDateString() + '\n- **Presenter:** [Name]\n\n## Executive Summary\n[Brief overview of main points]\n\n## Key Topics\n\n### Topic 1: [Title]\n• [Point 1]\n• [Point 2]\n\n### Topic 2: [Title]\n• [Point 1]\n• [Point 2]\n\n## Important Data/Statistics\n• [Statistic 1]\n• [Statistic 2]\n\n## Action Items\n- [ ] [Action 1]\n- [ ] [Action 2]\n\n## Questions for Follow-up\n• [Question 1]\n• [Question 2]',
        suggestions: ['📊 Add data analysis', '❓ Note questions', '🎯 Create action plan', '📋 Schedule follow-up']
      }
    };
    
    return summaries[type];
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl sm:rounded-3xl w-full max-w-7xl h-[95vh] sm:h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl">
        {/* Main Note Creation Form */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
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
              <div className="h-8 w-px bg-gray-700 mx-4"></div>
              <button
                onClick={() => setShowAiSidebar(!showAiSidebar)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
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
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="space-y-6">
            {/* Title Input - Compact */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Title</span>
              </label>
              <input
                type="text"
                placeholder="Give your note a compelling title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
            
            {/* Content Textarea - Much Larger */}
            <div className="flex-1 flex flex-col space-y-1 min-h-0">
              <label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <span>Content</span>
                <span className="text-xs text-gray-500">({content.length} characters)</span>
              </label>
              <textarea
                placeholder="Start writing your note... The AI assistant will help you improve it as you go!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 min-h-[290px] px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all leading-relaxed text-base"
                style={{ minHeight: '290px' }}
              />
            </div>
            
            {/* Compact Quick AI Actions */}
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-xl p-3 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h5 className="text-sm font-semibold text-white">AI Quick Actions</h5>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleQuickAction('improve')}
                  disabled={isAiProcessing}
                  className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg text-purple-200 hover:from-purple-500/20 hover:to-purple-600/20 hover:border-purple-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                  <span className="text-xs font-medium text-center">{isAiProcessing && aiAction === 'improve' ? 'Improving...' : 'Improve'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('structure')}
                  disabled={isAiProcessing}
                  className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg text-blue-200 hover:from-blue-500/20 hover:to-blue-600/20 hover:border-blue-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                  <span className="text-xs font-medium text-center">{isAiProcessing && aiAction === 'structure' ? 'Structuring...' : 'Structure'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('expand')}
                  disabled={isAiProcessing}
                  className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg text-green-200 hover:from-green-500/20 hover:to-green-600/20 hover:border-green-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                  <span className="text-xs font-medium text-center">{isAiProcessing && aiAction === 'expand' ? 'Expanding...' : 'Expand'}</span>
                </button>
                <button
                  onClick={() => handleQuickAction('summarize')}
                  disabled={isAiProcessing}
                  className="group flex flex-col items-center justify-center p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg text-orange-200 hover:from-orange-500/20 hover:to-orange-600/20 hover:border-orange-500/40 disabled:opacity-50 transition-all duration-200 hover:scale-105"
                >
                  <Lightbulb className="w-4 h-4 group-hover:rotate-12 transition-transform mb-1" />
                  <span className="text-xs font-medium text-center">{isAiProcessing && aiAction === 'summarize' ? 'Summarizing...' : 'Summarize'}</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onCreateNote}
                disabled={!title.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Note
              </button>
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
              <div className="flex space-x-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Ask me anything about your note..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isAiProcessing}
                  className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile AI Overlay */}
        {showAiSidebar && (
          <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end mobile-overlay-enter">
            <div className="w-full h-[85vh] bg-gray-900 rounded-t-3xl border-t border-gray-700 flex flex-col mobile-sidebar-enter">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <h4 className="text-lg font-semibold text-purple-300">AI Assistant</h4>
                </div>
                <button
                  onClick={() => setShowAiSidebar(false)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-container">
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
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask me anything about your note..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isAiProcessing}
                    className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CreateNoteModal;