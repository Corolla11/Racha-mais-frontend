import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { Funcao } from "../../generated/prisma/enums.js";
import { Prisma } from "../../generated/prisma/client.js";

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
          "O grupo foi alterado por outra operação. Tente novamente",
        );
      }
    }
  }

  throw new AppError(409, "Não foi possível concluir a operação concorrente");
}

export const membroRepository = {
  buscarGrupo(idGrupo: string) {
    return prisma.grupo.findUnique({ where: { id: idGrupo }, select: { id: true } });
  },

  buscarUsuario(idUser: string) {
    return prisma.user.findUnique({ where: { id: idUser }, select: { id: true } });
  },

  buscarUsuarioPorEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, select: { id: true } });
  },

  buscarMembro(idUser: string, idGrupo: string) {
    return prisma.membro.findUnique({
      where: { idUser_idGrupo: { idUser, idGrupo } },
    });
  },

  listarPorGrupo(idGrupo: string) {
    return prisma.membro.findMany({
      where: { idGrupo },
      orderBy: { user: { name: "asc" } },
      select: {
        idUser: true,
        idGrupo: true,
        funcao: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  transacionarGrupo<T>(
    idGrupo: string,
    operacao: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return comRetryDeConflito(() =>
      prisma.$transaction(
        async (tx) => {
          // Escrita na linha do grupo serializa as operações concorrentes do grupo.
          const gruposAtualizados = await tx.$executeRaw`
            UPDATE "grupo" SET "updatedAt" = "updatedAt" WHERE "id" = ${idGrupo}
          `;
          if (gruposAtualizados === 0) {
            throw new AppError(404, "Grupo não encontrado");
          }
          return operacao(tx);
        },
        { isolationLevel: "Serializable" },
      ),
    );
  },

  buscarMembroNaTransacao(
    tx: Prisma.TransactionClient,
    idUser: string,
    idGrupo: string,
  ) {
    return tx.membro.findUnique({
      where: { idUser_idGrupo: { idUser, idGrupo } },
    });
  },

  contarDonosNaTransacao(tx: Prisma.TransactionClient, idGrupo: string) {
    return tx.membro.count({ where: { idGrupo, funcao: Funcao.dono } });
  },

  async criarNaTransacao(
    tx: Prisma.TransactionClient,
    idUser: string,
    idGrupo: string,
  ) {
    try {
      return await tx.membro.create({
        data: { idUser, idGrupo, funcao: Funcao.membro },
        select: {
          idUser: true,
          idGrupo: true,
          funcao: true,
          user: { select: { id: true, name: true, image: true } },
        },
      });
    } catch (erro) {
      if (erroPrismaComCodigo(erro, "P2002")) {
        throw new AppError(409, "Este usuário já participa do grupo");
      }
      if (erroPrismaComCodigo(erro, "P2003")) {
        throw new AppError(404, "Usuário não encontrado");
      }
      throw erro;
    }
  },

  atualizarFuncaoNaTransacao(
    tx: Prisma.TransactionClient,
    idUser: string,
    idGrupo: string,
    funcao: Funcao,
  ) {
    return tx.membro.update({
      where: { idUser_idGrupo: { idUser, idGrupo } },
      data: { funcao },
      select: {
        idUser: true,
        idGrupo: true,
        funcao: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  removerNaTransacao(tx: Prisma.TransactionClient, idUser: string, idGrupo: string) {
    return tx.membro.delete({
      where: { idUser_idGrupo: { idUser, idGrupo } },
    });
  },
};
