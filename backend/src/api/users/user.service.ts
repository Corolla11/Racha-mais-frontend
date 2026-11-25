import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { criarUrlLeituraAssinada } from "../../lib/s3.js";

export type AtualizarPerfilDados = {
  name?: string;
  bio?: string;
  cidade?: string;
  telefone?: string;
  image?: string | null;
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
      dados.telefone === undefined &&
      dados.image === undefined
    ) {
      throw new AppError(400, "Informe ao menos um campo para atualizar");
    }
    if (
      dados.image !== undefined &&
      dados.image !== null &&
      !dados.image.startsWith(`avatares/${idUser}/`)
    ) {
      throw new AppError(400, "Chave de avatar inválida");
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

  async obterAvatar(idUser: string, idAlvo: string) {
    const usuario = await prisma.user.findFirstOrThrow({
      where: {
        id: idAlvo,
        deletedAt: null,
        OR: [
          { id: idUser },
          { membros: { some: { grupo: { membros: { some: { idUser } } } } } },
        ],
      },
      select: { image: true },
    });
    if (!usuario.image?.startsWith("avatares/")) {
      throw new AppError(404, "Usuário não possui avatar");
    }
    return { url: await criarUrlLeituraAssinada({ key: usuario.image }) };
  },
};
