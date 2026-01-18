/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        marketDark: '#0a0a0c',
        marketPanel: '#0f0f12',
        marketCard: '#16161a',
        marketBorder: '#1e1e24',
      },
    },
  },
  plugins: [],
}