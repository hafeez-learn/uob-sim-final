import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173 },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      entryFileNames: 'assets/[name].js',
      chunkFileNames: 'assets/[name].js',
      assetFileNames: 'assets/[name].[ext]',
    },
  },
})
