import { initials, share, type Payment } from "./finance.ts";
import type { DadosTarefa, ParticipanteTarefa } from "../pages/editar-tarefa";
import type { Tarefa, ParticipanteTarefa as ParticipanteVisualizacao } from "../pages/tarefa";

export type GrupoDetalheApi = {
  id: string;
  nome: string;
  descricao: string;
  encerradoEm?: string | null;
  membros: {
    idUser: string;
    funcao: "dono" | "membro";
    user: { id: string; name: string; image: string | null };
  }[];
};

export type TarefaDetalheApi = {
  id: string;
  idGrupo: string;
  idUser: string;
  nome: string;
  descricao: string | null;
  valorTotal: string | number | null;
  dataInicio: string;
  dataFinal: string;
  statusAndamento: "AGENDADA" | "EM_ANDAMENTO" | "FINALIZADA" | "ATRASADA" | "CANCELADA";
  partes?: {
    id: string;
    idUser: string | null;
    valor: string | number;
    status: "AGENDADA" | "EM_ANDAMENTO" | "FINALIZADA" | "ATRASADA" | "CANCELADA";
    comprovanteKey?: string | null;
    comprovanteNome?: string | null;
    motivoContestacao?: string | null;
  }[];
};

export interface Cota {
  tarefa: DadosTarefa;
  pessoa: ParticipanteTarefa;
  valor: number;
  pago: boolean;
}

export function somar(valores: number[]) {
  return valores.reduce((total, valor) => total + Math.round(valor * 100), 0) / 100;
}

