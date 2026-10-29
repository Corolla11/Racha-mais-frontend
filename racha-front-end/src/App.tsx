import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/auth-provider";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./auth/auth-routes";

import Cadastro from "./pages/cadastro";
import Login from "./pages/login";
import Home from "./pages/home";
import Perfil from "./pages/perfil";
import Grupo from "./pages/grupo";
import CriarGrupo from "./pages/criar-grupo";
import MeusGrupos from "./pages/meus-grupos";
import MeusGruposVazio from "./pages/meus-grupos-vazio";
import Notificacoes from "./pages/notificacoes";
import Faq from "./pages/faq";
import EsqueceuSenha from "./pages/esqueceu-senha";
import GrupoCriado from "./pages/grupo-criado";
import Membros from "./pages/membros";
import Partes from "./pages/partes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/grupo" element={<Grupo />} />
            <Route path="/criar-grupo" element={<CriarGrupo />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
