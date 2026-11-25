import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import { ApiError, apiRequest } from "../lib/api";
import {
  ENDPOINTS,
  type NotificacaoApi,
  type NotificacoesResponseApi,
  type TipoNotificacaoApi,
} from "../lib/endpoints";

type Categoria = "invites" | "payments" | "tasks";
type Secao = "Hoje" | "Ontem" | "Anteriores";
type Tom = "primary" | "tertiary" | "secondary";

const TONS: Record<Tom, { barra: string; icone: string; rotulo: string }> = {
  primary: { barra: "bg-primary-container", icone: "bg-primary-fixed text-primary", rotulo: "text-primary" },
  tertiary: { barra: "bg-tertiary-container", icone: "bg-tertiary-fixed text-on-tertiary-container", rotulo: "text-tertiary" },
  secondary: { barra: "bg-secondary-container", icone: "bg-secondary-fixed/40 text-secondary", rotulo: "text-secondary" },
};

const META_TIPO: Record<
  TipoNotificacaoApi,
  { categoria: Categoria; icone: string; tom: Tom; selo: string; corSelo: string }
> = {
  MEMBRO_ADICIONADO: {
    categoria: "invites",
    icone: "group_add",
    tom: "tertiary",
    selo: "Grupo",
    corSelo: "bg-tertiary-fixed text-on-tertiary-fixed",
  },
  TAREFA_CRIADA: {
    categoria: "tasks",
    icone: "task_alt",
    tom: "primary",
    selo: "Nova tarefa",
    corSelo: "bg-primary-fixed text-on-primary-fixed",
  },
  COBRANCA_CRIADA: {
    categoria: "payments",
    icone: "payments",
    tom: "primary",
    selo: "Cobrança",
    corSelo: "bg-primary-fixed text-on-primary-fixed",
  },
  PRAZO_PROXIMO: {
    categoria: "tasks",
    icone: "alarm",
    tom: "secondary",
    selo: "Prazo próximo",
    corSelo: "bg-error-container text-on-error-container",
  },
  PRAZO_VENCIDO: {
    categoria: "tasks",
    icone: "warning",
    tom: "secondary",
    selo: "Vencida",
    corSelo: "bg-error-container text-on-error-container",
  },
};

const FILTROS: { id: Categoria | "all"; nome: string }[] = [
  { id: "all", nome: "Todas" },
  { id: "invites", nome: "Grupos" },
  { id: "payments", nome: "Cobranças" },
  { id: "tasks", nome: "Tarefas & Prazos" },
];

const SECOES: Secao[] = ["Hoje", "Ontem", "Anteriores"];

function secaoDaData(iso: string): Secao {
  const data = new Date(iso);
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const inicioOntem = inicioHoje - 86_400_000;
  const ts = data.getTime();
  if (ts >= inicioHoje) return "Hoje";
  if (ts >= inicioOntem) return "Ontem";
  return "Anteriores";
}

