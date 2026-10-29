import AppShell from "../components/app-shell";

import { useRef, useState } from "react";
import GroupFlows, { type GroupFlowControl, type Activity } from "../components/group-flows";
import { share, type Payment } from "../lib/finance";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  CreditCard,
  MapPin,
  Plus,
  QrCode,
  SlidersHorizontal,
  Users,
  WalletCards,
} from "lucide-react";

import OrangeButton from "../components/orange-button";

import EditarTarefa, {
  type DadosTarefa,
  type ParticipanteTarefa,
} from "./editar-tarefa";

import VisualizarTarefa, {
  type Tarefa,
  type ParticipanteTarefa as ParticipanteVisualizacao,
} from "./tarefa";
import TarefaConcluida from "./tarefa-concluida";

const nomeGrupo = "Viagem Florianópolis";

const participantesGrupo: ParticipanteTarefa[] = [
  { id: "1", nome: "Rodrigo Martins", selecionado: true },
  {
    id: "2",
    nome: "Mariana Silveira",
    email: "mariana.s@gmail.com",
    selecionado: true,
  },
  { id: "3", nome: "Lucas Martins", selecionado: true },
  { id: "4", nome: "Beatriz Alves", selecionado: true },
  { id: "5", nome: "Pedro Henrique", selecionado: true },
  { id: "6", nome: "Camila Rocha", selecionado: true },
];

function criarParticipantes(ids: string[]): ParticipanteTarefa[] {
  return participantesGrupo.map((p) => ({
    ...p,
    selecionado: ids.includes(p.id),
  }));
}

const tarefasIniciais: DadosTarefa[] = [
  {
    id: "tarefa-01",
    titulo: "Aluguel de Van executivo",
    descricao:
      "Organizar o aluguel de uma van executiva para transportar todos os participantes durante a viagem. Confirmar disponibilidade, horários de saída e retorno, capacidade e condições de pagamento.",
    dataLimite: "2025-11-14",
    horario: "09:00",
    responsavelId: "3",
    participantes: criarParticipantes(["1", "2", "3", "4", "5", "6"]),
    possuiDespesa: true,
    valorTotal: 1200,
    pagadorId: "3",
    comprovante: "",
    concluida: true,
  },
  {
    id: "tarefa-02",
    titulo: "Comprar carnes e bebidas para o churrasco",
    descricao:
      "Comprar carnes, bebidas, carvão, gelo e demais itens necessários para o churrasco do grupo. Verificar preços e organizar as compras antes do evento.",
    dataLimite: "2025-11-15",
    horario: "10:00",
    responsavelId: "2",
    participantes: criarParticipantes(["1", "2", "3", "5"]),
    possuiDespesa: true,
    valorTotal: 650,
    pagadorId: "2",
    comprovante: "",
    concluida: false,
  },
  {
    id: "tarefa-03",
    titulo: "Reservar passeios de barco na ilha",
    descricao:
      "Pesquisar e reservar passeios de barco para o grupo durante a viagem. Comparar preços, horários, duração e condições de cancelamento.",
    dataLimite: "2025-11-18",
    horario: "10:00",
    responsavelId: "1",
    participantes: criarParticipantes(["1", "2", "3", "4", "5"]),
    possuiDespesa: true,
    valorTotal: 190,
    pagadorId: "1",
    comprovante: "",
    concluida: false,
  },
  {
    id: "tarefa-04",
    titulo: "Comprar bebidas e gelo para o barco",
    descricao:
      "Comprar bebidas, gelo e itens de apoio para o passeio de barco. Verificar quantidades e organizar o transporte dos produtos.",
    dataLimite: "2025-11-20",
    horario: "08:00",
    responsavelId: "5",
    participantes: criarParticipantes(["1", "2", "5"]),
    possuiDespesa: true,
    valorTotal: 320,
    pagadorId: "5",
    comprovante: "",
    concluida: false,
  },
  {
    id: "tarefa-05",
    titulo: "Jantar de confraternização",
    descricao:
      "Organizar um jantar de confraternização para todos os participantes. Escolher restaurante, verificar cardápio, reservar mesa e combinar o horário.",
    dataLimite: "2025-11-22",
    horario: "19:00",
    responsavelId: "6",
    participantes: criarParticipantes(["1", "2", "3", "4", "5", "6"]),
    possuiDespesa: true,
    valorTotal: 450,
    pagadorId: "6",
    comprovante: "",
    concluida: false,
  },
];


