import AppShell from "../components/app-shell";
import Icon from "../components/icon";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS } from "../lib/endpoints";
import GroupFlows, { type GroupFlowControl, type Activity } from "../components/group-flows";
import { initials, money, share, type Payment } from "../lib/finance";
import {
  converterParaVisualizacao,
  corAvatar,
  cotasDaTarefa,
  dataBR,
  dataCurta,
  iconeTarefa,
  mapearTarefasDoGrupo,
  nomeCurto,
  nomePagador,
  nomeResponsavel,
  periodoGrupo,
  quantidadeParticipantes,
  somar,
  statusItem,
  type GrupoDetalheApi,
  type TarefaDetalheApi,
} from "../lib/grupo-dados";

import OrangeButton from "../components/orange-button";

import EditarTarefa, {
  type DadosTarefa,
  type ParticipanteTarefa,
} from "./editar-tarefa";

import VisualizarTarefa, { type Tarefa } from "./tarefa";
import TarefaConcluida from "./tarefa-concluida";

const categoriaGrupo = "Grupo";
const destinoGrupo = "";

type FiltroTarefas =
  | "todas"
  | "planejadas"
  | "andamento"
  | "concluidas";

/** Mini gráfico circular de progresso (Stitch, tela 19). */
function ProgressoCircular({ valor, rotulo }: { valor: number; rotulo: string }) {
  const arco = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";
  return (
    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <path className="text-surface-container-high" d={arco} fill="none" stroke="currentColor" strokeWidth="4"/>
        {valor > 0 && <path className="text-primary-container" d={arco} fill="none" stroke="currentColor" strokeDasharray={`${valor}, 100`} strokeLinecap="round" strokeWidth="4"/>}
      </svg>
      <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">{rotulo}</span>
    </div>
  );
}

