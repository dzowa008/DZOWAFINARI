import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Headphones, Camera, Star, TrendingUp, Zap, Brain, Target } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalNotes: number;
    audioNotes: number;
    videoNotes: number;
    starredNotes: number;
  };
}

function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Notes',
      value: stats.totalNotes,
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderGradient: 'border-purple-500/20',
      iconColor: 'text-white',
      change: '+12%',
      changeColor: 'text-green-500'
    },
    {
      title: 'Audio Notes',
      value: stats.audioNotes,
      icon: Headphones,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      borderGradient: 'border-blue-500/20',
      iconColor: 'text-white',
      change: '+8%',
      changeColor: 'text-green-500'
    },
    {
      title: 'Video Notes',
      value: stats.videoNotes,
      icon: Camera,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderGradient: 'border-green-500/20',
      iconColor: 'text-white',
      change: '+15%',
      changeColor: 'text-green-500'
    },
    {
      title: 'Starred',
      value: stats.starredNotes,
      icon: Star,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
      borderGradient: 'border-orange-500/20',
      iconColor: 'text-white',
      change: '+5%',
      changeColor: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} border ${card.borderGradient} rounded-premium-xl p-6 backdrop-blur-xl shadow-premium hover:shadow-glow transition-all duration-300 group cursor-pointer`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${card.changeColor} flex items-center space-x-1`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{card.change}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{card.title}</p>
              <motion.p 
                className="text-3xl font-bold text-gray-900 dark:text-white"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
              >
                {card.value.toLocaleString()}
              </motion.p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${card.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (card.value / Math.max(stats.totalNotes, 1)) * 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-premium-xl"></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <div className="w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;