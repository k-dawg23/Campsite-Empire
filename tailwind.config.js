/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: '#123225',
        moss: '#4f9a5f',
        lake: '#3f8fbf',
        trail: '#9a8f73',
        canvas: '#f5efe2'
      },
      boxShadow: {
        panel: '0 18px 45px rgba(14, 31, 24, 0.18)'
      }
    }
  },
  plugins: []
};
