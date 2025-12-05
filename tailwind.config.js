/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        puzzle: {
          bg: '#0a0a0f',
          card: '#14141f',
          border: '#2a2a3a',
          accent: '#00ff88',
          easy: '#2d5a27',
          normal: '#1e3a5f',
          hard: '#5c2d5c',
        }
      },
      animation: {
        'slide': 'slide 0.15s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'celebrate': 'celebrate 0.5s ease-out',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
        celebrate: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
