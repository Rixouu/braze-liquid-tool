/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['framer-motion'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})