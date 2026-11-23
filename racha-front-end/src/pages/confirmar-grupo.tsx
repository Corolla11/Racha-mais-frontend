import { useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import AppShell from "../components/app-shell";
import Link from "../components/app-link";
import Icon from "../components/icon";
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
        <div className="flex flex-col items-center gap-space-md rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-xl shadow-on-surface/5 sm:p-space-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-outline">
            <Icon name="draft" size={32} />
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Nenhum grupo para revisar</h1>
          <p className="max-w-sm font-body-md text-body-md text-on-surface-variant">
            Preencha os detalhes do grupo primeiro e depois volte para
            confirmar.
          </p>
          <Link
            to="/criar-grupo/manual"
            className="flex h-12 items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-xl font-label-lg text-label-lg text-on-primary shadow-lg shadow-primary-container/30 transition-all hover:bg-primary-container/90 active:scale-[0.98]"
          >
            Preencher detalhes do grupo
            <Icon name="arrow_forward" size={20} />
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
      <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-space-md text-center shadow-xl shadow-on-surface/5 sm:p-space-xl">
        {/* Ícone de destaque */}
        <div className="relative mb-space-md flex items-center justify-center">
          <Icon
            name="auto_awesome"
            size={20}
            className="absolute -left-5 -top-3 animate-bounce text-tertiary-container [animation-duration:2.4s]"
          />
          <Icon name="checklist" size={22} className="absolute -bottom-1 -right-5 animate-pulse text-secondary-container" />
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed shadow-lg shadow-primary-container/20 sm:h-24 sm:w-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container shadow-md sm:h-16 sm:w-16">
              <Icon name="fact_check" size={32} filled className="text-on-primary" />
            </div>
          </div>
        </div>

        <span className="mb-space-xs inline-flex items-center gap-1 rounded-full bg-surface-container-low px-space-md py-1 font-label-sm text-label-sm font-semibold uppercase tracking-wide text-primary">
          <Icon name="verified" size={16} />
          Passo Final de Validação
        </span>
        <h1 className="mb-space-xs max-w-lg font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
          Tudo pronto! Revise os detalhes do grupo
        </h1>
        <p className="mx-auto mb-space-lg max-w-md font-body-md text-body-md text-on-surface-variant">
          Confirme as informações do grupo{" "}
          <span className="font-semibold text-on-surface">“{grupo.nome}”</span>{" "}
          antes de criá-lo.
        </p>

        {/* Resumo do grupo */}
        <div className="mb-space-lg w-full rounded-xl bg-surface-container-low p-space-md text-left shadow-sm sm:p-space-lg">
          <div className="flex flex-col gap-space-md pb-space-md sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-3xl shadow-sm"
              aria-hidden="true"
            >
              {categoria.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-space-xs">
                <span className="rounded-full bg-surface-container-highest px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                  {categoria.nome}
                </span>
                {grupo.data && (
                  <span className="flex items-center gap-1 rounded-full bg-surface-container-lowest px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                    <Icon name="event" size={14} />
                    {grupo.data}
                  </span>
                )}
              </div>
              <h2 className="break-words font-headline-sm text-headline-sm text-on-surface">{grupo.nome}</h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span>
                  Criado por <strong className="font-semibold text-on-surface">{user?.name || "Você"}</strong>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1">
                  <Icon name="group" size={16} className="text-outline" />
                  {totalMembros} {totalMembros === 1 ? "participante" : "participantes"}
                </span>
              </div>
            </div>
          </div>

          {grupo.descricao.trim() && (
            <p className="mb-space-md whitespace-pre-line rounded-lg bg-surface-container-lowest p-space-md font-body-sm text-body-sm text-on-surface-variant shadow-sm">
              {grupo.descricao}
            </p>
          )}

          {/* Membros */}
          <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm shadow-sm sm:p-space-md">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <Icon name="groups" size={16} className="text-primary" />
                Membros do Grupo
              </span>
              <span className="font-label-sm text-label-sm text-outline">{totalMembros} no total</span>
            </div>
            <ul className="grid grid-cols-1 gap-space-xs min-[420px]:grid-cols-2">
              <li className="flex items-center gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-md text-label-md font-bold text-on-primary shadow-sm">
                  {user?.name ? iniciais(user.name) : "VC"}
                  <span
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm"
                    title="Organizador"
                  >
                    <Icon name="shield" size={11} className="text-primary" />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-label-md text-label-md text-on-surface">Você</span>
                  <span className="block truncate font-label-sm text-label-sm text-primary">Organizador</span>
                </span>
              </li>
              {outros.map((membro) => {
                const email = extrairEmail(membro.contato);
                return (
                  <li key={membro.id} className="flex items-center gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest font-label-md text-label-md font-bold text-on-surface shadow-sm">
                      {membro.iniciais || iniciais(membro.nome)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-label-md text-label-md text-on-surface">{nomeCurto(membro.nome)}</span>
                      <span className={`block truncate font-label-sm text-label-sm ${email ? "text-on-surface-variant" : "text-outline"}`}>
                        {email ? "Membro" : "Sem e-mail"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {semEmail > 0 && (
              <p className="flex items-start gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <Icon name="warning" size={16} className="shrink-0 text-tertiary-container" />
                <span>
                  {semEmail === 1 ? "1 participante não tem" : `${semEmail} participantes não têm`} e-mail
                  informado e não será adicionado agora. Convide depois pela tela de membros.
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Configurações iniciais */}
        <Secao titulo="Configurações Iniciais">
          <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
            <Parametro
              icone="payments"
              rotulo="Moeda Padrão"
              valor={MOEDAS[grupo.moeda] ?? grupo.moeda}
              detalhe={grupo.moeda === "BRL" ? "Símbolo R$" : undefined}
            />
            <Parametro icone="notifications_active" rotulo="Notificações" valor="Avisos no app" detalhe="Ativadas" destaque />
            <Parametro icone="qr_code_2" rotulo="Liquidação" valor="Pix entre membros" detalhe="Copia e Cola" />
          </div>
        </Secao>

        {/* Tarefas */}
        {grupo.itens.length > 0 && (
          <Secao titulo="Tarefas planejadas" extra={`Total ${money(grupo.total)}`}>
            <ul className="flex flex-col gap-space-xs">
              {grupo.itens.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-space-sm rounded-lg bg-surface-container-low px-space-md py-space-sm font-body-sm text-body-sm text-on-surface"
                >
                  <span className="flex min-w-0 items-center gap-space-sm">
                    <Icon name="task_alt" size={18} className="shrink-0 text-primary" />
                    <span className="truncate">{item.titulo}</span>
                  </span>
                  <span className={`shrink-0 font-semibold ${item.valor > 0 ? "text-on-surface" : "text-outline"}`}>
                    {item.valor > 0 ? money(item.valor) : "Sem custo"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-space-xs pl-1 font-label-sm text-label-sm text-on-surface-variant">
              As tarefas ficam no rascunho por enquanto: depois de criar o
              grupo, cadastre-as dentro dele.
            </p>
          </Secao>
        )}

        {/* Convites */}
        <div className="mb-space-lg flex w-full flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-sm text-left shadow-sm sm:p-space-md">
          <div className="flex items-center justify-between gap-space-sm">
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <Icon name="link" size={16} className="text-primary" />
              Convites para os amigos
            </span>
            <span className="rounded-full bg-surface-container-lowest px-space-sm py-0.5 font-label-sm text-label-sm text-outline shadow-sm">
              Após criar
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface">
            {convidaveis.length > 0
              ? `${convidaveis.length} ${convidaveis.length === 1 ? "pessoa será adicionada" : "pessoas serão adicionadas"} pelo e-mail assim que o grupo for criado. Quem ainda não tem conta no Racha+ poderá ser convidado pela tela de membros.`
              : "Depois de criar o grupo, adicione os participantes pelo e-mail na tela de membros."}
          </p>
        </div>

        {/* Divisão automática */}
        <div className="mb-space-lg flex w-full items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md text-left">
          <div className="flex items-center gap-space-md">
            <svg className="h-10 w-10 shrink-0 text-primary-container" viewBox="0 0 36 36" aria-hidden="true">
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
              <p className="font-label-md text-label-md text-on-surface">
                Divisão automática: {percentual.toLocaleString("pt-BR")}% para cada
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Lançamentos futuros serão distribuídos entre os participantes de cada tarefa.
              </p>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full bg-surface-container-lowest px-2.5 py-1 font-label-sm text-label-sm text-on-surface shadow-sm md:inline-flex">
            {totalMembros} Cotas Iguais
          </span>
        </div>

        {/* Mensagens */}
        {erro && (
          <p
            role="alert"
            className="mb-space-lg flex w-full items-start gap-space-sm rounded-lg bg-error-container px-space-md py-space-sm text-left font-body-sm text-body-sm text-on-error-container"
          >
            <Icon name="error" size={18} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        )}

        {criado && (
          <div
            role="status"
            className="mb-space-lg flex w-full flex-col gap-space-sm rounded-xl bg-tertiary-fixed p-space-md text-left font-body-sm text-body-sm text-on-tertiary-fixed"
          >
            <p className="flex items-center gap-space-xs font-label-md text-label-md">
              <Icon name="check_circle" size={18} filled className="text-tertiary" />
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
              className="flex h-11 w-fit cursor-pointer items-center gap-space-xs rounded-lg bg-primary-container px-space-lg font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container/90 active:scale-[0.98]"
            >
              Ir para o grupo
              <Icon name="arrow_forward" size={18} />
            </button>
          </div>
        )}

        {/* Ações */}
        {!criado && (
          <div className="flex w-full flex-col-reverse items-center justify-center gap-space-sm pt-space-xs sm:flex-row">
            <button
              type="button"
              disabled={criando}
              onClick={() => navigate("/criar-grupo/manual", { state: { rascunho: grupo } })}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-surface-container-high px-space-lg font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Icon name="arrow_back" size={20} />
              Editar detalhes
            </button>
            <button
              type="button"
              onClick={criarGrupo}
              disabled={criando}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-xl font-label-lg text-label-lg text-on-primary shadow-lg shadow-primary-container/30 transition-all hover:bg-primary-container/90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 sm:w-auto"
            >
              {criando ? (
                <>
                  <Icon name="progress_activity" size={20} className="animate-spin" />
                  Criando grupo...
                </>
              ) : (
                <>
                  Criar grupo agora
                  <Icon name="rocket_launch" size={20} />
                </>
              )}
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

function Moldura({ children }: { children: ReactNode }) {
  return (
    <AppShell title="Confirmar grupo">
      <div className="relative isolate mx-auto w-full max-w-2xl py-space-md sm:py-space-lg">
        <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-fixed-dim/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-1/2 -z-10 h-64 w-64 rounded-full bg-secondary-fixed/30 blur-3xl" />

        <nav aria-label="Navegação estrutural" className="mb-space-lg flex flex-wrap items-center justify-center gap-space-xs text-center">
          <Link to="/meus-grupos" className="font-label-sm text-label-sm text-outline transition-colors hover:text-on-surface">
            Meus Grupos
          </Link>
          <Icon name="chevron_right" size={16} className="text-outline-variant" />
          <Link to="/criar-grupo" className="font-label-sm text-label-sm text-outline transition-colors hover:text-on-surface">
            Criar Novo Grupo
          </Link>
          <Icon name="chevron_right" size={16} className="text-outline-variant" />
          <span className="font-label-sm text-label-sm font-semibold text-primary" aria-current="page">
            Confirmação
          </span>
        </nav>

        {children}

        <div className="mt-space-md flex items-center justify-center gap-space-xs text-center font-label-sm text-label-sm text-outline">
          <Icon name="lock" size={16} />
          <span>Nada é criado antes da sua confirmação • Cálculo automático de dívidas mínimas</span>
        </div>
      </div>
    </AppShell>
  );
}

function Secao({ titulo, extra, children }: { titulo: string; extra?: string; children: ReactNode }) {
  return (
    <div className="mb-space-lg w-full text-left">
      <div className="mb-space-sm flex items-center justify-between gap-space-sm pl-1">
        <h3 className="font-label-md text-label-md uppercase tracking-wider text-outline">{titulo}</h3>
        {extra && <span className="font-label-sm text-label-sm text-on-surface-variant">{extra}</span>}
      </div>
      {children}
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
  icone: string;
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm sm:flex-col">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
        <Icon name={icone} size={20} />
      </span>
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm text-on-surface-variant">{rotulo}</p>
        <p className="mt-0.5 font-label-md text-label-md text-on-surface">{valor}</p>
        {detalhe && (
          <span
            className={`mt-1 inline-flex items-center gap-1 font-label-sm text-label-sm ${destaque ? "font-semibold text-primary" : "text-outline"}`}
          >
            {destaque && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />}
            {detalhe}
          </span>
        )}
      </div>
    </div>
  );
}
