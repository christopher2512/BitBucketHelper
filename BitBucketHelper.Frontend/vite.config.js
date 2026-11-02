import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During development the React app runs on Vite (5173) and proxies API calls
// to the ASP.NET backend (5219). In production the built bundle is served by
// the backend itself, so /api calls resolve to the same origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5219',
        changeOrigin: true,
      },
    },
  },
  // Output the production build into the backend wwwroot so a single
  // dotnet run serves both the API and the UI.
  build: {
    outDir: '../BitBucketHelper.Backend/BitBucketHelper.Backend/wwwroot',
    emptyOutDir: true,
  },
})
