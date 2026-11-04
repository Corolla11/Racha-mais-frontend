import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  Flame,
  Home,
  KeyRound,
  ListChecks,
  MessageCircleQuestion,
  Plane,
  Plus,
  QrCode,
  Sparkles,
  UserPlus,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import AppShell from "../components/app-shell";
import { useAppNavigate as useNavigate } from "../lib/navigation";

/* =====================================================
   TOKENS DO DESIGN

   Ficam aqui dentro (e não no tema do Tailwind) para que
   esta tela não interfira nas demais páginas do projeto.
====================================================== */

const C = {
  primary: "#9b4500",
  primaryContainer: "#ff8c42",
  primaryFixed: "#ffdbc9",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6a2d00",

  secondary: "#ab3425",
  secondaryFixed: "#ffdad4",

  tertiary: "#855300",
  tertiaryFixed: "#ffddb8",
  tertiaryContainer: "#ed9800",

  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e6eeff",
  surfaceHigh: "#dee9fc",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
};

type Passo = {
  numero: string;
  titulo: string;
  descricao: string;
  rodape: string;
  icone: LucideIcon;
  cor: string;
  fundo: string;
};

const PASSOS: Passo[] = [
  {
    numero: "01",
    titulo: "Crie seu grupo",
    descricao:
      "Em segundos com Inteligência Artificial contextual ou pelo formulário manual detalhado. Convide amigos por link direto.",
    rodape: "Criar por IA ou Manual",
    icone: Sparkles,
    cor: C.primary,
    fundo: C.primaryFixed,
  },
  {
    numero: "02",
    titulo: "Adicione despesas e tarefas",
    descricao:
      "Defina quem participa de cada custo ou tarefa sem enrolação. Suporte a divisões desiguais, cotas fixas ou porcentagens.",
    rodape: "Controle transparente",
    icone: ListChecks,
    cor: C.tertiary,
    fundo: C.tertiaryFixed,
  },
  {
    numero: "03",
    titulo: "Acerte as contas via Pix",
    descricao:
      "O algoritmo inteligente otimiza transações para o menor número de transferências e gera QR Codes Pix diretamente.",
    rodape: "Liquidação sem estresse",
    icone: ArrowRightLeft,
    cor: C.secondary,
    fundo: C.secondaryFixed,
  },
];

// Os ids batem com as categorias da tela de criação manual
const CATEGORIAS: { id: string; nome: string; icone: LucideIcon }[] = [
  { id: "viagem", nome: "Viagem", icone: Plane },
  { id: "evento", nome: "Rolê / Evento", icone: Flame },
  { id: "republica", nome: "Casa / República", icone: Home },
];

