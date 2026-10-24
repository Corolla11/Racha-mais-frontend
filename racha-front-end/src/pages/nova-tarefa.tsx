import { useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Home,
  Plus,
  Users,
  Utensils,
  X,
  Car,
  Palmtree,
  Package,
} from "lucide-react";

interface NovaTarefaProps {
  aberto: boolean;
  onClose: () => void;
}

interface Participante {
  id: number;
  nome: string;
  iniciais: string;
  cargo: string;
}

const participantes: Participante[] = [
  {
    id: 1,
    nome: "Você (Rodrigo)",
    iniciais: "RM",
    cargo: "Organizador",
  },
  {
    id: 2,
    nome: "Mariana S.",
    iniciais: "MS",
    cargo: "Comoradora",
  },
  {
    id: 3,
    nome: "Pedro H.",
    iniciais: "PH",
    cargo: "Membro",
  },
  {
    id: 4,
    nome: "Lucas M.",
    iniciais: "LM",
    cargo: "Membro",
  },
  {
    id: 5,
    nome: "Carla T.",
    iniciais: "CT",
    cargo: "Membro",
  },
  {
    id: 6,
    nome: "Beatriz L.",
    iniciais: "BL",
    cargo: "Membro",
  },
];

const categorias = [
  {
    id: "hospedagem",
    nome: "Hospedagem",
    icon: Home,
  },
  {
    id: "alimentacao",
    nome: "Alimentação",
    icon: Utensils,
  },
  {
    id: "transporte",
    nome: "Transporte",
    icon: Car,
  },
  {
    id: "lazer",
    nome: "Lazer",
    icon: Palmtree,
  },
  {
    id: "outros",
    nome: "Outros",
    icon: Package,
  },
];

