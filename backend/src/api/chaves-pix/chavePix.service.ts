import type { TipoChave } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

export type CriarChavePixDados = {
  tipoChave: TipoChave;
  chave: string;
};

const visivelAoUsuario = (idUser: string) => ({
  OR: [
    { idUser },
    { user: { membros: { some: { grupo: { membros: { some: { idUser } } } } } } },
  ],
});

export const chavePixService = {
  async criar(idUser: string, dados: CriarChavePixDados) {
    return prisma.chavePix.create({ data: { ...dados, idUser } });
  },

  async listar(
    idUser: string,
    filtros: { idUser?: string; tipoChave?: TipoChave },
  ) {
    return prisma.chavePix.findMany({
      where: {
        ...filtros,
        idUser: filtros.idUser ?? idUser,
        ...visivelAoUsuario(idUser),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async obter(idUser: string, idChave: string) {
    return prisma.chavePix.findFirstOrThrow({
      where: { id: idChave, ...visivelAoUsuario(idUser) },
    });
  },

  async atualizar(
    idUser: string,
    idChave: string,
    dados: Partial<CriarChavePixDados>,
  ) {
    return prisma.chavePix.update({
      where: { id: idChave, idUser },
      data: dados,
    });
  },

  async excluir(idUser: string, idChave: string) {
    await prisma.chavePix.delete({ where: { id: idChave, idUser } });
  },
};
