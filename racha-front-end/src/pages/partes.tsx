import { useEffect, useState, type FormEvent } from "react";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import { Link, useParams } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

type StatusParte =
  | "AGENDADA"
  | "EM_ANDAMENTO"
  | "FINALIZADA"
  | "ATRASADA"
  | "CANCELADA";

type Parte = {
  id: string;
  idUser: string;
  idTarefa: string;
  descricao: string;
  valor: string;
  status: StatusParte;
  user: { id: string; name: string; image: string | null };
};

type AtualizacaoParte = {
  descricao?: string;
  valor?: string;
  status?: StatusParte;
};

const statusDisponiveis: StatusParte[] = [
  "AGENDADA",
  "EM_ANDAMENTO",
  "FINALIZADA",
  "ATRASADA",
  "CANCELADA",
];

export default function Partes() {
  const { idTarefa } = useParams<{ idTarefa: string }>();
  const [partes, setPartes] = useState<Parte[]>([]);
  const [idUser, setIdUser] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!idTarefa) return;
    let ativo = true;

    apiRequest<Parte[]>(`/tarefas/${encodeURIComponent(idTarefa)}/partes`)
      .then((resultado) => {
        if (ativo) setPartes(resultado);
      })
      .catch((error: unknown) => {
        if (!ativo) return;
        setErro(
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar as partes.",
        );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [idTarefa]);

  async function atualizarLista() {
    if (!idTarefa) return;
    setPartes(
      await apiRequest<Parte[]>(
        `/tarefas/${encodeURIComponent(idTarefa)}/partes`,
      ),
    );
  }

  async function criarParte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!idTarefa) return;
    setErro("");
    setMensagem("");
    setEnviando(true);
    try {
      await apiRequest<Parte>(
        `/tarefas/${encodeURIComponent(idTarefa)}/partes`,
        {
          method: "POST",
          body: {
            idUser: idUser.trim(),
            descricao: descricao.trim(),
            valor,
          },
        },
      );
      setIdUser("");
      setDescricao("");
      setValor("");
      setMensagem("Parte criada.");
      await atualizarLista();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a parte.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function atualizarParte(id: string, dados: AtualizacaoParte) {
    if (!idTarefa) return;
    setErro("");
    setMensagem("");
    try {
      await apiRequest<Parte>(`/partes/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: dados,
      });
      setMensagem("Parte atualizada.");
      await atualizarLista();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar a parte.",
      );
    }
  }

  async function removerParte(id: string) {
    setErro("");
    setMensagem("");
    try {
      await apiRequest<void>(`/partes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setMensagem("Parte removida.");
      await atualizarLista();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover a parte.",
      );
    }
  }

  const valorDe = (parte: Parte) => Number(parte.valor) || 0;
  const totalRateado = partes.reduce((soma, parte) => soma + valorDe(parte), 0);
  const finalizadas = partes.filter((parte) => parte.status === "FINALIZADA");
  const totalFinalizado = finalizadas.reduce((soma, parte) => soma + valorDe(parte), 0);
  const emAberto = partes.filter(
    (parte) => parte.status !== "FINALIZADA" && parte.status !== "CANCELADA",
  );
  const totalEmAberto = emAberto.reduce((soma, parte) => soma + valorDe(parte), 0);
  const percentual = (parcial: number) =>
    totalRateado > 0 ? Math.round((parcial / totalRateado) * 100) : 0;
  const atrasadas = partes.filter((parte) => parte.status === "ATRASADA").length;

  return (
    <AppShell title="Rateio da tarefa" bare>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-gutter-mobile py-space-lg sm:px-gutter">
        <nav
          aria-label="Navegação estrutural"
          className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant"
        >
          <Link
            to="/meus-grupos"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Icon name="groups" size={16} />
            Meus Grupos
          </Link>
          <Icon name="chevron_right" size={14} className="text-outline" />
          <span className="font-semibold text-on-surface">Rateio da Tarefa</span>
        </nav>

        <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:flex-row lg:items-center">
          <div className="flex max-w-2xl flex-col gap-space-xs">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                Rateio da tarefa
              </h1>
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                <Icon name="receipt_long" size={14} className="text-primary" />
                <span className="truncate">Tarefa: {idTarefa ?? "não informada"}</span>
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Distribua o valor da tarefa entre os membros do grupo e acompanhe o
              status de cada parte em tempo real.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm font-semibold text-on-surface">
                <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary-container" />
                {finalizadas.length} de {partes.length}{" "}
                {partes.length === 1 ? "Parte Finalizada" : "Partes Finalizadas"} (
                {percentual(totalFinalizado)}%)
              </div>
              {atrasadas > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 font-label-sm text-label-sm font-semibold text-on-primary-fixed-variant">
                  <Icon name="priority_high" size={16} />
                  {atrasadas} {atrasadas === 1 ? "parte atrasada" : "partes atrasadas"}
                </div>
              )}
            </div>
          </div>
        </div>

        {erro && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-error-container/50 p-space-md font-body-sm text-body-sm text-on-error-container"
          >
            <Icon name="error" size={20} className="shrink-0 text-error" />
            {erro}
          </p>
        )}
        {mensagem && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl bg-[#ECFDF5] p-space-md font-body-sm text-body-sm text-[#047857]"
          >
            <Icon name="check_circle" size={20} className="shrink-0" />
            {mensagem}
          </p>
        )}

        <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
          <MetricCard
            titulo="Total Rateado"
            icone="calculate"
            valor={moeda(totalRateado)}
            detalhe={`${partes.length} ${partes.length === 1 ? "parte cadastrada" : "partes cadastradas"}`}
            progresso={partes.length ? 100 : 0}
          />
          <MetricCard
            titulo="Finalizado"
            icone="check_circle"
            valor={moeda(totalFinalizado)}
            detalhe={`${finalizadas.length} ${finalizadas.length === 1 ? "parte finalizada" : "partes finalizadas"} (${percentual(totalFinalizado)}%)`}
            progresso={percentual(totalFinalizado)}
            destaque="primary"
          />
          <MetricCard
            titulo="Em Aberto"
            icone="pending_actions"
            valor={moeda(totalEmAberto)}
            detalhe={`${emAberto.length} ${emAberto.length === 1 ? "parte agendada, em andamento ou atrasada" : "partes agendadas, em andamento ou atrasadas"}`}
            progresso={percentual(totalEmAberto)}
            destaque="tertiary"
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Partes cadastradas
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Status individual por parte rateada
                </p>
              </div>
              <span className="rounded-md bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm font-bold text-on-surface-variant">
                {partes.length} {partes.length === 1 ? "Parte" : "Partes"}
              </span>
            </div>

            {carregando ? (
              <p className="flex items-center gap-2 rounded-xl bg-surface-container-lowest p-space-md font-body-sm text-body-sm text-on-surface-variant shadow-sm">
                <Icon name="progress_activity" size={20} className="animate-spin text-primary" />
                Carregando partes...
              </p>
            ) : partes.length === 0 ? (
              <div className="flex flex-col items-center gap-space-xs rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-primary">
                  <Icon name="receipt_long" size={24} />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Ainda não há partes nesta tarefa.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-space-sm">
                {partes.map((parte) => {
                  const visual = statusVisual[parte.status];
                  return (
                    <li
                      key={parte.id}
                      className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-colors"
                    >
                      <div className="flex items-start justify-between gap-space-sm">
                        <div className="flex min-w-0 items-start gap-space-sm">
                          <div className="relative shrink-0">
                            {parte.user.image ? (
                              <img
                                src={parte.user.image}
                                alt=""
                                className="h-11 w-11 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-[15px] font-bold text-primary">
                                {iniciais(parte.user.name)}
                              </span>
                            )}
                            <span
                              className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm ${visual.selo}`}
                            >
                              <Icon name={visual.icone} size={13} />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-label-lg text-label-lg font-bold text-on-surface">
                                {parte.user.name}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm font-bold ${visual.badge}`}
                              >
                                {visual.rotulo}
                              </span>
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {parte.descricao || "Sem descrição"}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="block font-label-lg text-label-lg font-bold text-on-surface">
                            R${" "}
                            {Number(parte.valor).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className="font-label-sm text-label-sm text-outline">
                            Valor da parte
                          </span>
                        </div>
                      </div>

                      <div className="mt-space-sm flex items-center justify-between gap-space-sm rounded-lg bg-surface-container-low p-space-sm font-body-sm text-body-sm">
                        <span className="flex min-w-0 items-center gap-1.5 text-on-surface-variant">
                          <Icon name="tag" size={16} className="shrink-0 text-tertiary" />
                          <span className="break-all">ID da parte: {parte.id}</span>
                        </span>
                      </div>

                      <div className="mt-space-sm flex flex-col gap-space-xs pt-space-xs sm:flex-row sm:items-end">
                        <div className="flex flex-1 flex-col gap-1">
                          <label
                            htmlFor={`status-${parte.id}`}
                            className="font-label-sm text-label-sm font-semibold text-on-surface-variant"
                          >
                            Status
                          </label>
                          <div className="relative flex items-center">
                            <select
                              id={`status-${parte.id}`}
                              value={parte.status}
                              onChange={(event) =>
                                void atualizarParte(parte.id, {
                                  status: event.target.value as StatusParte,
                                })
                              }
                              className="w-full appearance-none rounded-lg bg-surface-container-low py-2 pl-3 pr-10 font-body-sm text-body-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
                            >
                              {statusDisponiveis.map((status) => (
                                <option key={status} value={status}>
                                  {status.replaceAll("_", " ")}
                                </option>
                              ))}
                            </select>
                            <Icon
                              name="expand_more"
                              size={20}
                              className="pointer-events-none absolute right-3 text-on-surface-variant"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removerParte(parte.id)}
                          className="flex items-center justify-center gap-1 rounded-lg bg-surface-container-high px-space-md py-2 font-label-md text-label-md text-error transition-colors hover:bg-error-container/40"
                        >
                          <Icon name="delete" size={18} />
                          Remover
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-space-md lg:col-span-5">
            <form
              onSubmit={criarParte}
              className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
            >
              <div className="pb-space-xs">
                <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                  Nova parte do rateio
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Adicionar parte
                </h3>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="parte-usuario"
                  className="font-label-md text-label-md text-on-surface"
                >
                  ID do membro responsável <span className="text-error">*</span>
                </label>
                <input
                  id="parte-usuario"
                  required
                  value={idUser}
                  onChange={(event) => setIdUser(event.target.value)}
                  placeholder="ID de um membro do grupo"
                  className={campo}
                />
              </div>
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="parte-valor"
                    className="font-label-md text-label-md text-on-surface"
                  >
                    Valor (R$) <span className="text-error">*</span>
                  </label>
                  <input
                    id="parte-valor"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={valor}
                    onChange={(event) => setValor(event.target.value)}
                    className={campo}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="parte-descricao"
                    className="font-label-md text-label-md text-on-surface"
                  >
                    Descrição
                  </label>
                  <input
                    id="parte-descricao"
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    placeholder="Ex.: cota da hospedagem"
                    className={campo}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-container text-on-primary">
                    <Icon name="verified_user" size={16} />
                  </div>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    Validação automática
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  A pessoa precisa ser membro do grupo. O backend valida permissões e
                  impede que o rateio ultrapasse o total da tarefa.
                </p>
              </div>

              <button
                type="submit"
                disabled={enviando || !idTarefa}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-space-md py-3 font-label-lg text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="add_circle" size={20} />
                {enviando ? "Salvando..." : "Adicionar parte"}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:flex-row">
          <div className="flex items-center gap-space-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
              <Icon name="history" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                Histórico & Transparência
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Cada parte criada, atualizada ou removida fica registrada no grupo e
                visível para todos os participantes.
              </p>
            </div>
          </div>
          <Link
            to="/meus-grupos"
            className="flex items-center gap-1 whitespace-nowrap font-label-md text-label-md font-semibold text-primary hover:underline"
          >
            Voltar aos grupos
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

const campo =
  "w-full rounded-lg bg-surface-container-low px-4 py-2.5 font-body-md text-body-md text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container";

const statusVisual: Record<
  StatusParte,
  { rotulo: string; icone: string; badge: string; selo: string }
> = {
  AGENDADA: {
    rotulo: "Agendada",
    icone: "event",
    badge: "bg-surface-container-high text-on-surface-variant",
    selo: "bg-surface-container-high text-on-surface-variant",
  },
  EM_ANDAMENTO: {
    rotulo: "Em andamento",
    icone: "hourglass_top",
    badge: "bg-tertiary-fixed text-on-tertiary-fixed",
    selo: "bg-tertiary-container text-on-tertiary",
  },
  FINALIZADA: {
    rotulo: "Finalizada",
    icone: "check",
    badge: "bg-surface-container text-on-surface",
    selo: "bg-surface-container-high text-primary",
  },
  ATRASADA: {
    rotulo: "Atrasada",
    icone: "priority_high",
    badge: "bg-error-container text-on-error-container",
    selo: "bg-error text-on-error",
  },
  CANCELADA: {
    rotulo: "Cancelada",
    icone: "close",
    badge: "bg-surface-container text-outline",
    selo: "bg-surface-container text-outline",
  },
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function iniciais(nome: string) {
  return (
    nome
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function MetricCard({
  titulo,
  icone,
  valor,
  detalhe,
  progresso,
  destaque,
}: {
  titulo: string;
  icone: string;
  valor: string;
  detalhe: string;
  progresso: number;
  destaque?: "primary" | "tertiary";
}) {
  const tituloCor = destaque === "tertiary" ? "text-tertiary" : "text-outline";
  const iconeCor =
    destaque === "tertiary"
      ? "bg-tertiary-fixed text-on-tertiary-fixed"
      : destaque === "primary"
        ? "bg-surface-container text-primary"
        : "bg-surface-container-low text-on-surface-variant";
  const valorCor =
    destaque === "tertiary"
      ? "text-tertiary"
      : destaque === "primary"
        ? "text-primary"
        : "text-on-surface";
  return (
    <div
      className={`flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm ${destaque === "tertiary" ? "bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-surface-container-low" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-label-sm text-label-sm font-semibold uppercase tracking-wider ${tituloCor}`}
        >
          {titulo}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconeCor}`}>
          <Icon name={icone} size={18} />
        </div>
      </div>
      <div className="mt-space-sm">
        <div className={`font-numeric-stat text-numeric-stat font-bold ${valorCor}`}>
          {valor}
        </div>
        <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{detalhe}</p>
      </div>
      <div className="mt-space-md h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className={`h-full rounded-full ${destaque === "tertiary" ? "bg-tertiary-container" : "bg-primary-container"}`}
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
}
