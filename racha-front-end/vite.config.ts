import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.VITE_BACKEND_PROXY_TARGET ?? 'http://localhost:3000'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api/auth': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/grupos': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/tarefas': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/partes': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})