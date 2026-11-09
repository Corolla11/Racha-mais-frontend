import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BellRing,
  Calculator,
  Check,
  Link2,
  ListChecks,
  QrCode,
  SlidersHorizontal,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import Link from "../components/app-link";
import { useAuth } from "../auth/auth-context";
import { ApiError, apiRequest } from "../lib/api";
import { money } from "../lib/finance";
import {
  ehOrganizador,
  extrairEmail,
  lerRascunho,
  limparRascunho,
  type GrupoRascunho,
} from "../lib/grupo-rascunho";
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
  onPrimaryFixed: "#331200",

  tertiaryContainer: "#ed9800",
  onTertiaryContainer: "#5b3700",

  outlineVariant: "#ddc1b3",

  surface: "#f8f9ff",
  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e6eeff",
  surfaceHigh: "#dee9fc",
  surfaceHighest: "#d9e3f6",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
};

// Mesmos ids da tela de criação manual
const CATEGORIAS: Record<string, { nome: string; emoji: string }> = {
  viagem: { nome: "Viagem & Lazer", emoji: "🏖️" },
  evento: { nome: "Evento / Churrasco", emoji: "🥩" },
  republica: { nome: "República / Casa", emoji: "🏠" },
  academico: { nome: "Trabalho Acadêmico", emoji: "🎓" },
  outro: { nome: "Outro", emoji: "📦" },
};

const MOEDAS: Record<string, string> = {
  BRL: "Real Brasileiro (BRL)",
  USD: "Dólar Americano (USD)",
  EUR: "Euro (EUR)",
};

