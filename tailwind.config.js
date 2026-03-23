/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        crime: {
          bg: '#0a0a0f',
          surface: '#0f0f1a',
          card: '#13131f',
          border: '#1e1e32',
          accent: '#c8102e',
          'accent-dim': '#8b0b20',
          'accent-glow': '#ff1744',
          muted: '#3a3a5c',
          text: '#e0e0f0',
          'text-dim': '#8888aa',
          warning: '#ff8c00',
          success: '#00c853',
          info: '#0091ea',
        }
      },
      animation: {
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 16, 46, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(200, 16, 46, 0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
