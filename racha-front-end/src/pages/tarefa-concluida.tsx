import { useEffect } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  RotateCcw,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { Tarefa } from "./tarefa";

interface TarefaConcluidaProps {
  aberta: boolean;
  tarefa: Tarefa | null;
  onFechar: () => void;
  onReabrir?: (tarefa: Tarefa) => void;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TarefaConcluida({
  aberta,
  tarefa,
  onFechar,
  onReabrir,
}: TarefaConcluidaProps) {
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

  if (!aberta || !tarefa || tarefa.status !== "concluida") return null;

  const responsavel = tarefa.participantes.find((p) => p.id === tarefa.responsavelId);
  const despesa = tarefa.despesa;
  const participantesRateio = despesa
    ? tarefa.participantes.filter((p) => despesa.participantesIds.includes(p.id))
    : [];
  const valorIndividual = despesa && participantesRateio.length
    ? despesa.valorTotal / participantesRateio.length
    : 0;
  const totalPago = participantesRateio.reduce(
    (total, participante) => total + Math.min(Math.max(participante.valorPago ?? 0, 0), valorIndividual),
    0
  );
  const progresso = despesa && despesa.valorTotal > 0
    ? Math.min(Math.round((totalPago / despesa.valorTotal) * 100), 100)
    : 0;
  const todosPagos = despesa ? progresso === 100 : true;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Tarefa concluída: ${tarefa.titulo}`}
        className="flex max-h-[94dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-[#F8FAFD] shadow-2xl"
      >
        <header className="shrink-0 border-b border-slate-200 bg-[#EDF3FF] px-5 py-5 sm:px-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {tarefa.grupo}
            </span>
            <button onClick={onFechar} type="button" aria-label="Fechar tarefa" className="rounded-lg p-2 text-slate-500 hover:bg-white">
              <X size={20} />
            </button>
          </div>
          <h2 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl">{tarefa.titulo}</h2>
          <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-white p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={23} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800">Tarefa concluída</p>
              <p className="text-xs text-slate-500">Execução encerrada por {responsavel?.nome ?? "responsável não definido"}</p>
            </div>
            <span className="rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Concluída</span>
          </div>
        </header>

        <main className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          <section>
            <div className="mb-3 flex items-center gap-2 text-slate-800">
              <ClipboardCheck className="text-orange-500" size={19} />
              <h3 className="font-bold">Resumo da execução</h3>
            </div>
            <div className="space-y-3 rounded-xl bg-[#EDF3FF] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                  {responsavel?.nome.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{responsavel?.nome ?? "Não definido"}</p>
                  <p className="text-xs text-slate-500">Responsável pela tarefa</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Executado</span>
              </div>
              <p className="rounded-lg bg-white p-4 text-sm leading-relaxed text-slate-600">{tarefa.descricao}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarCheck size={15} /> Prazo original: {tarefa.prazo}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Wallet size={19} className="text-orange-500" />
                  <h3 className="font-bold text-slate-800">Acerto financeiro da tarefa</h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">Rateio entre os participantes</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-slate-500">Valor total</p>
                <p className="text-2xl font-extrabold text-slate-900">{moeda(despesa?.valorTotal ?? 0)}</p>
              </div>
            </div>

            {despesa ? (
              <>
                <div className="mb-4 rounded-xl bg-[#EDF3FF] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="text-slate-700">Reembolso e liquidação</span>
                    <span className="text-orange-600">{progresso}% completo</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100}>
                    <div style={{ width: `${progresso}%` }} className="h-full rounded-full bg-orange-500" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {todosPagos ? "Pagamentos registrados como quitados." : "Execução concluída; ainda há pagamentos pendentes."}
                  </p>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <Users size={17} className="text-orange-500" />
                  <h4 className="text-sm font-bold text-slate-800">Participantes do rateio</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {participantesRateio.map((participante) => (
                    <div key={participante.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        {participante.iniciais}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{participante.nome}</p>
                        <p className="text-xs text-slate-500">{moeda(valorIndividual)}</p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${participante.statusPagamento === "pago" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {participante.statusPagamento === "pago" ? "Pago" : participante.statusPagamento === "parcial" ? "Parcial" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">Esta tarefa foi concluída sem despesas vinculadas.</p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <FileText size={19} className="text-orange-500" />
              <h3 className="font-bold text-slate-800">Comprovantes anexados</h3>
            </div>
            {tarefa.comprovantes?.length ? tarefa.comprovantes.map((arquivo) => (
              <div key={arquivo.id} className="mb-2 flex items-center gap-3 rounded-xl bg-[#EDF3FF] p-4">
                <FileText className="shrink-0 text-orange-500" size={22} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{arquivo.nome}</p>
                  <p className="text-xs text-slate-500">{arquivo.descricao}</p>
                </div>
                {arquivo.url && (
                  <a href={arquivo.url} download={arquivo.nome} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600">
                    <Download size={15} /> Baixar
                  </a>
                )}
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Nenhum comprovante anexado.</p>
            )}
          </section>
        </main>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-[#EDF3FF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button type="button" onClick={() => onReabrir?.(tarefa)} disabled={!onReabrir} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-40">
            <RotateCcw size={16} /> Reabrir tarefa
          </button>
          <button type="button" onClick={onFechar} className="flex items-center justify-center gap-2 rounded-lg bg-[#F97316] px-6 py-3 text-sm font-semibold text-white hover:bg-[#EA580C]">
            <ArrowLeft size={17} /> Voltar para o grupo
          </button>
        </footer>
      </section>
    </div>
  );
}
