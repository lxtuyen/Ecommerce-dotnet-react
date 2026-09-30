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
        // Vibrant Electric Sky Blue (0xFF42A6ED) Palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#5abdf5',
          500: '#42A6ED', // Brand Core (0xFF42A6ED)
          600: '#258cd6', // Hover State
          700: '#1b6eac', // Active State
          800: '#1a598a',
          900: '#1b4a72',
          950: '#112f4c',
          DEFAULT: '#42A6ED',
        },
        indigo: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#5abdf5',
          500: '#42A6ED',
          600: '#258cd6',
          700: '#1b6eac',
          800: '#1a598a',
          900: '#1b4a72',
          950: '#112f4c',
          DEFAULT: '#42A6ED',
        },
      },
      boxShadow: {
        'electric': '0 4px 18px -2px rgba(66, 166, 237, 0.38)',
        'electric-lg': '0 8px 25px -4px rgba(66, 166, 237, 0.45)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
