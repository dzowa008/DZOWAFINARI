import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, Sparkles, Zap, Loader2, Download, Upload, Cpu, Database, Cloud, Wifi } from 'lucide-react';

interface SpinnerProps {
  variant?: 'default' | 'ai' | 'upload' | 'processing' | 'minimal' | 'neural' | 'quantum' | 'matrix';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  message?: string;
  progress?: number;
  showIcon?: boolean;
  animated?: boolean;
  morphing?: boolean;
  particles?: boolean;
  glow?: boolean;
  pulse?: boolean;
  theme?: 'dark' | 'light' | 'auto';
  speed?: 'slow' | 'normal' | 'fast' | 'ultra';
  onComplete?: () => void;
  stages?: string[];
  showPercentage?: boolean;
  showETA?: boolean;
  soundEnabled?: boolean;
}

export default function Spinner({ 
  variant = 'default', 
  size = 'md', 
  message, 
  progress,
  showIcon = true,
  animated = true,
  morphing = false,
  particles = true,
  glow = true,
  pulse = true,
  theme = 'dark',
  speed = 'normal',
  onComplete,
  stages = [],
  showPercentage = true,
  showETA = false,
  soundEnabled = false
}: SpinnerProps) {
  // State management
  const [currentStage, setCurrentStage] = useState(0);
  const [startTime] = useState(Date.now());
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [particleCount, setParticleCount] = useState(20);
  const [morphPhase, setMorphPhase] = useState(0);

  // Calculate ETA
  useEffect(() => {
    if (showETA && progress && progress > 0) {
      const elapsed = Date.now() - startTime;
      const rate = progress / elapsed;
      const remaining = (100 - progress) / rate;
      setEstimatedTimeRemaining(remaining);
    }
  }, [progress, showETA, startTime]);

  // Handle completion
  useEffect(() => {
    if (progress === 100 && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [progress, isComplete, onComplete]);

  // Stage management
  useEffect(() => {
    if (stages.length > 0 && progress) {
      const stageIndex = Math.floor((progress / 100) * stages.length);
      setCurrentStage(Math.min(stageIndex, stages.length - 1));
    }
  }, [progress, stages]);

  // Morphing animation
  useEffect(() => {
    if (morphing) {
      const interval = setInterval(() => {
        setMorphPhase(prev => (prev + 1) % 4);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [morphing]);

  // Dynamic particle count based on activity
  useEffect(() => {
    if (particles) {
      const baseCount = variant === 'neural' ? 50 : variant === 'quantum' ? 30 : 20;
      const activityMultiplier = progress ? Math.max(0.5, progress / 100) : 1;
      setParticleCount(Math.floor(baseCount * activityMultiplier));
    }
  }, [particles, variant, progress]);
  const sizeClasses = {
    sm: { container: 'w-16 h-16', spinner: 'w-8 h-8', glow: 'w-20 h-20', text: 'text-sm' },
    md: { container: 'w-24 h-24', spinner: 'w-12 h-12', glow: 'w-32 h-32', text: 'text-base' },
    lg: { container: 'w-32 h-32', spinner: 'w-20 h-20', glow: 'w-40 h-40', text: 'text-lg' },
    xl: { container: 'w-40 h-40', spinner: 'w-28 h-28', glow: 'w-48 h-48', text: 'text-xl' }
  };

  const variantStyles = {
    default: {
      glow: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-400',
      spinner: 'text-white',
      icon: Brain,
      iconColor: 'text-purple-400'
    },
    ai: {
      glow: 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600',
      spinner: 'text-purple-300',
      icon: Brain,
      iconColor: 'text-purple-400'
    },
    upload: {
      glow: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
      spinner: 'text-cyan-300',
      icon: Zap,
      iconColor: 'text-cyan-400'
    },
    processing: {
      glow: 'bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500',
      spinner: 'text-yellow-300',
      icon: Sparkles,
      iconColor: 'text-yellow-400'
    },
    minimal: {
      glow: 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700',
      spinner: 'text-gray-300',
      icon: Brain,
      iconColor: 'text-gray-400'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantStyles[variant];
  const IconComponent = currentVariant.icon;

  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative flex items-center justify-center">
          <svg
            className={`animate-spin ${currentSize.spinner} ${currentVariant.spinner} drop-shadow-lg`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
        {message && (
          <p className={`${currentSize.text} text-gray-400 font-medium animate-pulse`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Main Loading Animation */}
        <div className="relative flex items-center justify-center">
          {/* Outer Glow Rings */}
          <div className={`absolute animate-ping rounded-full ${currentSize.glow} ${currentVariant.glow} opacity-20 blur-2xl`} />
          <div className={`absolute animate-pulse rounded-full ${currentSize.glow} ${currentVariant.glow} opacity-30 blur-xl`} />
          
          {/* Rotating Border */}
          <div className={`absolute ${currentSize.container} rounded-full border-2 border-transparent bg-gradient-to-r ${currentVariant.glow} animate-spin`}
               style={{ animationDuration: '3s' }}>
            <div className="w-full h-full rounded-full bg-black border-2 border-gray-900" />
          </div>
          
          {/* Inner Icon */}
          {showIcon && (
            <div className="absolute flex items-center justify-center">
              <IconComponent className={`${currentSize.spinner} ${currentVariant.iconColor} animate-pulse`} />
            </div>
          )}
          
          {/* Main Spinner */}
          <svg
            className={`animate-spin ${currentSize.spinner} ${currentVariant.spinner} drop-shadow-2xl relative z-10`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
            style={{ animationDuration: '1s' }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="w-64 bg-gray-800/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-full bg-gradient-to-r ${currentVariant.glow} transition-all duration-500 ease-out relative overflow-hidden`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        )}

        {/* Loading Message */}
        {message && (
          <div className="text-center space-y-2">
            <p className={`${currentSize.text} font-semibold text-white animate-pulse`}>
              {message}
            </p>
            {progress !== undefined && (
              <p className="text-sm text-gray-400">
                {Math.round(progress)}% Complete
              </p>
            )}
          </div>
        )}

        {/* Loading Dots */}
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 ${currentVariant.glow} rounded-full animate-bounce`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes neural-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: hue-rotate(0deg) brightness(1);
          }
          25% { 
            transform: scale(1.1) rotate(90deg);
            filter: hue-rotate(90deg) brightness(1.2);
          }
          50% { 
            transform: scale(1.2) rotate(180deg);
            filter: hue-rotate(180deg) brightness(1.4);
          }
          75% { 
            transform: scale(1.1) rotate(270deg);
            filter: hue-rotate(270deg) brightness(1.2);
          }
        }
        @keyframes quantum-orbit {
          0% { 
            transform: rotate(0deg) translateX(30px) rotate(0deg);
            opacity: 1;
          }
          50% { 
            transform: rotate(180deg) translateX(40px) rotate(-180deg);
            opacity: 0.6;
          }
          100% { 
            transform: rotate(360deg) translateX(30px) rotate(-360deg);
            opacity: 1;
          }
        }
        @keyframes matrix-rain {
          0% { 
            transform: translateY(-100vh);
            opacity: 0;
          }
          10% { 
            opacity: 1;
          }
          90% { 
            opacity: 1;
          }
          100% { 
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        @keyframes morph-shape {
          0% { border-radius: 50%; }
          25% { border-radius: 20% 80% 20% 80%; }
          50% { border-radius: 80% 20% 80% 20%; }
          75% { border-radius: 40% 60% 40% 60%; }
          100% { border-radius: 50%; }
        }
        @keyframes energy-wave {
          0% { 
            transform: scale(0.8);
            opacity: 1;
          }
          50% { 
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% { 
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes data-stream {
          0% { 
            transform: translateX(-100%) skewX(-15deg);
            opacity: 0;
          }
          50% { 
            opacity: 1;
          }
          100% { 
            transform: translateX(100%) skewX(-15deg);
            opacity: 0;
          }
        }
        @keyframes hologram-flicker {
          0%, 100% { 
            opacity: 1;
            filter: brightness(1) contrast(1);
          }
          10% { 
            opacity: 0.8;
            filter: brightness(1.2) contrast(1.1);
          }
          20% { 
            opacity: 1;
            filter: brightness(0.9) contrast(0.9);
          }
          30% { 
            opacity: 0.9;
            filter: brightness(1.1) contrast(1.2);
          }
        }
        @keyframes particle-explosion {
          0% { 
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% { 
            transform: scale(1) rotate(180deg);
            opacity: 0.8;
          }
          100% { 
            transform: scale(2) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes neon-glow {
          0%, 100% { 
            box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
          }
          50% { 
            box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor;
          }
        }
        @keyframes code-scan {
          0% { 
            background-position: -100% 0;
          }
          100% { 
            background-position: 100% 0;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-neural-pulse {
          animation: neural-pulse 3s ease-in-out infinite;
        }
        .animate-quantum-orbit {
          animation: quantum-orbit 4s linear infinite;
        }
        .animate-matrix-rain {
          animation: matrix-rain 2s linear infinite;
        }
        .animate-morph-shape {
          animation: morph-shape 4s ease-in-out infinite;
        }
        .animate-energy-wave {
          animation: energy-wave 2s ease-out infinite;
        }
        .animate-data-stream {
          animation: data-stream 3s ease-in-out infinite;
        }
        .animate-hologram-flicker {
          animation: hologram-flicker 0.1s ease-in-out infinite;
        }
        .animate-particle-explosion {
          animation: particle-explosion 1s ease-out infinite;
        }
        .animate-neon-glow {
          animation: neon-glow 2s ease-in-out infinite;
        }
        .animate-code-scan {
          animation: code-scan 2s ease-in-out infinite;
          background: linear-gradient(90deg, transparent 0%, rgba(0,255,0,0.2) 50%, transparent 100%);
          background-size: 200% 100%;
        }
        @keyframes dna-helix {
          0% { 
            transform: rotateY(0deg) rotateX(0deg);
            border-radius: 50% 20% 50% 20%;
          }
          25% { 
            transform: rotateY(90deg) rotateX(15deg);
            border-radius: 20% 50% 20% 50%;
          }
          50% { 
            transform: rotateY(180deg) rotateX(0deg);
            border-radius: 50% 20% 50% 20%;
          }
          75% { 
            transform: rotateY(270deg) rotateX(-15deg);
            border-radius: 20% 50% 20% 50%;
          }
          100% { 
            transform: rotateY(360deg) rotateX(0deg);
            border-radius: 50% 20% 50% 20%;
          }
        }
        @keyframes galaxy-spiral {
          0% { 
            transform: rotate(0deg) scale(1);
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
          }
          25% { 
            transform: rotate(90deg) scale(1.1);
            border-radius: 60% 40% 60% 40%;
            box-shadow: 0 0 30px rgba(75, 0, 130, 0.7);
          }
          50% { 
            transform: rotate(180deg) scale(1.2);
            border-radius: 40% 60% 40% 60%;
            box-shadow: 0 0 40px rgba(138, 43, 226, 0.9);
          }
          75% { 
            transform: rotate(270deg) scale(1.1);
            border-radius: 60% 40% 60% 40%;
            box-shadow: 0 0 30px rgba(75, 0, 130, 0.7);
          }
          100% { 
            transform: rotate(360deg) scale(1);
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
          }
        }
        @keyframes liquid-morph {
          0%, 100% { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          20% { 
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(72deg) scale(1.05);
          }
          40% { 
            border-radius: 70% 30% 40% 60% / 40% 50% 60% 50%;
            transform: rotate(144deg) scale(0.95);
          }
          60% { 
            border-radius: 40% 70% 60% 30% / 60% 40% 50% 60%;
            transform: rotate(216deg) scale(1.1);
          }
          80% { 
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
            transform: rotate(288deg) scale(0.9);
          }
        }
        @keyframes crystalline {
          0% { 
            transform: rotate(0deg) scale(1);
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
            filter: hue-rotate(0deg);
          }
          20% { 
            transform: rotate(72deg) scale(1.1);
            clip-path: polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%);
            filter: hue-rotate(72deg);
          }
          40% { 
            transform: rotate(144deg) scale(0.9);
            clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
            filter: hue-rotate(144deg);
          }
          60% { 
            transform: rotate(216deg) scale(1.2);
            clip-path: polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 60% 100%, 40% 100%, 10% 70%, 0% 35%, 20% 10%);
            filter: hue-rotate(216deg);
          }
          80% { 
            transform: rotate(288deg) scale(0.8);
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
            filter: hue-rotate(288deg);
          }
          100% { 
            transform: rotate(360deg) scale(1);
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
            filter: hue-rotate(360deg);
          }
        }
        @keyframes plasma-flow {
          0%, 100% { 
            background: radial-gradient(circle at 20% 50%, #ff006e 0%, transparent 50%),
                       radial-gradient(circle at 80% 50%, #8338ec 0%, transparent 50%),
                       radial-gradient(circle at 40% 20%, #3a86ff 0%, transparent 50%),
                       radial-gradient(circle at 60% 80%, #06ffa5 0%, transparent 50%);
            transform: rotate(0deg);
          }
          25% { 
            background: radial-gradient(circle at 80% 20%, #ff006e 0%, transparent 50%),
                       radial-gradient(circle at 20% 80%, #8338ec 0%, transparent 50%),
                       radial-gradient(circle at 60% 50%, #3a86ff 0%, transparent 50%),
                       radial-gradient(circle at 40% 50%, #06ffa5 0%, transparent 50%);
            transform: rotate(90deg);
          }
          50% { 
            background: radial-gradient(circle at 50% 80%, #ff006e 0%, transparent 50%),
                       radial-gradient(circle at 50% 20%, #8338ec 0%, transparent 50%),
                       radial-gradient(circle at 80% 60%, #3a86ff 0%, transparent 50%),
                       radial-gradient(circle at 20% 40%, #06ffa5 0%, transparent 50%);
            transform: rotate(180deg);
          }
          75% { 
            background: radial-gradient(circle at 20% 80%, #ff006e 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, #8338ec 0%, transparent 50%),
                       radial-gradient(circle at 40% 40%, #3a86ff 0%, transparent 50%),
                       radial-gradient(circle at 60% 60%, #06ffa5 0%, transparent 50%);
            transform: rotate(270deg);
          }
        }
        @keyframes cyber-grid {
          0% { 
            background-image: 
              linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent);
            background-size: 20px 20px;
            transform: translateX(0) translateY(0);
          }
          100% { 
            background-image: 
              linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.1) 75%, rgba(0, 255, 255, 0.1) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.1) 75%, rgba(0, 255, 255, 0.1) 76%, transparent 77%, transparent);
            background-size: 20px 20px;
            transform: translateX(20px) translateY(20px);
          }
        }
        @keyframes aurora-wave {
          0%, 100% { 
            background: linear-gradient(45deg, 
              rgba(255, 0, 150, 0.3) 0%, 
              rgba(0, 204, 255, 0.3) 25%, 
              rgba(238, 130, 238, 0.3) 50%, 
              rgba(0, 255, 127, 0.3) 75%, 
              rgba(255, 69, 0, 0.3) 100%);
            transform: translateX(0%) rotate(0deg);
          }
          33% { 
            background: linear-gradient(45deg, 
              rgba(0, 255, 127, 0.4) 0%, 
              rgba(255, 69, 0, 0.4) 25%, 
              rgba(255, 0, 150, 0.4) 50%, 
              rgba(0, 204, 255, 0.4) 75%, 
              rgba(238, 130, 238, 0.4) 100%);
            transform: translateX(100%) rotate(120deg);
          }
          66% { 
            background: linear-gradient(45deg, 
              rgba(238, 130, 238, 0.5) 0%, 
              rgba(0, 255, 127, 0.5) 25%, 
              rgba(255, 69, 0, 0.5) 50%, 
              rgba(255, 0, 150, 0.5) 75%, 
              rgba(0, 204, 255, 0.5) 100%);
            transform: translateX(-100%) rotate(240deg);
          }
        }
        @keyframes geometric-shift {
          0% { 
            clip-path: circle(50% at 50% 50%);
            transform: rotate(0deg);
          }
          14% { 
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
            transform: rotate(45deg);
          }
          28% { 
            clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
            transform: rotate(90deg);
          }
          42% { 
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
            transform: rotate(135deg);
          }
          56% { 
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
            transform: rotate(180deg);
          }
          70% { 
            clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
            transform: rotate(225deg);
          }
          84% { 
            clip-path: polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%);
            transform: rotate(270deg);
          }
          100% { 
            clip-path: circle(50% at 50% 50%);
            transform: rotate(360deg);
          }
        }
        .animate-dna-helix {
          animation: dna-helix 4s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .animate-galaxy-spiral {
          animation: galaxy-spiral 6s ease-in-out infinite;
        }
        .animate-liquid-morph {
          animation: liquid-morph 5s ease-in-out infinite;
        }
        .animate-crystalline {
          animation: crystalline 3s linear infinite;
        }
        .animate-plasma-flow {
          animation: plasma-flow 4s ease-in-out infinite;
        }
        .animate-cyber-grid {
          animation: cyber-grid 2s linear infinite;
        }
        .animate-aurora-wave {
          animation: aurora-wave 6s ease-in-out infinite;
        }
        .animate-geometric-shift {
          animation: geometric-shift 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}