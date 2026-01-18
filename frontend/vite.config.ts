import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In Docker dev mode, VITE_API_URL points to backend service
// In local dev, it defaults to localhost:8000
const apiTarget = process.env.VITE_API_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all addresses (needed for Docker)
    watch: {
      usePolling: true, // Needed for Docker volume mounts on Windows
      interval: 1000, // Poll every 1 second
    },
    hmr: {
      // Configure HMR for Docker on Windows
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
