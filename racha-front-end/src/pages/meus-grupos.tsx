import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Hourglass,
  PieChart,
  Plus,
  Receipt,
  ReceiptText,
  Rocket,
  Search,
  UserPlus,
  Wallet,
  Banknote,
  X,
} from "lucide-react";
import AppShell from "../components/app-shell";
import { ApiError, apiRequest } from "../lib/api";
import { money } from "../lib/finance";
import { useAppNavigate as useNavigate } from "../lib/navigation";
import MeusGruposVazio from "./meus-grupos-vazio";

/* =====================================================
   TOKENS DO DESIGN

   Ficam aqui dentro (e não no tema do Tailwind) para que
   esta tela não interfira nas demais páginas do projeto.
====================================================== */

const C = {
  primary: "#9b4500",
  primaryContainer: "#ff8c42",
  primaryFixed: "#ffdbc9",
  onPrimaryFixed: "#331200",

  secondary: "#ab3425",
  secondaryContainer: "#fc6f5a",
  secondaryFixed: "#ffdad4",
  onSecondaryFixed: "#410100",

  tertiary: "#855300",
  tertiaryContainer: "#ed9800",
  tertiaryFixed: "#ffddb8",
  onTertiaryContainer: "#5b3700",

  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e6eeff",
  surfaceHigh: "#dee9fc",
  surfaceHighest: "#d9e3f6",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
};

type Categoria = "Viagem" | "Moradia" | "Evento";
type Tom = "primary" | "tertiary" | "secondary";

// Cores usadas pelo selo de status e pela barra de quitação
const TONS: Record<Tom, { selo: string; textoSelo: string; ponto: string; texto: string; barra: string }> = {
  primary: {
    selo: C.primaryFixed,
    textoSelo: C.onPrimaryFixed,
    ponto: C.primary,
    texto: C.primary,
    barra: `linear-gradient(to right, ${C.primaryContainer}, ${C.primary})`,
  },
  tertiary: {
    selo: C.surfaceHighest,
    textoSelo: C.onSurface,
    ponto: C.tertiary,
    texto: C.tertiary,
    barra: C.tertiaryContainer,
  },
  secondary: {
    selo: C.secondaryFixed,
    textoSelo: C.onSecondaryFixed,
    ponto: C.secondary,
    texto: C.secondary,
    barra: C.secondaryContainer,
  },
};

type Financeiro = {
  total: number;
  suaParte: number;
  quitacao: number;
  rodape: string;
  rodapeIcone: "recibo" | "ok" | "prazo";
};

type GrupoCartao = {
  id: string;
  nome: string;
  subtitulo: string;
  emoji: string;
  categoria?: Categoria;
  status: string;
  tom: Tom;
  participantes?: number;
  membros: string[];
  financeiro?: Financeiro;
  destino: { path: string; state?: unknown };
};

type GrupoApi = {
  id: string;
  nome: string;
  descricao: string;
};

// Dados demonstrativos usados na rota de prévia
const GRUPOS_DEMO: GrupoCartao[] = [
  {
    id: "demo-ubatuba",
    nome: "Viagem Ubatuba",
    subtitulo: "Praia Vermelha do Norte",
    emoji: "🏖️",
    categoria: "Viagem",
    status: "Ativo",
    tom: "primary",
    participantes: 6,
    membros: ["R", "M", "F", "L", "P", "B"],
    financeiro: { total: 2450, suaParte: 380, quitacao: 75, rodape: "8 lançamentos", rodapeIcone: "recibo" },
    destino: { path: "/grupo" },
  },
  {
    id: "demo-augusta",
    nome: "República Augusta",
    subtitulo: "Despesas mensais / Aluguel",
    emoji: "🏠",
    categoria: "Moradia",
    status: "Em dia",
    tom: "tertiary",
    participantes: 4,
    membros: ["M", "T", "L", "B"],
    financeiro: { total: 3820, suaParte: 955, quitacao: 100, rodape: "Tudo acertado", rodapeIcone: "ok" },
    destino: { path: "/grupo" },
  },
  {
    id: "demo-churrasco",
    nome: "Churrasco Fim de Ano",
    subtitulo: "Sítio dos Manacás",
    emoji: "🥩",
    categoria: "Evento",
    status: "Pendente",
    tom: "secondary",
    participantes: 12,
    membros: ["A", "R", "D", "C", "E", "G", "H", "I", "J", "K", "N", "O"],
    financeiro: { total: 890, suaParte: 74, quitacao: 40, rodape: "Expira em 3 dias", rodapeIcone: "prazo" },
    destino: { path: "/grupo" },
  },
];

