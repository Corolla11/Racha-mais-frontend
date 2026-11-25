import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/icon";
import { money } from "../lib/finance";
import type { Tarefa } from "./tarefa";

interface TarefaConcluidaProps {
  aberta: boolean;
  tarefa: Tarefa | null;
  onFechar: () => void;
  onPagamento?: () => void;
  onReabrir?: (tarefa: Tarefa) => void;
}

export default function TarefaConcluida({
  aberta,
  tarefa,
  onFechar,
  onPagamento,
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
  const todosPagos = despesa ? participantesRateio.every(p => p.statusPagamento === "pago") : true;
  const confirmados = participantesRateio.filter((p) => p.statusPagamento === "pago").length;
  const faltante = despesa ? Math.max(despesa.valorTotal - totalPago, 0) : 0;
  const percentualGauge = despesa ? progresso : 100;
  const circunferencia = 2 * Math.PI * 40;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tarefa concluída: ${tarefa.titulo}`}
      className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto overscroll-contain bg-surface font-body-md text-body-md text-on-surface"
    >
      <div className="w-full max-w-6xl mx-auto px-gutter-mobile sm:px-gutter py-8 flex flex-col gap-8">
        {/* TRILHA DE NAVEGAÇÃO */}
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <nav aria-label="Trilha de navegação" className="flex items-center gap-2 text-on-surface-variant overflow-x-auto whitespace-nowrap min-w-0">
            <Link to="/meus-grupos" className="font-label-sm text-label-sm hover:text-primary transition-colors flex items-center gap-1.5">
              <Icon name="group_work" size={16}/>
              <span>Meus Grupos</span>
            </Link>
            <Icon name="chevron_right" size={16} className="text-outline"/>
            <button type="button" onClick={onFechar} className="font-label-sm text-label-sm hover:text-primary transition-colors">
              {tarefa.grupo}
            </button>
            <Icon name="chevron_right" size={16} className="text-outline"/>
            <button type="button" onClick={onFechar} className="font-label-sm text-label-sm hover:text-primary transition-colors">
              Tarefas
            </button>
            <Icon name="chevron_right" size={16} className="text-outline"/>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold bg-surface-container-high px-2 py-0.5 rounded truncate max-w-[16rem]">
              {tarefa.titulo}
            </span>
          </nav>
          <button
            onClick={onFechar}
            type="button"
            aria-label="Fechar tarefa"
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <Icon name="close" size={22}/>
          </button>
        </div>

        {/* DESTAQUE DE CONCLUSÃO */}
        <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 flex flex-col gap-4 max-w-2xl min-w-0">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold w-fit shadow-sm ${todosPagos ? "bg-emerald-50 text-emerald-800" : "bg-tertiary-fixed text-on-tertiary-fixed"}`}>
              <Icon name={todosPagos ? "verified" : "task_alt"} size={18} filled/>
              <span>{todosPagos ? (despesa ? "Tarefa 100% Concluída & Quitada" : "Tarefa Concluída") : "Tarefa Concluída • Pagamentos pendentes"}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-headline-lg text-headline-lg tracking-tight text-on-surface break-words">
                {tarefa.titulo}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {!despesa
                  ? "Esta tarefa foi concluída sem despesas vinculadas."
                  : todosPagos
                  ? "Todas as cotas foram pagas e registradas como quitadas. O saldo foi equalizado."
                  : "Execução concluída; ainda há pagamentos pendentes."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-3 py-1 rounded-lg">
                <Icon name="calendar_today" size={16} className="text-primary"/>
                Prazo original: {tarefa.prazo}
              </span>
              <span className="inline-flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm bg-surface-container px-3 py-1 rounded-lg">
                <Icon name="verified_user" size={16} className="text-primary"/>
                Execução encerrada por {responsavel?.nome ?? "responsável não definido"}
              </span>
            </div>
          </div>

          <div className="relative z-10 self-center md:self-auto flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="text-surface-variant fill-none" cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8"/>
                <circle
                  className={`fill-none transition-all duration-1000 ease-out ${todosPagos ? "text-emerald-500" : "text-primary-container"}`}
                  cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circunferencia}
                  strokeDashoffset={circunferencia * (1 - percentualGauge / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center" role="progressbar" aria-label="Liquidação da tarefa" aria-valuenow={percentualGauge} aria-valuemin={0} aria-valuemax={100}>
                <Icon name="check_circle" size={28} filled className={todosPagos ? "text-emerald-600" : "text-primary"}/>
                <span className="font-numeric-stat text-numeric-stat text-on-surface font-extrabold leading-none mt-1">{percentualGauge}%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">liquidado</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-gradient-to-br from-primary-container/20 via-tertiary-container/10 to-transparent blur-3xl pointer-events-none"/>
          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent blur-2xl pointer-events-none"/>
        </section>

        {/* MÉTRICAS */}
        {despesa && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <Icon name="payments" size={26}/>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Valor Total</span>
                <span className="font-numeric-stat text-numeric-stat text-on-surface truncate">{money(despesa.valorTotal)}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{despesa.categoria ? `Categoria: ${despesa.categoria}` : "Despesa categorizada"}</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <Icon name="group" size={26}/>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Divisão Igual</span>
                <span className="font-numeric-stat text-numeric-stat text-on-surface truncate">{participantesRateio.length} Membros</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{money(valorIndividual)} por pessoa</span>
              </div>
            </div>
            <div className={`rounded-xl p-5 shadow-sm flex items-center gap-4 ${todosPagos ? "bg-emerald-50" : "bg-surface-container-lowest"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${todosPagos ? "bg-emerald-100 text-emerald-600" : "bg-secondary-fixed text-secondary"}`}>
                <Icon name="savings" size={26}/>
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`font-label-sm text-label-sm uppercase tracking-wider ${todosPagos ? "text-emerald-800" : "text-on-surface-variant"}`}>Total Quitado</span>
                <span className={`font-numeric-stat text-numeric-stat truncate ${todosPagos ? "text-emerald-800" : "text-on-surface"}`}>{money(totalPago)}</span>
                <span className={`font-label-sm text-label-sm font-semibold ${todosPagos ? "text-emerald-700" : "text-secondary"}`}>
                  {todosPagos ? "Zero pendências" : `Faltam ${money(faltante)}`}
                </span>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA PRINCIPAL */}
          <section className="lg:col-span-8 flex flex-col gap-4 min-w-0">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <Icon name="assignment_turned_in" size={22} className="text-primary"/>
                Resumo da execução
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-label-md text-label-md font-bold ${responsavel?.cor ?? "bg-primary-fixed text-on-primary-fixed"}`}>
                  {responsavel?.iniciais ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-label-md text-label-md text-on-surface">{responsavel?.nome ?? "Não definido"}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Responsável pela tarefa</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-label-sm text-label-sm font-semibold text-emerald-800">Executado</span>
              </div>
              <p className="rounded-lg bg-surface-container-low p-4 font-body-sm text-body-sm leading-relaxed text-on-surface-variant whitespace-pre-line">
                {tarefa.descricao || "Nenhuma descrição adicionada."}
              </p>
            </div>

            {despesa && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Auditoria de Cotas &amp; Pagamentos</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Rateio entre os participantes da tarefa</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full text-on-surface font-label-sm text-label-sm font-semibold">
                    <span className={`w-2 h-2 rounded-full ${todosPagos ? "bg-emerald-500" : "bg-tertiary-container"}`}/>
                    <span>{confirmados} de {participantesRateio.length} confirmados</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {participantesRateio.map((participante) => {
                    const pago = participante.statusPagamento === "pago";
                    const parcial = participante.statusPagamento === "parcial";
                    return (
                      <div key={participante.id} className="bg-surface-container-low hover:bg-surface-container rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm font-label-md text-label-md font-bold ${participante.cor ?? "bg-primary-fixed text-on-primary-fixed"}`}>
                            {participante.iniciais}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-label-lg text-label-lg text-on-surface truncate">{participante.nome}</span>
                              {pago ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full">
                                  <Icon name="check" size={14}/> Pago &amp; Confirmado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full">
                                  <Icon name="schedule" size={14}/> {parcial ? "Parcial" : "Pendente"}
                                </span>
                              )}
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <Icon name={participante.id === tarefa.responsavelId ? "credit_card" : "schedule"} size={15} className="text-outline"/>
                              {participante.id === tarefa.responsavelId ? "Responsável pela tarefa" : participante.funcao ?? "Participante"}
                            </span>
                          </div>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold self-end sm:self-center">{money(valorIndividual)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-high" role="progressbar" aria-label="Reembolso e liquidação" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100}>
                  <div style={{ width: `${progresso}%` }} className="h-full rounded-full bg-primary-container"/>
                </div>

                <div className="bg-surface-container p-4 rounded-xl flex items-start gap-3">
                  <Icon name={todosPagos ? "lock" : "info"} size={22} className="text-primary shrink-0 mt-0.5"/>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {todosPagos ? "Registro Imutável em Livro Caixa" : "Reembolso e liquidação"}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {todosPagos
                        ? "Pagamentos registrados como quitados. Todos os participantes confirmaram seus pagamentos individuais."
                        : `Execução concluída; ainda há pagamentos pendentes. ${progresso}% do valor já foi liquidado.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* COLUNA LATERAL */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Comprovante Fiscal</h3>
                <Icon name="receipt" size={20} className="text-primary"/>
              </div>
              {tarefa.comprovantes?.length ? tarefa.comprovantes.map((arquivo) => (
                <div key={arquivo.id} className="w-full rounded-xl bg-surface-container-low p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="description" size={20} className="text-primary shrink-0"/>
                    <div className="min-w-0">
                      <p className="font-label-sm text-label-sm font-bold text-on-surface truncate">{arquivo.nome}</p>
                      {arquivo.descricao && <p className="font-label-sm text-label-sm text-outline">{arquivo.descricao}</p>}
                    </div>
                  </div>
                  {arquivo.url && (
                    <a href={arquivo.url} download={arquivo.nome} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-2 rounded-lg font-label-sm text-label-sm transition-colors">
                      <Icon name="download" size={18}/>
                      <span>Baixar Arquivo Completo</span>
                    </a>
                  )}
                </div>
              )) : (
                <p className="rounded-xl bg-surface-container-low p-4 font-body-sm text-body-sm text-on-surface-variant">Nenhum comprovante anexado.</p>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between gap-2 text-on-surface-variant font-body-sm text-body-sm">
                  <span>Responsável:</span>
                  <span className="font-semibold text-on-surface text-right">{responsavel?.nome ?? "Não definido"}</span>
                </div>
                <div className="flex justify-between gap-2 text-on-surface-variant font-body-sm text-body-sm">
                  <span>Prazo:</span>
                  <span className="font-semibold text-on-surface text-right">{tarefa.prazo}</span>
                </div>
                {despesa?.formaPagamento && (
                  <div className="flex justify-between gap-2 text-on-surface-variant font-body-sm text-body-sm">
                    <span>Pagamento:</span>
                    <span className="font-semibold text-on-surface text-right">{despesa.formaPagamento}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-3">
              <h3 className="font-label-lg text-label-lg text-on-surface">Próximos Passos</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Você pode voltar ao painel do grupo ou conferir os pagamentos desta tarefa.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <button type="button" onClick={onFechar} className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary px-5 py-3 rounded-lg font-label-md text-label-md hover:bg-primary transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(255,140,66,0.35)]">
                  <Icon name="arrow_back" size={20}/>
                  <span>Voltar para o Grupo</span>
                </button>
                {despesa && onPagamento && (
                  <button type="button" onClick={onPagamento} className="w-full flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface px-5 py-3 rounded-lg font-label-md text-label-md transition-all active:scale-[0.98] shadow-sm">
                    <Icon name="receipt_long" size={20}/>
                    <span>Ver pagamentos / Pix</span>
                  </button>
                )}
                {onReabrir && (
                  <button type="button" onClick={() => onReabrir(tarefa)} className="w-full flex items-center justify-center gap-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-5 py-3 rounded-lg font-label-md text-label-md transition-colors">
                    <Icon name="restart_alt" size={20}/>
                    <span>Reabrir tarefa</span>
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
