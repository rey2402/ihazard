/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mining: {
          dark: '#0A192F',
          surface: '#112240',
          border: '#233554',
          accent: '#F59E0B',
          orange: '#FF6B00',
          green: '#10B981',
          danger: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
