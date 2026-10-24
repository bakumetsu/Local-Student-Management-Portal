import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Chuyển tiếp API tới backend tự host (cùng origin nên không cần cấu hình CORS).
    proxy: {
      '/api': process.env.VITE_PROXY_TARGET || 'http://localhost:8080'
    }
  },
  build: {
    outDir: 'dist'
  }
})
