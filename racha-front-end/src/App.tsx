import { BrowserRouter, Routes, Route } from "react-router-dom";

import Cadastro from "./pages/cadastro";
import Login from "./pages/login";
import Home from "./pages/home";
import Grupo from "./pages/grupo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/grupo" element={<Grupo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;