function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataBR(data: string) {
  return data ? data.split("-").reverse().join("/") : "Não definida";
}

function iniciais(nome: string) {
  return nome
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}

function nomeResponsavel(tarefa: DadosTarefa) {
  const participante = tarefa.participantes.find(
    (p) => p.id === tarefa.responsavelId
  );

  if (!participante) return "Não definido";

  return participante.id === "1"
    ? "Você (Rodrigo)"
    : participante.nome;
}

function quantidadeParticipantes(tarefa: DadosTarefa) {
  return tarefa.participantes.filter((p) => p.selecionado).length;
}

// Converte os dados utilizados na edição para o formato
// utilizado pela tela de visualização.

function converterParaVisualizacao(dados: DadosTarefa, payments: Record<string, Payment>): Tarefa {
  const participantesSelecionados = dados.participantes.filter(
    (p) => p.selecionado
  );


  const participantes: ParticipanteVisualizacao[] =
    participantesSelecionados.map((p, index) => ({
      id: p.id,
      nome: p.nome,
      iniciais: iniciais(p.nome),
      funcao:
        p.id === dados.responsavelId
          ? "Responsável"
          : "Participante",
      cor: "bg-orange-100 text-orange-600",

      // Dados demonstrativos de pagamento:
      // o pagador aparece como tendo pago sua própria cota.
      valorPago:
        dados.possuiDespesa && (payments[`${dados.id}:${p.id}`]?.status === "confirmado" || (!payments[`${dados.id}:${p.id}`] && p.id === dados.pagadorId))
          ? share(dados.valorTotal, participantesSelecionados.length, index)
          : 0,

      statusPagamento:
        dados.possuiDespesa && (payments[`${dados.id}:${p.id}`]?.status === "confirmado" || (!payments[`${dados.id}:${p.id}`] && p.id === dados.pagadorId))
          ? "pago"
          : "pendente",
    }));

  return {
    id: dados.id,
    titulo: dados.titulo,
    grupo: nomeGrupo,
    status: dados.concluida ? "concluida" : dados.emAndamento ? "andamento" : "pendente",
    descricao: dados.descricao,
    responsavelId: dados.responsavelId,
    prazo: `${dataBR(dados.dataLimite)} às ${dados.horario}`,
    participantes,

    despesa: dados.possuiDespesa
      ? {
          valorTotal: dados.valorTotal,
          descricao: "Despesa vinculada à tarefa",
          categoria: "Geral",
          formaPagamento: "Pix",
          participantesIds: participantesSelecionados.map((p) => p.id),
        }
      : undefined,

    comprovantes: dados.comprovante
      ? [
          {
            id: "comprovante-1",
            nome: "Comprovante da tarefa",
            descricao: "Arquivo informado na edição",
            url: dados.comprovante,
          },
        ]
      : [],

    historico: [
      "Tarefa cadastrada no grupo.",
      ...(dados.concluida ? ["Tarefa marcada como concluída."] : []),
    ],
  };
}

type FiltroTarefas =
  | "todas"
  | "planejadas"
  | "andamento"
  | "concluidas";

