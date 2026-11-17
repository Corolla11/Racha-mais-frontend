import { prisma } from "../../lib/prisma.js";

const usuarioPublico = {
  id: true,
  name: true,
  email: true,
  image: true,
  createdAt: true,
  chavesPix: true,
};

export const userService = {
  async obterPerfil(idUser: string) {
    return prisma.user.findUniqueOrThrow({
      where: { id: idUser },
      select: usuarioPublico,
    });
  },

  async obter(idUser: string, idAlvo: string) {
    return prisma.user.findFirstOrThrow({
      where: {
        id: idAlvo,
        OR: [
          { id: idUser },
          { membros: { some: { grupo: { membros: { some: { idUser } } } } } },
        ],
      },
      select: usuarioPublico,
    });
  },
};
