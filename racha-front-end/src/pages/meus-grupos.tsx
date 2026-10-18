import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlarmClock,
  ArrowDown,
  Bell,
  ChevronDown,
  CircleCheckBig,
  CircleDollarSign,
  MailCheck,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";

import Aba from "../components/aba-perfil";

type Filtro =
  | "todos"
  | "organizador"
  | "pendentes"
  | "viagens"
  | "moradia"
  | "finalizados";

type Ordenacao = "recentes" | "antigos" | "pendencias" | "alfabetico";

interface Grupo {
  id: number;
  nome: string;
  categoria: string;
  corCategoria: string;
  etiqueta: string;
  corEtiqueta: string;
  avatares: number[];
  extras: number;
  rotuloParticipantes: string;
  progressoTitulo: string;
  progressoPercentual: number;
  corProgresso: string;
  saldoIcone: "pendente" | "pago" | "carteira" | "confirmado";
  saldoTexto: string;
  saldoValor: string;
  corSaldoValor: string;
  saldoBadge: string;
  corSaldoBadge: string;
  acaoSecundaria: "pix" | "whatsapp" | null;
  rotuloDetalhes: string;
  organizador: boolean;
  pendente: boolean;
  finalizado: boolean;
  criadoEm: number;
  pendenciaValor: number;
}

const grupos: Grupo[] = [
  {
    id: 1,
    nome: "Churrasco de Fim de Ano 🥩",
    categoria: "Evento / Lazer",
    corCategoria: "text-primary",
    etiqueta: "Acerto em 3 dias",
    corEtiqueta: "bg-red-50 text-red-700",
    avatares: [12, 47, 33, 68, 24],
    extras: 3,
    rotuloParticipantes: "8 participantes",
    progressoTitulo: "6 de 8 pagaram",
    progressoPercentual: 75,
    corProgresso: "bg-secondary/60",
    saldoIcone: "pendente",
    saldoTexto: "Sua cota:",
    saldoValor: "R$ 65,00",
    corSaldoValor: "text-tertiary",
    saldoBadge: "Pendente",
    corSaldoBadge: "bg-red-50 text-red-700",
    acaoSecundaria: "pix",
    rotuloDetalhes: "Ver Detalhes",
    organizador: true,
    pendente: true,
    finalizado: false,
    criadoEm: 5,
    pendenciaValor: 65,
  },
  {
    id: 2,
    nome: "Apê 402 - Despesas Fixas 🏠",
    categoria: "República & Moradia",
    corCategoria: "text-secondary",
    etiqueta: "Mensal • Junho",
    corEtiqueta: "bg-input text-secondary",
    avatares: [5, 15, 26, 51],
    extras: 0,
    rotuloParticipantes: "4 moradores",
    progressoTitulo: "4 de 4 pagaram",
    progressoPercentual: 100,
    corProgresso: "bg-secondary",
    saldoIcone: "pago",
    saldoTexto: "Você pagou",
    saldoValor: "R$ 450,00",
    corSaldoValor: "text-text-primary",
    saldoBadge: "Quitado",
    corSaldoBadge: "bg-blue-50 text-secondary",
    acaoSecundaria: null,
    rotuloDetalhes: "Ver Detalhes do Mês",
    organizador: true,
    pendente: false,
    finalizado: false,
    criadoEm: 4,
    pendenciaValor: 0,
  },
  {
    id: 3,
    nome: "Viagem Floripa Réveillon 🏖️",
    categoria: "Viagem",
    corCategoria: "text-tertiary",
    etiqueta: "Em planejamento",
    corEtiqueta: "bg-input text-text-secondary",
    avatares: [9, 32, 60, 41],
    extras: 2,
    rotuloParticipantes: "6 viajantes",
    progressoTitulo: "R$ 1.840,00 de R$ 3.000,00",
    progressoPercentual: 61,
    corProgresso: "bg-primary",
    saldoIcone: "carteira",
    saldoTexto: "Você adiantou:",
    saldoValor: "R$ 600,00",
    corSaldoValor: "text-text-primary",
    saldoBadge: "Receber R$ 350,00",
    corSaldoBadge: "bg-blue-50 text-secondary",
    acaoSecundaria: "whatsapp",
    rotuloDetalhes: "Ver Detalhes",
    organizador: true,
    pendente: true,
    finalizado: false,
    criadoEm: 3,
    pendenciaValor: 350,
  },
  {
    id: 4,
    nome: "Racha do Futebol de Terça ⚽",
    categoria: "Esportes & Lazer",
    corCategoria: "text-secondary",
    etiqueta: "Semanal",
    corEtiqueta: "bg-input text-text-secondary",
    avatares: [11, 18, 55],
    extras: 9,
    rotuloParticipantes: "12 jogadores",
    progressoTitulo: "10 de 12 confirmados",
    progressoPercentual: 83,
    corProgresso: "bg-secondary",
    saldoIcone: "confirmado",
    saldoTexto: "Sua cota:",
    saldoValor: "R$ 25,00",
    corSaldoValor: "text-text-primary",
    saldoBadge: "Pago",
    corSaldoBadge: "bg-blue-50 text-secondary",
    acaoSecundaria: null,
    rotuloDetalhes: "Ver Detalhes da Partida",
    organizador: false,
    pendente: false,
    finalizado: false,
    criadoEm: 2,
    pendenciaValor: 0,
  },
  {
    id: 5,
    nome: "Aniversário da Bia 🎂",
    categoria: "Evento / Lazer",
    corCategoria: "text-primary",
    etiqueta: "Encerrado",
    corEtiqueta: "bg-input text-text-secondary",
    avatares: [23, 36, 44],
    extras: 4,
    rotuloParticipantes: "7 participantes",
    progressoTitulo: "7 de 7 pagaram",
    progressoPercentual: 100,
    corProgresso: "bg-secondary",
    saldoIcone: "pago",
    saldoTexto: "Você pagou",
    saldoValor: "R$ 80,00",
    corSaldoValor: "text-text-primary",
    saldoBadge: "Quitado",
    corSaldoBadge: "bg-blue-50 text-secondary",
    acaoSecundaria: null,
    rotuloDetalhes: "Ver Resumo Final",
    organizador: false,
    pendente: false,
    finalizado: true,
    criadoEm: 1,
    pendenciaValor: 0,
  },
];

