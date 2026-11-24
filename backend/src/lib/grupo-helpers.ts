import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import { Funcao } from "../generated/prisma/enums.js";
import { prisma } from "./prisma.js";

const MAX_TENTATIVAS_TRANSACAO = 3;

export function erroPrismaComCodigo(erro: unknown, codigo: string): boolean {
  return (
    erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === codigo
  );
}

export async function comRetryDeConflito<T>(
  operacao: () => Promise<T>,
  mensagemConflito = "O recurso foi alterado por outra operação. Tente novamente",
): Promise<T> {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_TRANSACAO; tentativa += 1) {
    try {
      return await operacao();
    } catch (erro) {
      if (!erroPrismaComCodigo(erro, "P2034")) throw erro;
      if (tentativa === MAX_TENTATIVAS_TRANSACAO) {
        throw new AppError(409, mensagemConflito);
      }
    }
  }
  throw new AppError(409, "Não foi possível concluir a operação concorrente");
}

export function transacionarGrupo<T>(
  idGrupo: string,
  operacao: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return comRetryDeConflito(
    () =>
      prisma.$transaction(
        async (tx) => {
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
    "O grupo foi alterado por outra operação. Tente novamente",
  );
}

export function transacionarTarefa<T>(
  idTarefa: string,
  operacao: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return comRetryDeConflito(
    () =>
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
    "A tarefa foi alterada por outra operação. Tente novamente",
  );
}

export async function exigirMembro(idUser: string, idGrupo: string) {
  const membro = await prisma.membro.findUnique({
    where: { idUser_idGrupo: { idUser, idGrupo } },
  });
  if (membro) return membro;

  const existe = (await prisma.grupo.count({ where: { id: idGrupo } })) > 0;
  throw existe
    ? new AppError(403, "Você não participa deste grupo")
    : new AppError(404, "Grupo não encontrado");
}

export async function exigirDono(
  idUser: string,
  idGrupo: string,
  mensagem = "Apenas o dono do grupo pode fazer isso",
) {
  const membro = await exigirMembro(idUser, idGrupo);
  if (membro.funcao !== Funcao.dono) {
    throw new AppError(403, mensagem);
  }
  return membro;
}

export async function exigirDonoNaTransacao(
  tx: Prisma.TransactionClient,
  idUser: string,
  idGrupo: string,
  mensagem = "Apenas o dono do grupo pode fazer isso",
) {
  const membro = await tx.membro.findUnique({
    where: { idUser_idGrupo: { idUser, idGrupo } },
  });
  if (!membro) {
    throw new AppError(403, "Você não participa deste grupo");
  }
  if (membro.funcao !== Funcao.dono) {
    throw new AppError(403, mensagem);
  }
  return membro;
}
