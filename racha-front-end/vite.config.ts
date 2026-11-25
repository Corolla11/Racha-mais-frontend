import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BACKEND_ROUTES = [
  '/api/auth',
  '/grupos',
  '/convites',
  '/tarefas',
  '/partes',
  '/chaves-pix',
  '/users',
  '/health',
  '/notificacoes',
  '/pagamentos',
  '/planos',
  '/assinaturas',
  '/ia',
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    env.VITE_BACKEND_PROXY_TARGET ?? 'http://localhost:3000'

  // Rotas como /tarefas/:id/partes existem no front e na API. Navegação do
  // navegador (Accept: text/html) fica com o SPA; fetch/XHR vai para o backend.
  const api = (): ProxyOptions => ({
    target: backendTarget,
    changeOrigin: true,
    bypass: (req) =>
      req.headers.accept?.includes('text/html') ? '/index.html' : undefined,
  })

  const proxy = Object.fromEntries(
    BACKEND_ROUTES.map((route) => [route, api()]),
  )

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy,
    },
  }
})
