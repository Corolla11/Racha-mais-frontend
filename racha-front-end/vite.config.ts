import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BACKEND_ROUTES = [
  '/api/auth',
  '/grupos',
  '/tarefas',
  '/partes',
  '/chaves-pix',
  '/users',
  '/health',
  '/notificacoes',
  '/pagamentos',
  '/ia',
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.VITE_BACKEND_PROXY_TARGET ?? 'http://localhost:3000'

  const proxy = Object.fromEntries(
    BACKEND_ROUTES.map((route) => [
      route,
      { target: backendTarget, changeOrigin: true },
    ]),
  )

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
        '/notificacoes': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/planos': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/assinaturas': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/ia': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
