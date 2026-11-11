/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#245C3A',
          dark: '#173D2A',
          light: '#6C9468',
        },
        agri: {
          bg: '#F5F7F2',
          surface: '#FFFFFF',
          text: '#26332B',
          muted: '#748077',
          border: '#E3E9E1',
          warning: '#D69A36',
          danger: '#C65349',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