const filtros: { id: Filtro; nome: string }[] = [
  { id: "todos", nome: "Todos" },
  { id: "organizador", nome: "Como Organizador" },
  { id: "pendentes", nome: "Contas Pendentes" },
  { id: "viagens", nome: "Viagens & Eventos" },
  { id: "moradia", nome: "República & Moradia" },
  { id: "finalizados", nome: "Finalizados" },
];

function pertenceAoFiltro(grupo: Grupo, filtro: Filtro) {
  if (filtro === "todos") return !grupo.finalizado;
  if (filtro === "organizador") return grupo.organizador && !grupo.finalizado;
  if (filtro === "pendentes") return grupo.pendente && !grupo.finalizado;
  if (filtro === "viagens")
    return (
      !grupo.finalizado &&
      (grupo.categoria.includes("Viagem") || grupo.categoria.includes("Evento"))
    );
  if (filtro === "moradia") return grupo.categoria.includes("República");

  return grupo.finalizado;
}

const iconesSaldo = {
  pendente: <AlarmClock size={17} className="text-tertiary" />,
  pago: <CircleCheckBig size={17} className="text-secondary" />,
  carteira: <WalletCards size={17} className="text-secondary" />,
  confirmado: <CircleCheckBig size={17} className="text-secondary" />,
};

