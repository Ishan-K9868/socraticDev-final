/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette - Warm terracotta meets deep ocean
        primary: {
          50: '#fef7f4',
          100: '#fceee7',
          200: '#f9d5c6',
          300: '#f4b49a',
          400: '#ec8b64',
          500: '#E07A5F',  // Terracotta - warm, earthy, NOT AI-slop
          600: '#d15a3c',
          700: '#ae4730',
          800: '#8f3c2c',
          900: '#763628',
        },
        // Secondary - Deep teal ocean
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#3D5A80',  // Deep ocean blue - sophisticated
          600: '#2c4a6e',
          700: '#1e3a5c',
          800: '#1a2f4a',
          900: '#14253d',
        },
        // Accent - Sage green for "learning mode"
        accent: {
          50: '#f6f7f4',
          100: '#e8ebe2',
          200: '#d4dac8',
          300: '#b7c2a4',
          400: '#98a87e',
          500: '#81936A',  // Sage green - organic, educational
          600: '#667752',
          700: '#515e42',
          800: '#434c38',
          900: '#3a4131',
        },
        // Neutral - Warm grays
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0F0E0D',
        },
        // System colors
        success: '#4ADE80',
        warning: '#FBBF24',
        error: '#EF4444',
        info: '#60A5FA',
      },
      fontFamily: {
        display: ['Clash Display', 'system-ui', 'sans-serif'],
        body: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-primary': '0 0 40px -10px rgba(224, 122, 95, 0.4)',
        'glow-secondary': '0 0 40px -10px rgba(61, 90, 128, 0.4)',
        'glow-accent': '0 0 40px -10px rgba(129, 147, 106, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
