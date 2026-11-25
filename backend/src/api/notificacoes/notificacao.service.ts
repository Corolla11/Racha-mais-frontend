import { AppError } from "../../errors/AppError.js";
import { TipoNotificacao } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

const HORAS_AVISO_PRAZO = 24;
const HORAS_JANELA_ATRASO = 24;
const LOCK_ID_LEMBRETES = 84209173;

export type NovaNotificacao = {
  idUser: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  chaveEvento: string;
  idGrupo?: string | null;
  idTarefa?: string | null;
  idParte?: string | null;
};

type ParteComPrazo = {
  id: string;
  idUser: string;
  idTarefa: string;
  tarefa: { idGrupo: string; nome: string; dataFinal: Date };
};

const selecaoPublica = {
  id: true,
  tipo: true,
  titulo: true,
  mensagem: true,
  idGrupo: true,
  idTarefa: true,
  idParte: true,
  lidaEm: true,
  createdAt: true,
};

export function construirLembretesDePrazo(
  partes: ParteComPrazo[],
  agora: Date,
): NovaNotificacao[] {
  return partes.map((parte) => {
    const dataFinal = parte.tarefa.dataFinal;
    const proximoDoPrazo = dataFinal > agora;
    const tipo = proximoDoPrazo
      ? TipoNotificacao.PRAZO_PROXIMO
      : TipoNotificacao.PRAZO_VENCIDO;

    return {
      idUser: parte.idUser,
      tipo,
      titulo: proximoDoPrazo ? "Prazo se aproximando" : "Prazo vencido",
      mensagem: proximoDoPrazo
        ? `A tarefa "${parte.tarefa.nome}" vence nas próximas 24 horas.`
        : `O prazo da tarefa "${parte.tarefa.nome}" venceu.`,
      idGrupo: parte.tarefa.idGrupo,
      idTarefa: parte.idTarefa,
      idParte: parte.id,
      chaveEvento: `prazo:${tipo}:${parte.id}:${dataFinal.toISOString()}`,
    };
  });
}

export const notificacaoService = {
  async listar(
    idUser: string,
    options: { naoLidas: boolean; pagina: number; limite: number },
  ) {
    const where = {
      idUser,
      ...(options.naoLidas ? { lidaEm: null } : {}),
    };
    const [notificacoes, naoLidas] = await prisma.$transaction([
      prisma.notificacao.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (options.pagina - 1) * options.limite,
        take: options.limite + 1,
        select: selecaoPublica,
      }),
      prisma.notificacao.count({ where: { idUser, lidaEm: null } }),
    ]);
    const temMais = notificacoes.length > options.limite;
    return {
      notificacoes: notificacoes.slice(0, options.limite),
      naoLidas,
      pagina: options.pagina,
      limite: options.limite,
      temMais,
    };
  },

  async marcarLida(idUser: string, id: string) {
    const resultado = await prisma.notificacao.updateMany({
      where: { id, idUser, lidaEm: null },
      data: { lidaEm: new Date() },
    });
    if (resultado.count === 0) {
      const notificacao = await prisma.notificacao.findFirst({
        where: { id, idUser },
        select: { id: true },
      });
      if (!notificacao) throw new AppError(404, "Notificação não encontrada");
    }
  },

  marcarTodasLidas(idUser: string) {
    return prisma.notificacao.updateMany({
      where: { idUser, lidaEm: null },
      data: { lidaEm: new Date() },
    });
  },

  salvarPreferencias(idUser: string, notificarDespesas: boolean) {
    return prisma.user.update({
      where: { id: idUser },
      data: { notificarDespesas },
      select: { notificarDespesas: true },
    });
  },

  async emitirLembretesDePrazo(agora = new Date()) {
    return prisma.$transaction(async (tx) => {
      const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(${LOCK_ID_LEMBRETES}) AS locked
      `;
      if (!locked) return { count: 0 };

      const fimProximoPrazo = new Date(
        agora.getTime() + HORAS_AVISO_PRAZO * 60 * 60 * 1000,
      );
      const inicioAtrasoRecente = new Date(
        agora.getTime() - HORAS_JANELA_ATRASO * 60 * 60 * 1000,
      );
      const partes = await tx.parte.findMany({
        where: {
          status: { notIn: ["FINALIZADA", "CANCELADA"] },
          tarefa: {
            dataFinal: { gt: inicioAtrasoRecente, lte: fimProximoPrazo },
            statusAndamento: { notIn: ["FINALIZADA", "CANCELADA"] },
          },
        },
        select: {
          id: true,
          idUser: true,
          idTarefa: true,
          tarefa: { select: { idGrupo: true, nome: true, dataFinal: true } },
        },
      });

      const notificacoes = construirLembretesDePrazo(partes, agora);
      if (notificacoes.length === 0) return { count: 0 };
      return tx.notificacao.createMany({
        data: notificacoes,
        skipDuplicates: true,
      });
    });
  },
};

export function iniciarAgendadorDeNotificacoes(
  intervaloMs = 15 * 60 * 1000,
): () => void {
  let executando = false;
  const executar = async () => {
    if (executando) return;
    executando = true;
    try {
      const resultado = await notificacaoService.emitirLembretesDePrazo();
      if (resultado.count > 0) {
        console.info(`Lembretes de prazo criados: ${resultado.count}`);
      }
    } catch (erro) {
      console.error("Falha ao processar lembretes de prazo", erro);
    } finally {
      executando = false;
    }
  };

  void executar();
  const timer = setInterval(() => void executar(), intervaloMs);
  timer.unref();
  return () => clearInterval(timer);
}
