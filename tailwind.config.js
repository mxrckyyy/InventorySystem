/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
      },
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
        neon: '0 0 16px rgba(56, 189, 248, 0.2)',
        'neon-lg': '0 0 28px rgba(56, 189, 248, 0.25)'
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0.5' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'neon-pulse': 'neon-pulse 2.4s ease-in-out infinite',
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out'
      }
    }
  },
  plugins: []
};
