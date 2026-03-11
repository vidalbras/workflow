/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        priority: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444',
          urgent: '#8b5cf6',
        },
      },
    },
  },
  plugins: [],
};
