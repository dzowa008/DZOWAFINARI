/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  animation: {
    'gradient-move': 'gradientMove 7s infinite alternate linear',
    'blob-morph': 'blobMorph 13s infinite ease-in-out',
    'blob-morph2': 'blobMorph2 11s infinite ease-in-out',
    'text-glow': 'textGlow 2s infinite alternate',
  },
  keyframes: {
    gradientMove: {
      '0%': { backgroundPosition: '0% 50%' },
      '100%': { backgroundPosition: '100% 50%' },
    },
    blobMorph: {
      '0%':   { borderRadius: '42% 58% 58% 42% / 42% 45% 55% 58%' },
      '33%':  { borderRadius: '57% 43% 49% 51% / 33% 52% 48% 67%' },
      '66%':  { borderRadius: '40% 60% 56% 44% / 38% 64% 36% 62%' },
      '100%': { borderRadius: '42% 58% 58% 42% / 42% 45% 55% 58%' },
    },
    blobMorph2: {
      '0%':   { borderRadius: '36% 64% 60% 40% / 54% 38% 62% 46%' },
      '33%':  { borderRadius: '60% 40% 42% 58% / 54% 60% 40% 46%' },
      '66%':  { borderRadius: '40% 60% 36% 64% / 54% 38% 62% 46%' },
      '100%': { borderRadius: '36% 64% 60% 40% / 54% 38% 62% 46%' },
    },
    textGlow: {
      '0%': { textShadow: '0 0 0px #fff,0 0 12px #8d5cf6' },
      '100%': { textShadow: '0 0 8px #fff,0 0 32px #b455fa' },
    },
  },
  
};
