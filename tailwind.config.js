/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'premium': '1rem',
        'premium-lg': '1.5rem',
        'premium-xl': '2rem',
      },
      boxShadow: {
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 40px rgba(102, 126, 234, 0.3)',
        'glow-lg': '0 0 60px rgba(102, 126, 234, 0.4)',
        'inner-premium': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'blob-morph': 'blob-morph 20s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'neural-pulse': 'neural-pulse 2s ease-in-out infinite',
        'typing-dots': 'typing-dots 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'premium-spin': 'premium-spin 2s ease-in-out infinite',
        'text-reveal': 'text-reveal 0.8s ease-out',
      },
      keyframes: {
        'blob-morph': {
          '0%, 100%': {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'rotate(0deg) scale(1)',
          },
          '25%': {
            borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
            transform: 'rotate(90deg) scale(1.1)',
          },
          '50%': {
            borderRadius: '70% 30% 40% 60% / 40% 50% 60% 50%',
            transform: 'rotate(180deg) scale(0.9)',
          },
          '75%': {
            borderRadius: '40% 70% 60% 30% / 60% 40% 50% 60%',
            transform: 'rotate(270deg) scale(1.05)',
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(102, 126, 234, 0.8)',
            transform: 'scale(1.02)',
          },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in-right': {
          'from': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'scale-in': {
          'from': {
            opacity: '0',
            transform: 'scale(0.8)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'neural-pulse': {
          '0%, 100%': {
            opacity: '0.6',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.1)',
          },
        },
        'typing-dots': {
          '0%, 20%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        'premium-spin': {
          '0%': {
            transform: 'rotate(0deg) scale(1)',
            borderRadius: '50%',
          },
          '25%': {
            transform: 'rotate(90deg) scale(1.1)',
            borderRadius: '30%',
          },
          '50%': {
            transform: 'rotate(180deg) scale(1)',
            borderRadius: '50%',
          },
          '75%': {
            transform: 'rotate(270deg) scale(0.9)',
            borderRadius: '70%',
          },
          '100%': {
            transform: 'rotate(360deg) scale(1)',
            borderRadius: '50%',
          },
        },
        'text-reveal': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
      },
    },
  },
  plugins: [],
};