export default function Grupo({ memberMode: initialMemberMode = false }: { memberMode?: boolean }) {
  const { idGrupo } = useParams<{ idGrupo?: string }>();
  const estado = useLocation().state as { nomeGrupo?: string } | null;
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";
  const [memberMode, setMemberMode] = useState(initialMemberMode);
  const [participantesAtuais, setParticipantesAtuais] =
    useState<ParticipanteTarefa[]>([]);
  const [parteIds, setParteIds] = useState<Record<string, string>>({});
  const [groupName, setGroupName] = useState(estado?.nomeGrupo || "Grupo");
  const [adminName, setAdminName] = useState("");
  const [closed, setClosed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [taskEvents, setTaskEvents] = useState<Activity[]>([]);
  const [feedback, setFeedback] = useState("");
  function record(text: string) { setFeedback(text); setTaskEvents(old => [{ text, date: new Date().toISOString() }, ...old]); }
  const flowControl = useRef<GroupFlowControl>(null);

  const [tarefas, setTarefas] = useState<DadosTarefa[]>([]);
  const [tarefaSelecionadaId, setTarefaSelecionadaId] =
    useState<string | null>(null);

  const [editarAberto, setEditarAberto] = useState(false);
  const [filtro, setFiltro] = useState<FiltroTarefas>("todas");
  const [busca, setBusca] = useState("");

  // Carrega o grupo real (membros, tarefas e partes) quando há um id na rota
  useEffect(() => {
    if (!idGrupo) return;
    let ativo = true;

    async function carregarGrupo() {
      try {
        const grupo = await apiRequest<GrupoDetalheApi>(ENDPOINTS.grupos.byId(idGrupo!));
        if (!ativo) return;
        setGroupName(grupo.nome);
        setClosed(Boolean(grupo.encerradoEm));

        const dono = grupo.membros.find((m) => m.funcao === "dono");
        if (dono) setAdminName(dono.user.name);

        const listaParticipantes: ParticipanteTarefa[] = grupo.membros.map((m) => ({
          id: m.idUser,
          nome: m.user.name,
          selecionado: true,
        }));
        setParticipantesAtuais(listaParticipantes);

        const meuMembro = grupo.membros.find((m) => m.idUser === user?.id);
        if (meuMembro) {
          setMemberMode(meuMembro.funcao !== "dono");
        }

        const detalhes = await apiRequest<TarefaDetalheApi[]>(
          `${ENDPOINTS.tarefas.base}?idGrupo=${encodeURIComponent(idGrupo!)}`,
        );
        if (!ativo) return;

        const { mapeadas, novosPagamentos, novasPartes } = mapearTarefasDoGrupo(
          detalhes,
          listaParticipantes,
          currentUserId,
        );

        setParteIds(novasPartes);
        setPayments(novosPagamentos);
        setTarefas(mapeadas);
      } catch (err) {
        if (ativo) {
          setFeedback(err instanceof ApiError ? err.message : "Não foi possível carregar os dados do grupo.");
        }
      }
    }

    void carregarGrupo();
    return () => {
      ativo = false;
    };
  }, [idGrupo, user?.id, currentUserId]);

  const tarefaSelecionada =
    tarefas.find((t) => t.id === tarefaSelecionadaId) ?? null;

  const tarefaVisualizacao = tarefaSelecionada
    ? converterParaVisualizacao(tarefaSelecionada, payments, groupName)
    : null;

  const totalDespesas = tarefas.reduce(
    (soma, tarefa) =>
      soma + (tarefa.possuiDespesa ? tarefa.valorTotal : 0),
    0
  );
  const tarefasComDespesa = tarefas.filter((t) => t.possuiDespesa).length;

  // Cotas de todas as tarefas com despesa.
  const cotas = tarefas.flatMap((tarefa) => cotasDaTarefa(tarefa, payments));
  const totalRateado = somar(cotas.map((c) => c.valor));
  const totalQuitado = somar(cotas.filter((c) => c.pago).map((c) => c.valor));
  const totalFaltante = Math.max(somar([totalRateado, -totalQuitado]), 0);
  const liquidacao = totalRateado > 0 ? Math.round((totalQuitado / totalRateado) * 100) : 0;
  const cotasQuitadas = cotas.filter((c) => c.pago).length;

  const minhasCotas = cotas.filter((c) => c.pessoa.id === currentUserId);
  const suaCota = somar(minhasCotas.map((c) => c.valor));
  const suaParte = somar(minhasCotas.filter((c) => !c.pago).map((c) => c.valor));
  const seuQuitado = Math.max(somar([suaCota, -suaParte]), 0);
  const liquidacaoAposPagar = totalRateado > 0 ? Math.round(((totalQuitado + suaParte) / totalRateado) * 100) : 0;
  const cotasPendentes = minhasCotas.filter((c) => !c.pago);
  const credores = [...new Set(cotasPendentes.map((c) => c.tarefa.pagadorId))]
    .map((id) => participantesAtuais.find((p) => p.id === id)?.nome)
    .filter((nome): nome is string => Boolean(nome));

  const tarefasConcluidas = tarefas.filter((t) => t.concluida).length;

  const progresso =
    tarefas.length > 0
      ? Math.round((tarefasConcluidas / tarefas.length) * 100)
      : 0;

  const contagem: Record<FiltroTarefas, number> = {
    todas: tarefas.length,
    planejadas: tarefas.filter((t) => !t.concluida && !t.emAndamento).length,
    andamento: tarefas.filter((t) => !t.concluida && t.emAndamento).length,
    concluidas: tarefasConcluidas,
  };

  const termoBusca = busca.trim().toLowerCase();

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (termoBusca && ![tarefa.titulo, nomeResponsavel(tarefa, currentUserId, user?.name), nomePagador(tarefa, currentUserId)].some((texto) => texto.toLowerCase().includes(termoBusca))) return false;
    if (filtro === "concluidas") return tarefa.concluida;
    if (filtro === "planejadas") return !tarefa.concluida && !tarefa.emAndamento;
    if (filtro === "andamento") return !tarefa.concluida && tarefa.emAndamento;
    return true;
  });

  const periodo = periodoGrupo(tarefas.map((t) => t.dataLimite));

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

  async function salvarEdicao(atualizada: DadosTarefa) {
    if (memberMode || closed) return;
    const previous = tarefas.find(t => t.id === atualizada.id);
    const hasPayments = Object.entries(payments).some(([key, value]) => key.startsWith(`${atualizada.id}:`) && value.status !== "pendente");
    if (previous && hasPayments && (previous.valorTotal !== atualizada.valorTotal || previous.pagadorId !== atualizada.pagadorId || previous.possuiDespesa !== atualizada.possuiDespesa || JSON.stringify(previous.participantes.filter(p => p.selecionado).map(p => p.id)) !== JSON.stringify(atualizada.participantes.filter(p => p.selecionado).map(p => p.id)))) { setFeedback("Existem pagamentos registrados. Preserve o valor e os participantes desta tarefa."); return; }
    let idFinal = creating ? crypto.randomUUID() : atualizada.id;

    if (idGrupo) {
      const agora = new Date();
      const dataFinal = atualizada.dataLimite
        ? new Date(`${atualizada.dataLimite}T${atualizada.horario || "23:59"}:00`)
        : new Date(agora.getTime() + 86400_000);
      const dataInicio = dataFinal > agora ? agora : new Date(dataFinal.getTime() - 3600_000);

      try {
        if (creating) {
          const criada = await apiRequest<{ id: string }>(ENDPOINTS.tarefas.base, {
            method: "POST",
            body: {
              idGrupo,
              nome: atualizada.titulo,
              descricao: atualizada.descricao || undefined,
              valorTotal: atualizada.possuiDespesa ? atualizada.valorTotal : undefined,
              dataInicio: dataInicio.toISOString(),
              dataFinal: dataFinal.toISOString(),
              tipoTarefa: atualizada.possuiDespesa ? "contribuinte" : "comum",
              statusAndamento: atualizada.concluida ? "FINALIZADA" : "AGENDADA",
            },
          });
          idFinal = criada.id;

          if (atualizada.possuiDespesa && atualizada.valorTotal > 0) {
            const selecionados = atualizada.participantes.filter((p) => p.selecionado);
            const novasPartes: Record<string, string> = {};
            for (let i = 0; i < selecionados.length; i++) {
              const cota = share(atualizada.valorTotal, selecionados.length, i);
              if (cota > 0) {
                const parte = await apiRequest<{ id: string }>(
                  ENDPOINTS.tarefas.partes(idFinal),
                  {
                    method: "POST",
                    body: {
                      idUser: selecionados[i].id,
                      descricao: `Cota: ${atualizada.titulo}`,
                      valor: cota.toFixed(2),
                    },
                  },
                );
                novasPartes[`${idFinal}:${selecionados[i].id}`] = parte.id;
              }
            }
            if (Object.keys(novasPartes).length > 0) {
              setParteIds((old) => ({ ...old, ...novasPartes }));
            }
          }
        } else {
          const valorNovo = atualizada.possuiDespesa ? atualizada.valorTotal : 0;
          const selecionados = atualizada.possuiDespesa && valorNovo > 0
            ? atualizada.participantes.filter((p) => p.selecionado)
            : [];
          const partesSync = selecionados
            .map((p, i) => ({
              idUser: p.id,
              descricao: `Cota: ${atualizada.titulo}`,
              valor: share(valorNovo, selecionados.length, i).toFixed(2),
            }))
            .filter((p) => Number(p.valor) > 0);

          const tarefaAtualizada = await apiRequest<{
            partes?: { id: string; idUser: string | null }[];
          }>(ENDPOINTS.tarefas.byId(atualizada.id), {
            method: "PATCH",
            body: {
              nome: atualizada.titulo,
              descricao: atualizada.descricao,
              valorTotal: valorNovo,
              dataFinal: dataFinal.toISOString(),
              statusAndamento: atualizada.concluida ? "FINALIZADA" : "EM_ANDAMENTO",
              partes: partesSync,
            },
          });

          const mapaAtualizado: Record<string, string> = {};
          for (const p of tarefaAtualizada.partes ?? []) {
            if (p.idUser) mapaAtualizado[`${atualizada.id}:${p.idUser}`] = p.id;
          }

          setParteIds((old) => {
            const next: Record<string, string> = {};
            for (const [k, v] of Object.entries(old)) {
              if (!k.startsWith(`${atualizada.id}:`)) next[k] = v;
            }
            return { ...next, ...mapaAtualizado };
          });
        }
      } catch (err) {
        setFeedback(err instanceof ApiError ? err.message : "Não foi possível salvar a tarefa.");
        return;
      }
    }

    record(`${creating ? "Tarefa criada" : "Tarefa editada"}: ${atualizada.titulo}`);
    setTarefas((anteriores) =>
      creating ? [...anteriores, { ...atualizada, id: idFinal }] : anteriores.map((tarefa) =>
        tarefa.id === atualizada.id ? atualizada : tarefa
      )
    );
    setCreating(false);
    setEditarAberto(false);
  }

  async function concluirTarefa(tarefa: Tarefa) {
    if (memberMode || closed) return;
    if (idGrupo) {
      try {
        await apiRequest(ENDPOINTS.tarefas.byId(tarefa.id), {
          method: "PATCH",
          body: { statusAndamento: "FINALIZADA" },
        });
      } catch (err) {
        setFeedback(err instanceof ApiError ? err.message : "Não foi possível concluir a tarefa.");
        return;
      }
    }
    record(`Tarefa concluida: ${tarefa.titulo}`);
    setTarefas((anteriores) =>
      anteriores.map((item) =>
        item.id === tarefa.id
          ? { ...item, concluida: true }
          : item
      )
    );
  }

  async function reabrirTarefa(tarefa: Tarefa) {
    if (memberMode || closed) return;
    if (idGrupo) {
      try {
        await apiRequest(ENDPOINTS.tarefas.byId(tarefa.id), {
          method: "PATCH",
          body: { statusAndamento: "EM_ANDAMENTO" },
        });
      } catch (err) {
        setFeedback(err instanceof ApiError ? err.message : "Não foi possível reabrir a tarefa.");
        return;
      }
    }
    record(`Tarefa reaberta: ${tarefa.titulo}`);
    setTarefas((anteriores) =>
      anteriores.map((item) =>
        item.id === tarefa.id ? { ...item, concluida: false } : item
      )
    );
  }

  async function excluirTarefa(tarefa: Tarefa) {
    if (memberMode || closed) return;
    if (Object.keys(payments).some(key => key.startsWith(`${tarefa.id}:`))) { setFeedback("Preserve tarefas com pagamentos registrados no historico."); return; }
    if (idGrupo) {
      try {
        await apiRequest(ENDPOINTS.tarefas.byId(tarefa.id), {
          method: "DELETE",
        });
      } catch (err) {
        setFeedback(err instanceof ApiError ? err.message : "Não foi possível excluir a tarefa.");
        return;
      }
    }
    record(`Tarefa excluida: ${tarefa.titulo}`);
    setTarefas((anteriores) =>
      anteriores.filter((item) => item.id !== tarefa.id)
    );
    fecharTarefa();
  }

  const filtros = ([
    ["todas", "Todas"],
    ["planejadas", "Planejadas"],
    ["andamento", "Em andamento"],
    ["concluidas", "Concluídas"],
  ] as const);

  // Agrupamento de avatares do cabeçalho.
  const avatares = (
    <div className="flex -space-x-2.5 overflow-hidden p-0.5">
      {participantesAtuais.map((p) => (
        <div
          key={p.id}
          title={p.id === currentUserId ? `${nomeCurto(p.nome)} (Você)` : p.nome}
          className={`inline-flex h-9 w-9 rounded-full ring-2 ring-surface-container-lowest items-center justify-center font-label-sm text-label-sm font-bold ${corAvatar(p.id, participantesAtuais)}`}
        >
          {initials(p.nome)}
        </div>
      ))}
    </div>
  );

  const barraFiltros = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
      <div className="flex items-center gap-space-xs scroll-fade-x pb-1 sm:pb-0" role="group" aria-label="Filtrar tarefas">
        {filtros.map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setFiltro(valor)}
            aria-pressed={filtro === valor}
            className={`px-space-md min-h-11 py-2 rounded-full font-label-sm text-label-sm transition-colors whitespace-nowrap cursor-pointer ${
              filtro === valor
                ? "bg-inverse-surface text-inverse-on-surface"
                : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {texto} ({contagem[valor]})
          </button>
        ))}
      </div>
      <label className="relative sm:min-w-[240px]">
        <span className="sr-only">Filtrar por nome ou pagador</span>
        <Icon name="filter_list" size={18} className="text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
        <input
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Filtrar por nome ou pagador..."
          className="w-full pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
        />
      </label>
    </div>
  );

  const estadoVazio = (
    <div className="flex flex-col items-center justify-center bg-surface-container-lowest rounded-xl shadow-sm text-center w-full px-space-lg py-16">
      <div className="w-24 h-24 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-space-md shadow-sm">
        <Icon name="beach_access" size={48} filled/>
      </div>
      {tarefas.length === 0 ? (
        <>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Nenhum item adicionado ainda</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2">
            Organize a viagem adicionando a primeira despesa compartilhada ou designando uma tarefa para os amigos.
          </p>
          {!memberMode && !closed && (
            <OrangeButton onClick={criarTarefa} className="mt-space-lg py-3 font-bold">
              <Icon name="add" size={20}/>
              Criar o primeiro item
            </OrangeButton>
          )}
        </>
      ) : (
        <>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Nenhuma tarefa encontrada neste filtro.</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mt-2">Ajuste o filtro ou a busca para ver outros itens do grupo.</p>
        </>
      )}
    </div>
  );

  return (
    <AppShell title="Visão Geral">
      <div className="flex flex-col gap-space-lg">
        {feedback && (
          <div role="status" className="flex items-center justify-between gap-space-md px-space-md py-space-sm rounded-xl bg-primary-fixed text-on-primary-fixed font-body-sm text-body-sm shadow-sm">
            <span className="flex items-center gap-space-sm">
              <Icon name="info" size={18} className="text-primary"/>
              {feedback}
            </span>
            <button type="button" onClick={() => setFeedback("")} aria-label="Fechar aviso" className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center hover:bg-primary-fixed-dim/50 transition-colors">
              <Icon name="close" size={18}/>
            </button>
          </div>
        )}

        {/* TRILHA DE NAVEGAÇÃO */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Trilha de navegação" className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant min-w-0">
            <Link to="/meus-grupos" className="hover:text-primary transition-colors flex items-center gap-1 shrink-0">
              <Icon name="groups" size={16}/>
              <span>Meus Grupos</span>
            </Link>
            <Icon name="chevron_right" size={14} className="text-outline"/>
            <span className="text-on-surface font-semibold truncate">{groupName}</span>
          </nav>
          {memberMode && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/80 text-on-surface-variant font-label-sm text-label-sm shadow-sm">
              <Icon name="person" size={15} className="text-primary"/>
              Visão de Membro
            </span>
          )}
        </div>

        {memberMode ? (
          /* CABEÇALHO — VISÃO DO MEMBRO COMUM */
          <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 rounded-xl bg-gradient-to-b from-surface-container-low/60 to-surface p-space-lg">
            <div className="flex flex-col gap-3 max-w-2xl min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider font-bold">
                  {categoriaGrupo}
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${closed ? "bg-outline" : "bg-emerald-500"}`}/>
                  {closed ? "Encerrado" : "Ativo"}{periodo && ` • ${periodo}`}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg lg:font-display lg:text-display text-on-surface tracking-tight font-extrabold break-words">
                {groupName}
              </h1>
              <div className="flex items-center gap-3 pt-1">
                {avatares}
                <span className="text-on-surface-variant font-body-sm text-body-sm">
                  {participantesAtuais.length} participantes confirmados
                </span>
              </div>
            </div>
          </section>
        ) : (
          /* CABEÇALHO — VISÃO DO ADMINISTRADOR */
          <section className="relative bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-fixed/20 pointer-events-none blur-3xl"/>
            <div className="absolute left-1/3 -bottom-20 w-48 h-48 rounded-full bg-secondary-fixed/30 pointer-events-none blur-2xl"/>
            <div className="flex flex-col gap-space-sm relative z-10 min-w-0">
              <div className="flex flex-wrap items-center gap-space-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                  <Icon name="beach_access" size={16}/>
                  {categoriaGrupo}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm ${closed ? "bg-surface-container-high text-on-surface-variant" : "bg-emerald-100 text-emerald-800"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${closed ? "bg-outline" : "bg-emerald-500"}`}/>
                  {closed ? "Encerrado" : "Ativo"}
                </span>
                {periodo && (
                  <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <Icon name="calendar_today" size={16}/>
                    {periodo}
                  </span>
                )}
                {destinoGrupo && (
                  <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <Icon name="location_on" size={16}/>
                    {destinoGrupo}
                  </span>
                )}
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1 break-words">
                {groupName}
              </h1>
              <div className="flex items-center gap-space-md mt-2">
                {avatares}
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {participantesAtuais.length} membros confirmados
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm relative z-10 shrink-0">
              <OrangeButton onClick={criarTarefa} disabled={memberMode || closed}>
                <Icon name="add_circle" size={20}/>
                Nova Tarefa
              </OrangeButton>
            </div>
          </section>
        )}

        {!closed && memberMode && (
          /* SITUAÇÃO PESSOAL DO MEMBRO */
          <section className="w-full bg-gradient-to-r from-primary-fixed/40 via-surface-container-lowest to-surface-container-lowest rounded-xl shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"/>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
              <div className="w-14 h-14 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                <Icon name="toll" size={32}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    Sua Situação neste Grupo
                  </span>
                  {suaParte > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold">Débito Pendente</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold">Em dia</span>
                  )}
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {suaParte > 0 ? (
                    <>Você deve <span className="text-secondary font-bold">{money(suaParte)}</span> {credores.length === 1 ? `para ${credores[0]}` : "no grupo"}</>
                  ) : (
                    "Você não possui pendências neste grupo"
                  )}
                </p>
                {cotasPendentes.length > 0 && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Referente a: <span className="font-medium text-on-surface">{cotasPendentes.map((c) => c.tarefa.titulo).join(", ")}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 z-10 shrink-0">
              <button
                type="button"
                onClick={() => flowControl.current?.openPayments()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary-container hover:bg-primary text-on-primary px-6 py-3.5 rounded-lg font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Icon name="qr_code_2" size={20}/>
                <span>Pagar Agora via Pix</span>
              </button>
            </div>
          </section>
        )}

        {!closed && (
          /* RESUMO FINANCEIRO */
          <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-label-md text-label-md">{memberMode ? "Total Acumulado" : "Total do Grupo"}</span>
                  <span className="text-on-surface font-numeric-stat text-numeric-stat mt-1">{money(totalDespesas)}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <Icon name={memberMode ? "receipt_long" : "payments"} size={22}/>
                </div>
              </div>
              <div className="mt-space-md flex flex-wrap items-center justify-between gap-2 text-on-surface-variant font-body-sm text-body-sm pt-space-xs">
                <span>{tarefasComDespesa} despesas {memberMode ? "registradas" : "catalogadas"}</span>
                {participantesAtuais.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-tertiary font-label-sm text-label-sm font-semibold">
                    <Icon name="receipt_long" size={16}/>
                    Média {money(totalDespesas / participantesAtuais.length)}/p
                  </span>
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-label-md text-label-md">{memberMode ? "Sua Cota Prevista" : "Sua Cota Pessoal"}</span>
                  <span className="text-on-surface font-numeric-stat text-numeric-stat mt-1">{money(suaCota)}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <Icon name={memberMode ? "pie_chart" : "account_balance_wallet"} size={22}/>
                </div>
              </div>
              <div className="mt-space-md flex flex-wrap items-center gap-space-sm pt-space-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"/>
                  Quitado: {money(seuQuitado)}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"/>
                  Pendente: {money(suaParte)}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant font-label-md text-label-md">{memberMode ? "Progresso de Liquidação" : "Liquidação Geral"}</span>
                  <div className="flex flex-wrap items-baseline gap-2 mt-1">
                    <span className="text-on-surface font-numeric-stat text-numeric-stat">{liquidacao}%</span>
                    <span className="text-on-surface-variant font-body-sm text-body-sm">
                      {memberMode ? `${cotasQuitadas} de ${cotas.length} cotas quitadas` : "do valor total quitado"}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
                  <Icon name="check_circle" size={22}/>
                </div>
              </div>
              <div className="mt-space-md w-full pt-space-xs">
                <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden flex" role="progressbar" aria-label="Liquidação do grupo" aria-valuenow={liquidacao} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: `${liquidacao}%` }}/>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-1.5">
                  <span>{money(totalQuitado)} transferidos</span>
                  <span className="font-bold text-primary">Faltam {money(totalFaltante)}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <GroupFlows idGrupo={idGrupo} currentUserId={currentUserId} adminName={adminName} parteIds={parteIds} taskEvents={taskEvents} ref={flowControl} payments={payments} setPayments={setPayments} tasks={tarefas} name={groupName} onName={setGroupName} closed={closed} onCloseGroup={() => setClosed(true)} memberMode={memberMode}/>

        {!closed && !memberMode && <>
          {/* TAREFAS E DESPESAS — VISÃO DO ADMINISTRADOR */}
          <section className="flex flex-col gap-space-md" aria-labelledby="grupo-tarefas-titulo">
            <div className="flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <h2 id="grupo-tarefas-titulo" className="font-headline-sm text-headline-sm text-on-surface font-bold">Tarefas &amp; Despesas</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">{tarefas.length}</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <div className="text-right">
                  <p className="font-label-md text-label-md text-on-surface">Progresso das Tarefas</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{tarefasConcluidas} de {tarefas.length} tarefas concluídas</p>
                </div>
                <ProgressoCircular valor={progresso} rotulo={`${tarefasConcluidas}/${tarefas.length}`}/>
              </div>
            </div>

            {barraFiltros}

            {tarefasFiltradas.length === 0 ? estadoVazio : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {tarefasFiltradas.map((tarefa) => {
                  const cotasTarefa = cotasDaTarefa(tarefa, payments);
                  const quitado = tarefa.possuiDespesa && cotasTarefa.length > 0 && cotasTarefa.every((c) => c.pago);
                  const status = statusItem(tarefa, quitado);
                  const quantidade = quantidadeParticipantes(tarefa);
                  const selecionados = tarefa.participantes.filter((p) => p.selecionado);
                  const responsavel = tarefa.participantes.find((p) => p.id === tarefa.responsavelId);
                  return (
                    <button
                      key={tarefa.id}
                      type="button"
                      onClick={() => abrirTarefa(tarefa.id)}
                      className="group text-left bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                    >
                      <div className="flex flex-col gap-space-sm w-full">
                        <div className="flex items-center justify-between gap-2">
                          {tarefa.possuiDespesa ? (
                            <span className="px-2.5 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                              <Icon name="sell" size={14}/>
                              Tarefa com custo
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                              <Icon name="task_alt" size={14}/>
                              Tarefa
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm font-semibold inline-flex items-center gap-1 whitespace-nowrap ${status.classe}`}>
                            <Icon name={status.icone} size={14}/>
                            {status.texto}
                          </span>
                        </div>
                        <div className="mt-1">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">{tarefa.titulo}</h3>
                          {tarefa.descricao && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{tarefa.descricao}</p>}
                          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
                            <Icon name="calendar_month" size={14}/>
                            Prazo: {dataBR(tarefa.dataLimite)}
                          </p>
                        </div>
                        <div className="py-space-sm bg-surface-container-low px-space-md rounded-lg flex items-center justify-between gap-2">
                          {tarefa.possuiDespesa ? (
                            <>
                              <div>
                                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">Valor total</span>
                                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{money(tarefa.valorTotal)}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">Por pessoa</span>
                                <span className="font-label-md text-label-md font-semibold text-on-surface">
                                  {quantidade > 0 ? `${money(share(tarefa.valorTotal, quantidade, quantidade - 1))} / ${quantidade} pax` : "Sem rateio"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">Custo estimado</span>
                                <span className="font-label-md text-label-md font-semibold text-on-surface-variant">Sem custo financeiro</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">Prazo</span>
                                <span className="font-label-md text-label-md font-semibold text-on-surface">{dataCurta(tarefa.dataLimite)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-space-md pt-space-sm flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 shrink-0 rounded-full font-label-sm text-label-sm font-bold flex items-center justify-center ${corAvatar(tarefa.responsavelId, participantesAtuais)}`}>
                            {responsavel ? initials(responsavel.nome) : "?"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                              {responsavel ? (responsavel.id === currentUserId ? "Você" : nomeCurto(responsavel.nome)) : "Não definido"}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">Responsável</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-sm shrink-0">
                          <div className="flex -space-x-1.5" aria-label={`${quantidade} participantes`}>
                            {selecionados.slice(0, 3).map((p) => (
                              <div key={p.id} className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface font-label-sm text-[10px] flex items-center justify-center font-bold ring-2 ring-surface-container-lowest">
                                {initials(p.nome)}
                              </div>
                            ))}
                            {selecionados.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-label-sm text-[10px] flex items-center justify-center font-bold ring-2 ring-surface-container-lowest">
                                +{selecionados.length - 3}
                              </div>
                            )}
                          </div>
                          <Icon name="chevron_right" size={18} className="text-outline transition-transform group-hover:translate-x-0.5"/>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ACERTO RÁPIDO VIA PIX */}
          <section className="bg-gradient-to-r from-primary-fixed/40 via-surface-container-low to-surface-container-lowest p-space-lg rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Icon name="qr_code_2" size={20}/>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface">
                  {suaParte > 0
                    ? `Você possui ${money(suaParte)} pendente${credores.length === 1 ? ` para ${credores[0]}` : " no grupo"}`
                    : "Você não possui pendências neste grupo"}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {suaParte > 0
                    ? `Liquidando agora, a taxa de quitação do grupo chega a ${liquidacaoAposPagar}%.`
                    : `A taxa de quitação do grupo está em ${liquidacao}%.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => flowControl.current?.openPayments()}
              className="px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all whitespace-nowrap shadow-sm active:scale-[0.98]"
            >
              Pagar via PIX
            </button>
          </section>
        </>}

        {!closed && memberMode && (
          /* TAREFAS E DESPESAS — VISÃO DO MEMBRO COMUM */
          <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden" aria-labelledby="grupo-tarefas-membro-titulo">
            <div className="px-6 pt-4 pb-3 bg-surface-container-low/40 flex flex-wrap items-center justify-between gap-space-md">
              <h2 id="grupo-tarefas-membro-titulo" className="font-label-md text-label-md text-primary font-bold flex items-center gap-2">
                <span>Tarefas e Despesas</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm">{tarefas.length}</span>
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{tarefasConcluidas} de {tarefas.length} tarefas concluídas</span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {barraFiltros}
              {tarefasFiltradas.length === 0 ? estadoVazio : tarefasFiltradas.map((tarefa) => {
                const cotasTarefa = cotasDaTarefa(tarefa, payments);
                const minha = cotasTarefa.find((c) => c.pessoa.id === currentUserId);
                const souPagador = tarefa.possuiDespesa && tarefa.pagadorId === currentUserId;
                const aReceber = somar(cotasTarefa.filter((c) => c.pessoa.id !== currentUserId && !c.pago).map((c) => c.valor));
                const quantidade = quantidadeParticipantes(tarefa);
                const pendente = !!minha && !minha.pago;
                const naoParticipa = tarefa.possuiDespesa && !minha;
                const selecionados = tarefa.participantes.filter((p) => p.selecionado);

                let chip = { texto: statusItem(tarefa, false).texto, classe: "bg-surface-container text-on-surface" };
                if (pendente) chip = { texto: "Sua parte pendente", classe: "bg-secondary-container text-on-secondary font-bold" };
                else if (souPagador) chip = { texto: "Você pagou", classe: "bg-surface-container text-on-surface" };
                else if (minha?.pago) chip = { texto: "Quitado por Você", classe: "bg-emerald-100 text-emerald-800 font-semibold" };
                else if (naoParticipa) chip = { texto: "Não participa", classe: "bg-surface-container-high text-on-surface-variant" };

                const detalhes = tarefa.possuiDespesa
                  ? souPagador
                    ? `Reembolso recebido de ${cotasTarefa.filter((c) => c.pessoa.id !== currentUserId && c.pago).length}/${Math.max(quantidade - 1, 0)} amigos`
                    : naoParticipa
                    ? `Apenas ${selecionados.map((p) => nomeCurto(p.nome)).join(", ")}`
                    : `Pago por ${nomePagador(tarefa, currentUserId)} • Divisão igual (${quantidade} pessoas)`
                  : `Responsável: ${nomeResponsavel(tarefa, currentUserId, user?.name)}`;

                return (
                  <div
                    key={tarefa.id}
                    className={`p-4 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      pendente
                        ? "bg-secondary-fixed/20 hover:bg-secondary-fixed/30"
                        : naoParticipa
                        ? "bg-surface/60 hover:bg-surface-container-low opacity-80 hover:opacity-100"
                        : "bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <button type="button" onClick={() => abrirTarefa(tarefa.id)} className="flex items-center gap-4 text-left min-w-0 flex-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pendente ? "bg-secondary-container/20 text-secondary" : "bg-surface-container text-primary"}`}>
                        <Icon name={iconeTarefa(tarefa.titulo)} size={24}/>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">{tarefa.titulo}</span>
                          <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${chip.classe}`}>{chip.texto}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                          <span>{detalhes}</span>
                          <span aria-hidden="true">•</span>
                          <span>{dataCurta(tarefa.dataLimite)}</span>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                      {tarefa.possuiDespesa ? (
                        <div className="flex flex-col md:text-right">
                          {souPagador ? (
                            <>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">Você recebe</span>
                              <span className="font-headline-sm text-headline-sm text-primary font-bold">+ {money(aReceber)}</span>
                            </>
                          ) : naoParticipa ? (
                            <>
                              <span className="font-label-sm text-label-sm text-outline">Sua cota</span>
                              <span className="font-headline-sm text-headline-sm text-outline">{money(0)}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">{pendente ? "Sua parte" : "Sua cota quitada"}</span>
                              <span className={`font-headline-sm text-headline-sm font-bold ${pendente ? "text-secondary" : "text-on-surface"}`}>{money(minha?.valor ?? 0)}</span>
                            </>
                          )}
                          <span className="font-label-sm text-label-sm text-outline">Total: {money(tarefa.valorTotal)}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col md:text-right">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Custo</span>
                          <span className="font-label-md text-label-md text-on-surface-variant">Sem custo financeiro</span>
                        </div>
                      )}
                      {pendente ? (
                        <button
                          type="button"
                          onClick={() => flowControl.current?.openPayments(tarefa.id)}
                          className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all active:scale-[0.98] shadow-sm"
                        >
                          Liquidar
                        </button>
                      ) : souPagador ? (
                        <span className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                          {aReceber > 0 ? "Quase Quitado" : "Quitado"}
                        </span>
                      ) : minha?.pago ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-label-md text-label-md">
                          <Icon name="verified" size={18}/>
                          <span>Pago</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          Sem impacto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* VISUALIZAÇÃO DA TAREFA */}
      {tarefaVisualizacao?.status !== "concluida" && tarefaVisualizacao && !editarAberto && (
        <VisualizarTarefa
          key={tarefaVisualizacao.id}
          aberta={true}
          tarefa={tarefaVisualizacao}
          usuarioId={currentUserId}
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
          tarefa={creating ? { id: "tarefa-nova", titulo: "", descricao: "", dataLimite: "", horario: "09:00", responsavelId: currentUserId, participantes: participantesAtuais, possuiDespesa: true, valorTotal: 0, pagadorId: currentUserId, comprovante: "", concluida: false } : tarefaSelecionada!}
          nomeGrupo={groupName}
          onClose={() => { setEditarAberto(false); setCreating(false); }}
          onSave={salvarEdicao}
        />
      )}
    </AppShell>
  );
}