function deApi(grupo: GrupoApi): GrupoCartao {
  return {
    id: grupo.id,
    nome: grupo.nome,
    subtitulo: grupo.descricao || "Sem descrição",
    emoji: "👥",
    status: "Ativo",
    tom: "primary",
    membros: [],
    destino: {
      path: `/grupo/${encodeURIComponent(grupo.id)}/membros`,
      state: { nomeGrupo: grupo.nome },
    },
  };
}

const FILTROS: { id: Categoria | "todos"; nome: string }[] = [
  { id: "todos", nome: "Todos" },
  { id: "Viagem", nome: "Viagens" },
  { id: "Moradia", nome: "Casa" },
  { id: "Evento", nome: "Eventos" },
];

// Os ids batem com as categorias da tela de criação manual
const CATEGORIAS_MODAL = [
  { id: "viagem", nome: "Viagem 🏖️" },
  { id: "republica", nome: "Moradia 🏠" },
  { id: "evento", nome: "Evento 🥩" },
  { id: "outro", nome: "Outro 💼" },
];

const CORES_AVATAR = [
  { fundo: C.secondaryContainer, texto: "#6d0300" },
  { fundo: C.primaryFixed, texto: C.onPrimaryFixed },
  { fundo: C.surfaceHighest, texto: C.onSurface },
];