type GrupoCriado = { id: string; nome: string };

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function nomeCurto(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0]}.` : nome;
}

export default function ConfirmarGrupo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const estado = useLocation().state as { grupo?: GrupoRascunho } | null;
  const [rascunho] = useState<GrupoRascunho | null>(() => estado?.grupo ?? lerRascunho());

  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");
  const [criado, setCriado] = useState<GrupoCriado | null>(null);
  const [falhas, setFalhas] = useState<string[]>([]);

  const outros = useMemo(
    () => (rascunho ? rascunho.membros.filter((m) => !ehOrganizador(m)) : []),
    [rascunho],
  );

  if (!rascunho) {
    return (
      <Moldura>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Nenhum grupo para revisar</h1>
          <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
            Preencha os detalhes do grupo primeiro e depois volte para
            confirmar.
          </p>
          <Link
            to="/criar-grupo/manual"
            className="rounded-lg bg-[#ff8c42] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9b4500]"
          >
            Preencher detalhes do grupo
          </Link>
        </div>
      </Moldura>
    );
  }

  const grupo = rascunho;
  const categoria = CATEGORIAS[grupo.categoria] ?? CATEGORIAS.outro;
  const totalMembros = outros.length + 1;
  const percentual = Math.round((100 / totalMembros) * 10) / 10;
  const convidaveis = outros
    .map((m) => ({ membro: m, email: extrairEmail(m.contato) }))
    .filter((m): m is { membro: typeof m.membro; email: string } => m.email !== null);
  const semEmail = outros.length - convidaveis.length;

  function irParaGrupo(alvo: GrupoCriado) {
    navigate(`/grupo/${encodeURIComponent(alvo.id)}/membros`, {
      state: { nomeGrupo: alvo.nome },
      replace: true,
    });
  }

  async function criarGrupo() {
    setErro("");
    setCriando(true);
    try {
      const novo = await apiRequest<GrupoCriado>("/grupos", {
        method: "POST",
        body: { nome: grupo.nome.trim(), descricao: grupo.descricao.trim() },
      });

      // Adiciona quem já tem conta no Racha+ pelo e-mail informado
      const naoAdicionados: string[] = [];
      for (const { membro, email } of convidaveis) {
        try {
          await apiRequest(`/grupos/${encodeURIComponent(novo.id)}/membros`, {
            method: "POST",
            body: { email },
          });
        } catch (error) {
          const motivo = error instanceof ApiError ? error.message : "falha ao adicionar";
          naoAdicionados.push(`${membro.nome} (${email}): ${motivo}`);
        }
      }

      limparRascunho();
      if (naoAdicionados.length === 0) {
        irParaGrupo(novo);
        return;
      }
      setCriado(novo);
      setFalhas(naoAdicionados);
    } catch (error) {
      setErro(
        error instanceof ApiError ? error.message : "Não foi possível criar o grupo. Tente novamente.",
      );
    } finally {
      setCriando(false);
    }
  }

  return (
    <Moldura>
      <div className="relative isolate mx-auto flex w-full max-w-2xl flex-col items-center">
        <div
          className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: `${C.primaryContainer}1a` }}
        />

        {/* Título */}
        <div className="mb-6 w-full text-center">
          <span
            className="mb-2 inline-flex items-center gap-1 rounded-full px-4 py-1 shadow-sm"
            style={{ backgroundColor: C.surfaceLow, color: C.primary }}
          >
            <BadgeCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Passo Final de Validação</span>
          </span>
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
            Tudo pronto! Revise os detalhes do grupo
          </h1>
          <p className="mx-auto mt-1 max-w-xl text-base" style={{ color: C.onSurfaceVariant }}>
            Confirme as informações abaixo antes de criar o grupo.
          </p>
        </div>

        {/* Cartão principal */}
        <div className="flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
          <div
            className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center"
            style={{ backgroundColor: `${C.surfaceLow}99` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl shadow-sm"
                style={{ backgroundColor: C.primaryFixed }}
                aria-hidden="true"
              >
                {categoria.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.primary }}>
                    {categoria.nome}
                  </span>
                  {grupo.data && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.outlineVariant }} />
                      <span className="text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
                        {grupo.data}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="mt-0.5 break-words text-2xl font-semibold">{grupo.nome}</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-1 sm:flex-col sm:items-end">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium"
                style={{ backgroundColor: C.surfaceHigh }}
              >
                <Users className="h-4 w-4" style={{ color: C.primary }} />
                {totalMembros} {totalMembros === 1 ? "Participante" : "Participantes"}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium"
                style={{ backgroundColor: C.primaryFixed, color: C.onPrimaryFixed }}
              >
                <Calculator className="h-4 w-4" />
                Rateio igualitário automático
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6">
            {grupo.descricao.trim() && (
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                {grupo.descricao}
              </p>
            )}

            {/* Membros */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-base font-semibold">
                  <Users className="h-5 w-5" style={{ color: C.primary }} />
                  Membros do Grupo
                </span>
                <span className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  {totalMembros} no total
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <li className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: C.surfaceLow }}>
                  <span
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm"
                    style={{ backgroundColor: C.primary }}
                  >
                    {user?.name ? iniciais(user.name) : "VC"}
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                      style={{ backgroundColor: C.tertiaryContainer }}
                      title="Organizador"
                    >
                      👑
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">Você</span>
                    <span className="block truncate text-xs font-medium" style={{ color: C.primary }}>
                      Organizador
                    </span>
                  </span>
                </li>
                {outros.map((membro) => {
                  const email = extrairEmail(membro.contato);
                  return (
                    <li
                      key={membro.id}
                      className="flex items-center gap-2 rounded-lg p-2"
                      style={{ backgroundColor: C.surfaceLow }}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm"
                        style={{ backgroundColor: C.surfaceHighest }}
                      >
                        {membro.iniciais || iniciais(membro.nome)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{nomeCurto(membro.nome)}</span>
                        <span className="block truncate text-xs" style={{ color: C.onSurfaceVariant }}>
                          {email ? "Membro" : "Sem e-mail"}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              {semEmail > 0 && (
                <p className="flex items-start gap-1.5 text-xs" style={{ color: C.onSurfaceVariant }}>
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.tertiaryContainer }} />
                  {semEmail === 1 ? "1 participante não tem" : `${semEmail} participantes não têm`} e-mail
                  informado e não será adicionado agora. Convide depois pela tela de membros.
                </p>
              )}
            </div>

            {/* Configurações */}
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1 text-base font-semibold">
                <SlidersHorizontal className="h-5 w-5" style={{ color: C.primary }} />
                Configurações Iniciais
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Parametro
                  icone={<Banknote className="h-[18px] w-[18px]" />}
                  rotulo="Moeda Padrão"
                  valor={MOEDAS[grupo.moeda] ?? grupo.moeda}
                  detalhe={grupo.moeda === "BRL" ? "Símbolo R$" : undefined}
                />
                <Parametro
                  icone={<BellRing className="h-[18px] w-[18px]" />}
                  rotulo="Notificações"
                  valor="Avisos no app"
                  detalhe="Ativadas"
                  destaque
                />
                <Parametro
                  icone={<QrCode className="h-[18px] w-[18px]" />}
                  rotulo="Liquidação"
                  valor="Pix entre membros"
                  detalhe="Copia e Cola"
                />
              </div>
            </div>

            {/* Tarefas */}
            {grupo.itens.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-base font-semibold">
                    <ListChecks className="h-5 w-5" style={{ color: C.primary }} />
                    Tarefas planejadas
                  </span>
                  <span className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    Total {money(grupo.total)}
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {grupo.itens.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                      style={{ backgroundColor: C.surfaceLow }}
                    >
                      <span className="truncate">{item.titulo}</span>
                      <span className="shrink-0 font-semibold">
                        {item.valor > 0 ? money(item.valor) : "Sem custo"}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                  As tarefas ficam no rascunho por enquanto: depois de criar o
                  grupo, cadastre-as dentro dele.
                </p>
              </div>
            )}

            {/* Convite */}
            <div className="flex flex-col gap-2 rounded-xl p-4" style={{ backgroundColor: `${C.surfaceHigh}99` }}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-sm font-semibold">
                  <Link2 className="h-[18px] w-[18px]" style={{ color: C.primary }} />
                  Convites para os amigos
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs shadow-sm" style={{ color: C.onSurfaceVariant }}>
                  Após criar
                </span>
              </div>
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                {convidaveis.length > 0
                  ? `${convidaveis.length} ${convidaveis.length === 1 ? "pessoa será adicionada" : "pessoas serão adicionadas"} pelo e-mail assim que o grupo for criado. Quem ainda não tem conta no Racha+ poderá ser convidado pela tela de membros.`
                  : "Depois de criar o grupo, adicione os participantes pelo e-mail na tela de membros."}
              </p>
            </div>
          </div>

          {/* Divisão automática */}
          <div className="px-6 pb-6">
            <div
              className="flex items-center justify-between gap-4 rounded-lg p-4"
              style={{ backgroundColor: C.surfaceLow }}
            >
              <div className="flex items-center gap-4">
                <svg className="h-10 w-10 shrink-0" viewBox="0 0 36 36" style={{ color: C.primaryContainer }} aria-hidden="true">
                  <circle cx="18" cy="18" fill="none" r="14" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    fill="none"
                    r="14"
                    stroke="currentColor"
                    strokeDasharray={`${(88 * percentual) / 100} 88`}
                    strokeLinecap="round"
                    strokeWidth="3"
                    transform="rotate(-90 18 18)"
                  />
                  <circle cx="18" cy="18" fill="currentColor" r="4" />
                </svg>
                <div>
                  <p className="text-sm font-semibold">
                    Divisão automática: {percentual.toLocaleString("pt-BR")}% para cada
                  </p>
                  <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    Lançamentos futuros serão distribuídos entre os participantes de cada tarefa.
                  </p>
                </div>
              </div>
              <span className="hidden rounded-full bg-white px-2.5 py-1 text-xs font-medium shadow-sm md:inline-flex">
                {totalMembros} Cotas Iguais
              </span>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {erro && (
          <p role="alert" className="mt-6 w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {erro}
          </p>
        )}

        {criado && (
          <div role="status" className="mt-6 flex w-full flex-col gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">
              Grupo criado! Algumas pessoas não puderam ser adicionadas:
            </p>
            <ul className="list-inside list-disc space-y-1">
              {falhas.map((falha) => (
                <li key={falha}>{falha}</li>
              ))}
            </ul>
            <p>Você pode convidá-las depois pela tela de membros.</p>
            <button
              type="button"
              onClick={() => irParaGrupo(criado)}
              className="flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-[#ff8c42] px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#9b4500]"
            >
              Ir para o grupo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Ações */}
        {!criado && (
          <div className="mt-6 flex w-full flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <button
              type="button"
              disabled={criando}
              onClick={() => navigate("/criar-grupo/manual", { state: { rascunho: grupo } })}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-white px-6 py-3 text-base font-semibold shadow-sm transition-all duration-200 hover:bg-[#e6eeff] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <ArrowLeft className="h-5 w-5" />
              Editar detalhes
            </button>
            <button
              type="button"
              onClick={criarGrupo}
              disabled={criando}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff8c42] px-10 py-3.5 text-base font-semibold text-white shadow-[0_8px_20px_-4px_rgba(255,140,66,0.45)] transition-all duration-200 hover:shadow-[0_12px_24px_-4px_rgba(255,140,66,0.6)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 sm:w-auto"
            >
              {criando ? "Criando grupo..." : "Criar grupo agora"}
              {!criando && <span aria-hidden="true">🚀</span>}
            </button>
          </div>
        )}
      </div>
    </Moldura>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
====================================================== */

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col font-jakarta"
      style={{ backgroundColor: C.surface, color: C.onSurface }}
    >
      <header className="sticky top-0 z-50 h-16 w-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            to="/meus-grupos"
            title="Fechar e voltar a Meus grupos"
            aria-label="Fechar e voltar a Meus grupos"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#eff4ff] hover:text-[#121c2a]"
            style={{ color: C.onSurfaceVariant }}
          >
            <X className="h-6 w-6" />
          </Link>
          <ol className="flex items-center gap-4 text-sm font-semibold" aria-label="Etapas">
            <li className="flex items-center gap-1">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                style={{ backgroundColor: `${C.primary}33`, color: C.primary }}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span>Criar</span>
            </li>
            <li aria-hidden="true" className="h-[2px] w-8" style={{ backgroundColor: C.surfaceHigh }} />
            <li className="flex items-center gap-1" aria-current="step">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white shadow-sm"
                style={{ backgroundColor: C.primaryContainer }}
              >
                2
              </span>
              <span>Confirmar</span>
            </li>
          </ol>
          <div className="w-10" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}

function Parametro({
  icone,
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg p-4" style={{ backgroundColor: C.surfaceLow }}>
      <span
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
        style={{ color: C.primary }}
      >
        {icone}
      </span>
      <div>
        <p className="text-xs" style={{ color: C.onSurfaceVariant }}>{rotulo}</p>
        <p className="mt-0.5 text-sm font-semibold">{valor}</p>
        {detalhe && (
          <span
            className={`mt-1 inline-flex items-center gap-1 text-xs ${destaque ? "font-semibold" : "font-medium"}`}
            style={{ color: destaque ? C.primary : C.onSurfaceVariant }}
          >
            {destaque && <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: C.primary }} />}
            {detalhe}
          </span>
        )}
      </div>
    </div>
  );
}