export function dataBR(data: string) {
  return data ? data.split("-").reverse().join("/") : "Não definida";
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function dataCurta(data: string) {
  if (!data) return "Sem prazo";
  const [, mes, dia] = data.split("-");
  return `${Number(dia)} ${MESES[Number(mes) - 1] ?? ""}`;
}

/** Período do grupo a partir dos prazos das tarefas (ex.: "14 a 22 Nov 2025"). */
export function periodoGrupo(datas: string[]) {
  const validas = datas.filter(Boolean).sort();
  if (!validas.length) return "";
  const inicio = validas[0];
  const fim = validas[validas.length - 1];
  const [anoInicio, mesInicio, diaInicio] = inicio.split("-");
  const [anoFim, mesFim, diaFim] = fim.split("-");
  if (inicio === fim) return `${Number(diaInicio)} ${MESES[Number(mesInicio) - 1]} ${anoInicio}`;
  if (anoInicio === anoFim && mesInicio === mesFim) return `${Number(diaInicio)} a ${Number(diaFim)} ${MESES[Number(mesFim) - 1]} ${anoFim}`;
  return `${dataCurta(inicio)} a ${dataCurta(fim)} ${anoFim}`;
}

export function nomeCurto(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1].charAt(0)}.` : partes[0];
}

const coresAvatar = [
  "bg-primary-container text-on-primary",
  "bg-secondary-fixed text-on-secondary-fixed",
  "bg-primary-fixed-dim text-on-primary-fixed",
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-surface-container-highest text-on-surface-variant",
  "bg-surface-container-high text-on-surface",
];

export function corAvatar(id: string, lista: ParticipanteTarefa[] = []) {
  const indice = lista.findIndex((p) => p.id === id);
  return coresAvatar[(indice < 0 ? 0 : indice) % coresAvatar.length];
}

export function nomeResponsavel(tarefa: DadosTarefa, currentUserId: string, currentUserName?: string) {
  const participante = tarefa.participantes.find((p) => p.id === tarefa.responsavelId);
  if (!participante) return "Não definido";
  return participante.id === currentUserId
    ? currentUserName
      ? `Você (${currentUserName.split(" ")[0]})`
      : "Você"
    : participante.nome;
}

export function nomePagador(tarefa: DadosTarefa, currentUserId: string) {
  const pagador = tarefa.participantes.find((p) => p.id === tarefa.pagadorId);
  if (!pagador) return "Não definido";
  return pagador.id === currentUserId ? "Você" : pagador.nome;
}

export function quantidadeParticipantes(tarefa: DadosTarefa) {
  return tarefa.participantes.filter((p) => p.selecionado).length;
}

export function iconeTarefa(titulo: string) {
  const texto = titulo.toLowerCase();
  if (/van|carro|transporte|combust|ped[aá]gio|uber/.test(texto)) return "airport_shuttle";
  if (/churrasco|carne|carv[aã]o/.test(texto)) return "outdoor_grill";
  if (/barco|passeio|escuna/.test(texto)) return "directions_boat";
  if (/bebida|gelo|cerveja/.test(texto)) return "local_bar";
  if (/jantar|restaurante|almo[cç]o|comida/.test(texto)) return "restaurant";
  if (/casa|hosped|airbnb|hotel|aluguel/.test(texto)) return "house";
  return "task_alt";
}

export function cotasDaTarefa(tarefa: DadosTarefa, payments: Record<string, Payment>): Cota[] {
  if (!tarefa.possuiDespesa) return [];
  const selecionados = tarefa.participantes.filter((p) => p.selecionado);
  return selecionados.map((pessoa, index) => {
    const pagamento = payments[`${tarefa.id}:${pessoa.id}`];
    return {
      tarefa,
      pessoa,
      valor: share(tarefa.valorTotal, selecionados.length, index),
      pago: pagamento?.status === "confirmado" || (!pagamento && pessoa.id === tarefa.pagadorId),
    };
  });
}

export function converterParaVisualizacao(
  dados: DadosTarefa,
  payments: Record<string, Payment>,
  groupLabel: string,
): Tarefa {
  const participantesSelecionados = dados.participantes.filter((p) => p.selecionado);
  const participantes: ParticipanteVisualizacao[] = participantesSelecionados.map((p, index) => ({
    id: p.id,
    nome: p.nome,
    iniciais: initials(p.nome),
    funcao: p.id === dados.responsavelId ? "Responsável" : "Participante",
    cor: corAvatar(p.id, dados.participantes),
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
    grupo: groupLabel,
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
      ? [{ id: "comprovante-1", nome: "Comprovante da tarefa", descricao: "Arquivo informado na edição", url: dados.comprovante }]
      : [],
    historico: [
      "Tarefa cadastrada no grupo.",
      ...(dados.concluida ? ["Tarefa marcada como concluída."] : []),
    ],
  };
}

export function statusItem(tarefa: DadosTarefa, quitado: boolean) {
  if (tarefa.concluida) {
    return quitado
      ? { texto: "Quitado", icone: "check_circle", classe: "bg-emerald-100 text-emerald-800" }
      : { texto: "Concluída", icone: "task_alt", classe: "bg-emerald-100 text-emerald-800" };
  }
  if (tarefa.emAndamento) return { texto: "Em andamento", icone: "sync", classe: "bg-blue-100 text-blue-900" };
  return { texto: "Pendente", icone: "hourglass_empty", classe: "bg-amber-100 text-amber-900" };
}

function formatarPrazoLocal(iso: string): { dataLimite: string; horario: string } {
  if (!iso) return { dataLimite: "", horario: "09:00" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { dataLimite: iso.slice(0, 10), horario: iso.slice(11, 16) || "09:00" };
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dataLimite: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    horario: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function mapearTarefasDoGrupo(
  detalhes: TarefaDetalheApi[],
  listaParticipantes: ParticipanteTarefa[],
  currentUserId: string,
) {
  const novosPagamentos: Record<string, Payment> = {};
  const novasPartes: Record<string, string> = {};

  const mapeadas: DadosTarefa[] = detalhes.map((t) => {
    const valor = t.valorTotal != null ? Number(t.valorTotal) : 0;
    const partes = t.partes ?? [];
    const idsNasPartes = new Set(
      partes.map((p) => p.idUser).filter((id): id is string => Boolean(id)),
    );
    const responsavel = t.idUser ?? listaParticipantes[0]?.id ?? currentUserId;
    const { dataLimite, horario } = formatarPrazoLocal(t.dataFinal);

    for (const p of partes) {
      if (p.idUser) {
        const key = `${t.id}:${p.idUser}`;
        novasPartes[key] = p.id;
        const extras: Pick<Payment, "receiptKey" | "receiptName" | "reason"> = {
          ...(p.comprovanteKey ? { receiptKey: p.comprovanteKey } : {}),
          ...(p.comprovanteNome ? { receiptName: p.comprovanteNome } : {}),
          ...(p.motivoContestacao ? { reason: p.motivoContestacao } : {}),
        };
        if (p.status === "FINALIZADA") {
          novosPagamentos[key] = { status: "confirmado", ...extras };
        } else if (p.status === "EM_ANDAMENTO") {
          novosPagamentos[key] = { status: "informado", ...extras };
        } else if (p.motivoContestacao) {
          novosPagamentos[key] = { status: "contestado", ...extras };
        }
      }
    }

    return {
      id: t.id,
      titulo: t.nome,
      descricao: t.descricao ?? "",
      dataLimite,
      horario,
      responsavelId: responsavel,
      participantes: listaParticipantes.map((m) => ({
        ...m,
        selecionado: idsNasPartes.size > 0 ? idsNasPartes.has(m.id) : true,
      })),
      possuiDespesa: valor > 0,
      valorTotal: valor,
      pagadorId: responsavel,
      comprovante: "",
      concluida: t.statusAndamento === "FINALIZADA",
      emAndamento: t.statusAndamento === "EM_ANDAMENTO",
    };
  });

  return { mapeadas, novosPagamentos, novasPartes };
}
