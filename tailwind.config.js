/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#0a0a12',
          900: '#0f0f1a',
          800: '#161625',
          700: '#1e1e33',
          600: '#282845',
        },
        accent: {
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          cyan: '#22d3ee',
          amber: '#f59e0b',
          rose: '#fb7185',
          emerald: '#34d399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(139, 92, 246, 0.45)',
        card: '0 8px 30px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        'pop-in': {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'pulse-edge': {
          '0%, 100%': { opacity: 0.35 },
          '50%': { opacity: 0.9 },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'pop-in': 'pop-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-edge': 'pulse-edge 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
