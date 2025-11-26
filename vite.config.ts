import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      // COOP 오류 완화를 위한 헤더 설정 (팝업 방식 사용 시)
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
