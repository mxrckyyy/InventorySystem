/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344'
        }
      },
      boxShadow: {
        neon: '0 0 20px rgba(34, 211, 238, 0.35)',
        'neon-lg': '0 0 40px rgba(34, 211, 238, 0.45)'
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0.5' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.25s ease-out'
      }
    }
  },
  plugins: []
};
