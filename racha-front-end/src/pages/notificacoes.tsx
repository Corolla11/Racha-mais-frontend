import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Bell,
  BellRing,
  Bot,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CloudCheck,
  Landmark,
  MessageCircle,
  Mail,
  MoonStar,
  MoreVertical,
  PartyPopper,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowDownUp,
  Medal,
  ShieldCheck,
  BadgeCheck,
  Banknote,
  Users,
  X,
  Zap,
} from "lucide-react";

import Aba from "../components/aba-perfil";

type Filtro = "todas" | "pendencias" | "pix" | "lembretes";
type Secao = "Hoje" | "Ontem" | "Esta Semana";

interface Notificacao {
  id: number;
  secao: Secao;
  categorias: Filtro[];
  naoLida: boolean;
  destaque: "primary" | "secondary" | null;
  icone: ReactNode;
  corIcone: string;
  titulo: string;
  selo: string;
  corSelo: string;
  descricao: ReactNode;
  meta: ReactNode[];
  acao: "pix" | "comprovante" | "convite" | "enviado" | "grupo" | "ia";
}

const notificacoesIniciais: Notificacao[] = [
  {
    id: 1,
    secao: "Hoje",
    categorias: ["pendencias", "pix"],
    naoLida: true,
    destaque: "primary",
    icone: <Banknote size={22} />,
    corIcone: "bg-primary/15 text-tertiary",
    titulo: "Cota pendente: Churrasco de Fim de Ano 🥩",
    selo: "Vence em 48h",
    corSelo: "bg-red-50 text-red-700",
    descricao: (
      <>
        Mariana Silva (Organizadora) aguarda sua cota individual de{" "}
        <strong className="font-semibold text-text-primary">R$ 65,00</strong>{" "}
        para confirmação das carnes e bebidas.
      </>
    ),
    meta: [
      <span key="g" className="flex items-center gap-1">
        <Users size={13} /> Amigos da Firma
      </span>,
      "Há 20 minutos",
    ],
    acao: "pix",
  },
  {
    id: 2,
    secao: "Hoje",
    categorias: ["pix"],
    naoLida: true,
    destaque: "secondary",
    icone: <CheckCircle2 size={22} />,
    corIcone: "bg-blue-50 text-secondary",
    titulo: "Pix recebido de Lucas Rodrigues 🏠",
    selo: "Validado Open Finance",
    corSelo: "bg-input text-secondary",
    descricao: (
      <>
        Pagamento de{" "}
        <strong className="font-semibold text-secondary">R$ 450,00</strong>{" "}
        referente ao aluguel e despesas fixas de Maio no grupo{" "}
        <em>'Apê 402'</em>.
      </>
    ),
    meta: [
      <span key="b" className="flex items-center gap-1">
        <Landmark size={13} /> Nubank Pagamentos S.A.
      </span>,
      "Hoje às 11:42",
    ],
    acao: "comprovante",
  },
  {
    id: 3,
    secao: "Hoje",
    categorias: ["lembretes"],
    naoLida: false,
    destaque: null,
    icone: <Bot size={22} />,
    corIcone: "bg-input text-secondary",
    titulo: "Lembrete amigável enviado para 4 amigos",
    selo: "Automação WhatsApp",
    corSelo: "bg-background text-text-secondary",
    descricao: (
      <>
        O bot Racha+ relembrou educadamente os participantes que ainda não
        confirmaram a presença no <em>'Futebol de Terça ⚽'</em>.
      </>
    ),
    meta: ["96% de eficácia em cobranças automáticas", "Hoje às 09:15"],
    acao: "enviado",
  },
  {
    id: 4,
    secao: "Ontem",
    categorias: ["pendencias"],
    naoLida: true,
    destaque: "primary",
    icone: <PartyPopper size={22} />,
    corIcone: "bg-primary/15 text-tertiary",
    titulo: "Convite: Viagem Floripa Réveillon 🏖️",
    selo: "Novo Grupo",
    corSelo: "bg-primary/20 text-tertiary",
    descricao: (
      <>
        Beatriz Mendonça adicionou você ao rateio de hospedagem e transporte.
        Estimativa individual:{" "}
        <strong className="font-semibold text-text-primary">R$ 600,00</strong>.
      </>
    ),
    meta: ["6 membros convidados", "Ontem às 18:30"],
    acao: "convite",
  },
  {
    id: 5,
    secao: "Ontem",
    categorias: ["pix"],
    naoLida: false,
    destaque: null,
    icone: <Medal size={22} />,
    corIcone: "bg-blue-50 text-secondary",
    titulo: "100% arrecadado no 'Apê 402 - Fixas' 🎉",
    selo: "Grupo Liquidado",
    corSelo: "bg-input text-secondary",
    descricao: (
      <>
        Todos os 4 moradores quitaram suas cotas pontualmente. O índice de
        confiança do grupo subiu para{" "}
        <strong className="font-semibold text-secondary">96%</strong>.
      </>
    ),
    meta: ["Total: R$ 2.450,00", "Ontem às 14:00"],
    acao: "grupo",
  },
  {
    id: 6,
    secao: "Esta Semana",
    categorias: ["lembretes"],
    naoLida: false,
    destaque: null,
    icone: <Sparkles size={22} />,
    corIcone: "bg-primary/15 text-tertiary",
    titulo: "Divisão Inteligente por IA aprimorada ✨",
    selo: "Recurso Novo",
    corSelo: "bg-input text-text-secondary",
    descricao:
      "Agora nossa IA escaneia cupons fiscais complexos, dividindo automaticamente gorjetas e taxas de serviço entre quem consumiu cada item.",
    meta: ["Disponível para todos os grupos", "Quarta-feira"],
    acao: "ia",
  },
];

