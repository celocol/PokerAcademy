/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        celo: {
          primary: '#35D07F',
          secondary: '#FBCC5C',
          dark: '#1E1E1E',
        },
        poker: {
          red: '#DC2626',
          black: '#1F2937',
          green: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 