function formatarPercentual(valor: number) {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export default function MeusGrupos() {
  const navigate = useNavigate();
  const preview = useLocation().pathname.startsWith("/previa");

  const [gruposApi, setGruposApi] = useState<GrupoApi[]>([]);
  const [carregando, setCarregando] = useState(!preview);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  const [filtro, setFiltro] = useState<Categoria | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [categoriaNova, setCategoriaNova] = useState("viagem");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (preview) return;
    let ativo = true;

    apiRequest<GrupoApi[]>("/grupos")
      .then((resultado) => {
        if (ativo) setGruposApi(resultado);
      })
      .catch((error: unknown) => {
        if (!ativo) return;
        setErro(
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar seus grupos.",
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tentativa, preview]);

  // Esconde o aviso depois de alguns segundos
  useEffect(() => {
    if (!aviso) return;
    const id = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(id);
  }, [aviso]);

  // Fecha o modal com Esc
  useEffect(() => {
    if (!modalAberto) return;
    function aoPressionar(event: KeyboardEvent) {
      if (event.key === "Escape") setModalAberto(false);
    }
    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [modalAberto]);

  const grupos = useMemo(
    () => (preview ? GRUPOS_DEMO : gruposApi.map(deApi)),
    [preview, gruposApi],
  );

  const temCategorias = grupos.some((grupo) => grupo.categoria);

  const gruposVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return grupos.filter((grupo) => {
      if (filtro !== "todos" && grupo.categoria !== filtro) return false;
      return !termo || grupo.nome.toLowerCase().includes(termo);
    });
  }, [grupos, filtro, busca]);

  // Métricas só existem para grupos com dados financeiros
  const metricas = useMemo(() => {
    const comFinanceiro = grupos.filter((grupo) => grupo.financeiro);
    if (comFinanceiro.length === 0) return null;
    let suaParte = 0;
    let total = 0;
    let quitadoPonderado = 0;
    let participantes = 0;
    let abertos = 0;
    let resolvidos = 0;
    for (const grupo of comFinanceiro) {
      const f = grupo.financeiro!;
      suaParte += f.suaParte;
      total += f.total;
      quitadoPonderado += f.total * f.quitacao;
      participantes += grupo.participantes ?? 0;
      if (f.quitacao >= 100) resolvidos++;
      else abertos++;
    }
    return {
      suaParte,
      total,
      participantes,
      abertos,
      resolvidos,
      indice: total > 0 ? quitadoPonderado / total : 0,
    };
  }, [grupos]);

  function abrirModal() {
    setNomeNovo("");
    setModalAberto(true);
  }

  function criarGrupo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/criar-grupo/manual", {
      state: { nome: nomeNovo.trim(), categoria: categoriaNova },
    });
  }

  async function copiarConvite() {
    const link = `${window.location.origin}/cadastro`;
    try {
      await navigator.clipboard.writeText(link);
      setAviso("Link de convite copiado para sua área de transferência!");
    } catch {
      setAviso(`Não foi possível copiar. Compartilhe: ${link}`);
    }
  }

  // Sem nenhum grupo na conta: mostra a tela de primeiro acesso
  if (!preview && !carregando && !erro && gruposApi.length === 0) {
    return <MeusGruposVazio />;
  }

  return (
    <AppShell title="Meus grupos">
      <div
        className="flex w-full flex-col gap-6 font-jakarta"
        style={{ color: C.onSurface }}
      >
        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <section className="flex flex-col justify-between gap-4 pb-2 md:flex-row md:items-end">
          <div className="flex flex-col gap-1">
            <div
              className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider"
              style={{ color: C.primary }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: C.primary }}
              />
              <span>Visão Geral • {new Date().getFullYear()}</span>
            </div>
            <h1 className="text-[2rem] font-bold leading-10 tracking-tight">
              Meus grupos
            </h1>
            <p className="max-w-xl text-sm" style={{ color: C.onSurfaceVariant }}>
              Acompanhe despesas compartilhadas, saldos pendentes e divisão
              instantânea com amigos e colegas de casa.
            </p>
          </div>
          {!carregando && !erro && (
            <span
              className="self-start rounded-xl px-4 py-2 text-xs font-semibold shadow-sm md:self-auto"
              style={{ backgroundColor: C.surfaceLowest }}
            >
              Ativos ({grupos.length})
            </span>
          )}
        </section>

        {carregando ? (
          <p role="status" className="text-sm" style={{ color: C.onSurfaceVariant }}>
            Carregando seus grupos...
          </p>
        ) : erro ? (
          <div className="rounded-xl bg-red-50 p-4">
            <p role="alert" className="text-sm text-red-800">
              {erro}
            </p>
            <button
              type="button"
              onClick={() => {
                setErro("");
                setCarregando(true);
                setTentativa((valor) => valor + 1);
              }}
              className="mt-2 cursor-pointer text-sm font-semibold text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* =====================================================
                MÉTRICAS
            ====================================================== */}

            {metricas && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Metrica
                  rotulo="Sua parte total a pagar"
                  valor={money(metricas.suaParte)}
                  detalhe={`${metricas.abertos} ${metricas.abertos === 1 ? "grupo" : "grupos"} em aberto`}
                  detalheIcone={<Clock className="h-4 w-4" />}
                  corDetalhe={C.tertiary}
                  icone={<Wallet className="h-6 w-6" />}
                  fundoIcone={C.surfaceHigh}
                  corIcone={C.primary}
                />
                <Metrica
                  rotulo="Despesas totais movimentadas"
                  valor={money(metricas.total)}
                  detalhe={`${metricas.participantes} participantes no total`}
                  detalheIcone={<ReceiptText className="h-4 w-4" />}
                  icone={<Banknote className="h-6 w-6" />}
                  fundoIcone={C.surfaceContainer}
                  corIcone={C.onSurfaceVariant}
                />
                <Metrica
                  rotulo="Índice de quitação"
                  valor={formatarPercentual(metricas.indice)}
                  corValor={C.tertiaryContainer}
                  detalhe={`${metricas.resolvidos} ${metricas.resolvidos === 1 ? "grupo" : "grupos"} 100% resolvido${metricas.resolvidos === 1 ? "" : "s"}`}
                  detalheIcone={<CheckCircle2 className="h-4 w-4" />}
                  icone={<PieChart className="h-6 w-6" />}
                  fundoIcone={C.tertiaryFixed}
                  corIcone={C.onTertiaryContainer}
                />
              </div>
            )}

            {/* =====================================================
                FILTROS E BUSCA
            ====================================================== */}

            <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
              {temCategorias ? (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {FILTROS.map((item) => {
                    const ativo = filtro === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => setFiltro(item.id)}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-1 text-xs font-semibold transition-all ${
                          ativo ? "" : "hover:bg-[#e6eeff] hover:text-[#121c2a]"
                        }`}
                        style={
                          ativo
                            ? { backgroundColor: C.onSurface, color: "#f8f9ff" }
                            : { backgroundColor: C.surfaceLow, color: C.onSurfaceVariant }
                        }
                      >
                        {item.id === "todos" ? `Todos (${grupos.length})` : item.nome}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span />
              )}
              <div className="relative w-full sm:w-72">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                  style={{ color: C.onSurfaceVariant }}
                />
                <label htmlFor="busca-grupo" className="sr-only">
                  Buscar grupo
                </label>
                <input
                  id="busca-grupo"
                  type="search"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar por nome do grupo..."
                  className="w-full rounded-lg bg-white py-1.5 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-[#56433899] focus:shadow-md"
                />
              </div>
            </div>

            {/* =====================================================
                GRADE DE GRUPOS
            ====================================================== */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gruposVisiveis.map((grupo) => (
                <CartaoGrupo
                  key={grupo.id}
                  grupo={grupo}
                  onAcessar={() =>
                    navigate(grupo.destino.path, { state: grupo.destino.state })
                  }
                />
              ))}

              <button
                type="button"
                onClick={abrirModal}
                className="group flex min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-xl bg-[#eff4ff99] p-6 text-center shadow-sm transition-all duration-200 hover:bg-[#eff4ff]"
                style={{ color: C.onSurfaceVariant }}
              >
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#ff8c42] shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:bg-[#ff8c42] group-hover:text-white">
                  <Plus className="h-7 w-7" />
                </div>
                <span className="text-xl font-bold text-[#121c2a] transition-colors group-hover:text-[#9b4500]">
                  Criar novo grupo
                </span>
                <p className="mt-1 max-w-xs text-sm">
                  Divida contas de uma viagem, república, festa ou projeto com
                  cálculo automático por Pix.
                </p>
                <span
                  className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-1 text-xs font-semibold shadow-sm transition-shadow group-hover:shadow"
                  style={{ color: C.primary }}
                >
                  Começar divisão →
                </span>
              </button>
            </div>

            {gruposVisiveis.length === 0 && (
              <p className="text-center text-sm" style={{ color: C.onSurfaceVariant }}>
                Nenhum grupo encontrado com esses filtros.
              </p>
            )}

            {/* =====================================================
                CONVITE
            ====================================================== */}

            <div
              className="mt-4 flex flex-col items-center justify-between gap-6 rounded-2xl p-6 shadow-sm md:flex-row"
              style={{ backgroundColor: C.surfaceLow }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{ backgroundColor: C.primaryContainer }}
                >
                  <Rocket className="h-[30px] w-[30px]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold">
                    Convidar amigos via Pix ou link direto
                  </h3>
                  <p className="mt-0.5 max-w-xl text-sm" style={{ color: C.onSurfaceVariant }}>
                    Quem entra no grupo não precisa baixar aplicativo para
                    conferir a conta ou confirmar o comprovante de pagamento.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={copiarConvite}
                className="shrink-0 cursor-pointer rounded-lg bg-white px-6 py-2 text-sm font-bold shadow-sm transition-colors hover:bg-[#e6eeff]"
              >
                Copiar convite rápido
              </button>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          MODAL — CRIAR NOVO GRUPO
      ====================================================== */}

      {modalAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#27313f66] p-4 font-jakarta backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalAberto(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-novo-grupo"
            className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl"
            style={{ color: C.onSurface }}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1">
                <div
                  className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${C.primaryContainer}33`, color: C.primary }}
                >
                  <UserPlus className="h-5 w-5" />
                </div>
                <h3 id="titulo-novo-grupo" className="text-xl font-bold">
                  Criar novo grupo
                </h3>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setModalAberto(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#e6eeff] hover:text-[#121c2a]"
                style={{ color: C.onSurfaceVariant }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={criarGrupo}>
              <div className="flex flex-col gap-1">
                <label htmlFor="nome-novo-grupo" className="text-xs font-semibold">
                  Nome do grupo
                </label>
                <input
                  id="nome-novo-grupo"
                  type="text"
                  required
                  autoFocus
                  value={nomeNovo}
                  onChange={(event) => setNomeNovo(event.target.value)}
                  placeholder="Ex: Carnaval Salvador, Aluguel AP 402"
                  className="w-full rounded-lg px-4 py-2 text-base outline-none transition-all focus:ring-2 focus:ring-[#ff8c42]"
                  style={{ backgroundColor: C.surfaceLow }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="categoria-novo-grupo" className="text-xs font-semibold">
                  Categoria
                </label>
                <select
                  id="categoria-novo-grupo"
                  value={categoriaNova}
                  onChange={(event) => setCategoriaNova(event.target.value)}
                  className="w-full cursor-pointer rounded-lg px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-[#ff8c42]"
                  style={{ backgroundColor: C.surfaceLow }}
                >
                  {CATEGORIAS_MODAL.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
                <span className="text-xs" style={{ color: C.onSurfaceVariant }}>
                  Na próxima etapa você define o período e adiciona os
                  participantes.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#e6eeff]"
                  style={{ backgroundColor: C.surfaceLow }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg px-6 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105 active:scale-95"
                  style={{ backgroundColor: C.primaryContainer }}
                >
                  Criar grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Aviso flutuante */}
      {aviso && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-1 rounded-xl px-4 py-2 font-jakarta text-sm font-semibold shadow-xl"
          style={{ backgroundColor: "#27313f", color: "#eaf1ff" }}
        >
          <CheckCircle2 className="mr-1 h-[18px] w-[18px]" style={{ color: C.tertiaryFixed }} />
          {aviso}
        </div>
      )}
    </AppShell>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
====================================================== */

function Metrica({
  rotulo,
  valor,
  corValor = C.onSurface,
  detalhe,
  detalheIcone,
  corDetalhe = C.onSurfaceVariant,
  icone,
  fundoIcone,
  corIcone,
}: {
  rotulo: string;
  valor: string;
  corValor?: string;
  detalhe: string;
  detalheIcone: React.ReactNode;
  corDetalhe?: string;
  icone: React.ReactNode;
  fundoIcone: string;
  corIcone: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col">
        <span className="text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
          {rotulo}
        </span>
        <span
          className="mt-0.5 text-[1.75rem] font-extrabold leading-9 tracking-tight"
          style={{ color: corValor }}
        >
          {valor}
        </span>
        <span
          className="mt-1 flex items-center gap-1 text-xs font-medium"
          style={{ color: corDetalhe }}
        >
          {detalheIcone} {detalhe}
        </span>
      </div>
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: fundoIcone, color: corIcone }}
      >
        {icone}
      </div>
    </div>
  );
}

function CartaoGrupo({
  grupo,
  onAcessar,
}: {
  grupo: GrupoCartao;
  onAcessar: () => void;
}) {
  const tom = TONS[grupo.tom];
  const f = grupo.financeiro;
  const visiveis = grupo.membros.slice(0, 3);
  const extras = grupo.membros.length - visiveis.length;
  const quitado = f ? f.quitacao >= 100 : false;
  const RodapeIcone = f?.rodapeIcone === "ok" ? Check : f?.rodapeIcone === "prazo" ? Hourglass : Receipt;

  return (
    <article className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
          >
            {grupo.categoria ?? "Grupo"}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{ backgroundColor: tom.selo, color: tom.textoSelo }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tom.ponto }} />
            {grupo.status}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: C.surfaceContainer }}
            aria-hidden="true"
          >
            {grupo.emoji}
          </div>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-xl font-bold">{grupo.nome}</h2>
            <span className="truncate text-sm" style={{ color: C.onSurfaceVariant }}>
              {grupo.subtitulo}
            </span>
          </div>
        </div>

        {grupo.participantes !== undefined && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
              {grupo.participantes} participantes
            </span>
            <div className="flex items-center -space-x-2">
              {visiveis.map((letra, indice) => {
                const cor = CORES_AVATAR[indice % CORES_AVATAR.length];
                return (
                  <div
                    key={`${letra}-${indice}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-2 ring-white"
                    style={{ backgroundColor: cor.fundo, color: cor.texto }}
                  >
                    {letra}
                  </div>
                );
              })}
              {extras > 0 && (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: C.tertiaryFixed, color: C.onTertiaryContainer }}
                >
                  +{extras}
                </div>
              )}
            </div>
          </div>
        )}

        {f && (
          <>
            <div
              className="mt-2 flex flex-col gap-1 rounded-lg p-2"
              style={{ backgroundColor: C.surfaceLow }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  Total despesas
                </span>
                <span className="text-sm font-bold">{money(f.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: quitado ? C.onSurface : tom.texto }}
                >
                  Sua parte
                </span>
                <span
                  className="text-xl font-extrabold"
                  style={{ color: quitado ? C.onSurface : tom.texto }}
                >
                  {money(f.suaParte)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span style={{ color: C.onSurfaceVariant }}>Quitação do grupo</span>
                <span className="font-bold" style={{ color: tom.texto }}>
                  {quitado ? "100% quitado" : `${f.quitacao}%`}
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: C.surfaceContainer }}
                role="progressbar"
                aria-valuenow={f.quitacao}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Quitação de ${grupo.nome}`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(f.quitacao, 100)}%`, background: tom.barra }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between pt-4">
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: C.onSurfaceVariant }}
        >
          {f && (
            <>
              <RodapeIcone className="h-4 w-4" /> {f.rodape}
            </>
          )}
        </span>
        <button
          type="button"
          onClick={onAcessar}
          className="flex cursor-pointer items-center gap-1 text-sm font-bold transition-colors hover:text-[#ff8c42]"
          style={{ color: C.primary }}
        >
          <span>Acessar</span>
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
}
