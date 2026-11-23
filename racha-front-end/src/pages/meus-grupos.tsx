import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import AppShell from "../components/app-shell";
import Link from "../components/app-link";
import Icon from "../components/icon";
import { ApiError, apiRequest } from "../lib/api";
import { money } from "../lib/finance";
import { useAppNavigate as useNavigate } from "../lib/navigation";
import MeusGruposVazio from "./meus-grupos-vazio";

type Categoria = "Viagem" | "Moradia" | "Evento";
type Tom = "primary" | "tertiary" | "secondary";

// Classes do tema usadas pelo selo de status, pelo valor e pela barra de quitação
const TONS: Record<Tom, { texto: string; ponto: string; barra: string }> = {
  primary: { texto: "text-primary", ponto: "bg-primary", barra: "bg-gradient-to-r from-primary-container to-primary" },
  tertiary: { texto: "text-tertiary", ponto: "bg-tertiary", barra: "bg-tertiary-container" },
  secondary: { texto: "text-secondary", ponto: "bg-secondary", barra: "bg-secondary-container" },
};

// Capa decorativa de cada categoria (grupos sem categoria usam a padrão)
const CAPAS: Record<Categoria | "padrao", { fundo: string; icone: string; imagem?: string }> = {
  Viagem: { fundo: "bg-gradient-to-br from-primary-container to-tertiary-container", icone: "flight", imagem: "/images/florianopolis-cover.jpg" },
  Moradia: { fundo: "bg-gradient-to-br from-tertiary-container to-primary", icone: "home_work" },
  Evento: { fundo: "bg-gradient-to-br from-secondary-container to-primary-container", icone: "outdoor_grill" },
  padrao: { fundo: "bg-gradient-to-br from-primary-container via-primary-container to-tertiary-container", icone: "groups" },
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
  { id: "Evento", nome: "Churrascos & Eventos" },
];

// Os ids batem com as categorias da tela de criação manual
const CATEGORIAS_MODAL = [
  { id: "viagem", nome: "Viagem 🏖️" },
  { id: "republica", nome: "Moradia 🏠" },
  { id: "evento", nome: "Evento 🥩" },
  { id: "outro", nome: "Outro 💼" },
];

const CORES_AVATAR = [
  "bg-surface-container-high text-primary",
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-secondary-fixed text-on-secondary-fixed-variant",
  "bg-primary-fixed text-on-primary-fixed",
];

