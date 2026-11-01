import { prisma } from "../../lib/prisma.js";
import { Funcao } from "../../generated/prisma/enums.js";

export const grupoRepository = {
  criarComDono(idUser: string, dados: { nome: string; descricao: string }) {
    return prisma.grupo.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        membros: { create: { idUser, funcao: Funcao.dono } },
      },
    });
  },

  listarPorUsuario(idUser: string) {
    return prisma.grupo.findMany({
      where: { membros: { some: { idUser } } },
      orderBy: { createdAt: "desc" },
    });
  },

  buscarPorId(id: string) {
    return prisma.grupo.findUnique({
      where: { id },
      include: {
        membros: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });
  },

  async existe(id: string) {
    return (await prisma.grupo.count({ where: { id } })) > 0;
  },

  buscarMembro(idUser: string, idGrupo: string) {
    return prisma.membro.findUnique({
      where: { idUser_idGrupo: { idUser, idGrupo } },
    });
  },

  atualizar(id: string, dados: { nome?: string; descricao?: string }) {
    return prisma.grupo.update({ where: { id }, data: dados });
  },

  excluir(id: string) {
    return prisma.grupo.delete({ where: { id } });
  },
};
