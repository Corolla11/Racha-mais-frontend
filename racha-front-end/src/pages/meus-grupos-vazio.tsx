import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowDown,
  ArrowRight,
  Bell,
  ChevronDown,
  CircleCheckBig,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import Aba from "../components/aba-perfil";

const filtros = [
  "Todos",
  "Como Organizador",
  "Contas Pendentes",
  "Viagens & Eventos",
  "República & Moradia",
  "Finalizados",
];

const modelos = [
  {
    emoji: "🥩",
    titulo: "Churrasco & Festas",
    descricao:
      "Divida compras, bebidas e carnes por pessoa com regras de consumo personalizadas.",
  },
  {
    emoji: "🏠",
    titulo: "Contas da Casa",
    descricao:
      "Aluguel, internet, energia e mercado coletivo com divisão mensal recorrente.",
  },
  {
    emoji: "🏖️",
    titulo: "Viagem com Amigos",
    descricao:
      "Hospedagem, combustível e passeios com rateio em tempo real e comprovantes.",
  },
];

function MeusGruposVazio() {
  const navigate = useNavigate();

  const [abaAberta, setAbaAberta] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-surface px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F6FA]">
            <span className="text-xs font-bold text-secondary">R+</span>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">Racha+</p>

            <p className="text-[9px] text-text-secondary">
              Divisão Inteligente
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <button
            type="button"
            className="rounded-lg bg-input px-3 py-1.5 text-xs font-semibold text-secondary"
          >
            Meus Grupos
          </button>

          <button
            type="button"
            onClick={() => navigate("/criar-grupo")}
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Criar com IA
          </button>

          <button
            type="button"
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Histórico &amp; Pix
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Perfil
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/criar-grupo")}
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-text-primary transition hover:bg-tertiary hover:text-white sm:flex"
          >
            <Plus size={14} />
            Novo Grupo
          </button>

          <button
            type="button"
            aria-label="Notificações"
            onClick={() => navigate("/notificacoes")}
            className="relative text-gray-600"
          >
            <Bell size={17} />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          </button>

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

              <div className="hidden text-left xl:block">
                <p className="text-xs font-semibold">Mariana S.</p>

                <p className="text-[9px] text-text-secondary">Online</p>
              </div>

              <ChevronDown
                size={15}
                className={`text-gray-500 transition-transform ${
                  abaAberta ? "rotate-180" : ""
                }`}
              />
            </button>

            {abaAberta && <Aba onLogout={() => navigate("/login")} />}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-6 py-8">
        {/* TÍTULO E AÇÕES */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />

              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                Visão Geral de Grupos • Junho 2025
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-secondary">
              Meus Grupos
            </h1>

            <p className="text-base text-text-secondary">
              Gerencie despesas compartilhadas, acompanhe quem já pagou e
              acesse seus compromissos ativos sem atrito.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="flex items-center gap-2 rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-secondary shadow-sm transition hover:bg-input"
            >
              <Sparkles size={18} className="fill-primary text-primary" />
              Criar com IA
            </button>

            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white"
            >
              <Plus size={18} />
              Novo Grupo Manual
            </button>
          </div>
        </div>

        {/* RESUMO ZERADO */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              titulo: "Saldo a Receber",
              valor: "R$ 0,00",
              legenda: "Nenhum valor pendente a receber",
              icone: <ArrowDown size={16} className="rotate-45" />,
            },
            {
              titulo: "Minhas Cotas Pendentes",
              valor: "R$ 0,00",
              legenda: "Tudo em dia! Sem pendências",
              icone: <CircleCheckBig size={16} />,
            },
            {
              titulo: "Grupos Ativos",
              valor: "0 grupos",
              legenda: "Crie seu primeiro racha agora",
              icone: <Users size={16} />,
            },
            {
              titulo: "Pontualidade Geral",
              valor: "100%",
              legenda: "Iniciando histórico coletivo",
              icone: <ShieldCheck size={16} />,
            },
          ].map((card) => (
            <div
              key={card.titulo}
              className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface p-6 shadow-sm"
            >
              <div className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 rounded-full bg-input opacity-60" />

              <div className="relative mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  {card.titulo}
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-input text-secondary">
                  {card.icone}
                </span>
              </div>

              <div className="relative flex flex-col">
                <span className="text-3xl font-bold tracking-tight text-secondary">
                  {card.valor}
                </span>

                <span className="mt-1 text-[11px] text-text-secondary">
                  {card.legenda}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* BUSCA, ORDENAÇÃO E FILTROS */}
        <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm">
          <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="relative max-w-xl flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="text"
                placeholder="Buscar por grupo ou participante..."
                className="h-11 w-full rounded-xl bg-input pl-11 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <label
                htmlFor="ordenar-grupos"
                className="hidden text-[11px] text-text-secondary sm:inline"
              >
                Ordenar:
              </label>

              <div className="relative">
                <select
                  id="ordenar-grupos"
                  className="cursor-pointer appearance-none rounded-xl bg-input py-2.5 pl-4 pr-10 text-xs font-semibold text-secondary outline-none transition hover:bg-background"
                >
                  <option>Mais recentes primeiro</option>
                  <option>Maior valor total</option>
                  <option>Mais antigos</option>
                  <option>Nome (A-Z)</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filtros.map((nome) => {
              const ativo = filtroAtivo === nome;

              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => setFiltroAtivo(nome)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    ativo
                      ? "bg-secondary text-white shadow-sm"
                      : "bg-input text-text-secondary hover:bg-background hover:text-text-primary"
                  }`}
                >
                  {nome} (0)
                </button>
              );
            })}
          </div>
        </div>

        {/* ESTADO VAZIO */}
        <section className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-surface p-8 text-center shadow-sm md:p-12">
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-input opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-input" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-inner">
              <Users size={40} className="fill-primary/30 text-tertiary" />
            </div>

            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-text-primary shadow-md">
              <Plus size={18} />
            </div>
          </div>

          <h2 className="relative mb-3 max-w-xl text-2xl font-bold tracking-tight text-secondary">
            Você ainda não participa de nenhum grupo
          </h2>

          <p className="relative mb-8 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Divida churrascos, contas da república, viagens ou partidas de
            futebol sem constrangimento nem planilhas complicadas. Crie um
            grupo em segundos ou peça o link de convite para um amigo.
          </p>

          <div className="relative mb-12 flex w-full max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white sm:w-auto"
            >
              <Sparkles size={18} className="fill-current" />
              Criar Primeiro Grupo com IA
            </button>

            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-input px-6 py-3 text-sm font-semibold text-secondary transition hover:bg-background sm:w-auto"
            >
              <Plus size={18} />
              Criar Manualmente
            </button>
          </div>

          {/* Modelos populares */}
          <div className="relative mt-2 flex w-full flex-col items-center pt-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-gray-200" />

              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Modelos populares para começar
              </span>

              <span className="h-px w-8 bg-gray-200" />
            </div>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-4 text-left md:grid-cols-3">
              {modelos.map((modelo) => (
                <button
                  key={modelo.titulo}
                  type="button"
                  onClick={() => navigate("/criar-grupo")}
                  className="group flex flex-col justify-between rounded-xl bg-input p-5 text-left shadow-sm transition hover:bg-background"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="text-2xl" role="img" aria-label={modelo.titulo}>
                      {modelo.emoji}
                    </span>

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-text-secondary transition group-hover:text-tertiary">
                      <ArrowRight size={14} />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-secondary transition group-hover:text-tertiary">
                      {modelo.titulo}
                    </h3>

                    <p className="mt-1 text-[13px] leading-snug text-text-secondary">
                      {modelo.descricao}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AVISO - LEMBRETES AUTOMÁTICOS */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-surface p-6 shadow-sm md:flex-row md:p-8">
          <div className="flex max-w-3xl items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-input text-secondary">
              <MessageCircle size={24} />
            </div>

            <div className="flex flex-col">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-secondary">
                  Lembretes Automáticos Racha+
                </h3>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-input px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Ativo em todos os grupos
                </span>
              </div>

              <p className="text-[13px] leading-relaxed text-text-secondary">
                Nenhum constrangimento: avisamos os participantes com
                pendências via WhatsApp de forma amigável e com link direto do
                Pix quando faltar 24h para o vencimento.
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-end gap-3 md:w-auto">
            <button
              type="button"
              className="rounded-xl bg-input px-5 py-2.5 text-xs font-semibold text-secondary shadow-sm transition hover:bg-background"
            >
              Configurar Regras
            </button>
          </div>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="mt-12 w-full bg-surface py-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-secondary">Racha+</span>

            <span className="text-xs text-text-secondary">
              • Organização descomplicada de despesas e tarefas coletivas
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary">
            <button type="button" className="transition hover:text-secondary">
              Sobre
            </button>

            <button type="button" className="transition hover:text-secondary">
              Segurança Pix
            </button>

            <button type="button" className="transition hover:text-secondary">
              Privacidade
            </button>

            <span>© 2025 Racha+. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MeusGruposVazio;
