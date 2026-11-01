import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 確保在 GitHub Pages (https://lucifer0427.github.io/grade2-math-midterm/) 靜態路徑無誤
});
