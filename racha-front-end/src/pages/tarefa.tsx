
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  ListChecks,
  Paperclip,
  Pencil,
  Trash2,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

export type StatusTarefa = "pendente" | "andamento" | "concluida";
export type StatusPagamento = "pago" | "pendente" | "parcial";

export interface ParticipanteTarefa {
  id: string;
  nome: string;
  iniciais: string;
  funcao?: string;
  cor?: string;
  statusPagamento?: StatusPagamento;
  valorPago?: number;
}

export interface DespesaTarefa {
  valorTotal: number;
  descricao?: string;
  categoria?: string;
  formaPagamento?: string;
  participantesIds: string[];
}

export interface ComprovanteTarefa {
  id: string;
  nome: string;
  descricao?: string;
  url?: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  grupo: string;
  status: StatusTarefa;
  descricao: string;
  responsavelId: string;
  prazo: string;
  participantes: ParticipanteTarefa[];
  despesa?: DespesaTarefa;
  comprovantes?: ComprovanteTarefa[];
  historico?: string[];
}

interface VisualizarTarefaProps {
  aberta: boolean;
  tarefa: Tarefa | null;
  onFechar: () => void;
  onPagamento?: () => void;
  onEditar?: (tarefa: Tarefa) => void;
  onExcluir?: (tarefa: Tarefa) => void;
  onConcluir?: (tarefa: Tarefa) => void;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Avatar({ participante }: { participante: ParticipanteTarefa }) {
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${participante.cor ?? "bg-orange-100 text-orange-600"}`}>
      {participante.iniciais}
    </div>
  );
}

export default function VisualizarTarefa({
  aberta,
  tarefa,
  onFechar,
  onPagamento,
  onEditar,
  onExcluir,
  onConcluir,
}: VisualizarTarefaProps) {
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [concluidaLocalmente, setConcluidaLocalmente] = useState(false);

  useEffect(() => {
    if (!aberta) return;

    const overflowAnterior = document.body.style.overflow;
    const paddingAnterior = document.body.style.paddingRight;
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    const paddingAtual = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
    if (larguraBarra > 0) {
      document.body.style.paddingRight = `${paddingAtual + larguraBarra}px`;
    }
    document.body.style.overflow = "hidden";

    function fecharEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onFechar();
    }

    window.addEventListener("keydown", fecharEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.body.style.paddingRight = paddingAnterior;
      window.removeEventListener("keydown", fecharEscape);
    };
  }, [aberta, onFechar]);

  if (!aberta || !tarefa) return null;

  const statusAtual = concluidaLocalmente ? "concluida" : tarefa.status;
  const responsavel = tarefa.participantes.find(
    (p) => p.id === tarefa.responsavelId
  );

  const despesa = tarefa.despesa;
  const participantesRateio = despesa
    ? tarefa.participantes.filter((p) =>
        despesa.participantesIds.includes(p.id)
      )
    : [];

  const valorIndividual =
    despesa && participantesRateio.length
      ? despesa.valorTotal / participantesRateio.length
      : 0;

  const totalPago = participantesRateio.reduce(
    (total, p) =>
      total + Math.min(Math.max(p.valorPago ?? 0, 0), valorIndividual),
    0
  );

  const restante = despesa
    ? Math.max(despesa.valorTotal - totalPago, 0)
    : 0;

  const progresso =
    despesa && despesa.valorTotal > 0
      ? Math.min((totalPago / despesa.valorTotal) * 100, 100)
      : 0;

  function concluir() {
    if (!onConcluir) return;
    if (statusAtual === "concluida") return;
    setConcluidaLocalmente(true);
    onConcluir?.(tarefa!);
  }

  function excluir() {
    if (!onExcluir) return;
    if (!confirmarExclusao) {
      setConfirmarExclusao(true);
      return;
    }

    if (onExcluir) onExcluir(tarefa!);
    else onFechar();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-slate-950/50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes da tarefa ${tarefa.titulo}`}
        className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F8FAFD] shadow-2xl sm:max-w-[650px]"
      >
        {/* CABEÇALHO */}
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="truncate text-ui-caption font-semibold uppercase tracking-wide text-orange-600">
              {tarefa.grupo} / Detalhes da tarefa
            </span>

            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar tarefa"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-ui-page-title font-bold text-slate-900 text-ui-page-title">
                {tarefa.titulo}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Informações e acompanhamento da tarefa
              </p>
            </div>

            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusAtual === "concluida"
                ? "bg-green-100 text-green-700"
                : statusAtual === "andamento"
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {statusAtual === "concluida"
                ? "Concluída"
                : statusAtual === "andamento"
                ? "Em andamento"
                : "Pendente"}
            </span>
          </div>
        </header>

        {/* CONTEÚDO — SCROLL ÚNICO */}
        <main className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-[#EDF3FF] p-4">
              {responsavel ? (
                <Avatar participante={responsavel} />
              ) : (
                <UserRound size={24} className="text-orange-500" />
              )}

              <div className="min-w-0">
                <p className="text-ui-caption text-slate-500">
                  Responsável principal
                </p>
                <p className="truncate text-sm font-bold">
                  {responsavel?.nome ?? "Não definido"}
                </p>
                <p className="text-ui-caption text-orange-600">
                  Organização e acompanhamento
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-[#EDF3FF] p-4">
              <CalendarDays size={21} className="text-slate-500" />
              <div>
                <p className="text-ui-caption text-slate-500">
                  Prazo de entrega
                </p>
                <p className="text-sm font-bold">{tarefa.prazo}</p>
              </div>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-ui-section-title font-bold">
              <ListChecks size={18} className="text-orange-500" />
              Instruções e Notas da Tarefa
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {tarefa.descricao || "Nenhuma descrição adicionada."}
            </p>
          </section>

          {/* PARTICIPANTES */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-ui-section-title font-bold">
              <Users size={18} className="text-slate-500" />
              Participantes da Tarefa
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-ui-caption">
                {tarefa.participantes.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {tarefa.participantes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <Avatar participante={p} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{p.nome}</p>
                    <p className="text-ui-caption text-slate-500">
                      {p.funcao ?? "Membro"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DESPESA */}
          {despesa ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                    <Wallet size={21} />
                  </div>
                  <div>
                    <h2 className="text-ui-section-title font-bold">Despesa Vinculada</h2>
                    <p className="text-xs text-slate-500">
                      {despesa.descricao ?? "Rateio da tarefa"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-ui-caption uppercase text-slate-400">
                    Valor total
                  </p>
                  <p className="text-xl font-extrabold text-orange-600">
                    {moeda(despesa.valorTotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#EDF3FF] p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-slate-500" />
                    <div>
                      <p className="text-ui-caption text-slate-500">
                        Categoria / Pagamento
                      </p>
                      <p className="text-xs font-semibold">
                        {despesa.categoria ?? "Geral"} /{" "}
                        {despesa.formaPagamento ?? "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-ui-caption text-slate-500">
                      Valor por participante
                    </p>
                    <p className="text-sm font-bold">
                      {moeda(valorIndividual)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs">
                    <span className="font-semibold">
                      Progresso dos pagamentos
                    </span>
                    <span className="text-slate-500">
                      Restante: {moeda(restante)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-ui-caption text-slate-500">
                    {moeda(totalPago)} de {moeda(despesa.valorTotal)} pagos
                  </p>
                </div>

                <div className="space-y-2">
                  {participantesRateio.map((p) => {
                    const pago = Math.min(
                      Math.max(p.valorPago ?? 0, 0),
                      valorIndividual
                    );
                    const quitado = valorIndividual - pago < 0.01;

                    return (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#EDF3FF] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar participante={p} />
                          <div>
                            <p className="text-xs font-bold">{p.nome}</p>
                            <p className="text-ui-caption text-slate-500">
                              Cota: {moeda(valorIndividual)}
                            </p>
                          </div>
                        </div>

                        <span className={`rounded-md px-2 py-1 text-ui-caption font-semibold ${
                          quitado
                            ? "bg-green-100 text-green-700"
                            : pago > 0
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {quitado ? "Pago" : pago > 0 ? "Parcial" : "Pendente"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
              <p className="text-sm font-semibold">
                Nenhuma despesa vinculada
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Esta tarefa não possui valores para dividir.
              </p>
            </section>
          )}

          {/* COMPROVANTES */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-ui-section-title font-bold">
              <Paperclip size={18} className="text-orange-500" />
              Comprovantes e Arquivos
            </h2>

            {tarefa.comprovantes?.length ? (
              <div className="space-y-2">
                {tarefa.comprovantes.map((arquivo) => (
                  <div
                    key={arquivo.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#EDF3FF] p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText size={19} className="text-orange-500" />
                      <span className="truncate text-xs font-semibold">
                        {arquivo.nome}
                      </span>
                    </div>

                    {arquivo.url && (
                      <a
                        href={arquivo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-orange-600"
                      >
                        Abrir
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Nenhum arquivo anexado a esta tarefa.
              </p>
            )}
          </section>

          {/* HISTÓRICO */}
          <section className="pb-3">
            <h2 className="mb-3 flex items-center gap-2 text-ui-section-title font-bold">
              <Clock3 size={17} className="text-slate-500" />
              Histórico da Tarefa
            </h2>

            {tarefa.historico?.length ? (
              <div className="space-y-2">
                {tarefa.historico.map((evento, indice) => (
                  <p key={indice} className="text-xs text-slate-500">
                    <span className="mr-2 text-orange-500">•</span>
                    {evento}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Nenhum evento registrado.
              </p>
            )}
          </section>
        </main>

        {/* RODAPÉ FIXO */}
        <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-8">
          {confirmarExclusao && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-700">
                <AlertCircle size={17} />
                Deseja realmente excluir esta tarefa?
              </div>
              <button
                type="button"
                onClick={() => setConfirmarExclusao(false)}
                className="text-xs font-semibold text-slate-600 underline"
              >
                Cancelar
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
                onClick={excluir}
                disabled={!onExcluir}
              className={`ui-button ui-button--md ${`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                confirmarExclusao
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              }`}`}
            >
              <Trash2 size={16} />
              {confirmarExclusao ? "Confirmar exclusão" : "Excluir tarefa"}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {despesa && onPagamento && <button className="racha-primary" onClick={onPagamento}>Ver pagamentos / Pix</button>}
              <button
                type="button"
                onClick={() => onEditar?.(tarefa!)}
                disabled={!onEditar}
                className="ui-button ui-button--md flex items-center gap-2 rounded-lg bg-[#EDF3FF] px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-100 disabled:opacity-40"
              >
                <Pencil size={16} />
                Editar Tarefa
              </button>

              {statusAtual === "concluida" ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-xs font-bold text-green-700">
                  <CheckCircle2 size={17} />
                  Tarefa concluída
                </div>
              ) : (
                <button
                  type="button"
                  onClick={concluir}
                  disabled={!onConcluir}
                  className="ui-button ui-button--md flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#EA580C]"
                >
                  <CheckCircle2 size={17} />
                  Marcar como concluída
                </button>
              )}
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
