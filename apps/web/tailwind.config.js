/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nepal-red': '#DC143C',
        'nepal-blue': '#003366',
      },
    },
  },
  plugins: [],
};