import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { StatusAndamento } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

const MAX_TENTATIVAS_TRANSACAO = 3;

function erroPrismaComCodigo(erro: unknown, codigo: string): boolean {
  return (
    erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === codigo
  );
}

async function comRetryDeConflito<T>(operacao: () => Promise<T>): Promise<T> {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_TRANSACAO; tentativa += 1) {
    try {
      return await operacao();
    } catch (erro) {
      if (!erroPrismaComCodigo(erro, "P2034")) throw erro;
      if (tentativa === MAX_TENTATIVAS_TRANSACAO) {
        throw new AppError(
          409,
          "A tarefa foi alterada por outra operação. Tente novamente",
        );
      }
    }
  }

  throw new AppError(409, "Não foi possível concluir a operação concorrente");
}

export const parteRepository = {
  buscarTarefa(idTarefa: string) {
    return prisma.tarefa.findUnique({
      where: { id: idTarefa },
      select: { id: true, idGrupo: true, idUser: true, valorTotal: true },
    });
  },

  buscarMembro(idUser: string, idGrupo: string) {
    return prisma.membro.findUnique({
      where: { idUser_idGrupo: { idUser, idGrupo } },
      select: { idUser: true, idGrupo: true, funcao: true },
    });
  },

  listarPorTarefa(idTarefa: string) {
    return prisma.parte.findMany({
      where: { idTarefa },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        idUser: true,
        idTarefa: true,
        descricao: true,
        valor: true,
        status: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  buscarPorId(id: string) {
    return prisma.parte.findUnique({
      where: { id },
      select: {
        id: true,
        idUser: true,
        idTarefa: true,
        descricao: true,
        valor: true,
        status: true,
        user: { select: { id: true, name: true, image: true } },
        tarefa: { select: { id: true, idGrupo: true } },
      },
    });
  },

  transacionarTarefa<T>(
    idTarefa: string,
    operacao: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return comRetryDeConflito(() =>
      prisma.$transaction(
        async (tx) => {
          const tarefasAtualizadas = await tx.$executeRaw`
            UPDATE "tarefa" SET "updatedAt" = "updatedAt" WHERE "id" = ${idTarefa}
          `;
          if (tarefasAtualizadas === 0) {
            throw new AppError(404, "Tarefa não encontrada");
          }
          return operacao(tx);
        },
        { isolationLevel: "Serializable" },
      ),
    );
  },

  buscarNaTransacao(tx: Prisma.TransactionClient, id: string) {
    return tx.parte.findUnique({
      where: { id },
      select: {
        id: true,
        idUser: true,
        idTarefa: true,
        descricao: true,
        valor: true,
        status: true,
      },
    });
  },

  somarNaTransacao(
    tx: Prisma.TransactionClient,
    idTarefa: string,
    excluirId?: string,
  ) {
    return tx.parte.aggregate({
      where: {
        idTarefa,
        ...(excluirId ? { id: { not: excluirId } } : {}),
      },
      _sum: { valor: true },
    });
  },

  criarNaTransacao(
    tx: Prisma.TransactionClient,
    dados: {
      idUser: string;
      idTarefa: string;
      descricao: string;
      valor: string;
    },
  ) {
    return tx.parte.create({
      data: dados,
      select: {
        id: true,
        idUser: true,
        idTarefa: true,
        descricao: true,
        valor: true,
        status: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  atualizar(
    id: string,
    dados: {
      descricao?: string;
      valor?: string;
      status?: StatusAndamento;
    },
  ) {
    return prisma.parte
      .update({
        where: { id },
        data: dados,
        select: {
          id: true,
          idUser: true,
          idTarefa: true,
          descricao: true,
          valor: true,
          status: true,
          user: { select: { id: true, name: true, image: true } },
        },
      })
      .catch((erro: unknown) => {
        if (erroPrismaComCodigo(erro, "P2025")) {
          throw new AppError(404, "Parte não encontrada");
        }
        throw erro;
      });
  },

  atualizarNaTransacao(
    tx: Prisma.TransactionClient,
    id: string,
    dados: {
      descricao?: string;
      valor?: string;
      status?: StatusAndamento;
    },
  ) {
    return tx.parte.update({
      where: { id },
      data: dados,
      select: {
        id: true,
        idUser: true,
        idTarefa: true,
        descricao: true,
        valor: true,
        status: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  remover(id: string) {
    return prisma.parte.delete({ where: { id } }).catch((erro: unknown) => {
      if (erroPrismaComCodigo(erro, "P2025")) {
        throw new AppError(404, "Parte não encontrada");
      }
      throw erro;
    });
  },
};
