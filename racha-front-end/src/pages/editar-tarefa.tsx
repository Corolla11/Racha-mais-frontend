
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Trash2,
  Upload,
  Users,
  Wallet,
  X,
} from "lucide-react";

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
}

interface EditarTarefaProps {
  tarefa: DadosTarefa;
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

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export default function EditarTarefa({
  tarefa,
  nomeGrupo = "Viagem Florianópolis",
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

  const responsavel =
    formulario.participantes.find(
      (participante) =>
        participante.id === formulario.responsavelId
    );

  const quantidadeParticipantes =
    participantesSelecionados.length;

  const valorPorPessoa =
    quantidadeParticipantes > 0
      ? formulario.valorTotal / quantidadeParticipantes
      : 0;

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

  // ======================================================
  // TROCAR RESPONSÁVEL
  // ======================================================

  function trocarResponsavel() {
    if (participantesSelecionados.length === 0) {
      return;
    }

    const indiceAtual =
      participantesSelecionados.findIndex(
        (participante) =>
          participante.id === formulario.responsavelId
      );

    const proximoIndice =
      (indiceAtual + 1) %
      participantesSelecionados.length;

    atualizarCampo(
      "responsavelId",
      participantesSelecionados[proximoIndice].id
    );
  }

  // ======================================================
  // COMPROVANTE VISUAL
  // ======================================================

  function selecionarComprovante(
    event: React.ChangeEvent<HTMLInputElement>
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
  // ESTILOS REUTILIZÁVEIS
  // ======================================================

  const estiloInput =
    "w-full rounded-xl border border-transparent bg-[#F0F4FF] px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#F97316] focus:bg-white";

  const estiloLabel =
    "mb-2 block text-sm font-semibold text-[#253047]";

  // ======================================================
  // JSX
  // ======================================================

  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden">
      {/* ================================================
          FUNDO ÚNICO

          O fundo cobre os painéis anteriores visualmente.
          Não cria outra área de rolagem.
      ================================================= */}

      <div
        className="absolute inset-0 bg-[#172033]/65"
        onClick={onClose}
      />

      {/* ================================================
          PAINEL LATERAL

          Uma única estrutura com:
          - Cabeçalho fixo
          - Conteúdo rolável
          - Rodapé fixo
      ================================================= */}

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-tarefa-titulo"
        className="
          absolute
          inset-y-0
          right-0
          flex
          h-full
          w-full
          max-w-[560px]
          flex-col
          overflow-hidden
          bg-white
          text-[#172033]
          shadow-2xl
        "
      >
        {/* ============================================
            CABEÇALHO FIXO
        ============================================ */}

        <header className="z-10 shrink-0 border-b border-[#EDF0F6] bg-white px-6 pb-5 pt-6 sm:px-7">
          <div className="mb-4 flex items-center justify-between">
            <span className="max-w-[80%] truncate rounded-full bg-[#FFF0E7] px-3 py-1.5 text-xs font-semibold text-[#C65B19]">
              {nomeGrupo}
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar edição"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-800
              "
            >
              <X size={19} />
            </button>
          </div>

          <h2
            id="editar-tarefa-titulo"
            className="text-2xl font-bold tracking-tight"
          >
            Editar Tarefa
          </h2>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            Atualize as informações e os participantes
            desta tarefa.
          </p>
        </header>

        {/* ============================================
            CONTEÚDO

            ÚNICA ÁREA COM SCROLL
        ============================================ */}

        <div
          className="
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
            overscroll-contain
            px-6
            py-6
            sm:px-7
          "
        >
          <div className="space-y-7">
            {/* ========================================
                INFORMAÇÕES PRINCIPAIS
            ======================================== */}

            <section className="space-y-5">
              <div>
                <label
                  htmlFor="editar-titulo"
                  className={estiloLabel}
                >
                  Título da Tarefa{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="editar-titulo"
                  type="text"
                  value={formulario.titulo}
                  onChange={(event) =>
                    atualizarCampo(
                      "titulo",
                      event.target.value
                    )
                  }
                  className={estiloInput}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="editar-descricao"
                    className="text-sm font-semibold text-[#253047]"
                  >
                    Descrição e Notas Adicionais
                  </label>

                  <span className="text-xs text-gray-400">
                    Opcional
                  </span>
                </div>

                <textarea
                  id="editar-descricao"
                  rows={4}
                  value={formulario.descricao}
                  onChange={(event) =>
                    atualizarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                  className={`${estiloInput} resize-none leading-6`}
                />
              </div>

              {/* DATA E HORÁRIO */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="editar-data"
                    className={estiloLabel}
                  >
                    Data limite
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

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
                      className={`${estiloInput} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="editar-horario"
                    className={estiloLabel}
                  >
                    Horário previsto
                  </label>

                  <div className="relative">
                    <Clock3
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

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
                      className={`${estiloInput} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* DIVISÓRIA */}

            <div className="h-px bg-[#EDF0F6]" />

            {/* ========================================
                RESPONSÁVEL E PARTICIPANTES
            ======================================== */}

            <section className="space-y-5">
              {/* RESPONSÁVEL */}

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">
                    Responsável Principal
                  </h3>

                  <span className="text-xs text-gray-400">
                    Encarregado da execução
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-[#F0F4FF] p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-xs font-bold text-white">
                    {responsavel
                      ? obterIniciais(responsavel.nome)
                      : "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {responsavel?.nome ??
                        "Sem responsável"}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {responsavel?.email ??
                        "Participante do grupo"}
                    </p>
                  </div>

                  <span className="hidden rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#F97316] sm:inline-flex">
                    Ativa
                  </span>

                  <button
                    type="button"
                    onClick={trocarResponsavel}
                    title="Trocar responsável"
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      transition
                      hover:bg-white
                    "
                  >
                    <ArrowLeftRight size={17} />
                  </button>
                </div>
              </div>

              {/* PARTICIPANTES */}

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">
                    Participantes Envolvidos
                  </h3>

                  <span className="text-xs font-semibold text-[#C65B19]">
                    {quantidadeParticipantes} selecionados
                    de {formulario.participantes.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {formulario.participantes.map(
                    (participante) => (
                      <button
                        key={participante.id}
                        type="button"
                        onClick={() =>
                          alternarParticipante(
                            participante.id
                          )
                        }
                        aria-pressed={
                          participante.selecionado
                        }
                        className={`
                          flex
                          min-w-0
                          items-center
                          gap-2
                          rounded-xl
                          border
                          p-2.5
                          text-left
                          transition
                          ${
                            participante.selecionado
                              ? "border-[#FFDCC7] bg-[#FFF3EA]"
                              : "border-transparent bg-[#F0F4FF]"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-xs
                            font-bold
                            ${
                              participante.selecionado
                                ? "bg-[#F97316] text-white"
                                : "bg-[#DDE6F8] text-[#53647E]"
                            }
                          `}
                        >
                          {obterIniciais(
                            participante.nome
                          )}
                        </div>

                        <span className="min-w-0 flex-1 truncate text-xs font-medium">
                          {participante.nome}
                        </span>

                        {participante.selecionado ? (
                          <CheckCircle2
                            size={17}
                            className="shrink-0 text-[#F97316]"
                          />
                        ) : (
                          <span className="h-[17px] w-[17px] shrink-0 rounded-full border border-gray-300" />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* DIVISÓRIA */}

            <div className="h-px bg-[#EDF0F6]" />

            {/* ========================================
                DESPESAS FINANCEIRAS
            ======================================== */}

            <section className="rounded-2xl bg-[#F0F4FF] p-4 sm:p-5">
              {/* CABEÇALHO DA DESPESA */}

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFE1CF] text-[#C65B19]">
                  <Wallet size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold">
                    Vincular Despesas Financeiras
                  </h3>

                  <p className="mt-0.5 text-xs leading-4 text-gray-500">
                    Divida os custos entre os
                    participantes selecionados.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-label="Vincular despesas"
                  aria-checked={
                    formulario.possuiDespesa
                  }
                  onClick={() =>
                    atualizarCampo(
                      "possuiDespesa",
                      !formulario.possuiDespesa
                    )
                  }
                  className={`
                    relative
                    h-6
                    w-11
                    shrink-0
                    rounded-full
                    transition
                    ${
                      formulario.possuiDespesa
                        ? "bg-[#F97316]"
                        : "bg-gray-300"
                    }
                  `}
                >
                  <span
                    className={`
                      absolute
                      top-1
                      h-4
                      w-4
                      rounded-full
                      bg-white
                      shadow-sm
                      transition-all
                      ${
                        formulario.possuiDespesa
                          ? "left-6"
                          : "left-1"
                      }
                    `}
                  />
                </button>
              </div>

              {/* CONTEÚDO FINANCEIRO */}

              {formulario.possuiDespesa && (
                <div className="mt-5 space-y-4 rounded-xl bg-white p-4">
                  {/* VALOR E PAGADOR */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="editar-valor"
                        className={estiloLabel}
                      >
                        Valor Total Pago
                      </label>

                      <div className="flex items-center rounded-xl bg-[#F0F4FF] px-3">
                        <span className="text-sm text-gray-500">
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
                          className="w-full min-w-0 bg-transparent px-2 py-3 text-lg font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="editar-pagador"
                        className={estiloLabel}
                      >
                        Quem realizou o pagamento
                      </label>

                      <select
                        id="editar-pagador"
                        value={formulario.pagadorId}
                        onChange={(event) =>
                          atualizarCampo(
                            "pagadorId",
                            event.target.value
                          )
                        }
                        className={estiloInput}
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
                    </div>
                  </div>

                  {/* RATEIO */}

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#E5EDFF] p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Users
                        size={17}
                        className="text-[#F97316]"
                      />

                      <span>
                        Rateio igualitário (
                        {quantidadeParticipantes} pessoas)
                      </span>
                    </div>

                    <div className="text-xs">
                      <span className="text-gray-500">
                        Por pessoa:{" "}
                      </span>

                      <strong className="text-[#F97316]">
                        {formatarMoeda(valorPorPessoa)}
                      </strong>
                    </div>
                  </div>

                  {/* COMPROVANTE */}

                  <div>
                    <label className={estiloLabel}>
                      Comprovante Fiscal / Recibo
                    </label>

                    {formulario.comprovante ? (
                      <div className="flex items-center gap-3 rounded-xl bg-[#F0F4FF] p-3">
                        <div className="rounded-lg bg-[#FFE1CF] p-2 text-[#F97316]">
                          <FileText size={18} />
                        </div>

                        <p className="min-w-0 flex-1 truncate text-xs font-semibold">
                          {formulario.comprovante}
                        </p>

                        <label className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold transition hover:bg-gray-50">
                          Alterar

                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={
                              selecionarComprovante
                            }
                          />
                        </label>

                        <button
                          type="button"
                          title="Remover comprovante"
                          onClick={() =>
                            atualizarCampo(
                              "comprovante",
                              ""
                            )
                          }
                          className="text-red-500 transition hover:text-red-700"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-[#F8FAFF] p-4 text-xs text-gray-500 transition hover:bg-[#F0F4FF]">
                        <Upload size={17} />

                        Adicionar comprovante

                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={
                            selecionarComprovante
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* ========================================
                STATUS
            ======================================== */}

            <section className="flex items-center justify-between gap-3 rounded-xl border border-[#EDF0F6] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#F0F4FF] p-2 text-[#F97316]">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Status da Tarefa
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Marcar tarefa como concluída
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={formulario.concluida}
                onChange={(event) =>
                  atualizarCampo(
                    "concluida",
                    event.target.checked
                  )
                }
                className="h-5 w-5 shrink-0 accent-[#F97316]"
              />
            </section>

            {/* ERRO */}

            {erro && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
              >
                {erro}
              </p>
            )}
          </div>
        </div>

        {/* ============================================
            RODAPÉ FIXO

            Fica fora da área rolável.
        ============================================ */}

        <footer className="z-10 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#EDF0F6] bg-white px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              bg-[#E5EDFF]
              px-5
              py-3
              text-sm
              font-semibold
              text-[#172033]
              transition
              hover:bg-[#D9E5FF]
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvarAlteracoes}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#F97316]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#EA580C]
            "
          >
            <Check size={17} />
            Salvar Alterações
          </button>
        </footer>
      </aside>
    </div>
  );
}
