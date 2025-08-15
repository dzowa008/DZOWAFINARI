import React, { useState, useEffect } from 'react';
import { Brain, Play, CheckCircle, XCircle, RotateCcw, Trophy, Clock, Sparkles, Zap, BookOpen } from 'lucide-react';
import { aiService } from '../services/aiService';
import Spinner from './spinner';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Quiz {
  id: string;
  topic: string;
  questions: Question[];
  createdAt: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number[];
  userAnswers: number[];
}

// Fallback quiz generation function
const generateFallbackQuiz = (topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number): Quiz => {
  const fallbackQuestions: Question[] = [];
  
  // Generate sample questions based on topic and difficulty
  for (let i = 0; i < questionCount; i++) {
    const questionTemplates = {
      easy: [
        { q: `What is a basic concept related to ${topic}?`, options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'], correct: 0, exp: `This is a fundamental concept in ${topic} that forms the foundation for more advanced topics.` },
        { q: `Which of the following is most associated with ${topic}?`, options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], correct: 1, exp: `This option is directly related to ${topic} and is commonly encountered when studying this subject.` },
        { q: `What is an important principle in ${topic}?`, options: ['Principle A', 'Principle B', 'Principle C', 'Principle D'], correct: 2, exp: `This principle is essential for understanding how ${topic} works in practice.` }
      ],
      medium: [
        { q: `How does ${topic} relate to practical applications?`, options: ['Application A', 'Application B', 'Application C', 'Application D'], correct: 0, exp: `This application demonstrates the practical relevance of ${topic} in real-world scenarios.` },
        { q: `What is a common challenge when working with ${topic}?`, options: ['Challenge 1', 'Challenge 2', 'Challenge 3', 'Challenge 4'], correct: 1, exp: `This challenge is frequently encountered and requires understanding of core ${topic} concepts to overcome.` },
        { q: `Which approach is most effective for ${topic}?`, options: ['Approach A', 'Approach B', 'Approach C', 'Approach D'], correct: 2, exp: `This approach has proven to be most effective based on research and practical experience in ${topic}.` }
      ],
      hard: [
        { q: `What is an advanced technique used in ${topic}?`, options: ['Technique A', 'Technique B', 'Technique C', 'Technique D'], correct: 0, exp: `This advanced technique requires deep understanding of ${topic} fundamentals and is used in complex scenarios.` },
        { q: `How do experts approach complex problems in ${topic}?`, options: ['Method 1', 'Method 2', 'Method 3', 'Method 4'], correct: 1, exp: `Expert practitioners use this method because it addresses the complexity inherent in advanced ${topic} problems.` },
        { q: `What is a cutting-edge development in ${topic}?`, options: ['Development A', 'Development B', 'Development C', 'Development D'], correct: 2, exp: `This recent development represents the current state-of-the-art in ${topic} and opens new possibilities.` }
      ]
    };
    
    const templates = questionTemplates[difficulty];
    const template = templates[i % templates.length];
    
    fallbackQuestions.push({
      id: `fallback_q${i}`,
      question: template.q,
      options: template.options,
      correctAnswer: template.correct,
      explanation: template.exp,
      difficulty
    });
  }
  
  return {
    id: `fallback_${Date.now()}`,
    topic: `${topic} (Demo Quiz)`,
    questions: fallbackQuestions,
    createdAt: new Date(),
    difficulty,
    estimatedTime: questionCount * 60
  };
};

export default function AIQuiz() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentQuiz && startTime && !showResult) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentQuiz, startTime, showResult]);

  // Load saved quizzes on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-quizzes');
    if (saved) {
      setSavedQuizzes(JSON.parse(saved));
    }
  }, []);

  const generateQuiz = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      // Use the new aiService.generateQuiz method with Google Gemini
      const quiz = await aiService.generateQuiz(topic, difficulty, questionCount);

      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(new Date());
      setTimeSpent(0);
      setShowExplanation(false);
      setIsAnswered(false);

      // Save quiz to localStorage
      const updatedQuizzes = [...savedQuizzes, quiz];
      setSavedQuizzes(updatedQuizzes);
      localStorage.setItem('ai-quizzes', JSON.stringify(updatedQuizzes));

    } catch (error) {
      console.error('Error generating quiz:', error);
      
      // Fallback quiz generation
      const fallbackQuiz = generateFallbackQuiz(topic, difficulty, questionCount);
      setCurrentQuiz(fallbackQuiz);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(new Date());
      setTimeSpent(0);
      setShowExplanation(false);
      setIsAnswered(false);

      // Save fallback quiz
      const updatedQuizzes = [...savedQuizzes, fallbackQuiz];
      setSavedQuizzes(updatedQuizzes);
      localStorage.setItem('ai-quizzes', JSON.stringify(updatedQuizzes));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const newUserAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newUserAnswers);
    setIsAnswered(true);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;

    const correctAnswers = currentQuiz.questions.map(q => q.correctAnswer);
    const score = userAnswers.reduce((acc, answer, index) => {
      return acc + (answer === correctAnswers[index] ? 1 : 0);
    }, 0);

    const result: QuizResult = {
      score: Math.round((score / currentQuiz.questions.length) * 100),
      totalQuestions: currentQuiz.questions.length,
      timeSpent,
      correctAnswers,
      userAnswers
    };

    setQuizResult(result);
    setShowResult(true);
  };

  const restartQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizResult(null);
    setStartTime(null);
    setTimeSpent(0);
    setShowExplanation(false);
    setIsAnswered(false);
  };

  const loadSavedQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setStartTime(new Date());
    setTimeSpent(0);
    setShowExplanation(false);
    setIsAnswered(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-500 bg-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'hard': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (showResult && quizResult) {
    return (
      <div className="p-6 space-y-6 relative z-[2]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400">Topic: {currentQuiz?.topic}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(quizResult.score)}`}>
                {quizResult.score}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {formatTime(quizResult.timeSpent)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {quizResult.userAnswers.filter((answer, index) => answer === quizResult.correctAnswers[index]).length} / {quizResult.totalQuestions} Correct
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={restartQuiz}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="p-6 space-y-6 relative z-[2]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentQuiz.topic}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-blue-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left rounded-lg border transition-all duration-200 ";
              
              if (showExplanation) {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass += "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300";
                } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
                  buttonClass += "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300";
                } else {
                  buttonClass += "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400";
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass += "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300";
                } else {
                  buttonClass += "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                    {showExplanation && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                    {showExplanation && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Explanation</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={restartQuiz}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Exit Quiz
            </button>
            
            {!isAnswered ? (
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 relative z-[2]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Quiz Generator</h2>
        <p className="text-gray-600 dark:text-gray-400">Create personalized quizzes on any topic</p>
      </div>

      {/* Quiz Creation Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quiz Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., JavaScript fundamentals, World History, Biology..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateQuiz}
          disabled={!topic.trim() || isGenerating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <Spinner size="sm" variant="minimal" />
              <span>Generating Quiz...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Generate Quiz</span>
            </>
          )}
        </button>
      </div>

      {/* Saved Quizzes */}
      {savedQuizzes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Recent Quizzes</span>
          </h3>
          <div className="space-y-3">
            {savedQuizzes.slice(-5).reverse().map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => loadSavedQuiz(quiz)}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{quiz.topic}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {quiz.questions.length} questions • {getDifficultyColor(quiz.difficulty).split(' ')[0]} {quiz.difficulty}
                  </div>
                </div>
                <Play className="w-5 h-5 text-purple-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