export default function Grupo() {
  const [groupName, setGroupName] = useState(nomeGrupo);
  const [closed, setClosed] = useState(false);
  const [memberMode, setMemberMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [taskEvents, setTaskEvents] = useState<Activity[]>([]);
  const [feedback, setFeedback] = useState("");
  function record(text: string) { setFeedback(text); setTaskEvents(old => [{ text, date: new Date().toISOString() }, ...old]); }
  const flowControl = useRef<GroupFlowControl>(null);

  const [tarefas, setTarefas] = useState<DadosTarefa[]>(tarefasIniciais);
  const [tarefaSelecionadaId, setTarefaSelecionadaId] =
    useState<string | null>(null);

  const [editarAberto, setEditarAberto] = useState(false);
  const [filtro, setFiltro] = useState<FiltroTarefas>("todas");

  const tarefaSelecionada =
    tarefas.find((t) => t.id === tarefaSelecionadaId) ?? null;

  const tarefaVisualizacao = tarefaSelecionada
    ? converterParaVisualizacao(tarefaSelecionada, payments)
    : null;

  const totalDespesas = tarefas.reduce(
    (soma, tarefa) =>
      soma + (tarefa.possuiDespesa ? tarefa.valorTotal : 0),
    0
  );

  const suaParte = tarefas.reduce((total, tarefa) => {
    if (
      !tarefa.possuiDespesa ||
      !tarefa.participantes.some(
        (p) => p.id === "1" && p.selecionado
      )
    ) {
      return total;
    }

    const quantidade = quantidadeParticipantes(tarefa);
    const selected = tarefa.participantes.filter(p => p.selecionado);
    const confirmed = payments[`${tarefa.id}:1`]?.status === "confirmado" || (!payments[`${tarefa.id}:1`] && tarefa.pagadorId === "1");
    return total + (quantidade > 0 && !confirmed ? share(tarefa.valorTotal, quantidade, selected.findIndex(p => p.id === "1")) : 0);
  }, 0);

  const tarefasConcluidas = tarefas.filter((t) => t.concluida).length;

  const progresso =
    tarefas.length > 0
      ? Math.round((tarefasConcluidas / tarefas.length) * 100)
      : 0;

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === "concluidas") return tarefa.concluida;
    if (filtro === "planejadas") return !tarefa.concluida && !tarefa.emAndamento;
    if (filtro === "andamento") return !tarefa.concluida && tarefa.emAndamento;
    return true;
  });

  function abrirTarefa(id: string) {
    setTarefaSelecionadaId(id);
    setEditarAberto(false);
  }

  function criarTarefa() {
    if (memberMode || closed) return;
    setCreating(true);
    setEditarAberto(true);
  }

  function fecharTarefa() {
    setTarefaSelecionadaId(null);
    setEditarAberto(false);
  }

  function abrirEdicao() {
    setEditarAberto(true);
  }

  function salvarEdicao(atualizada: DadosTarefa) {
    if (memberMode || closed) return;
    const previous = tarefas.find(t => t.id === atualizada.id);
    const hasPayments = Object.entries(payments).some(([key, value]) => key.startsWith(`${atualizada.id}:`) && value.status !== "pendente");
    if (previous && hasPayments && (previous.valorTotal !== atualizada.valorTotal || previous.pagadorId !== atualizada.pagadorId || previous.possuiDespesa !== atualizada.possuiDespesa || JSON.stringify(previous.participantes.filter(p => p.selecionado).map(p => p.id)) !== JSON.stringify(atualizada.participantes.filter(p => p.selecionado).map(p => p.id)))) { setFeedback("Existem pagamentos registrados. Preserve o valor e os participantes desta tarefa."); return; }
    record(`${creating ? "Tarefa criada" : "Tarefa editada"}: ${atualizada.titulo}`);
    setTarefas((anteriores) =>
      creating ? [...anteriores, { ...atualizada, id: crypto.randomUUID() }] : anteriores.map((tarefa) =>
        tarefa.id === atualizada.id ? atualizada : tarefa
      )
    );
    setCreating(false);
    setEditarAberto(false);
  }

  function concluirTarefa(tarefa: Tarefa) {
    if (memberMode || closed) return;
    record(`Tarefa concluida: ${tarefa.titulo}`);
    setTarefas((anteriores) =>
      anteriores.map((item) =>
        item.id === tarefa.id
          ? { ...item, concluida: true }
          : item
      )
    );
  }

  function reabrirTarefa(tarefa: Tarefa) {
    if (memberMode || closed) return;
    record(`Tarefa reaberta: ${tarefa.titulo}`);
    setTarefas((anteriores) =>
      anteriores.map((item) =>
        item.id === tarefa.id ? { ...item, concluida: false } : item
      )
    );
  }

  function excluirTarefa(tarefa: Tarefa) {
    if (memberMode || closed) return;
    if (Object.keys(payments).some(key => key.startsWith(`${tarefa.id}:`))) { setFeedback("Preserve tarefas com pagamentos registrados no historico."); return; }
    record(`Tarefa excluida: ${tarefa.titulo}`);
    setTarefas((anteriores) =>
      anteriores.filter((item) => item.id !== tarefa.id)
    );
    fecharTarefa();
  }

  return (
    <AppShell title="Visão Geral">
      {feedback && <div className="racha-feedback" role="status">{feedback}<button onClick={() => setFeedback("")} aria-label="Fechar aviso"> x </button></div>}
        <div className="racha-group-host">
          {/* IDENTIFICAÇÃO DO GRUPO */}
          <div className="racha-group-intro mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                <Users size={14} />
                <span>Meus grupos</span>
                <ChevronRight size={13} />
                <span className="text-slate-600">{nomeGrupo}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <MapPin size={20} />
                </div>
                <h1 className="text-ui-page-title font-bold tracking-tight text-slate-900">
                  {groupName}
                </h1>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                  ● Ativo • 6 participantes
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  Praia & Lazer
                </span>
              </div>
            </div>

            <div className="w-fit shrink-0">
             <OrangeButton onClick={criarTarefa} disabled={memberMode || closed}>
              <Plus size={16} />
               Nova tarefa
             </OrangeButton>
            </div>
          </div>

          <div className="racha-role-preview"><label>Prévia de permissões: <select aria-label="Papel na demonstração" value={memberMode ? "member" : "admin"} onChange={event => setMemberMode(event.target.value === "member")} ><option value="admin">Administrador</option><option value="member">Membro comum</option></select></label></div>
          <GroupFlows taskEvents={taskEvents} ref={flowControl} payments={payments} setPayments={setPayments} tasks={tarefas} name={groupName} onName={setGroupName} closed={closed} onCloseGroup={() => setClosed(true)} memberMode={memberMode}/>
          {!closed && <>
          {/* RESUMO */}
          <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Total Despesas
                </span>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                  <WalletCards size={17} />
                </div>
              </div>
              <p className="text-2xl font-bold">{moeda(totalDespesas)}</p>
              <p className="mt-1 text-xs text-slate-500">
                Despesas demonstrativas das tarefas
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Sua Parte
                </span>
                <div className="rounded-lg bg-red-50 p-2 text-red-500">
                  <CreditCard size={17} />
                </div>
              </div>
              <p className="text-2xl font-bold">{moeda(suaParte)}</p>
              <p className="mt-1 text-xs text-slate-500">
                Rateio demonstrativo
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Progresso das Tarefas
                </span>
                <span className="text-sm font-bold text-orange-500">
                  {progresso}%
                </span>
              </div>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="text-xs text-slate-600">
                {tarefasConcluidas} de {tarefas.length} tarefas concluídas
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white">
                  <QrCode size={42} className="text-slate-800" />
                </div>
                <div className="min-w-0">
                  <p className="text-ui-caption font-semibold uppercase text-orange-600">
                    Ação rápida
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {moeda(suaParte)}
                  </p>
                  <button
                    type="button"
                    onClick={() => flowControl.current?.openPayments()} className="ui-button ui-button--md mt-1 flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-xs font-semibold text-white"
                  >
                    <Copy size={12} />
                    Pagar Pix
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* TAREFAS */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2 className="font-semibold">Tarefas do Grupo</h2>
                  <p className="text-xs text-slate-400">
                    Confira todas as tarefas, despesas e o progresso de cada uma.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={criarTarefa} disabled={memberMode || closed} className="ui-button ui-button--md flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
              >
                <Plus size={15} />
                Tarefa
              </button>
            </div>

            <div className="mb-4 flex w-fit flex-wrap gap-1 rounded-lg bg-blue-50 p-1">
              {([
                ["todas", "Todas"],
                ["planejadas", "Planejadas"],
                ["andamento", "Em andamento"],
                ["concluidas", "Concluídas"],
              ] as const).map(([valor, texto]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setFiltro(valor)}
                  className={`ui-button ui-button--md ${`rounded-md px-4 py-1.5 text-xs font-medium transition ${
                    filtro === valor
                      ? "bg-white text-slate-700 shadow-sm"
                      : "text-slate-500 hover:bg-white"
                  }`}`}
                >
                  {texto}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {tarefasFiltradas.map((tarefa) => (
                <button
                  key={tarefa.id}
                  type="button"
                  onClick={() => abrirTarefa(tarefa.id)}
                  className="ui-button ui-button--md group flex w-full flex-col gap-4 rounded-xl bg-[#F4F7FC] p-4 text-left transition hover:bg-blue-50 md:flex-row md:items-center"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                    {tarefa.concluida ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : (
                      <ClipboardList size={18} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {tarefa.titulo}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Responsável: {nomeResponsavel(tarefa)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        {quantidadeParticipantes(tarefa)} pessoas
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        {dataBR(tarefa.dataLimite)}
                      </span>
                    </div>
                  </div>

                  <div className="md:w-28">
                    <span className={`inline-flex rounded-full px-3 py-1 text-ui-caption font-medium ${
                      tarefa.concluida
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    }`}>
                      ● {tarefa.concluida ? "Concluída" : "Pendente"}
                    </span>
                  </div>

                  <div className="text-left md:w-32 md:text-right">
                    <p className="text-sm font-bold">
                      {tarefa.possuiDespesa
                        ? moeda(tarefa.valorTotal)
                        : "Sem despesa"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {tarefa.possuiDespesa
                        ? `${quantidadeParticipantes(tarefa)} no rateio`
                        : "Sem rateio"}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="hidden text-slate-400 transition group-hover:translate-x-1 md:block"
                  />
                </button>
              ))}

              {tarefasFiltradas.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  Nenhuma tarefa encontrada neste filtro.
                </p>
              )}
            </div>

            <div className="relative mt-4 h-28 overflow-hidden rounded-xl bg-slate-300">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
                alt="Destino da viagem"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 text-white">
                <p className="mb-1 flex items-center gap-1 text-ui-caption font-semibold uppercase">
                  <MapPin size={12} />
                  Destino confirmado
                </p>
                <p className="text-lg font-bold">
                  Praia da Joaquina & Campeche
                </p>
              </div>
            </div>
          </section>
          </>}
        </div>

      {/* VISUALIZAÇÃO DA TAREFA */}
      {tarefaVisualizacao?.status !== "concluida" && tarefaVisualizacao && !editarAberto && (
        <VisualizarTarefa
          key={tarefaVisualizacao.id}
          aberta={true}
          tarefa={tarefaVisualizacao}
          onFechar={fecharTarefa}
          onPagamento={() => { fecharTarefa(); flowControl.current?.openPayments(tarefaVisualizacao.id); }}
          onEditar={memberMode || closed ? undefined : abrirEdicao}
          onConcluir={memberMode || closed ? undefined : concluirTarefa}
          onExcluir={memberMode || closed ? undefined : excluirTarefa}
        />
      )}

      {/* HISTÓRICO DA TAREFA CONCLUÍDA */}
      {tarefaVisualizacao?.status === "concluida" && !editarAberto && (
        <TarefaConcluida
          key={tarefaVisualizacao.id}
          aberta={true}
          tarefa={tarefaVisualizacao}
          onFechar={fecharTarefa}
          onReabrir={memberMode || closed ? undefined : reabrirTarefa}
          onPagamento={() => { fecharTarefa(); flowControl.current?.openPayments(tarefaVisualizacao.id); }}
        />
      )}

      {/* EDIÇÃO DA TAREFA */}
      {(tarefaSelecionada || creating) && editarAberto && !closed && !memberMode && (
        <EditarTarefa
          modo={creating ? "criar" : "editar"}
          tarefa={creating ? { id: "tarefa-nova", titulo: "", descricao: "", dataLimite: "", horario: "09:00", responsavelId: "1", participantes: participantesGrupo, possuiDespesa: true, valorTotal: 0, pagadorId: "1", comprovante: "", concluida: false } : tarefaSelecionada!}
          nomeGrupo={nomeGrupo}
          onClose={() => { setEditarAberto(false); setCreating(false); }}
          onSave={salvarEdicao}
        />
      )}
    </AppShell>
  );
}