function formatarPercentual(valor: number) {
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export default function MeusGrupos() {
  const navigate = useNavigate();
  const preview = useLocation().pathname.startsWith("/previa");
  const [searchParams] = useSearchParams();

  const [gruposApi, setGruposApi] = useState<GrupoApi[]>([]);
  const [carregando, setCarregando] = useState(!preview);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  // A busca do header chega como ?busca=termo e pré-preenche o filtro local
  const buscaUrl = searchParams.get("busca") ?? "";
  const [buscaUrlAnterior, setBuscaUrlAnterior] = useState(buscaUrl);
  const [filtro, setFiltro] = useState<Categoria | "todos">("todos");
  const [busca, setBusca] = useState(buscaUrl);
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [categoriaNova, setCategoriaNova] = useState("viagem");
  const [aviso, setAviso] = useState("");

  if (buscaUrl !== buscaUrlAnterior) {
    setBuscaUrlAnterior(buscaUrl);
    setBusca(buscaUrl);
  }

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

  const totalParticipantes = grupos.reduce((soma, grupo) => soma + (grupo.participantes ?? 0), 0);

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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-space-xl py-space-lg">
        {/* Saudação e visão geral */}
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs font-label-md text-label-md uppercase tracking-wider text-primary">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-container" />
              Painel Financeiro • {new Date().getFullYear()}
            </div>
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              Visão Geral dos Seus Rachas
            </h1>
            <p className="max-w-xl font-body-md text-body-md text-on-surface-variant">
              Acompanhe saldos pendentes, resolva rateios pendentes e gerencie
              suas despesas conjuntas sem atrito.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModal}
            className="inline-flex cursor-pointer items-center justify-center gap-space-xs self-start rounded-xl bg-primary-container px-space-lg py-3 font-label-md text-label-md text-on-primary shadow-md shadow-primary-container/20 transition-all duration-200 hover:bg-primary active:scale-[0.98] md:self-auto"
          >
            <Icon name="add_circle" size={20} />
            <span>Criar Novo Grupo</span>
          </button>
        </div>

        {carregando ? (
          <p role="status" className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="progress_activity" size={20} className="animate-spin text-primary-container" />
            Carregando seus grupos...
          </p>
        ) : erro ? (
          <div className="flex flex-col items-start gap-space-sm rounded-xl bg-error-container p-space-lg sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-error-container">
              <Icon name="error" size={20} />
              {erro}
            </p>
            <button
              type="button"
              onClick={() => {
                setErro("");
                setCarregando(true);
                setTentativa((valor) => valor + 1);
              }}
              className="cursor-pointer rounded-lg bg-surface-container-lowest px-space-md py-2 font-label-md text-label-md text-on-error-container shadow-sm transition-colors hover:bg-surface-container-low"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* Cartões de métricas */}
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3">
              {metricas && (
                <>
                  <Metrica
                    rotulo="Saldo a Pagar"
                    icone="arrow_upward_alt"
                    corIcone="text-secondary"
                    selo={`${metricas.abertos} ${metricas.abertos === 1 ? "pendência" : "pendências"}`}
                    corSelo="bg-secondary-fixed text-on-secondary-fixed-variant"
                    bolha="-right-4 -top-4 h-24 w-24 bg-secondary-fixed/30"
                    valor={<ValorMoeda valor={metricas.suaParte} cor="text-secondary" />}
                    legenda="Sua parte total nos grupos em aberto"
                  />
                  <Metrica
                    rotulo="Despesas Movimentadas"
                    icone="arrow_downward_alt"
                    corIcone="text-tertiary"
                    selo={`${formatarPercentual(metricas.indice)} quitado`}
                    corSelo="bg-surface-container text-tertiary"
                    bolha="-right-4 -top-4 h-24 w-24 bg-surface-container-low opacity-60"
                    valor={<ValorMoeda valor={metricas.total} cor="text-tertiary" />}
                    legenda={`${metricas.resolvidos} ${metricas.resolvidos === 1 ? "grupo" : "grupos"} 100% resolvido${metricas.resolvidos === 1 ? "" : "s"}`}
                  />
                </>
              )}
              <Metrica
                rotulo="Grupos Ativos"
                icone="diversity_3"
                corIcone="text-primary"
                selo="Total"
                corSelo="bg-surface-container-high text-primary"
                bolha="-bottom-6 -right-6 h-28 w-28 bg-surface-container-high/40"
                className={metricas ? "sm:col-span-2 lg:col-span-1" : ""}
                valor={
                  <div className="flex items-baseline gap-2 font-numeric-stat text-numeric-stat tracking-tight text-on-surface">
                    <span>{grupos.length}</span>
                    <span className="font-headline-sm text-headline-sm font-normal text-on-surface-variant">
                      {grupos.length === 1 ? "espaço colaborativo" : "espaços colaborativos"}
                    </span>
                  </div>
                }
                legenda={
                  totalParticipantes > 0
                    ? `${totalParticipantes} participantes sincronizados`
                    : "Abra um grupo para ver membros e saldos"
                }
              />
            </div>

            {/* Filtros e busca */}
            <div className="flex flex-col items-stretch justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm lg:flex-row lg:items-center">
              <div className="flex flex-wrap items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
                <span className="mr-space-md hidden font-headline-sm text-headline-sm text-on-surface sm:inline">
                  Meus Grupos
                </span>
                {temCategorias &&
                  FILTROS.map((item) => {
                    const ativo = filtro === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => setFiltro(item.id)}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-space-md py-1.5 font-label-md text-label-md transition-all duration-200 ${
                          ativo
                            ? "bg-on-surface text-surface"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        }`}
                      >
                        {item.id === "todos" ? `Todos (${grupos.length})` : item.nome}
                      </button>
                    );
                  })}
              </div>
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Icon
                  name="search"
                  size={20}
                  className="pointer-events-none absolute left-3 top-2.5 text-outline"
                />
                <label htmlFor="busca-grupo" className="sr-only">
                  Buscar grupo
                </label>
                <input
                  id="busca-grupo"
                  type="search"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Filtrar por nome do grupo..."
                  className="w-full rounded-lg bg-surface-container-low py-2 pl-10 pr-space-md font-body-sm text-body-sm text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>

            {/* Grade de grupos */}
            {gruposVisiveis.length > 0 ? (
              <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2">
                {gruposVisiveis.map((grupo) => (
                  <CartaoGrupo
                    key={grupo.id}
                    grupo={grupo}
                    onAcessar={() =>
                      navigate(grupo.destino.path, { state: grupo.destino.state })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-outline">
                  <Icon name="search_off" size={24} />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Nenhum grupo encontrado com esses filtros.
                </p>
              </div>
            )}

            {/* Dica de quitação via Pix */}
            <div className="flex flex-col items-start justify-between gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-space-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-fixed text-on-tertiary-fixed">
                  <Icon name="savings" size={24} />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Quer quitar com Pix instantâneo?
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Conecte sua chave Pix favorita para receber estornos de
                    despesas com um toque.
                  </p>
                </div>
              </div>
              <Link
                to="/perfil?aba=pix"
                className="whitespace-nowrap rounded-lg bg-surface-container-lowest px-space-md py-2 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-highest"
              >
                Configurar Chave
              </Link>
            </div>

            {/* Convite rápido */}
            <div className="flex flex-col items-start justify-between gap-space-md rounded-xl bg-surface-container-low p-space-lg shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-space-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                  <Icon name="rocket_launch" size={24} />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Convidar amigos via Pix ou link direto
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Quem entra no grupo não precisa baixar aplicativo para
                    conferir a conta ou confirmar o comprovante de pagamento.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={copiarConvite}
                className="flex shrink-0 cursor-pointer items-center gap-space-xs whitespace-nowrap rounded-lg bg-surface-container-lowest px-space-md py-2 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-highest"
              >
                <Icon name="content_copy" size={18} />
                Copiar convite rápido
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal — criar novo grupo */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 p-space-md backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalAberto(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-novo-grupo"
            className="flex w-full max-w-lg flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg text-on-surface shadow-2xl sm:p-space-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                  <Icon name="group_add" size={22} />
                </div>
                <h2 id="titulo-novo-grupo" className="font-headline-sm text-headline-sm text-on-surface">
                  Criar novo grupo
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setModalAberto(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form className="flex flex-col gap-space-md" onSubmit={criarGrupo}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nome-novo-grupo" className="font-label-md text-label-md text-on-surface">
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
                  className="h-12 w-full rounded-lg bg-surface-container-low px-space-md font-body-md text-body-md text-on-surface shadow-inner transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="categoria-novo-grupo" className="font-label-md text-label-md text-on-surface">
                  Categoria
                </label>
                <div className="relative flex items-center">
                  <select
                    id="categoria-novo-grupo"
                    value={categoriaNova}
                    onChange={(event) => setCategoriaNova(event.target.value)}
                    className="h-12 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-low px-space-md pr-10 font-body-sm text-body-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    {CATEGORIAS_MODAL.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
                      </option>
                    ))}
                  </select>
                  <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 text-outline" />
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Na próxima etapa você define o período e adiciona os
                  participantes.
                </span>
              </div>

              <div className="flex flex-col-reverse items-stretch justify-end gap-space-sm pt-space-xs sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="h-11 cursor-pointer rounded-lg bg-surface-container-low px-space-lg font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex h-11 cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-lg font-label-md text-label-md text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all hover:bg-primary-container/90 active:scale-[0.98]"
                >
                  Criar grupo
                  <Icon name="arrow_forward" size={18} />
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
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-space-sm rounded-xl bg-inverse-surface px-space-md py-space-sm font-label-md text-label-md text-inverse-on-surface shadow-xl"
        >
          <Icon name="check_circle" size={18} filled className="text-tertiary-fixed" />
          {aviso}
        </div>
      )}
    </AppShell>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
====================================================== */

function ValorMoeda({ valor, cor }: { valor: number; cor: string }) {
  const [, numero] = money(valor).split(/\s/);
  return (
    <div className="flex items-baseline gap-1 font-numeric-stat text-numeric-stat tracking-tight text-on-surface">
      <span className={`font-headline-sm text-headline-sm ${cor}`}>R$</span>
      <span>{numero ?? money(valor)}</span>
    </div>
  );
}

function Metrica({
  rotulo,
  icone,
  corIcone,
  selo,
  corSelo,
  bolha,
  valor,
  legenda,
  className = "",
}: {
  rotulo: string;
  icone: string;
  corIcone: string;
  selo: string;
  corSelo: string;
  bolha: string;
  valor: ReactNode;
  legenda: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}
    >
      <div className={`pointer-events-none absolute rounded-full ${bolha}`} />
      <div className="z-10 flex items-center justify-between gap-space-sm">
        <span className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
          <Icon name={icone} size={18} className={corIcone} />
          {rotulo}
        </span>
        <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-bold ${corSelo}`}>
          {selo}
        </span>
      </div>
      <div className="z-10 mt-space-md">
        {valor}
        <span className="font-body-sm text-body-sm text-outline">{legenda}</span>
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
  const capa = CAPAS[grupo.categoria ?? "padrao"];
  const f = grupo.financeiro;
  const visiveis = grupo.membros.slice(0, 3);
  const extras = grupo.membros.length - visiveis.length;
  const quitado = f ? f.quitacao >= 100 : false;
  const rodapeIcone = f?.rodapeIcone === "ok" ? "check_circle" : f?.rodapeIcone === "prazo" ? "hourglass_top" : "receipt_long";

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-md">
      <div>
        {/* Capa */}
        <div
          className={`relative h-44 w-full overflow-hidden bg-cover bg-center ${capa.imagem ? "" : capa.fundo}`}
          style={capa.imagem ? { backgroundImage: `url('${capa.imagem}')` } : undefined}
        >
          {!capa.imagem && (
            <Icon
              name={capa.icone}
              size={120}
              className="pointer-events-none absolute -right-4 -top-4 text-on-primary/25"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/20 to-transparent" />
          <div className="absolute left-space-md top-space-md flex items-center gap-space-xs">
            <span className="rounded-md bg-surface-container-lowest/90 px-space-sm py-1 font-label-sm text-label-sm font-semibold text-on-surface shadow-sm backdrop-blur-md">
              {grupo.categoria ?? "Grupo"}
            </span>
            <span className={`flex items-center gap-1 rounded-md bg-surface-container-lowest/90 px-space-sm py-1 font-label-sm text-label-sm font-semibold shadow-sm backdrop-blur-md ${tom.texto}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${tom.ponto}`} />
              {grupo.status}
            </span>
          </div>
          <div className="absolute bottom-space-md left-space-md right-space-md text-on-primary">
            {grupo.categoria && (
              <span className="block truncate font-label-sm text-label-sm uppercase tracking-wider opacity-80">
                {grupo.subtitulo}
              </span>
            )}
            <h3 className="flex items-center gap-space-xs font-headline-md text-headline-md font-bold tracking-tight text-on-primary drop-shadow-sm">
              <span aria-hidden="true">{grupo.emoji}</span>
              <span className="truncate">{grupo.nome}</span>
            </h3>
          </div>
        </div>

        {/* Corpo */}
        <div className="space-y-space-md p-space-lg">
          {grupo.participantes !== undefined && (
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center -space-x-2" aria-label={`${grupo.participantes} participantes`}>
                {visiveis.map((letra, indice) => (
                  <div
                    key={`${letra}-${indice}`}
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-label-sm text-label-sm font-bold shadow-sm ring-2 ring-surface-container-lowest ${CORES_AVATAR[indice % CORES_AVATAR.length]}`}
                  >
                    {letra}
                  </div>
                ))}
                {extras > 0 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest font-label-sm text-label-sm font-medium text-on-surface shadow-sm ring-2 ring-surface-container-lowest">
                    +{extras}
                  </div>
                )}
              </div>
              {f && (
                <span className="flex items-center gap-1 font-body-sm text-body-sm text-outline">
                  <Icon name={rodapeIcone} size={16} />
                  {f.rodape}
                </span>
              )}
            </div>
          )}

          {f ? (
            <div className="space-y-space-sm rounded-lg bg-surface-container-low p-space-md">
              <div className="flex items-center justify-between gap-space-sm">
                <div>
                  <span className="block font-body-sm text-body-sm text-outline">Sua parte</span>
                  <span className={`font-headline-sm text-headline-sm font-bold ${quitado ? "text-on-surface" : tom.texto}`}>
                    {money(f.suaParte)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-body-sm text-body-sm text-outline">Gasto Total do Grupo</span>
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                    {money(f.total)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Quitação do grupo</span>
                  <span className={`font-bold ${tom.texto}`}>
                    {quitado ? "100% quitado" : `${f.quitacao}%`}
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high"
                  role="progressbar"
                  aria-valuenow={f.quitacao}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Quitação de ${grupo.nome}`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${tom.barra}`}
                    style={{ width: `${Math.min(f.quitacao, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-md">
              <Icon name="notes" size={18} className="mt-0.5 shrink-0 text-outline" />
              <p className="line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">
                {grupo.subtitulo}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ação */}
      <div className="p-space-lg pt-0">
        <button
          type="button"
          onClick={onAcessar}
          className="flex w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-surface-container-high py-2.5 font-label-md text-label-md text-on-surface transition-all duration-200 group-hover:bg-primary-container group-hover:text-on-primary"
        >
          <span>Acessar Grupo</span>
          <Icon name="arrow_forward" size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}
