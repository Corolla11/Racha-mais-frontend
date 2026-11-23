
import { useEffect, useState } from "react";
import Icon from "../components/icon";
import Link from "../components/app-link";

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
  /** Participante que representa o usuário atual (destaca "Você" e "Sua parte"). */
  usuarioId?: string;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function numero(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const corPadrao = "bg-primary-fixed text-on-primary-fixed";

function Avatar({ participante, tamanho = "w-11 h-11 text-label-lg" }: { participante: ParticipanteTarefa; tamanho?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${tamanho} ${participante.cor ?? corPadrao}`}>
      {participante.iniciais}
    </div>
  );
}

const statusTarefa: Record<StatusTarefa, { texto: string; icone: string }> = {
  concluida: { texto: "Atividade Concluída", icone: "check_circle" },
  andamento: { texto: "Em andamento", icone: "sync" },
  pendente: { texto: "Pendente", icone: "hourglass_empty" },
};

function situacaoPagamento(pago: number, cota: number): StatusPagamento {
  if (cota - pago < 0.01) return "pago";
  return pago > 0 ? "parcial" : "pendente";
}

function ChipPagamento({ situacao }: { situacao: StatusPagamento }) {
  if (situacao === "pago") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-semibold">
        <Icon name="verified" size={16} filled className="text-primary"/>
        Pago
      </span>
    );
  }
  if (situacao === "parcial") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
        <Icon name="hourglass_top" size={16}/>
        Parcial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
      <span className="w-2 h-2 rounded-full bg-error"/>
      Pendente
    </span>
  );
}

function ListaComprovantes({ comprovantes }: { comprovantes?: ComprovanteTarefa[] }) {
  if (!comprovantes?.length) {
    return (
      <div className="flex items-center gap-space-md p-space-md rounded-lg bg-surface-container-low text-on-surface-variant">
        <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
          <Icon name="receipt_long" size={24} className="text-outline"/>
        </div>
        <span className="font-body-sm text-body-sm">Nenhum arquivo anexado a esta tarefa.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      {comprovantes.map((arquivo) => (
        <div key={arquivo.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="w-14 h-14 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 shadow-sm text-primary">
              <Icon name="description" size={26}/>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <Icon name="receipt_long" size={16} className="text-primary"/>
                <span className="font-label-md text-label-md text-on-surface truncate">{arquivo.nome}</span>
              </div>
              {arquivo.descricao && <span className="font-body-sm text-body-sm text-outline">{arquivo.descricao}</span>}
            </div>
          </div>
          {arquivo.url && (
            <div className="flex items-center gap-space-xs shrink-0">
              <a href={arquivo.url} target="_blank" rel="noopener noreferrer" className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface text-on-surface font-label-md text-label-md shadow-sm transition-colors flex items-center gap-1">
                <Icon name="visibility" size={16}/>
                Visualizar
              </a>
              <a href={arquivo.url} download={arquivo.nome} target="_blank" rel="noopener noreferrer" aria-label="Baixar comprovante" className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface text-on-surface-variant transition-colors shadow-sm flex">
                <Icon name="download" size={18}/>
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Historico({ eventos }: { eventos?: string[] }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
      <h2 className="font-label-lg text-label-lg text-on-surface font-bold flex items-center gap-2">
        <Icon name="history" size={20} className="text-primary"/>
        Histórico da Tarefa
      </h2>
      {eventos?.length ? (
        <ol className="flex flex-col gap-space-md pl-2 border-l-2 border-surface-container-high ml-2 font-body-sm text-body-sm">
          {eventos.map((evento, indice) => (
            <li key={indice} className="relative pl-space-md">
              <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-lowest ${indice === eventos.length - 1 ? "bg-primary" : "bg-surface-container-highest"}`}/>
              <p className="text-on-surface font-medium">{evento}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Nenhum evento registrado.</p>
      )}
    </section>
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
  usuarioId,
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
  // Sem ações de administração, a tela é exibida em modo somente leitura (visão do membro).
  const somenteLeitura = !onEditar && !onConcluir && !onExcluir;

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

  const pagoDe = (p: ParticipanteTarefa) => Math.min(Math.max(p.valorPago ?? 0, 0), valorIndividual);
  const quitados = participantesRateio.filter((p) => situacaoPagamento(pagoDe(p), valorIndividual) === "pago").length;
  const usuario = usuarioId ? participantesRateio.find((p) => p.id === usuarioId) : undefined;
  const situacaoUsuario = usuario ? situacaoPagamento(pagoDe(usuario), valorIndividual) : undefined;
  const pendenteUsuario = usuario ? Math.max(valorIndividual - pagoDe(usuario), 0) : 0;
  const status = statusTarefa[statusAtual];

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

  const chipStatus = (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
      <Icon name={status.icone} size={15} filled={statusAtual === "concluida"} className="text-primary"/>
      {status.texto}
    </span>
  );

  const botaoVoltar = (
    <button
      type="button"
      onClick={onFechar}
      aria-label="Fechar tarefa"
      className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container px-space-md py-space-sm rounded-xl transition-colors font-label-md text-label-md shadow-sm"
    >
      <Icon name="arrow_back" size={18}/>
      <span>Voltar ao Grupo</span>
    </button>
  );

  /* Lista de participantes / liquidações */
  const linhasParticipantes = despesa ? (
    <div className="flex flex-col gap-space-sm">
      {participantesRateio.map((p) => {
        const pago = pagoDe(p);
        const situacao = situacaoPagamento(pago, valorIndividual);
        const ehUsuario = p.id === usuarioId;
        const ehResponsavel = p.id === tarefa.responsavelId;
        return (
          <div
            key={p.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl gap-space-sm transition-colors ${ehUsuario ? "bg-surface-container-high/60" : "bg-surface-container-low hover:bg-surface-container"}`}
          >
            <div className="flex items-center gap-space-md min-w-0">
              <div className="relative">
                <Avatar participante={p}/>
                {ehResponsavel && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm" title="Responsável">
                    <Icon name="shopping_cart" size={13}/>
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-label-lg text-label-lg text-on-surface truncate ${ehUsuario ? "font-bold" : "font-semibold"}`}>{p.nome}</span>
                  {ehUsuario && <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">Você</span>}
                  {ehResponsavel && <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">Responsável</span>}
                </div>
                {situacao === "pago" ? (
                  <span className="font-body-sm text-body-sm text-outline">Cota liquidada</span>
                ) : situacao === "parcial" ? (
                  <span className="font-body-sm text-body-sm text-tertiary">Pagamento parcial de {moeda(pago)}</span>
                ) : (
                  <span className={`font-body-sm text-body-sm font-medium flex items-center gap-1 ${ehUsuario ? "text-secondary" : "text-on-surface-variant"}`}>
                    <Icon name="error_outline" size={16}/>
                    Pagamento ainda não realizado
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-space-lg sm:text-right pt-2 sm:pt-0">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">{situacao === "pago" ? "Cota liquidada" : ehUsuario ? "Sua parte" : "Cota"}</span>
                <span className={`font-label-lg text-label-lg font-bold ${ehUsuario && situacao !== "pago" ? "text-secondary" : "text-on-surface"}`}>{moeda(valorIndividual)}</span>
              </div>
              {ehUsuario && situacao !== "pago" && onPagamento ? (
                <button
                  type="button"
                  onClick={onPagamento}
                  className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <Icon name="qr_code_2" size={18}/>
                  Pagar com Pix
                </button>
              ) : (
                <ChipPagamento situacao={situacao}/>
              )}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
      {tarefa.participantes.map((p) => (
        <div key={p.id} className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low">
          <Avatar participante={p}/>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface truncate">
              {p.nome}{p.id === usuarioId && " (Você)"}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{p.funcao ?? "Membro"}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const barraProgresso = (altura: string) => (
    <div className={`w-full ${altura} rounded-full bg-surface-container-high overflow-hidden flex`} role="progressbar" aria-label="Arrecadação da tarefa" aria-valuenow={Math.round(progresso)} aria-valuemin={0} aria-valuemax={100}>
      <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: `${progresso}%` }}/>
    </div>
  );

  const semDespesa = (
    <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low">
      <Icon name="info" size={20} className="text-tertiary shrink-0"/>
      <div>
        <p className="font-label-md text-label-md text-on-surface">Nenhuma despesa vinculada</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Esta tarefa não possui valores para dividir.</p>
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes da tarefa ${tarefa.titulo}`}
      className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto overscroll-contain bg-surface font-body-md text-body-md text-on-surface"
    >
      <div className="max-w-6xl mx-auto px-gutter-mobile sm:px-gutter py-space-lg flex flex-col gap-space-lg">
        {somenteLeitura ? (
          /* BARRA SUPERIOR — VISÃO DO MEMBRO */
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            {botaoVoltar}
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm shadow-sm">
              <Icon name="lock" size={16} filled className="text-tertiary"/>
              <span className="font-semibold">Modo Somente Leitura</span>
              <span className="text-on-surface-variant font-normal">• Participante</span>
            </div>
          </div>
        ) : (
          /* TRILHA DE NAVEGAÇÃO — VISÃO DO ADMINISTRADOR */
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm text-outline">
              <Link to="/meus-grupos" className="hover:text-primary transition-colors flex items-center gap-1">
                <Icon name="groups" size={16}/>
                <span>Meus Grupos</span>
              </Link>
              <Icon name="chevron_right" size={14} className="text-outline-variant"/>
              <button type="button" onClick={onFechar} className="hover:text-primary transition-colors font-medium text-on-surface-variant">
                {tarefa.grupo}
              </button>
              <Icon name="chevron_right" size={14} className="text-outline-variant"/>
              <span className="text-primary font-semibold">Detalhes da Tarefa</span>
            </nav>
            {botaoVoltar}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
            {somenteLeitura ? (
              <>
                {/* CABEÇALHO DA TAREFA — MEMBRO */}
                <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"/>
                  <div className="flex flex-wrap items-center gap-space-sm relative">
                    {despesa && (
                      <span className="px-space-sm py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                        {despesa.categoria ?? "Geral"}
                      </span>
                    )}
                    <span className="px-space-sm py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                      Racha em {despesa ? participantesRateio.length : tarefa.participantes.length} pessoas
                    </span>
                    {chipStatus}
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight leading-snug relative break-words">
                    {tarefa.titulo}
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs relative">
                    <div className="flex items-center gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      {responsavel ? (
                        <Avatar participante={responsavel} tamanho="w-12 h-12 text-label-md"/>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                          <Icon name="person" size={24}/>
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface truncate">{responsavel?.nome ?? "Não definido"}</span>
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
                          <Icon name="shopping_cart" size={14}/>
                          Responsável designado
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-md bg-surface-container-low p-space-md rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                        <Icon name="event" size={24}/>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface">{tarefa.prazo}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                          <Icon name="schedule" size={14}/> Prazo de entrega
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-space-md text-on-surface-variant font-body-md text-body-md leading-relaxed whitespace-pre-line relative">
                    {tarefa.descricao || "Nenhuma descrição adicionada."}
                  </div>
                </article>

                {/* RATEIO — MEMBRO */}
                <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex flex-col">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">{despesa ? "Rateio dos Participantes" : "Participantes da Tarefa"}</h2>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {despesa
                          ? `Divisão igualitária de ${participantesRateio.length} cotas (${moeda(valorIndividual)} cada)`
                          : `${tarefa.participantes.length} participantes envolvidos`}
                      </span>
                    </div>
                    {despesa && (
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant">
                        {quitados} de {participantesRateio.length} quitados
                      </span>
                    )}
                  </div>
                  {linhasParticipantes}
                  {!despesa && semDespesa}
                </section>

                {/* COMPROVANTES — MEMBRO */}
                <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex flex-col">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Comprovantes &amp; Notas Fiscais</h2>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Arquivos anexados a esta tarefa</span>
                  </div>
                  <ListaComprovantes comprovantes={tarefa.comprovantes}/>
                </section>
              </>
            ) : (
              <>
                {/* CABEÇALHO DA TAREFA — ADMINISTRADOR */}
                <article className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
                  <div className="flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      {despesa && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                          <Icon name="sell" size={15} className="text-primary"/>
                          {despesa.categoria ?? "Geral"}
                        </span>
                      )}
                      {chipStatus}
                      {despesa && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"/>
                          {Math.round(progresso)}% Quitado
                        </span>
                      )}
                    </div>
                    <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                      <Icon name="event" size={14}/>
                      Prazo: {tarefa.prazo}
                    </span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight break-words">
                      {tarefa.titulo}
                    </h1>
                    <div className="flex items-center gap-space-sm pt-1">
                      {responsavel && <Avatar participante={responsavel} tamanho="w-7 h-7 text-[13px]"/>}
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {responsavel
                          ? <>Organizada por <span className="font-semibold text-on-surface">{responsavel.nome}</span></>
                          : "Responsável não definido"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-space-md text-on-surface-variant font-body-md text-body-md leading-relaxed whitespace-pre-line">
                    {tarefa.descricao || "Nenhuma descrição adicionada."}
                  </div>
                  <ListaComprovantes comprovantes={tarefa.comprovantes}/>
                </article>

                {/* RATEIO — ADMINISTRADOR */}
                <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-lg">
                  {despesa ? (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded-xl">
                        <div className="flex items-center gap-space-md">
                          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                            <Icon name="calculate" size={26}/>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Cálculo de Divisão</span>
                            <span className="font-numeric-stat text-numeric-stat text-on-surface font-bold">{moeda(despesa.valorTotal)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-md text-outline">
                          <Icon name="pie_chart" size={20} className="hidden sm:block"/>
                          <div className="flex flex-col sm:text-right">
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{participantesRateio.length} participantes iguais</span>
                            <span className="font-label-lg text-label-lg font-bold text-primary">
                              {moeda(valorIndividual)} <span className="font-normal text-outline text-[14px]">/ pessoa</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-1 font-body-sm text-body-sm">
                          <span className="text-on-surface-variant">Arrecadação do grupo</span>
                          <span className="text-on-surface font-semibold">
                            {moeda(totalPago)} de {moeda(despesa.valorTotal)} quitados ({quitados}/{participantesRateio.length})
                          </span>
                        </div>
                        {barraProgresso("h-2.5")}
                      </div>

                      <div className="flex flex-col gap-space-xs">
                        <h2 className="font-label-lg text-label-lg text-on-surface font-bold pb-1 flex flex-wrap items-center justify-between gap-1">
                          <span>Membros e Liquidações</span>
                          <span className="font-body-sm text-body-sm text-outline font-normal">
                            {despesa.descricao ?? "Rateio da tarefa"} • {despesa.formaPagamento ?? "Pagamento não informado"}
                          </span>
                        </h2>
                        <div className="pt-space-xs">{linhasParticipantes}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="font-label-lg text-label-lg text-on-surface font-bold flex items-center gap-2">
                        <Icon name="group" size={20} className="text-primary"/>
                        Participantes da Tarefa
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm">{tarefa.participantes.length}</span>
                      </h2>
                      {linhasParticipantes}
                      {semDespesa}
                    </>
                  )}
                </section>
              </>
            )}

            <Historico eventos={tarefa.historico}/>
          </div>

          {/* COLUNA LATERAL */}
          <aside className="lg:col-span-4 flex flex-col gap-space-lg">
            {somenteLeitura ? (
              <>
                {/* SEU PAGAMENTO — MEMBRO */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="w-full flex items-center justify-between">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Seu Pagamento</span>
                    {situacaoUsuario && (
                      <span className={`px-space-xs py-0.5 rounded font-label-sm text-label-sm font-semibold ${situacaoUsuario === "pago" ? "bg-emerald-100 text-emerald-800" : "bg-error-container text-on-error-container"}`}>
                        {situacaoUsuario === "pago" ? "Pago" : situacaoUsuario === "parcial" ? "Parcial" : "Pendente"}
                      </span>
                    )}
                  </div>
                  {usuario && despesa ? (
                    <div className="flex flex-col gap-space-xs pb-space-sm">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sua parte nesta tarefa:</span>
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-headline-md text-headline-md text-primary font-bold">R$</span>
                        <span className="font-display text-display text-on-surface font-extrabold tracking-tight">{numero(valorIndividual)}</span>
                      </div>
                      <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                        <span>Valor total da despesa:</span>
                        <span className="font-semibold text-on-surface">{moeda(despesa.valorTotal)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {despesa ? "Você não participa do rateio desta tarefa." : "Esta tarefa não possui valores para dividir."}
                    </p>
                  )}
                  {despesa && onPagamento && (
                    <button
                      type="button"
                      onClick={onPagamento}
                      className="w-full py-3.5 px-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-sm shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] hover:opacity-95 active:scale-[0.98] transition-all"
                    >
                      <Icon name="qr_code_2" size={20}/>
                      <span>{usuario && situacaoUsuario !== "pago" ? "Pagar minha parte via Pix" : "Ver pagamentos / Pix"}</span>
                    </button>
                  )}
                  {usuario && situacaoUsuario !== "pago" && (
                    <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm text-on-surface-variant">
                      <Icon name="info" size={18} className="text-tertiary shrink-0"/>
                      <p className="font-body-sm text-body-sm leading-tight">
                        Após transferir {moeda(pendenteUsuario)}, o responsável confirmará o recebimento diretamente no painel. O status atualizará para quitado.
                      </p>
                    </div>
                  )}
                </div>

                {/* PROGRESSO — MEMBRO */}
                {despesa && (
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Progresso da Arrecadação</span>
                      <span className="font-label-md text-label-md text-primary font-bold">{Math.round(progresso)}%</span>
                    </div>
                    {barraProgresso("h-3")}
                    <div className="flex flex-wrap items-center justify-between gap-1 font-label-sm text-label-sm text-on-surface-variant">
                      <span>{moeda(totalPago)} quitados</span>
                      <span>{moeda(restante)} pendentes</span>
                    </div>
                    <div className="pt-space-xs flex flex-wrap items-center justify-between gap-1 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-container"/>
                        {quitados} cotas acertadas
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-surface-container-high"/>
                        {participantesRateio.length - quitados} cotas em aberto
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* RESUMO RÁPIDO — ADMINISTRADOR */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-xs">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Resumo Rápido</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface font-label-sm text-label-sm">{status.texto}</span>
                  </div>
                  <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-low font-body-sm text-body-sm">
                    {despesa ? (
                      <>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-outline font-label-md">Valor Total da Conta</span>
                          <span className="font-bold text-on-surface font-label-lg">{moeda(despesa.valorTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-outline font-label-md">Participantes</span>
                          <span className="font-semibold text-on-surface">{participantesRateio.length} membros</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-outline font-label-md">Valor por participante</span>
                          <span className="font-semibold text-on-surface">{moeda(valorIndividual)}</span>
                        </div>
                        <div className="w-full h-px bg-surface-container-high my-1"/>
                        {usuario && pendenteUsuario > 0.009 ? (
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-label-lg text-label-lg text-secondary font-bold">Sua Cota Pendente</span>
                            <span className="font-numeric-stat text-numeric-stat text-secondary font-extrabold">{moeda(pendenteUsuario)}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-label-lg text-label-lg text-on-surface font-bold">Restante</span>
                            <span className="font-numeric-stat text-numeric-stat text-on-surface font-extrabold">{moeda(restante)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-outline font-label-md">Responsável</span>
                          <span className="font-semibold text-on-surface text-right">{responsavel?.nome ?? "Não definido"}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-outline font-label-md">Participantes</span>
                          <span className="font-semibold text-on-surface">{tarefa.participantes.length} membros</span>
                        </div>
                        <div className="w-full h-px bg-surface-container-high my-1"/>
                        <span className="text-on-surface-variant">Sem despesa vinculada</span>
                      </>
                    )}
                  </div>
                  {despesa && onPagamento && (
                    <button
                      type="button"
                      onClick={onPagamento}
                      className="w-full py-3 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="qr_code_2" size={20}/>
                      Ver pagamentos / Pix
                    </button>
                  )}
                </div>

                {/* AÇÕES DA TAREFA — ADMINISTRADOR */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-wider">Ações da Tarefa</span>
                  <div className="flex flex-col gap-space-xs pt-1">
                    {onEditar && (
                      <button type="button" onClick={() => onEditar(tarefa)} className="w-full flex items-center justify-between p-space-md rounded-lg hover:bg-surface-container-low text-on-surface transition-colors group">
                        <span className="flex items-center gap-space-sm">
                          <Icon name="edit_document" size={20} className="text-primary group-hover:scale-110 transition-transform"/>
                          <span className="font-label-md text-label-md font-semibold">Editar Detalhes da Tarefa</span>
                        </span>
                        <Icon name="chevron_right" size={18} className="text-outline"/>
                      </button>
                    )}
                    {statusAtual === "concluida" ? (
                      <div className="w-full flex items-center gap-space-sm p-space-md rounded-lg bg-emerald-50 text-emerald-800">
                        <Icon name="check_circle" size={20} filled/>
                        <span className="font-label-md text-label-md font-semibold">Tarefa concluída</span>
                      </div>
                    ) : onConcluir && (
                      <button type="button" onClick={concluir} className="w-full flex items-center justify-between p-space-md rounded-lg hover:bg-surface-container-low text-on-surface transition-colors group">
                        <span className="flex items-center gap-space-sm">
                          <Icon name="check_circle" size={20} className="text-primary group-hover:scale-110 transition-transform"/>
                          <span className="font-label-md text-label-md font-semibold">Marcar como concluída</span>
                        </span>
                        <Icon name="chevron_right" size={18} className="text-outline"/>
                      </button>
                    )}
                    {onExcluir && (
                      <button type="button" onClick={excluir} className={`w-full flex items-center justify-between p-space-md rounded-lg transition-colors group ${confirmarExclusao ? "bg-error text-on-error hover:opacity-95" : "hover:bg-error-container/40 text-error"}`}>
                        <span className="flex items-center gap-space-sm">
                          <Icon name="delete" size={20} className="group-hover:scale-110 transition-transform"/>
                          <span className="font-label-md text-label-md font-semibold">{confirmarExclusao ? "Confirmar exclusão" : "Excluir tarefa"}</span>
                        </span>
                        <Icon name="chevron_right" size={18}/>
                      </button>
                    )}
                    {confirmarExclusao && (
                      <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-sm rounded-lg bg-error-container text-on-error-container" role="alert">
                        <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold">
                          <Icon name="error_outline" size={17}/>
                          Deseja realmente excluir esta tarefa?
                        </span>
                        <button type="button" onClick={() => setConfirmarExclusao(false)} className="font-label-sm text-label-sm font-semibold underline underline-offset-2">
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