function MeusGrupos() {
  const navigate = useNavigate();

  const [abaAberta, setAbaAberta] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recentes");

  const gruposVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const filtrados = grupos.filter((grupo) => {
      if (!pertenceAoFiltro(grupo, filtro)) return false;

      if (!termo) return true;

      return (
        grupo.nome.toLowerCase().includes(termo) ||
        grupo.categoria.toLowerCase().includes(termo)
      );
    });

    return [...filtrados].sort((a, b) => {
      if (ordenacao === "antigos") return a.criadoEm - b.criadoEm;
      if (ordenacao === "pendencias") return b.pendenciaValor - a.pendenciaValor;
      if (ordenacao === "alfabetico") return a.nome.localeCompare(b.nome);

      return b.criadoEm - a.criadoEm;
    });
  }, [busca, filtro, ordenacao]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-surface px-6">
        {/* Logo */}
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

        {/* Navegação */}
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

        {/* Ações do usuário */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/criar-grupo")}
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-text-primary transition hover:bg-tertiary hover:text-white sm:flex"
          >
            <Plus size={14} />
            Novo Grupo
          </button>

          <button type="button" className="relative text-gray-600">
            <Bell size={17} />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
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
      <main className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-8">
        {/* TÍTULO E AÇÕES */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary">
                Visão Geral de Grupos
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-primary" />

              <span className="text-[10px] text-text-secondary">
                Junho 2025
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">Meus Grupos</h1>

            <p className="max-w-2xl text-sm text-text-secondary">
              Gerencie despesas compartilhadas, acompanhe quem já pagou e
              acesse seus compromissos ativos sem atrito.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5 text-xs font-medium text-secondary shadow-sm transition hover:bg-input"
            >
              <Sparkles size={15} className="text-primary" />
              Criar com IA
            </button>

            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white"
            >
              <Users size={15} />+ Novo Grupo Manual
            </button>
          </div>
        </div>

        {/* RESUMO FINANCEIRO */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Saldo a receber */}
          <div className="flex flex-col justify-between rounded-xl bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Saldo a Receber
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-input text-secondary">
                <ArrowDown size={15} />
              </div>
            </div>

            <div className="mt-4 flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-secondary">
                R$ 340,00
              </span>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-secondary" />

                <span className="text-[10px] font-medium text-text-secondary">
                  + 2 pessoas pendentes com você
                </span>
              </div>
            </div>
          </div>

          {/* Cotas pendentes */}
          <div className="flex flex-col justify-between rounded-xl bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Minhas Cotas Pendentes
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-tertiary">
                <AlarmClock size={15} />
              </div>
            </div>

            <div className="mt-4 flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-tertiary">
                R$ 115,00
              </span>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] text-text-secondary">
                  Vence em 2 dias (Churrasco)
                </span>

                <button
                  type="button"
                  className="text-[10px] font-semibold text-primary underline underline-offset-2 transition hover:text-tertiary"
                >
                  Pagar Pix
                </button>
              </div>
            </div>
          </div>

          {/* Grupos ativos */}
          <div className="flex flex-col justify-between rounded-xl bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Grupos Ativos
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-input text-secondary">
                <Users size={15} />
              </div>
            </div>

            <div className="mt-4 flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">5</span>

                <span className="text-xs text-text-secondary">
                  grupos em andamento
                </span>
              </div>

              <span className="mt-1 text-[10px] text-text-secondary">
                3 organizador • 2 participante
              </span>
            </div>
          </div>

          {/* Pontualidade */}
          <div className="flex flex-col justify-between rounded-xl bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Pontualidade Geral
              </span>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-input text-secondary">
                <ShieldCheck size={15} />
              </div>
            </div>

            <div className="mt-4 flex flex-col">
              <span className="text-2xl font-bold tracking-tight">96%</span>

              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-input px-2 py-0.5 text-[10px] font-semibold text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Alta Confiabilidade
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BUSCA, ORDENAÇÃO E FILTROS */}
        <div className="flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            {/* Busca */}
            <div className="relative max-w-lg flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="text"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar por grupo ou participante..."
                className="w-full rounded-lg bg-input py-2.5 pl-10 pr-4 text-xs text-text-primary outline-none transition placeholder:text-text-secondary focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-3 self-end lg:self-auto">
              <label
                htmlFor="ordenar-grupos"
                className="whitespace-nowrap text-xs text-text-secondary"
              >
                Ordenar por:
              </label>

              <div className="relative">
                <select
                  id="ordenar-grupos"
                  value={ordenacao}
                  onChange={(evento) =>
                    setOrdenacao(evento.target.value as Ordenacao)
                  }
                  className="cursor-pointer appearance-none rounded-lg bg-input py-2 pl-3 pr-8 text-xs font-medium text-text-primary outline-none"
                >
                  <option value="recentes">Mais recentes primeiro</option>
                  <option value="antigos">Mais antigos</option>
                  <option value="pendencias">Maior pendência</option>
                  <option value="alfabetico">Nome (A - Z)</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="-mb-1 flex items-center gap-2 overflow-x-auto pb-1">
            {filtros.map((item) => {
              const quantidade = grupos.filter((grupo) =>
                pertenceAoFiltro(grupo, item.id),
              ).length;

              const ativo = filtro === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFiltro(item.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-semibold transition ${
                    ativo
                      ? "bg-secondary text-white shadow-sm"
                      : "bg-input text-text-secondary hover:bg-background hover:text-text-primary"
                  }`}
                >
                  {item.nome} ({quantidade})
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTA DE GRUPOS */}
        {gruposVisiveis.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {gruposVisiveis.map((grupo) => (
              <div
                key={grupo.id}
                className="group flex flex-col justify-between gap-6 rounded-xl bg-surface p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide ${grupo.corCategoria}`}
                      >
                        {grupo.categoria}
                      </span>

                      <h2 className="mt-1 text-lg font-bold transition group-hover:text-secondary">
                        {grupo.nome}
                      </h2>
                    </div>

                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${grupo.corEtiqueta}`}
                    >
                      {grupo.etiqueta}
                    </span>
                  </div>

                  {/* Participantes */}
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      {grupo.avatares.map((avatar) => (
                        <img
                          key={avatar}
                          src={`https://i.pravatar.cc/100?img=${avatar}`}
                          alt="Participante do grupo"
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-surface"
                        />
                      ))}

                      {grupo.extras > 0 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-input text-[10px] font-bold text-text-secondary ring-2 ring-surface">
                          +{grupo.extras}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-text-secondary">
                      {grupo.rotuloParticipantes}
                    </span>
                  </div>

                  {/* Progresso */}
                  <div className="mt-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold">
                        {grupo.progressoTitulo}
                      </span>

                      <span className="font-bold text-secondary">
                        {grupo.progressoPercentual}%
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-input">
                      <div
                        className={`h-full rounded-full ${grupo.corProgresso}`}
                        style={{ width: `${grupo.progressoPercentual}%` }}
                      />
                    </div>
                  </div>

                  {/* Saldo pessoal */}
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-input p-3">
                    <div className="flex items-center gap-2">
                      {iconesSaldo[grupo.saldoIcone]}

                      <span className="text-xs font-medium">
                        {grupo.saldoTexto}{" "}
                        <strong className={`font-bold ${grupo.corSaldoValor}`}>
                          {grupo.saldoValor}
                        </strong>
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${grupo.corSaldoBadge}`}
                    >
                      {grupo.saldoBadge}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/grupo")}
                    className={`rounded-lg bg-input px-4 py-2.5 text-center text-xs font-medium text-text-primary transition hover:bg-background ${
                      grupo.acaoSecundaria ? "flex-1" : "w-full"
                    }`}
                  >
                    {grupo.rotuloDetalhes}
                  </button>

                  {grupo.acaoSecundaria === "pix" && (
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white"
                    >
                      <Zap size={14} />
                      Pagar Pix
                    </button>
                  )}

                  {grupo.acaoSecundaria === "whatsapp" && (
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-input px-4 py-2.5 text-xs font-semibold text-secondary transition hover:bg-background"
                    >
                      <MessageCircle size={14} />
                      Cobrar WhatsApp
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-surface p-12 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-input text-secondary">
              <CircleDollarSign size={22} />
            </div>

            <h3 className="text-base font-semibold">
              Nenhum grupo encontrado
            </h3>

            <p className="max-w-md text-xs text-text-secondary">
              Ajuste a busca ou escolha outro filtro para visualizar seus
              grupos.
            </p>
          </div>
        )}

        {/* AVISO - LEMBRETES AUTOMÁTICOS */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-r from-input to-background p-6 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
              <MailCheck size={24} />
            </div>

            <div className="flex flex-col">
              <h3 className="text-base font-semibold">
                Lembretes Automáticos Racha+
              </h3>

              <p className="mt-0.5 max-w-2xl text-xs text-text-secondary">
                Nenhum constrangimento: avisamos os participantes com
                pendências via WhatsApp de forma amigável e com link direto do
                Pix quando faltar 24h para o vencimento.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-end md:self-auto">
            <button
              type="button"
              className="px-3 py-2 text-xs font-semibold text-secondary transition hover:text-text-primary"
            >
              Configurar Regras
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[10px] font-bold text-secondary shadow-sm">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Ativo em todos os grupos
            </span>
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

export default MeusGrupos;
