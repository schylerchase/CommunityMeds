import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment
  // Change 'CommunityMeds' to your repository name
  base: process.env.NODE_ENV === 'production' ? '/CommunityMeds/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