export default function NovaTarefa({
  aberto,
  onClose,
}: NovaTarefaProps) {
  const [nomeTarefa, setNomeTarefa] = useState("");
  const [descricao, setDescricao] = useState("");

  const [responsavel, setResponsavel] = useState(1);

  const [participantesSelecionados, setParticipantesSelecionados] =
    useState<number[]>([1, 2, 3, 5]);

  const [dataEntrega, setDataEntrega] = useState("2025-11-15");
  const [horaEntrega, setHoraEntrega] = useState("14:00");

  const [vincularDespesa, setVincularDespesa] = useState(true);

  const [valorDespesa, setValorDespesa] = useState("450,00");

  const [categoria, setCategoria] = useState("hospedagem");

  const [descricaoDespesa, setDescricaoDespesa] = useState("");

  const [tipoPagamento, setTipoPagamento] = useState<
    "unico" | "multiplos"
  >("unico");

  const [pagador, setPagador] = useState(1);

  if (!aberto) {
    return null;
  }

  function selecionarParticipante(id: number) {
    setParticipantesSelecionados((anteriores) => {
      if (anteriores.includes(id)) {
        return anteriores.filter((participanteId) => participanteId !== id);
      }

      return [...anteriores, id];
    });
  }

  function selecionarTodos() {
    if (participantesSelecionados.length === participantes.length) {
      setParticipantesSelecionados([]);
      return;
    }

    setParticipantesSelecionados(
      participantes.map((participante) => participante.id)
    );
  }

  function salvarTarefa() {
    const tarefa = {
      nome: nomeTarefa,
      descricao,
      responsavel,
      participantes: participantesSelecionados,
      prazo: {
        data: dataEntrega,
        hora: horaEntrega,
      },
      despesa: vincularDespesa
        ? {
            valor: valorDespesa,
            categoria,
            descricao: descricaoDespesa,
            tipoPagamento,
            pagador,
          }
        : null,
    };

    console.log("Nova tarefa:", tarefa);

    onClose();
  }

  const valorNumerico =
    Number(
      valorDespesa
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;

  const valorIndividual =
    participantesSelecionados.length > 0
      ? valorNumerico / participantesSelecionados.length
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]">
      {/* Modal */}
      <div
        className="
          flex
          h-[92vh]
          w-full
          max-w-[640px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}
        <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-8 py-6">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />

              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Viagem Florianópolis
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Nova Tarefa
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organize quem faz o quê no grupo e já registre a despesa.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-500
              transition
              hover:bg-slate-200
              hover:text-slate-800
            "
          >
            <X size={20} />
          </button>
        </header>

        {/* CONTEÚDO COM SCROLL */}
        <div
          className="
            flex-1
            overflow-y-auto
            px-8
            py-6

            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-300
          "
        >
          {/* NOME */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800">
                Nome da tarefa
              </label>

              <span className="text-xs font-medium text-orange-600">
                Obrigatório
              </span>
            </div>

            <input
              type="text"
              value={nomeTarefa}
              onChange={(event) => setNomeTarefa(event.target.value)}
              placeholder="Ex: Comprar bebidas, gelo e carvão"
              className="
                w-full
                rounded-xl
                border
                border-transparent
                bg-[#F1F5FF]
                px-4
                py-3
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-orange-300
                focus:bg-white
              "
            />
          </section>

          {/* DESCRIÇÃO */}
          <section className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800">
                Descrição / Notas adicionais
              </label>

              <span className="text-xs text-slate-500">
                Opcional
              </span>
            </div>

            <div className="relative">
              <textarea
                value={descricao}
                maxLength={300}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Ex: Passar no atacado perto da rodovia antes de subir pro morro. Mariana tem cartão habilitado."
                className="
                  min-h-[110px]
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-transparent
                  bg-[#F1F5FF]
                  px-4
                  py-3
                  pb-8
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-orange-300
                  focus:bg-white
                "
              />

              <span className="absolute bottom-3 right-4 text-xs text-slate-500">
                {descricao.length}/300
              </span>
            </div>
          </section>

          {/* RESPONSÁVEL */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Responsável principal
              </h3>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                Quem vai executar?
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {participantes.slice(0, 5).map((participante) => {
                const selecionado =
                  responsavel === participante.id;

                return (
                  <button
                    key={participante.id}
                    type="button"
                    onClick={() =>
                      setResponsavel(participante.id)
                    }
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      px-3
                      py-3
                      text-left
                      transition
                      ${
                        selecionado
                          ? "border-orange-500 bg-orange-50"
                          : "border-transparent bg-[#F1F5FF] hover:border-slate-200"
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
                        font-semibold
                        ${
                          selecionado
                            ? "bg-orange-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }
                      `}
                    >
                      {participante.iniciais}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {participante.nome}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {participante.cargo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* PARTICIPANTES */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Participantes envolvidos
              </h3>

              <button
                type="button"
                onClick={selecionarTodos}
                className="flex items-center gap-2 text-xs font-medium text-slate-700"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                  {participantesSelecionados.length ===
                  participantes.length ? (
                    <Check size={12} />
                  ) : (
                    <Plus size={12} />
                  )}
                </span>

                Todos do grupo ({participantes.length})
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {participantes.map((participante) => {
                const selecionado =
                  participantesSelecionados.includes(
                    participante.id
                  );

                return (
                  <button
                    key={participante.id}
                    type="button"
                    onClick={() =>
                      selecionarParticipante(participante.id)
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      rounded-full
                      px-3
                      py-2
                      text-xs
                      font-medium
                      transition
                      ${
                        selecionado
                          ? "bg-orange-100 text-orange-950"
                          : "bg-[#F1F5FF] text-slate-700"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        text-[9px]
                        font-semibold
                        ${
                          selecionado
                            ? "bg-orange-500 text-white"
                            : "bg-slate-200"
                        }
                      `}
                    >
                      {participante.iniciais}
                    </span>

                    {participante.nome}

                    {selecionado ? (
                      <Check size={13} />
                    ) : (
                      <Plus size={13} />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {participantesSelecionados.length} de{" "}
              {participantes.length} pessoas selecionadas para esta
              tarefa
            </p>
          </section>

          <div className="my-7 border-t border-slate-100" />

          {/* PRAZO */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              Prazo / Data de entrega
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="date"
                  value={dataEntrega}
                  onChange={(event) =>
                    setDataEntrega(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-transparent
                    bg-[#F1F5FF]
                    py-3
                    pl-11
                    pr-3
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-orange-300
                  "
                />
              </div>

              <div className="relative">
                <Clock3
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="time"
                  value={horaEntrega}
                  onChange={(event) =>
                    setHoraEntrega(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-transparent
                    bg-[#F1F5FF]
                    py-3
                    pl-11
                    pr-3
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-orange-300
                  "
                />
              </div>
            </div>
          </section>

          {/* DESPESA */}
          <section className="mt-6 rounded-2xl bg-[#F1F5FF] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <CreditCard size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Vincular Despesa
                  </h3>

                  <p className="text-xs text-slate-500">
                    Esta tarefa possui um custo a ser dividido?
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setVincularDespesa((anterior) => !anterior)
                }
                className={`
                  relative
                  h-7
                  w-12
                  shrink-0
                  rounded-full
                  transition
                  ${
                    vincularDespesa
                      ? "bg-orange-500"
                      : "bg-slate-300"
                  }
                `}
              >
                <span
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-sm
                    transition-all
                    ${
                      vincularDespesa
                        ? "left-6"
                        : "left-1"
                    }
                  `}
                />
              </button>
            </div>

            {vincularDespesa && (
              <div className="mt-6">
                {/* VALOR */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-800">
                      Valor total da despesa
                    </label>

                    <span className="text-xs font-medium text-orange-600">
                      Obrigatório
                    </span>
                  </div>

                  <div className="flex items-center rounded-xl bg-white px-4 py-3">
                    <span className="mr-4 text-lg font-semibold text-orange-900">
                      R$
                    </span>

                    <input
                      value={valorDespesa}
                      onChange={(event) =>
                        setValorDespesa(event.target.value)
                      }
                      className="w-full bg-transparent text-xl font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* CATEGORIA */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800">
                      Categoria
                    </h4>

                    <span className="text-xs font-medium text-orange-600">
                      Obrigatório
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categorias.map((item) => {
                      const Icon = item.icon;
                      const selecionada =
                        categoria === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setCategoria(item.id)
                          }
                          className={`
                            flex
                            items-center
                            gap-2
                            rounded-lg
                            px-3
                            py-3
                            text-xs
                            font-medium
                            transition
                            ${
                              selecionada
                                ? "bg-orange-600 text-white shadow-sm"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }
                          `}
                        >
                          <Icon size={16} />

                          {item.nome}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DESCRIÇÃO DA DESPESA */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-800">
                      Descrição da despesa
                    </label>

                    <span className="text-xs text-slate-500">
                      Opcional
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      value={descricaoDespesa}
                      maxLength={300}
                      onChange={(event) =>
                        setDescricaoDespesa(
                          event.target.value
                        )
                      }
                      placeholder="Ex: Mercado, combustível, ingresso..."
                      className="
                        min-h-[90px]
                        w-full
                        resize-none
                        rounded-xl
                        bg-white
                        px-4
                        py-3
                        pb-7
                        text-sm
                        outline-none
                        placeholder:text-slate-400
                        focus:ring-1
                        focus:ring-orange-300
                      "
                    />

                    <span className="absolute bottom-3 right-3 text-xs text-slate-400">
                      {descricaoDespesa.length}/300
                    </span>
                  </div>
                </div>

                {/* PAGAMENTO */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold text-slate-800">
                      Quem realizou o pagamento?
                    </h4>

                    <div className="flex rounded-lg bg-white p-1 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          setTipoPagamento("unico")
                        }
                        className={`
                          rounded-md
                          px-3
                          py-1.5
                          transition
                          ${
                            tipoPagamento === "unico"
                              ? "bg-[#E4EBFC] font-semibold text-slate-900"
                              : "text-slate-500"
                          }
                        `}
                      >
                        Único
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setTipoPagamento("multiplos")
                        }
                        className={`
                          rounded-md
                          px-3
                          py-1.5
                          transition
                          ${
                            tipoPagamento ===
                            "multiplos"
                              ? "bg-[#E4EBFC] font-semibold text-slate-900"
                              : "text-slate-500"
                          }
                        `}
                      >
                        Múltiplos
                      </button>
                    </div>
                  </div>

                  {tipoPagamento === "unico" ? (
                    <div className="grid grid-cols-2 gap-2">
                      {participantes.map(
                        (participante) => {
                          const selecionado =
                            pagador === participante.id;

                          return (
                            <button
                              key={participante.id}
                              type="button"
                              onClick={() =>
                                setPagador(
                                  participante.id
                                )
                              }
                              className={`
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                border
                                bg-white
                                px-3
                                py-3
                                text-left
                                transition
                                ${
                                  selecionado
                                    ? "border-orange-500"
                                    : "border-transparent"
                                }
                              `}
                            >
                              <span
                                className={`
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  text-xs
                                  font-semibold
                                  ${
                                    selecionado
                                      ? "bg-orange-500 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }
                                `}
                              >
                                {
                                  participante.iniciais
                                }
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-800">
                                  {participante.nome}
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  {selecionado
                                    ? "Pagou tudo"
                                    : "Selecionar"}
                                </p>
                              </div>

                              {selecionado && (
                                <Check
                                  size={15}
                                  className="text-orange-600"
                                />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white p-4 text-sm text-slate-500">
                      A divisão entre múltiplos pagadores poderá
                      ser configurada aqui.
                    </div>
                  )}
                </div>

                {/* DIVISÃO */}
                <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Users
                        size={21}
                        className="text-orange-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Todos os{" "}
                          {
                            participantesSelecionados.length
                          }{" "}
                          incluídos
                        </p>

                        <p className="text-xs text-slate-500">
                          Divisão padrão de 1 cota cada
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">
                        Valor individual
                      </p>

                      <p className="text-lg font-bold text-orange-700">
                        {valorIndividual.toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Espaço para não encostar no footer */}
          <div className="h-4" />
        </div>

        {/* FOOTER FIXO */}
        <footer className="grid shrink-0 grid-cols-[0.8fr_1.2fr] gap-3 border-t border-slate-200 bg-white px-8 py-4">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              bg-[#F1F5FF]
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-800
              transition
              hover:bg-slate-200
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvarTarefa}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-orange-500
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-orange-600
              active:bg-orange-700
            "
          >
            <Check size={18} />

            Salvar Tarefa
          </button>
        </footer>
      </div>
    </div>
  );
}