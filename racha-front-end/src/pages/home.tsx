import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Sparkles,
  ListChecks,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";

import Aba from "../components/aba-perfil";

function Home() {
  const navigate = useNavigate();

  const [abaAberta, setAbaAberta] = useState(false);

  function handleLogout() {
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#F5F8FE] text-[#111827]">

      {/* HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F6FA]">
            <span className="text-xs font-bold text-[#1D4ED8]">
              R+
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#111827]">
              Racha+
            </p>

            <p className="text-[9px] text-gray-500">
              Divisão Inteligente
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex items-center gap-6">
          <button className="text-xs text-gray-700 hover:text-[#1D4ED8]">
            Meus Grupos
          </button>

          <button className="text-xs text-gray-700 hover:text-[#1D4ED8]">
            Criar com IA
          </button>

          <button className="text-xs text-gray-700 hover:text-[#1D4ED8]">
            Histórico & Pix
          </button>

          <button className="text-xs text-gray-700 hover:text-[#1D4ED8]">
            Perfil
          </button>
        </nav>

        {/* Ações do usuário */}
        <div className="flex items-center gap-4">

          <button className="rounded-lg bg-[#F5A623] px-4 py-2 text-xs font-medium text-[#111827] transition hover:brightness-95">
            + Novo Grupo
          </button>

          <button className="relative text-gray-600">
            <Bell size={17} />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#F5A623]" />
          </button>

          {/* Perfil */}
          <div className="relative">

            <button
              type="button"
              onClick={() => setAbaAberta(!abaAberta)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
            >
              <img
                src="https://i.pravatar.cc/100?img=47"
                alt="Foto de perfil"
                className="h-9 w-9 rounded-full object-cover"
              />

              <div className="text-left">
                <p className="text-xs font-semibold">
                  Mariana S.
                </p>

                <p className="text-[9px] text-gray-500">
                  Ativa agora
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`text-gray-500 transition-transform ${
                  abaAberta ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Aba do perfil */}
            {abaAberta && (
              <Aba onLogout={handleLogout} />
            )}

          </div>

        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Título */}
        <div className="text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />

            <span className="text-[10px] font-medium uppercase tracking-wide text-[#1D4ED8]">
              Novo começo
            </span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight">
            Olá, Mariana! Tudo
            <br />
            pronto para começar.
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Escolha como deseja criar o seu primeiro grupo:
          </p>

        </div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-2 gap-5">

          {/* IA */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Sparkles
                size={18}
                className="text-[#1D4ED8]"
              />
            </div>

            <h2 className="text-base font-semibold">
              Criar com IA ✨
            </h2>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Descreva em linguagem natural e deixe a inteligência
              montar os itens e participantes.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-3">
              <span className="text-xs text-[#1D4ED8]">
                💬
              </span>

              <p className="text-[10px] italic text-gray-500">
                "Aluguel de praia com Lucas e Ana..."
              </p>
            </div>

            <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5A623] py-2.5 text-xs font-medium text-[#111827]">
              Usar IA
              <ArrowRight size={14} />
            </button>

          </div>

          {/* Manual */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <ListChecks
                size={18}
                className="text-[#1D4ED8]"
              />
            </div>

            <h2 className="text-base font-semibold">
              Criar manualmente
            </h2>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Configure passo a passo membros, categorias
              e despesas.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-3">
              <SlidersHorizontal
                size={14}
                className="text-[#1D4ED8]"
              />

              <p className="text-[10px] text-gray-500">
                Controle total de pesos, percentuais e categorias
                personalizadas.
              </p>
            </div>

            <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-100 py-2.5 text-xs font-medium text-[#111827]">
              Configurar Manualmente
              <ArrowRight size={14} />
            </button>

          </div>

        </div>

        {/* Benefícios */}
        <div className="mt-7 flex justify-center gap-8">

          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-[#1D4ED8]" />

            <span className="text-[10px] text-gray-500">
              Transações Pix protegidas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap size={13} className="text-[#1D4ED8]" />

            <span className="text-[10px] text-gray-500">
              Sem taxas ocultas
            </span>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-6 py-5">

        <div className="flex items-center justify-between">

          <p className="text-xs text-gray-500">
            <span className="font-semibold text-[#1D4ED8]">
              Racha+
            </span>
            {" "}• Organização descomplicada de despesas e tarefas coletivas
          </p>

          <div className="flex gap-5 text-[10px] text-gray-500">
            <button>Sobre</button>
            <button>Segurança Pix</button>
            <button>Privacidade</button>
            <span>© 2025 Racha+. Todos os direitos reservados.</span>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;