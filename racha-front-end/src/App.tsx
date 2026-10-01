import { BrowserRouter, Routes, Route } from "react-router-dom";

import Cadastro from "./pages/cadastro";
import Login from "./pages/login";
import Home from "./pages/home";
import Perfil from "./pages/perfil";
import Grupo from "./pages/grupo";
import CriarGrupo from "./pages/criar-grupo";
import MeusGrupos from "./pages/meus-grupos";
import GrupoCriado from "./pages/grupo-criado";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/grupo" element={<Grupo />} />
        <Route path="/criar-grupo" element={<CriarGrupo />} />
        <Route path="/meus-grupos" element={<MeusGrupos />} />
        <Route path="/grupo-criado" element={<GrupoCriado />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;