import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { TipoNotificacao } from "../../generated/prisma/enums.js";

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

export const notificacaoRepository = {
  criarNaTransacao(
    tx: Prisma.TransactionClient,
    notificacoes: NovaNotificacao[],
  ) {
    if (notificacoes.length === 0) return Promise.resolve({ count: 0 });
    return tx.notificacao.createMany({
      data: notificacoes,
      skipDuplicates: true,
    });
  },

  criar(notificacoes: NovaNotificacao[]) {
    if (notificacoes.length === 0) return Promise.resolve({ count: 0 });
    return prisma.notificacao.createMany({
      data: notificacoes,
      skipDuplicates: true,
    });
  },

  listar(
    idUser: string,
    options: { naoLidas: boolean; pagina: number; limite: number },
  ) {
    const where = {
      idUser,
      ...(options.naoLidas ? { lidaEm: null } : {}),
    };
    return prisma.$transaction([
      prisma.notificacao.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (options.pagina - 1) * options.limite,
        take: options.limite + 1,
        select: selecaoPublica,
      }),
      prisma.notificacao.count({ where: { idUser, lidaEm: null } }),
    ]);
  },

  marcarLida(idUser: string, id: string, lidaEm: Date) {
    return prisma.notificacao.updateMany({
      where: { id, idUser, lidaEm: null },
      data: { lidaEm },
    });
  },

  existeDoUsuario(idUser: string, id: string) {
    return prisma.notificacao.findFirst({
      where: { id, idUser },
      select: { id: true },
    });
  },

  marcarTodasLidas(idUser: string, lidaEm: Date) {
    return prisma.notificacao.updateMany({
      where: { idUser, lidaEm: null },
      data: { lidaEm },
    });
  },

  listarPartesComPrazo(inicio: Date, fim: Date) {
    return prisma.parte.findMany({
      where: {
        status: { notIn: ["FINALIZADA", "CANCELADA"] },
        tarefa: {
          dataFinal: { gt: inicio, lte: fim },
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
  },
};
