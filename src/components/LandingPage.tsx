import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Mic, 
  FileText, 
  Zap, 
  Shield, 
  Users, 
  Star, 
  Play, 
  Check, 
  ArrowRight, 
  Menu, 
  X,
  Brain,
  Sparkles,
  MessageSquare,
  Upload,
  Search,
  TrendingUp,
  Globe,
  Award,
  ChevronDown,
  Quote
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced AI analyzes your notes, extracts insights, and provides intelligent summaries automatically."
    },
    {
      icon: Mic,
      title: "Voice-to-Text Magic",
      description: "Record audio notes and get instant, accurate transcriptions with speaker identification."
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find anything instantly with AI-powered semantic search across all your content."
    },
    {
      icon: MessageSquare,
      title: "Chat with Your Notes",
      description: "Ask questions about your notes and get intelligent answers from your personal AI assistant."
    },
    {
      icon: Upload,
      title: "Universal File Support",
      description: "Upload documents, images, audio, and video files - AI processes everything seamlessly."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and privacy protection keep your sensitive information secure."
    }
  ];

  const testimonials = [
    {
      name: "Takunda Dzowa",
      role: "CEO at SmaRta",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "SmaRta has revolutionized how I manage meeting notes. The AI summaries save me hours every week, and the search functionality is incredible."
    },
    {
      name: "Marcus Chibadura",
      role: "Product Manager",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "As a researcher, I deal with massive amounts of information. SmaRta's AI helps me find connections I would have missed otherwise."
    },
    {
      name: "Takunda Chikwava",
      role: "Freelance Journalist",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "The voice transcription is incredibly accurate, and being able to chat with my notes feels like having a research assistant."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for personal use",
      features: [
        "Up to 100 notes",
        "Basic AI summaries",
        "Voice transcription (30 min/month)",
        "Standard search",
        "Mobile app access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Professional",
      price: "$12",
      period: "per month",
      description: "For power users and professionals",
      features: [
        "Unlimited notes",
        "Advanced AI insights",
        "Unlimited voice transcription",
        "Smart search & chat",
        "File upload (100MB)",
        "Priority support",
        "Team collaboration"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For teams and organizations",
      features: [
        "Everything in Professional",
        "Unlimited file storage",
        "Advanced security controls",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "On-premise deployment"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "2M+", label: "Notes Processed" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9/5", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-pink-900/40" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
      
      {/* Animated Mesh Gradient */}
      <div className="fixed inset-0 opacity-40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob-morph"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob-morph delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob-morph delay-2000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/3 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/10 dark:bg-black/30 backdrop-blur-xl border-b border-white/20 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SmaRta
                </h1>
                <p className="text-xs text-gray-400">AI Notes</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium">Features</a>
              <a href="#testimonials" className="text-white/80 hover:text-white transition-colors font-medium">Testimonials</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors font-medium">Pricing</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors font-medium">Contact</a>
              <button
                onClick={onGetStarted}
                className="btn-base btn-premium hover-lift shadow-glow"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
                <button
                  onClick={onGetStarted}
                  className="w-full px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-sm mb-8 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Introducing AI-Powered Note Taking
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-display font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
            >
              Your Notes,
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Supercharged by AI
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-headline text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Transform how you capture, organize, and interact with information. 
              SmaRta uses advanced AI to make your notes intelligent, searchable, and actionable.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="group px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-premium hover:shadow-glow transition-all duration-300 flex items-center space-x-3"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 gradient-text">{stat.number}</div>
                  <div className="text-white/70 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-headline font-bold text-white mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Modern Productivity</span>
            </h2>
            <p className="text-body text-white/80 max-w-4xl mx-auto">
              Experience the future of note-taking with AI-powered features designed to enhance your workflow
            </p>
          </motion.div>

          <div className="content-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group card-premium p-8 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-premium flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-premium transition-all duration-300 -z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-headline font-bold text-white mb-6">
              See SmaRta in Action
            </h2>
            <p className="text-body text-white/80 max-w-3xl mx-auto">
              Watch how AI transforms your note-taking experience
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-white/20 rounded-premium-xl p-8 shadow-premium">
              <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-premium flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-20 h-20 text-white/50 mx-auto mb-4 animate-pulse-glow" />
                  <h3 className="text-2xl font-bold text-white mb-2">Interactive Demo</h3>
                  <p className="text-white/70">Experience the power of AI-driven note-taking</p>
                  <button
                    onClick={onGetStarted}
                    className="mt-6 btn-base btn-premium hover-lift"
                  >
                    Try It Now
                  </button>
                </div>
              </div>
            </div>

            {/* Floating UI Elements */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-6 -left-6 bg-purple-500/30 backdrop-blur-xl border border-purple-500/50 rounded-premium p-4 animate-float shadow-lg"
            >
              <Mic className="w-6 h-6 text-purple-300" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              className="absolute -top-6 -right-6 bg-pink-500/30 backdrop-blur-xl border border-pink-500/50 rounded-premium p-4 animate-float delay-1000 shadow-lg"
            >
              <Brain className="w-6 h-6 text-pink-300" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500/30 backdrop-blur-xl border border-blue-500/50 rounded-premium p-4 animate-float delay-2000 shadow-lg"
            >
              <MessageSquare className="w-6 h-6 text-blue-300" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by Professionals
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Worldwide</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of users who have transformed their productivity with SmaRta
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <Quote className="w-12 h-12 text-purple-400 mb-6" />
                <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <h4 className="text-white font-semibold">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-gray-400">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/5 to-pink-900/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Start free, upgrade when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-gray-900/50 backdrop-blur-xl border rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20' 
                    : 'border-gray-800 hover:border-purple-500/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period !== 'pricing' && (
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
                      : 'border border-gray-600 text-white hover:border-purple-500 hover:bg-purple-500/10'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Note-Taking?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already revolutionized their productivity with SmaRta AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
              >
                Start Your Free Trial
              </button>

            </div>
            <p className="text-gray-400 text-sm mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    SmaRta
                  </h1>
                  <p className="text-xs text-gray-400">AI Notes</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Transform your note-taking experience with AI-powered intelligence. 
                Capture, organize, and interact with your information like never before.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SmaRta AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;