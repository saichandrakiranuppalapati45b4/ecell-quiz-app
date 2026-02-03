/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#FFD700',
          DEFAULT: '#D4AF37',
          dark: '#AA8C2C',
        },
        black: {
          DEFAULT: '#000000',
          rich: '#0a0a0a',
          soft: '#1a1a1a',
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #D4AF37, #FFD700)',
        'gold-gradient-text': 'linear-gradient(to bottom, #D4AF37, #FFD700)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // Luxury heading font if available, or just use sans
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #D4AF37' },
          '100%': { boxShadow: '0 0 20px #FFD700' },
        }
      }
    },
  },
  plugins: [],
}
