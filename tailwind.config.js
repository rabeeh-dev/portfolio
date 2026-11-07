/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: {
          light: '#E9E8E6',
          dark: '#1A1A1A',
        },
        card: {
          light: '#F5F5F5',
          dark: '#242424',
        },
        heading: {
          light: '#1A1A1A',
          dark: '#F0F0F0',
        },
        body: {
          light: '#8A8A8A',
          dark: '#9A9A9A',
        },
        accent: '#22C55E',
      },
      fontFamily: {
        sans: ['Figtree', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
      },
      maxWidth: {
        content: '1100px',
      },
    },
  },
  plugins: [],
}
