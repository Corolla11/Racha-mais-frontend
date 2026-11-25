import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

export type AtualizarPerfilDados = {
  name?: string;
  bio?: string;
  cidade?: string;
  telefone?: string;
};

const usuarioPublico = {
  id: true,
  name: true,
  email: true,
  image: true,
  bio: true,
  cidade: true,
  telefone: true,
  notificarDespesas: true,
  createdAt: true,
  chavesPix: true,
};

export const userService = {
  async obterPerfil(idUser: string) {
    return prisma.user.findFirstOrThrow({
      where: { id: idUser, deletedAt: null },
      select: usuarioPublico,
    });
  },

  async atualizarPerfil(idUser: string, dados: AtualizarPerfilDados) {
    if (
      dados.name === undefined &&
      dados.bio === undefined &&
      dados.cidade === undefined &&
      dados.telefone === undefined
    ) {
      throw new AppError(400, "Informe ao menos um campo para atualizar");
    }
    return prisma.user.update({
      where: { id: idUser },
      data: dados,
      select: usuarioPublico,
    });
  },

  async desativarConta(idUser: string) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: idUser },
        data: { deletedAt: new Date() },
      });
      await tx.session.deleteMany({ where: { userId: idUser } });
    });
  },

  async obter(idUser: string, idAlvo: string) {
    return prisma.user.findFirstOrThrow({
      where: {
        id: idAlvo,
        deletedAt: null,
        OR: [
          { id: idUser },
          { membros: { some: { grupo: { membros: { some: { idUser } } } } } },
        ],
      },
      select: usuarioPublico,
    });
  },
};
