import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/auth-provider";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./auth/auth-routes";

import Login from "./pages/login";

const Cadastro = lazy(() => import("./pages/cadastro"));
const Home = lazy(() => import("./pages/home"));
const Perfil = lazy(() => import("./pages/perfil"));
const Grupo = lazy(() => import("./pages/grupo"));
const CriarGrupo = lazy(() => import("./pages/criar-grupo"));
const MeusGrupos = lazy(() => import("./pages/meus-grupos"));
const MeusGruposVazio = lazy(() => import("./pages/meus-grupos-vazio"));
const Notificacoes = lazy(() => import("./pages/notificacoes"));
const Faq = lazy(() => import("./pages/faq"));
const EsqueceuSenha = lazy(() => import("./pages/esqueceu-senha"));
const GrupoCriado = lazy(() => import("./pages/grupo-criado"));
const Membros = lazy(() => import("./pages/membros"));
const Partes = lazy(() => import("./pages/partes"));
const Assinatura = lazy(() => import("./pages/assinatura"));
const Convite = lazy(() => import("./pages/convite"));
const RedefinirSenha = lazy(() => import("./pages/redefinir-senha"));
const EscolherCriacao = lazy(() => import("./pages/escolher-criacao"));
const ConfirmarGrupo = lazy(() => import("./pages/confirmar-grupo"));
const VerificarEmail = lazy(() => import("./pages/verificar-email"));

const routeFallback = (
  <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface-variant font-body-md">
    Carregando...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/apresentacao" element={<Home />} />
            <Route path="/convite/:token" element={<Convite />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/verificar-email" element={<VerificarEmail />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/grupo" element={<Navigate to="/meus-grupos" replace />} />
              <Route path="/grupo/:idGrupo" element={<Grupo />} />
              <Route path="/criar-grupo" element={<EscolherCriacao />} />
              <Route path="/criar-grupo/manual" element={<CriarGrupo />} />
              <Route path="/criar-grupo/confirmar" element={<ConfirmarGrupo />} />
              <Route path="/assinatura" element={<Assinatura />} />
              <Route path="/gerenciar-assinatura" element={<Assinatura manage />} />
              <Route path="/meus-grupos" element={<MeusGrupos />} />
              <Route path="/meus-grupos-vazio" element={<MeusGruposVazio />} />
              <Route path="/notificacoes" element={<Notificacoes />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/grupo-criado" element={<GrupoCriado />} />
              <Route path="/grupo/:idGrupo/membros" element={<Membros />} />
              <Route path="/tarefas/:idTarefa/partes" element={<Partes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
