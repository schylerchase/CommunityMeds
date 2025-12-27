import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Using custom domain (publicrx.org) so base is root
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