export default function MeusGruposVazio() {
  const navigate = useNavigate();
  const campoCodigo = useRef<HTMLInputElement>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [categoria, setCategoria] = useState("viagem");
  const [codigo, setCodigo] = useState("");

  // Fecha o modal com Esc
  useEffect(() => {
    if (!modalAberto) return;
    function aoPressionar(event: KeyboardEvent) {
      if (event.key === "Escape") setModalAberto(false);
    }
    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [modalAberto]);

  function focarCodigo() {
    campoCodigo.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    campoCodigo.current?.focus({ preventScroll: true });
  }

  function continuarCriacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/criar-grupo/manual", {
      state: { nome: nomeGrupo.trim(), categoria },
    });
  }

  // Aceita tanto o código quanto o link completo do convite
  function ingressar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valor = codigo.trim();
    if (!valor) return;
    const token = valor.split("/convite/").pop()?.split(/[?#/]/)[0] ?? valor;
    navigate(`/convite/${encodeURIComponent(token)}`);
  }

  return (
    <AppShell title="Meus grupos">
      <div
        className="mx-auto flex w-full max-w-7xl flex-col gap-12 font-jakarta"
        style={{ color: C.onSurface }}
      >
        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[2rem] font-bold leading-10 tracking-tight">
                Meus grupos
              </h1>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: C.surfaceContainer,
                  color: C.onSurfaceVariant,
                }}
              >
                0 grupos ativos
              </span>
            </div>
            <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
              Gerencie divisões financeiras e tarefas coletivas com seus amigos
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#eff4ff] px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-[#e6eeff] active:scale-95"
          >
            <Plus className="h-[18px] w-[18px]" style={{ color: C.primary }} />
            <span>Novo grupo</span>
          </button>
        </div>

        {/* =====================================================
            ESTADO VAZIO
        ====================================================== */}

        <section
          className="relative flex flex-col items-center overflow-hidden rounded-2xl p-8 text-center shadow-sm sm:p-14"
          style={{ backgroundColor: C.surfaceLowest }}
        >
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${C.primaryFixed}4d` }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${C.tertiaryFixed}4d` }}
          />

          <div className="relative z-10 flex max-w-2xl flex-col items-center">
            <div className="relative mb-8">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(255,140,66,0.18)]"
                style={{ backgroundColor: C.primaryFixed }}
              >
                <Users className="h-12 w-12" style={{ color: C.primary }} />
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full shadow-md"
                style={{ backgroundColor: C.surfaceLowest }}
              >
                <ArrowLeft
                  className="h-5 w-5"
                  strokeWidth={3}
                  style={{ color: C.primaryContainer }}
                />
              </div>
            </div>

            <h2 className="mb-3 text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
              Você ainda não faz parte de nenhum grupo
            </h2>
            <p
              className="mb-10 max-w-xl text-lg leading-relaxed"
              style={{ color: C.onSurfaceVariant }}
            >
              Que tal começar agora? Organize viagens, churrascos, contas da
              casa ou qualquer despesa compartilhada com seus amigos de forma
              justa, visual e transparente.
            </p>

            <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="group inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#ff8c42] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#9b4500] hover:shadow-lg active:scale-95 sm:w-auto"
              >
                <Plus className="h-[22px] w-[22px] transition-transform duration-200 group-hover:rotate-90" />
                <span>Criar meu primeiro grupo</span>
              </button>
              <button
                type="button"
                onClick={focarCodigo}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#eff4ff] px-6 py-3.5 text-base font-semibold transition-all duration-200 hover:bg-[#e6eeff] active:scale-95 sm:w-auto"
              >
                <KeyRound className="h-5 w-5" style={{ color: C.onSurfaceVariant }} />
                <span>Entrar com link ou código</span>
              </button>
            </div>

            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium"
              style={{ color: `${C.onSurfaceVariant}cc` }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4" style={{ color: C.tertiaryContainer }} />
                Configuração em 30 segundos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <QrCode className="h-4 w-4" style={{ color: C.tertiaryContainer }} />
                Divisão e Pix integrados
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            COMO FUNCIONA
        ====================================================== */}

        <section className="flex flex-col gap-6 pt-2">
          <div className="flex flex-col gap-1">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: C.primary }}
            >
              Primeiros passos
            </span>
            <h3 className="text-2xl font-bold tracking-tight">
              Como funciona o Racha+
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PASSOS.map((passo) => {
              const Icone = passo.icone;
              return (
                <div
                  key={passo.numero}
                  className="group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: C.surfaceLowest }}
                >
                  <div
                    className="absolute right-0 top-0 -z-10 h-24 w-24 rounded-bl-[4rem] transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: C.surfaceLow }}
                  />
                  <div>
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: passo.fundo, color: passo.cor }}
                    >
                      <Icone className="h-[26px] w-[26px]" />
                    </div>
                    <span
                      className="mb-1 inline-block text-xs font-bold"
                      style={{ color: passo.cor }}
                    >
                      Passo {passo.numero}
                    </span>
                    <h4 className="mb-2 text-xl font-bold">{passo.titulo}</h4>
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: C.onSurfaceVariant }}
                    >
                      {passo.descricao}
                    </p>
                  </div>
                  <div
                    className="mt-6 flex items-center gap-2 pt-6 text-xs font-medium"
                    style={{ color: passo.cor }}
                  >
                    <span>{passo.rodape}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            CONVITE
        ====================================================== */}

        <section
          className="flex flex-col items-center justify-between gap-6 rounded-2xl p-6 md:flex-row"
          style={{ backgroundColor: C.surfaceLow }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm"
              style={{ backgroundColor: C.surfaceLowest }}
            >
              <MessageCircleQuestion className="h-6 w-6" style={{ color: C.primary }} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold">
                Foi convidado por alguém?
              </span>
              <span className="text-sm" style={{ color: C.onSurfaceVariant }}>
                Basta colar o link enviado pelo WhatsApp ou o código de 6
                dígitos para ingressar na hora.
              </span>
            </div>
          </div>
          <form
            onSubmit={ingressar}
            className="flex w-full items-center gap-2 md:w-auto"
          >
            <label htmlFor="codigo-convite" className="sr-only">
              Link ou código do convite
            </label>
            <input
              ref={campoCodigo}
              id="codigo-convite"
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              placeholder="Ex: RCH-789"
              className="w-full rounded-lg bg-white px-4 py-2.5 text-base tracking-wider shadow-sm outline-none focus:ring-2 focus:ring-[#ff8c42] md:w-44"
              style={{ color: C.onSurface }}
            />
            <button
              type="submit"
              disabled={!codigo.trim()}
              className="cursor-pointer whitespace-nowrap rounded-lg bg-[#9b4500] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6a2d00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ingressar
            </button>
          </form>
        </section>
      </div>

      {/* =====================================================
          MODAL — CRIAR NOVO GRUPO
      ====================================================== */}

      {modalAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#27313f]/40 p-4 font-jakarta backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalAberto(false);
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-grupo"
            onSubmit={continuarCriacao}
            className="relative flex w-full max-w-lg flex-col gap-6 rounded-2xl p-6 shadow-xl sm:p-8"
            style={{ backgroundColor: C.surfaceLowest, color: C.onSurface }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: C.primaryFixed, color: C.primary }}
                >
                  <UserPlus className="h-6 w-6" />
                </div>
                <h3 id="titulo-modal-grupo" className="text-xl font-bold">
                  Criar novo grupo
                </h3>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setModalAberto(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#e6eeff] transition-colors hover:bg-[#dee9fc]"
                style={{ color: C.onSurfaceVariant }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nome-grupo" className="text-sm font-medium">
                  Nome do grupo
                </label>
                <input
                  id="nome-grupo"
                  type="text"
                  autoFocus
                  value={nomeGrupo}
                  onChange={(event) => setNomeGrupo(event.target.value)}
                  placeholder="Ex: Viagem Florianópolis, Churrasco da Firma..."
                  className="rounded-lg px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-[#ff8c42]"
                  style={{ backgroundColor: C.surfaceLow }}
                />
              </div>

              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-sm font-medium">Categoria</legend>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIAS.map((item) => {
                    const Icone = item.icone;
                    const ativo = categoria === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => setCategoria(item.id)}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl p-3 text-xs transition-colors ${
                          ativo ? "font-semibold" : "hover:bg-[#e6eeff]"
                        }`}
                        style={
                          ativo
                            ? { backgroundColor: `${C.primaryContainer}1a`, color: C.primary }
                            : { backgroundColor: C.surfaceLow, color: C.onSurfaceVariant }
                        }
                      >
                        <Icone className="h-5 w-5" />
                        <span>{item.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="cursor-pointer rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#e6eeff]"
                style={{ color: C.onSurfaceVariant }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#ff8c42] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9b4500]"
              >
                <span>Continuar</span>
                <ArrowRight className="h-[18px] w-[18px]" />
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
