
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import Icon from "../components/icon";

// ======================================================
// TIPOS
// ======================================================

export interface ParticipanteTarefa {
  id: string;
  nome: string;
  email?: string;
  selecionado: boolean;
}

export interface DadosTarefa {
  id: string;
  titulo: string;
  descricao: string;
  dataLimite: string;
  horario: string;
  responsavelId: string;
  participantes: ParticipanteTarefa[];
  possuiDespesa: boolean;
  valorTotal: number;
  pagadorId: string;
  comprovante: string;
  concluida: boolean;
  emAndamento?: boolean;
  recorrencia?: "nenhuma" | "semanal" | "mensal";
}

interface EditarTarefaProps {
  tarefa: DadosTarefa;
  modo?: "criar" | "editar";
  nomeGrupo?: string;
  onClose: () => void;
  onSave: (tarefa: DadosTarefa) => void;
}

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function obterIniciais(nome: string) {
  return nome
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}

function nomeCurto(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1].charAt(0)}.` : partes[0];
}

// ======================================================
// ESTILOS REUTILIZÁVEIS
// ======================================================

const estiloInput =
  "w-full bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg px-space-md py-3 placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all";

const estiloLabel = "font-label-md text-label-md text-on-surface";

function TituloSecao({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{children}</span>
      {extra}
    </div>
  );
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export default function EditarTarefa({
  tarefa,
  modo = "editar",
  nomeGrupo = "",
  onClose,
  onSave,
}: EditarTarefaProps) {
  const [formulario, setFormulario] =
    useState<DadosTarefa>(() => ({
      ...tarefa,
      participantes: tarefa.participantes.map(
        (participante) => ({ ...participante })
      ),
    }));

  const [erro, setErro] = useState("");

  // ======================================================
  // BLOQUEAR SCROLL DAS TELAS DE FUNDO
  // ======================================================

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const bodyPaddingRight = document.body.style.paddingRight;
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    const paddingAtual =
      parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;

    // Ao ocultar a barra vertical, preserva a largura do conteúdo do grupo.
    if (larguraBarra > 0) {
      document.body.style.paddingRight = `${paddingAtual + larguraBarra}px`;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.body.style.paddingRight = bodyPaddingRight;
    };
  }, []);

  // ======================================================
  // FECHAR COM ESC
  // ======================================================

  useEffect(() => {
    function aoPressionarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      aoPressionarTecla,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        aoPressionarTecla,
        true
      );
    };
  }, [onClose]);

  // ======================================================
  // DADOS CALCULADOS
  // ======================================================

  const participantesSelecionados =
    formulario.participantes.filter(
      (participante) => participante.selecionado
    );

  const quantidadeParticipantes =
    participantesSelecionados.length;

  const todosSelecionados =
    quantidadeParticipantes === formulario.participantes.length;

  const valorPorPessoa =
    quantidadeParticipantes > 0
      ? formulario.valorTotal / quantidadeParticipantes
      : 0;

  const statusAtual = formulario.concluida
    ? { texto: "Concluída", classe: "bg-emerald-100 text-emerald-800", ponto: "bg-emerald-500" }
    : formulario.emAndamento
    ? { texto: "Em andamento", classe: "bg-blue-100 text-blue-900", ponto: "bg-blue-500" }
    : { texto: "Em aberto", classe: "bg-tertiary-fixed text-on-tertiary-fixed", ponto: "bg-tertiary-container" };

  // ======================================================
  // ALTERAR CAMPOS
  // ======================================================

  function atualizarCampo<K extends keyof DadosTarefa>(
    campo: K,
    valor: DadosTarefa[K]
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setErro("");
  }

  // ======================================================
  // SELECIONAR PARTICIPANTES
  // ======================================================

  function alternarParticipante(id: string) {
    const participantesAtualizados =
      formulario.participantes.map((participante) => {
        if (participante.id !== id) {
          return participante;
        }

        return {
          ...participante,
          selecionado: !participante.selecionado,
        };
      });

    atualizarCampo(
      "participantes",
      participantesAtualizados
    );
  }

  function selecionarTodos() {
    atualizarCampo(
      "participantes",
      formulario.participantes.map((participante) => ({
        ...participante,
        selecionado: !todosSelecionados,
      }))
    );
  }

  // ======================================================
  // COMPROVANTE VISUAL
  // ======================================================

  function selecionarComprovante(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    atualizarCampo("comprovante", arquivo.name);

    event.target.value = "";
  }

  // ======================================================
  // SALVAR
  // ======================================================

  function salvarAlteracoes() {
    if (!formulario.titulo.trim()) {
      setErro("Informe o título da tarefa.");
      return;
    }

    if (!formulario.dataLimite) {
      setErro("Informe a data limite.");
      return;
    }

    if (participantesSelecionados.length === 0) {
      setErro(
        "Selecione pelo menos um participante."
      );
      return;
    }

    if (
      formulario.possuiDespesa &&
      formulario.valorTotal <= 0
    ) {
      setErro(
        "Informe um valor válido para a despesa."
      );
      return;
    }

    const responsavelValido =
      participantesSelecionados.some(
        (participante) =>
          participante.id === formulario.responsavelId
      );

    const pagadorValido =
      participantesSelecionados.some(
        (participante) =>
          participante.id === formulario.pagadorId
      );

    onSave({
      ...formulario,
      titulo: formulario.titulo.trim(),
      responsavelId: responsavelValido
        ? formulario.responsavelId
        : participantesSelecionados[0].id,
      pagadorId: pagadorValido
        ? formulario.pagadorId
        : participantesSelecionados[0].id,
    });
  }

  // ======================================================
  // JSX
  // ======================================================

  return (
    <div>
      {/* FUNDO — cobre a tela abaixo do header */}
      <div
        className="fixed inset-0 top-16 z-40 bg-inverse-surface/40 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* PAINEL LATERAL: cabeçalho fixo, conteúdo rolável e rodapé fixo */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-tarefa-titulo"
        className="fixed top-16 right-0 bottom-0 z-50 w-full max-w-[580px] flex flex-col overflow-hidden bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-[-8px_0_30px_rgba(18,28,42,0.12)]"
      >
        {/* CABEÇALHO */}
        <header className="px-space-lg pt-space-lg pb-space-md shrink-0 flex items-start justify-between gap-space-md bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.03)] z-10">
          <div className="flex flex-col gap-space-xs min-w-0">
            <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm self-start max-w-full">
              <Icon name="beach_access" size={14}/>
              <span className="truncate">{nomeGrupo}</span>
            </span>
            <div className="flex flex-wrap items-center gap-space-xs">
              <h2
                id="editar-tarefa-titulo"
                className="font-headline-lg text-headline-lg text-on-surface tracking-tight"
              >
                {modo === "criar" ? "Novo Item" : "Editar Tarefa"}
              </h2>
              {modo === "editar" && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${statusAtual.classe}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusAtual.ponto}`}/>
                  {statusAtual.texto}
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {modo === "criar"
                ? "Crie uma tarefa com responsável e, se houver custo, vincule a despesa ao rateio."
                : "Atualize os dados, os participantes e o rateio entre amigos."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar edição"
            className="w-10 h-10 shrink-0 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <Icon name="close" size={22}/>
          </button>
        </header>

        {/* CONTEÚDO — única área com rolagem */}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-space-lg py-space-lg flex flex-col gap-space-xl">
          {/* 1. INFORMAÇÕES BÁSICAS */}
          <section className="flex flex-col gap-space-md">
            <TituloSecao
              extra={
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Icon name="info" size={15} className="text-tertiary-container"/> Campos obrigatórios *
                </span>
              }
            >
              1. Informações Básicas
            </TituloSecao>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="editar-titulo" className={`${estiloLabel} flex items-center justify-between`}>
                <span>Nome do item <span className="text-secondary">*</span></span>
                <span className="font-body-sm text-label-sm text-on-surface-variant">Identificação clara</span>
              </label>
              <div className="relative">
                <input
                  id="editar-titulo"
                  type="text"
                  value={formulario.titulo}
                  placeholder="Ex: Aluguel da van, Carvão e gelo..."
                  onChange={(event) =>
                    atualizarCampo(
                      "titulo",
                      event.target.value
                    )
                  }
                  className={`${estiloInput} pr-10`}
                />
                <Icon name="edit" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"/>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="editar-descricao" className={`${estiloLabel} flex items-center justify-between`}>
                <span>Descrição e Notas Adicionais</span>
                <span className="font-body-sm text-label-sm text-on-surface-variant">Opcional</span>
              </label>
              <textarea
                id="editar-descricao"
                rows={3}
                value={formulario.descricao}
                placeholder="Detalhes, combinados e observações para o grupo"
                onChange={(event) =>
                  atualizarCampo(
                    "descricao",
                    event.target.value
                  )
                }
                className={`${estiloInput} resize-none font-body-sm text-body-sm py-2.5`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="editar-data" className={estiloLabel}>
                  Data limite <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <Icon name="calendar_today" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"/>
                  <input
                    id="editar-data"
                    type="date"
                    value={formulario.dataLimite}
                    onChange={(event) =>
                      atualizarCampo(
                        "dataLimite",
                        event.target.value
                      )
                    }
                    className={`${estiloInput} pl-10 font-body-sm text-body-sm`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="editar-horario" className={estiloLabel}>
                  Horário estimado
                </label>
                <div className="relative">
                  <Icon name="schedule" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"/>
                  <input
                    id="editar-horario"
                    type="time"
                    value={formulario.horario}
                    onChange={(event) =>
                      atualizarCampo(
                        "horario",
                        event.target.value
                      )
                    }
                    className={`${estiloInput} pl-10 font-body-sm text-body-sm`}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-surface-container shrink-0"/>

          {/* 2. RESPONSÁVEIS & DIVISÃO */}
          <section className="flex flex-col gap-space-md">
            <TituloSecao
              extra={
                <span className="font-label-sm text-label-sm text-on-tertiary-fixed-variant font-semibold bg-tertiary-fixed px-2 py-0.5 rounded">Racha Igualitário</span>
              }
            >
              2. Responsáveis &amp; Divisão
            </TituloSecao>

            {/* PARTICIPANTES */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={estiloLabel} id="editar-participantes-rotulo">Participantes que usufruem do item</span>
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  {quantidadeParticipantes} de {formulario.participantes.length} selecionados
                </span>
              </div>
              <div className="flex flex-wrap gap-space-xs pt-1" role="group" aria-labelledby="editar-participantes-rotulo">
                <button
                  type="button"
                  onClick={selecionarTodos}
                  className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-colors flex items-center gap-1"
                >
                  <Icon name="done_all" size={14}/>
                  {todosSelecionados ? "Desmarcar todos" : `Todos (${formulario.participantes.length})`}
                </button>
                {formulario.participantes.map((participante) => (
                  <button
                    key={participante.id}
                    type="button"
                    onClick={() => alternarParticipante(participante.id)}
                    aria-pressed={participante.selecionado}
                    className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
                      participante.selecionado
                        ? "bg-inverse-surface text-inverse-on-surface"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {participante.selecionado ? (
                      <>
                        <span>{participante.nome}</span>
                        <Icon name="check" size={14}/>
                      </>
                    ) : (
                      <span>+ {participante.nome}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* RESPONSÁVEL */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={estiloLabel} id="editar-responsavel-rotulo">Responsável pela tarefa</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Encarregado da execução</span>
              </div>
              {participantesSelecionados.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-xs" role="radiogroup" aria-labelledby="editar-responsavel-rotulo">
                  {participantesSelecionados.map((participante) => {
                    const ativo = participante.id === formulario.responsavelId;
                    return (
                      <button
                        key={participante.id}
                        type="button"
                        role="radio"
                        aria-checked={ativo}
                        onClick={() => atualizarCampo("responsavelId", participante.id)}
                        className={`p-space-sm rounded-lg flex items-center gap-space-xs transition-colors text-left ${
                          ativo
                            ? "bg-primary-fixed/40 text-on-primary-fixed ring-[1.5px] ring-primary-container"
                            : "bg-surface-container-low hover:bg-surface-container-high text-on-surface"
                        }`}
                      >
                        <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold ${ativo ? "bg-primary-container text-on-primary" : "bg-surface-container-highest text-on-surface"}`}>
                          {obterIniciais(participante.nome)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-label-sm text-label-sm truncate ${ativo ? "font-bold" : ""}`}>{nomeCurto(participante.nome)}</span>
                          <span className="text-[10px] text-on-surface-variant truncate">{participante.email ?? (ativo ? "Responsável" : "Membro")}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant">
                  Selecione participantes para definir o responsável.
                </p>
              )}
            </div>
          </section>

          <div className="h-px w-full bg-surface-container shrink-0"/>

          {/* 3. DESPESA */}
          <section className="flex flex-col gap-space-md">
            <TituloSecao>3. Despesa &amp; Comprovantes</TituloSecao>

            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-md">
              <div className="flex items-start gap-space-sm">
                <button
                  type="button"
                  role="switch"
                  aria-label="Vincular despesas"
                  aria-checked={formulario.possuiDespesa}
                  onClick={() =>
                    atualizarCampo(
                      "possuiDespesa",
                      !formulario.possuiDespesa
                    )
                  }
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-md flex items-center justify-center transition-all ${formulario.possuiDespesa ? "bg-primary-container" : "bg-surface-container-highest"}`}
                >
                  <Icon name="check" size={16} className={`text-on-primary transition-opacity ${formulario.possuiDespesa ? "opacity-100" : "opacity-0"}`}/>
                </button>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Este item gerou ou vai gerar uma despesa
                  </span>
                  <span className="font-body-sm text-label-sm text-on-surface-variant">
                    Habilita rateio financeiro automático entre os {quantidadeParticipantes} membros vinculados
                  </span>
                </div>
              </div>

              {formulario.possuiDespesa && (
                <div className="flex flex-col gap-space-md pt-space-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                    <div className="flex flex-col gap-space-xs">
                      <label htmlFor="editar-valor" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Valor total previsto
                      </label>
                      <div className="flex items-center gap-space-xs">
                        <span className="px-space-md py-space-sm rounded-lg bg-surface-container-highest text-on-surface font-label-md text-label-md shrink-0">
                          R$
                        </span>
                        <input
                          id="editar-valor"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formulario.valorTotal}
                          onChange={(event) =>
                            atualizarCampo(
                              "valorTotal",
                              Math.max(
                                0,
                                Number(
                                  event.target.value
                                ) || 0
                              )
                            )
                          }
                          className="w-full min-w-0 bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm font-bold rounded-lg px-space-md py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-container"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-space-xs">
                      <label htmlFor="editar-pagador" className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                        Quem pagou ou vai comprar?
                      </label>
                      <div className="relative">
                        <select
                          id="editar-pagador"
                          value={formulario.pagadorId}
                          onChange={(event) =>
                            atualizarCampo(
                              "pagadorId",
                              event.target.value
                            )
                          }
                          className="w-full appearance-none bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-lg pl-space-md pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
                        >
                          {formulario.participantes.map(
                            (participante) => (
                              <option
                                key={participante.id}
                                value={participante.id}
                              >
                                {participante.nome}
                              </option>
                            )
                          )}
                        </select>
                        <Icon name="unfold_more" size={18} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"/>
                      </div>
                    </div>
                  </div>

                  <div className="p-space-sm rounded-lg bg-surface-container-lowest flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-space-xs">
                      <Icon name="pie_chart" size={20} className="text-primary"/>
                      <span className="font-body-sm text-body-sm text-on-surface">Divisão calculada:</span>
                    </div>
                    <div className="text-right">
                      <span className="font-label-md text-label-md text-primary font-bold">{formatarMoeda(valorPorPessoa)}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant"> / pessoa ({quantidadeParticipantes} pessoas)</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Comprovante ou Nota Fiscal (Opcional)
                    </span>
                    {formulario.comprovante ? (
                      <div className="flex items-center justify-between gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg">
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                            <Icon name="description" size={20}/>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface truncate">{formulario.comprovante}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high font-label-sm text-label-sm text-on-surface transition-colors">
                            Alterar
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={selecionarComprovante}
                            />
                          </label>
                          <button
                            type="button"
                            title="Remover comprovante"
                            aria-label="Remover comprovante"
                            onClick={() =>
                              atualizarCampo(
                                "comprovante",
                                ""
                              )
                            }
                            className="p-1.5 text-error hover:bg-error-container/30 rounded transition-colors"
                          >
                            <Icon name="delete" size={18}/>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="p-space-md rounded-lg bg-surface-container-lowest border-dashed border-2 border-surface-container-highest hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-center gap-space-sm group">
                        <div className="w-8 h-8 rounded-full bg-surface-container-low group-hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
                          <Icon name="receipt_long" size={18}/>
                        </div>
                        <div className="text-left">
                          <span className="font-label-sm text-label-sm text-on-surface font-semibold block">Anexar cupom fiscal, foto ou PDF</span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant block">Formatos aceitos: JPG, PNG ou PDF</span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={selecionarComprovante}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="h-px w-full bg-surface-container shrink-0"/>

          {/* 4. STATUS & RECORRÊNCIA */}
          <section className="flex flex-col gap-space-md">
            <TituloSecao>4. Status &amp; Recorrência</TituloSecao>

            <label className="flex items-center justify-between gap-space-sm p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container/70 cursor-pointer transition-colors">
              <span className="flex items-center gap-space-sm">
                <span className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary-container shrink-0">
                  <Icon name="check_circle" size={20}/>
                </span>
                <span className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Status da Tarefa</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Marcar tarefa como concluída</span>
                </span>
              </span>
              <input
                type="checkbox"
                checked={formulario.concluida}
                onChange={(event) =>
                  atualizarCampo(
                    "concluida",
                    event.target.checked
                  )
                }
                className="w-5 h-5 shrink-0 rounded accent-primary-container cursor-pointer"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <label className="flex flex-col gap-1.5">
                <span className={estiloLabel}>Execução</span>
                <select
                  value={formulario.emAndamento ? "andamento" : "planejada"}
                  onChange={event => atualizarCampo("emAndamento", event.target.value === "andamento")}
                  className={`${estiloInput} font-body-sm text-body-sm cursor-pointer`}
                >
                  <option value="planejada">Planejada</option>
                  <option value="andamento">Em andamento</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={estiloLabel}>Recorrência</span>
                <select
                  value={formulario.recorrencia ?? "nenhuma"}
                  onChange={event => atualizarCampo("recorrencia", event.target.value as DadosTarefa["recorrencia"])}
                  className={`${estiloInput} font-body-sm text-body-sm cursor-pointer`}
                >
                  <option value="nenhuma">Não repetir</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </label>
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm text-on-surface-variant">
              <Icon name="info" size={18} className="text-tertiary shrink-0"/>
              <p className="font-body-sm text-body-sm leading-tight">
                A recorrência é uma configuração visual nesta prévia. Concluir a atividade não confirma os pagamentos.
              </p>
            </div>
          </section>

          {/* ERRO */}
          {erro && (
            <p
              role="alert"
              className="flex items-center gap-space-sm rounded-lg bg-error-container p-space-md font-body-sm text-body-sm text-on-error-container"
            >
              <Icon name="error_outline" size={18}/>
              {erro}
            </p>
          )}
        </div>

        {/* RODAPÉ FIXO */}
        <footer className="shrink-0 p-space-md sm:px-space-lg bg-surface-container-lowest shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-end gap-space-md z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvarAlteracoes}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] active:scale-[0.98]"
          >
            <Icon name={modo === "criar" ? "add_task" : "check_circle"} size={18}/>
            {modo === "criar" ? "Salvar Item" : "Atualizar Tarefa"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
