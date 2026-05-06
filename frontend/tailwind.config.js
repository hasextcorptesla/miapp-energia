/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        'dark': {
          950: '#0a0a0f',
          900: '#0f1419',
          800: '#1a1a2e',
          700: '#2d2d44',
        },
        'glass': {
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.15)',
          300: 'rgba(255, 255, 255, 0.2)',
        },
        'accent': {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}