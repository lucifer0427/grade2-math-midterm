/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        math: {
          hundred: '#10b981', // 綠色百位
          ten: '#3b82f6',     // 藍色十位
          one: '#ef4444',     // 紅色個位
          candy: '#f43f5e',
          magic: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