function formatarQuando(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Notificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [filtro, setFiltro] = useState<Categoria | "all">("all");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let ativo = true;
    apiRequest<NotificacoesResponseApi>(`${ENDPOINTS.notificacoes.base}?limite=100`)
      .then((res) => {
        if (!ativo) return;
        setNotificacoes(res.notificacoes);
      })
      .catch((err: unknown) => {
        if (!ativo) return;
        setErro(
          err instanceof ApiError
            ? err.message
            : "Não foi possível carregar suas notificações.",
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  useEffect(() => {
    if (!aviso) return;
    const id = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(id);
  }, [aviso]);

  const naoLidas = notificacoes.filter((n) => !n.lidaEm).length;

  const contagem = useMemo(() => {
    const total: Record<string, number> = { all: notificacoes.length, invites: 0, payments: 0, tasks: 0 };
    for (const n of notificacoes) {
      total[META_TIPO[n.tipo].categoria]++;
    }
    return total;
  }, [notificacoes]);

  const visiveis = notificacoes.filter(
    (n) => filtro === "all" || META_TIPO[n.tipo].categoria === filtro,
  );

  async function marcarLida(id: string) {
    try {
      await apiRequest<void>(ENDPOINTS.notificacoes.marcarLida(id), { method: "PATCH" });
      const agora = new Date().toISOString();
      setNotificacoes((ant) =>
        ant.map((n) => (n.id === id ? { ...n, lidaEm: n.lidaEm ?? agora } : n)),
      );
    } catch (err) {
      setAviso(err instanceof ApiError ? err.message : "Não foi possível marcar como lida.");
    }
  }

  async function marcarTodasComoLidas() {
    try {
      await apiRequest<{ atualizadas: number }>(ENDPOINTS.notificacoes.marcarTodasLidas, {
        method: "PATCH",
      });
      const agora = new Date().toISOString();
      setNotificacoes((ant) => ant.map((n) => ({ ...n, lidaEm: n.lidaEm ?? agora })));
      setAviso("Todas as notificações foram marcadas como lidas.");
    } catch (err) {
      setAviso(err instanceof ApiError ? err.message : "Não foi possível atualizar as notificações.");
    }
  }

  return (
    <AppShell title="Notificações & Avisos" bare>
      <div className="flex w-full flex-col">
        <div className="mx-auto w-full max-w-5xl space-y-space-lg px-gutter-mobile py-space-md sm:px-gutter sm:py-space-xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <Link to="/meus-grupos" className="flex items-center gap-1 transition-colors hover:text-primary">
              <Icon name="home" size={16} />
              <span>Início</span>
            </Link>
            <Icon name="chevron_right" size={14} className="text-outline-variant" />
            <span className="font-semibold text-on-surface">Notificações &amp; Alertas</span>
          </nav>

          <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
            <div className="space-y-space-xs">
              <div className="flex flex-wrap items-center gap-space-sm">
                <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight text-on-surface">
                  Central de Notificações
                </h1>
                {naoLidas > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-primary shadow-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
                  </span>
                )}
              </div>
              <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
                Acompanhe movimentações dos seus grupos, tarefas criadas, cobranças e prazos.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-space-sm self-start lg:self-center">
              <button
                type="button"
                onClick={() => void marcarTodasComoLidas()}
                disabled={naoLidas === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-3.5 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-container-high active:scale-95 disabled:pointer-events-none disabled:opacity-70"
              >
                {naoLidas === 0 ? (
                  <>
                    <Icon name="check" size={18} className="text-tertiary" />
                    <span>Todas marcadas</span>
                  </>
                ) : (
                  <>
                    <Icon name="done_all" size={18} className="text-primary" />
                    <span>Marcar todas como lidas</span>
                  </>
                )}
              </button>
              <Link
                to="/perfil?aba=notifications"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest p-2 font-label-md text-label-md text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-high hover:text-on-surface sm:px-3.5 sm:py-2"
              >
                <Icon name="tune" size={20} />
                <span className="hidden sm:inline">Configurar</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-1.5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 overflow-x-auto px-0.5 py-0.5">
              {FILTROS.map((item) => {
                const ativo = filtro === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setFiltro(item.id)}
                    className={`shrink-0 rounded-lg px-3.5 py-1.5 font-label-md text-label-md transition-all ${
                      ativo
                        ? "bg-inverse-surface font-semibold text-inverse-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    {item.nome} <span className="ml-1 text-label-sm opacity-70">({contagem[item.id]})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {carregando ? (
            <p role="status" className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <Icon name="progress_activity" size={20} className="animate-spin text-primary-container" />
              Carregando notificações...
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
                  setTentativa((v) => v + 1);
                }}
                className="cursor-pointer rounded-lg bg-surface-container-lowest px-space-md py-2 font-label-md text-label-md text-on-error-container shadow-sm transition-colors hover:bg-surface-container-low"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="space-y-space-xl">
              {SECOES.map((secao) => {
                const itens = visiveis.filter((n) => secaoDaData(n.createdAt) === secao);
                if (itens.length === 0) return null;
                const novas = itens.filter((n) => !n.lidaEm).length;
                return (
                  <section key={secao} className="space-y-space-md">
                    <div className="flex items-center gap-space-sm">
                      <h2 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
                        {secao}
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant ${
                          novas > 0 ? "bg-surface-container-high font-semibold" : "bg-surface-container"
                        }`}
                      >
                        {novas > 0
                          ? `${novas} ${novas === 1 ? "nova" : "novas"}`
                          : `${itens.length} ${itens.length === 1 ? "alerta" : "alertas"}`}
                      </span>
                    </div>
                    <div className="space-y-space-sm">
                      {itens.map((n) => {
                        const meta = META_TIPO[n.tipo];
                        const tom = TONS[meta.tom];
                        const lida = Boolean(n.lidaEm);
                        return (
                          <article
                            key={n.id}
                            className="group relative rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all duration-200 hover:shadow-md sm:p-space-lg"
                          >
                            {!lida && (
                              <>
                                <div className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${tom.barra}`} />
                                <span className="sr-only">Não lida.</span>
                              </>
                            )}
                            <div className="flex flex-col items-start justify-between gap-space-md sm:flex-row">
                              <div className="flex min-w-0 items-start gap-space-md">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${lida ? "bg-surface-container-high text-on-surface-variant" : tom.icone}`}>
                                  <Icon name={meta.icone} size={24} />
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                  <h3 className="font-label-md text-label-md font-bold text-on-surface">{n.titulo}</h3>
                                  <p className="font-body-sm text-body-sm text-on-surface-variant">{n.mensagem}</p>
                                  <div className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
                                    <span className={`rounded-full px-2 py-0.5 font-medium ${meta.corSelo}`}>{meta.selo}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-on-surface-variant/80">
                                      <Icon name="schedule" size={14} />
                                      {formatarQuando(n.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-space-sm pt-2">
                                    {n.idGrupo && (
                                      <button
                                        type="button"
                                        onClick={() => navigate(`/grupo/${encodeURIComponent(n.idGrupo!)}`)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3.5 py-1.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary active:scale-95"
                                      >
                                        <Icon name="open_in_new" size={16} />
                                        <span>Abrir grupo</span>
                                      </button>
                                    )}
                                    {!lida && (
                                      <button
                                        type="button"
                                        onClick={() => void marcarLida(n.id)}
                                        className="rounded-lg bg-surface-container-low px-3.5 py-1.5 font-label-md text-label-md text-on-surface transition-all hover:bg-surface-container-high active:scale-95"
                                      >
                                        Marcar como lida
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {visiveis.length === 0 && (
                <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                    <Icon name="notifications_off" size={24} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Nenhuma notificação nesta categoria.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {aviso && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[110] flex items-center gap-2 rounded-xl bg-inverse-surface px-4 py-2.5 font-label-md text-label-md text-inverse-on-surface shadow-xl"
        >
          <Icon name="check_circle" size={18} filled className="text-tertiary-fixed" />
          {aviso}
        </div>
      )}
    </AppShell>
  );
}
