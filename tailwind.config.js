/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-accent': '#00FFAA', // Bright neon green-blue color
        'neon-accent-dark': '#00cc88',
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 170, 0.7)',
        'neon-lg': '0 0 20px rgba(0, 255, 170, 0.5)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 170, 0.7)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 170, 1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          'from': { boxShadow: '0 0 20px rgba(0, 255, 170, 0.5)' },
          'to': { boxShadow: '0 0 30px rgba(0, 255, 170, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}