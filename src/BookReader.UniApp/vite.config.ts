import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5125',
        changeOrigin: true
      }
    }
  }
})
