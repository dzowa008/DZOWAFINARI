import React from 'react';
import { FileText, Headphones, Camera, Star } from 'lucide-react';

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
      gradient: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Audio Notes',
      value: stats.audioNotes,
      icon: Headphones,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Video Notes',
      value: stats.videoNotes,
      icon: Camera,
      gradient: 'from-green-500/10 to-emerald-500/10',
      border: 'border-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      title: 'Starred',
      value: stats.starredNotes,
      icon: Star,
      gradient: 'from-orange-500/10 to-red-500/10',
      border: 'border-orange-500/20',
      iconColor: 'text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-2xl p-6 hover:scale-105 transition-transform duration-200 backdrop-blur-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <card.icon className={`w-8 h-8 ${card.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;