const abas: { id: Filtro; nome: string }[] = [
  { id: "todas", nome: "Todas" },
  { id: "pendencias", nome: "Pendências" },
  { id: "pix", nome: "Pix" },
  { id: "lembretes", nome: "Lembretes" },
];

const secoes: { nome: Secao; legenda: string }[] = [
  { nome: "Hoje", legenda: "3 novos eventos" },
  { nome: "Ontem", legenda: "2 atualizações" },
  { nome: "Esta Semana", legenda: "Novidade da plataforma" },
];

interface ToggleProps {
  ativo: boolean;
  onChange: () => void;
  cor: string;
  label: string;
}

function Toggle({ ativo, onChange, cor, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={label}
      onClick={onChange}
      className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
        ativo ? cor : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          ativo ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Notificacoes() {
  const navigate = useNavigate();

  const [abaAberta, setAbaAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState(notificacoesIniciais);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busca, setBusca] = useState("");
  const [maisAntigasPrimeiro, setMaisAntigasPrimeiro] = useState(false);

  const [whatsapp, setWhatsapp] = useState(true);
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);

  const naoLidas = notificacoes.filter((n) => n.naoLida).length;

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return notificacoes.filter((n) => {
      if (filtro !== "todas" && !n.categorias.includes(filtro)) return false;
      if (!termo) return true;

      return n.titulo.toLowerCase().includes(termo);
    });
  }, [notificacoes, filtro, busca]);

  const secoesOrdenadas = maisAntigasPrimeiro ? [...secoes].reverse() : secoes;

  function marcarTodasComoLidas() {
    setNotificacoes((lista) => lista.map((n) => ({ ...n, naoLida: false })));
  }

  function dispensar(id: number) {
    setNotificacoes((lista) => lista.filter((n) => n.id !== id));
  }

  function renderAcao(n: Notificacao) {
    switch (n.acao) {
      case "pix":
        return (
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white md:flex-initial"
          >
            <QrCode size={15} />
            Pagar com Pix
          </button>
        );
      case "comprovante":
        return (
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-input px-4 py-2 text-xs font-semibold text-secondary transition hover:bg-background md:flex-initial"
          >
            <ReceiptText size={15} />
            Comprovante
          </button>
        );
      case "convite":
        return (
          <>
            <button
              type="button"
              onClick={() => dispensar(n.id)}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white md:flex-initial"
            >
              Aceitar
            </button>

            <button
              type="button"
              onClick={() => dispensar(n.id)}
              className="flex-1 rounded-xl bg-input px-3 py-2 text-xs font-medium text-text-secondary transition hover:bg-background md:flex-initial"
            >
              Recusar
            </button>
          </>
        );
      case "enviado":
        return (
          <span className="inline-flex items-center gap-1 rounded-xl bg-input px-3 py-1.5 text-[11px] font-medium text-secondary">
            <Check size={13} />
            Enviado
          </span>
        );
      case "grupo":
        return (
          <button
            type="button"
            onClick={() => navigate("/meus-grupos")}
            className="flex items-center gap-1 text-[11px] font-semibold text-secondary hover:underline"
          >
            Ver Grupo
            <ChevronRight size={14} />
          </button>
        );
      case "ia":
        return (
          <button
            type="button"
            onClick={() => navigate("/criar-grupo")}
            className="flex items-center gap-1 text-[11px] font-semibold text-tertiary hover:underline"
          >
            Experimentar IA
            <ArrowRight size={14} />
          </button>
        );
    }
  }

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
            onClick={() => navigate("/meus-grupos")}
            className="text-xs text-gray-700 transition hover:text-secondary"
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
            className="relative rounded-lg bg-input p-2 text-secondary"
          >
            <Bell size={17} />

            {naoLidas > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            )}
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
        {/* TÍTULO */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              <button
                type="button"
                onClick={() => navigate("/meus-grupos")}
                className="uppercase transition hover:text-secondary"
              >
                Início
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-secondary">Central de Notificações</span>
              <span className="text-gray-300">•</span>
              <span className="rounded-full bg-input px-2 py-0.5 font-medium lowercase text-secondary">
                Junho 2025
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Notificações e Avisos
            </h1>

            <p className="text-sm text-text-secondary">
              Acompanhe cobranças ativas, confirmações instantâneas de Pix,
              lembretes automáticos e novidades dos seus rateios em tempo
              real.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start md:self-end">
            <button
              type="button"
              onClick={marcarTodasComoLidas}
              disabled={naoLidas === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-semibold text-secondary shadow-sm transition hover:bg-input disabled:pointer-events-none disabled:opacity-70"
            >
              {naoLidas === 0 ? <Check size={16} /> : <CheckCheck size={16} />}
              {naoLidas === 0 ? "Tudo lido!" : "Marcar todas como lidas"}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary shadow-sm transition hover:bg-input hover:text-text-primary"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Configurar Lembretes</span>
            </button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface p-5 shadow-sm">
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-primary/10 blur-xl" />

            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Não Lidas
              </span>
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold leading-none tracking-tight">
                {String(naoLidas).padStart(2, "0")}
              </span>
              <span className="text-[11px] font-medium text-tertiary">
                requerem atenção
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-input px-3 py-1.5">
              <Clock size={15} className="text-tertiary" />
              <span className="truncate text-xs text-text-secondary">
                2 vencimentos para hoje
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Aguardando Seu Pix
              </span>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                2 pendências
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-text-secondary">R$</span>
              <span className="text-4xl font-bold leading-none tracking-tight">
                90,00
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="truncate text-xs text-text-secondary">
                Churrasco + Futebol
              </span>

              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-semibold text-tertiary hover:underline"
              >
                Pagar tudo
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Recebidos Hoje
              </span>
              <span className="rounded-full bg-input px-2 py-0.5 text-[10px] font-semibold text-secondary">
                3 pessoas
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-text-secondary">R$</span>
              <span className="text-4xl font-bold leading-none tracking-tight text-secondary">
                340,00
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-text-secondary">
              <BadgeCheck size={16} className="text-secondary" />
              <span className="truncate text-xs">
                Conciliado via Banco Central
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">
                Lembretes Automáticos
              </span>
              <span className="rounded-full bg-input px-2 py-0.5 text-[10px] font-semibold text-secondary">
                24h
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold leading-none tracking-tight">
                03
              </span>
              <span className="text-[11px] text-text-secondary">
                disparos via bot
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-text-secondary">
              <MessageCircle size={16} className="text-tertiary" />
              <span className="truncate text-xs">Sem atrito entre amigos</span>
            </div>
          </div>
        </div>

        {/* LISTA + LATERAL */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Lista */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Filtros e busca */}
            <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl bg-surface p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {abas.map((aba) => {
                  const quantidade =
                    aba.id === "todas"
                      ? notificacoes.length
                      : notificacoes.filter((n) => n.categorias.includes(aba.id))
                          .length;
                  const ativo = filtro === aba.id;

                  return (
                    <button
                      key={aba.id}
                      type="button"
                      onClick={() => setFiltro(aba.id)}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                        ativo
                          ? "bg-secondary text-white shadow-sm"
                          : "text-text-secondary hover:bg-input"
                      }`}
                    >
                      {aba.nome} ({quantidade})
                    </button>
                  );
                })}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="relative w-full sm:w-48">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />

                  <input
                    type="text"
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                    placeholder="Buscar..."
                    className="w-full rounded-xl bg-input py-1.5 pl-9 pr-3 text-xs outline-none transition placeholder:text-text-secondary focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMaisAntigasPrimeiro(!maisAntigasPrimeiro)}
                  title={
                    maisAntigasPrimeiro
                      ? "Mais antigas primeiro"
                      : "Mais recentes primeiro"
                  }
                  className="rounded-xl p-2 text-text-secondary transition hover:bg-input hover:text-text-primary"
                >
                  <ArrowDownUp size={18} />
                </button>
              </div>
            </div>

            {/* Seções */}
            {visiveis.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-12 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-input text-secondary">
                  <Bell size={22} />
                </div>

                <h3 className="text-base font-semibold">
                  Nenhuma notificação por aqui
                </h3>

                <p className="max-w-md text-xs text-text-secondary">
                  Você está em dia! Novas cobranças e confirmações de Pix
                  aparecem aqui em tempo real.
                </p>
              </div>
            ) : (
              secoesOrdenadas.map((secao) => {
                const itens = visiveis.filter((n) => n.secao === secao.nome);

                if (itens.length === 0) return null;

                return (
                  <section key={secao.nome} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                        {secao.nome}
                      </span>

                      <span className="text-xs text-text-secondary">
                        {secao.legenda}
                      </span>
                    </div>

                    {itens.map((n) => (
                      <article
                        key={n.id}
                        className={`relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl p-5 shadow-sm transition md:flex-row md:items-center ${
                          n.naoLida
                            ? "bg-surface hover:shadow-md"
                            : "bg-surface/70 hover:bg-surface"
                        }`}
                      >
                        {n.naoLida && n.destaque && (
                          <span
                            className={`absolute bottom-0 left-0 top-0 w-1 ${
                              n.destaque === "primary"
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                          />
                        )}

                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${n.corIcone}`}
                          >
                            {n.icone}
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <div className="flex flex-wrap items-center gap-2">
                              {n.naoLida && (
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    n.destaque === "secondary"
                                      ? "bg-secondary"
                                      : "bg-primary"
                                  }`}
                                />
                              )}

                              <h2 className="truncate text-[15px] font-semibold">
                                {n.titulo}
                              </h2>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${n.corSelo}`}
                              >
                                {n.selo}
                              </span>
                            </div>

                            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                              {n.descricao}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-secondary">
                              {n.meta.map((item, indice) => (
                                <span
                                  key={indice}
                                  className="flex items-center gap-3"
                                >
                                  {indice > 0 && <span>•</span>}
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full shrink-0 items-center gap-2 self-end pt-2 md:w-auto md:self-center md:pt-0">
                          {renderAcao(n)}

                          {(n.acao === "pix" || n.acao === "comprovante") && (
                            <button
                              type="button"
                              onClick={() =>
                                n.acao === "comprovante"
                                  ? dispensar(n.id)
                                  : undefined
                              }
                              title={
                                n.acao === "comprovante"
                                  ? "Dispensar"
                                  : "Mais opções"
                              }
                              className="rounded-xl p-2 text-text-secondary transition hover:bg-input hover:text-text-primary"
                            >
                              {n.acao === "comprovante" ? (
                                <X size={18} />
                              ) : (
                                <MoreVertical size={18} />
                              )}
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </section>
                );
              })
            )}
          </div>

          {/* Lateral */}
          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="flex flex-col gap-5 rounded-2xl bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-input text-secondary">
                    <BellRing size={17} />
                  </div>

                  <h3 className="text-base font-semibold">Canais de Envio</h3>
                </div>

                <span className="rounded-full bg-input px-2 py-0.5 text-[10px] font-semibold text-secondary">
                  Ativos
                </span>
              </div>

              <p className="text-xs text-text-secondary">
                Defina como você e seus amigos recebem cobranças e lembretes
                para evitar constrangimentos.
              </p>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <MessageCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-secondary"
                    />

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        Avisos no WhatsApp
                      </span>
                      <span className="text-xs text-text-secondary">
                        Lembretes 24h antes do vencimento
                      </span>
                    </div>
                  </div>

                  <Toggle
                    ativo={whatsapp}
                    onChange={() => setWhatsapp(!whatsapp)}
                    cor="bg-secondary"
                    label="Avisos no WhatsApp"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <Mail size={19} className="mt-0.5 shrink-0 text-secondary" />

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        Resumo por E-mail
                      </span>
                      <span className="text-xs text-text-secondary">
                        Relatório semanal de comprovantes
                      </span>
                    </div>
                  </div>

                  <Toggle
                    ativo={email}
                    onChange={() => setEmail(!email)}
                    cor="bg-secondary"
                    label="Resumo por E-mail"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <Zap size={19} className="mt-0.5 shrink-0 text-tertiary" />

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        Pix Instantâneo (Push)
                      </span>
                      <span className="text-xs text-text-secondary">
                        Aviso na tela assim que o dinheiro cair
                      </span>
                    </div>
                  </div>

                  <Toggle
                    ativo={push}
                    onChange={() => setPush(!push)}
                    cor="bg-primary"
                    label="Pix Instantâneo (Push)"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-background p-4">
                <span className="text-[11px] text-text-secondary">
                  Horário silencioso: 22h às 08h
                </span>
                <MoonStar size={16} className="text-secondary" />
              </div>

              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="rounded-xl py-2 text-center text-xs font-semibold text-secondary transition hover:bg-input"
              >
                Gerenciar Regras Avançadas no Perfil
              </button>
            </div>

            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-[#315b81] p-6 text-white shadow-sm">
              <div className="relative z-10 flex flex-col gap-2">
                <div className="inline-flex w-max items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">
                  <ShieldCheck size={15} />
                  Cobrança Sem Constrangimento
                </div>

                <h4 className="mt-2 text-base font-semibold">Você sabia?</h4>

                <p className="text-xs leading-relaxed text-white/90">
                  Grupos que utilizam lembretes via bot com chave Pix
                  integrada recebem até <strong>3.2x mais rápido</strong> sem
                  necessidade de mensagens manuais no privado.
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/criar-grupo")}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[11px] font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white"
                >
                  Ativar Cobrança Automática
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-surface p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                </span>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold">
                    Integração Pix &amp; Bacen
                  </span>
                  <span className="text-xs text-text-secondary">
                    Operando normalmente (100%)
                  </span>
                </div>
              </div>

              <CloudCheck size={20} className="text-secondary" />
            </div>
          </aside>
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

export default Notificacoes;
