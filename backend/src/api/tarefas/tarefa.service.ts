import { ForbiddenError } from "../../errors/AppError.js";
import {
  Funcao,
  type StatusAndamento,
  type TipoTarefa,
} from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

export type CriarTarefaDados = {
  idGrupo: string;
  nome: string;
  descricao?: string;
  valorTotal?: number;
  dataInicio: Date;
  dataFinal: Date;
  tipoTarefa: TipoTarefa;
  statusAndamento?: StatusAndamento;
};

const membroPublico = {
  include: { user: { select: { id: true, name: true, image: true } } },
};

async function exigirMembro(idUser: string, idGrupo: string) {
  await prisma.grupo.findUniqueOrThrow({ where: { id: idGrupo } });

  const membro = await prisma.membro.findUnique({
    where: { idUser_idGrupo: { idUser, idGrupo } },
  });
  if (!membro) throw new ForbiddenError("Você não participa deste grupo");
  return membro;
}

async function exigirPermissaoEdicao(idUser: string, idTarefa: string) {
  const tarefa = await prisma.tarefa.findUniqueOrThrow({
    where: { id: idTarefa },
  });
  const membro = await exigirMembro(idUser, tarefa.idGrupo);

  if (tarefa.idUser !== membro.idUser && membro.funcao !== Funcao.dono) {
    throw new ForbiddenError(
      "Apenas o criador da tarefa ou o dono do grupo pode fazer isso",
    );
  }
}

export const tarefaService = {
  async criar(idUser: string, dados: CriarTarefaDados) {
    await exigirMembro(idUser, dados.idGrupo);
    return prisma.tarefa.create({ data: { ...dados, idUser } });
  },

  async listar(
    idUser: string,
    filtros: Partial<Pick<CriarTarefaDados, "idGrupo" | "tipoTarefa" | "statusAndamento">>,
  ) {
    if (filtros.idGrupo) await exigirMembro(idUser, filtros.idGrupo);

    return prisma.tarefa.findMany({
      where: { ...filtros, grupo: { membros: { some: { idUser } } } },
      orderBy: [{ dataFinal: "asc" }, { createdAt: "desc" }],
    });
  },

  async obter(idUser: string, idTarefa: string) {
    const tarefa = await prisma.tarefa.findUniqueOrThrow({
      where: { id: idTarefa },
      include: {
        membro: membroPublico,
        partes: { include: { membro: membroPublico } },
      },
    });
    await exigirMembro(idUser, tarefa.idGrupo);
    return tarefa;
  },

  async atualizar(
    idUser: string,
    idTarefa: string,
    dados: Partial<Omit<CriarTarefaDados, "idGrupo">>,
  ) {
    await exigirPermissaoEdicao(idUser, idTarefa);
    return prisma.tarefa.update({ where: { id: idTarefa }, data: dados });
  },

  async excluir(idUser: string, idTarefa: string) {
    await exigirPermissaoEdicao(idUser, idTarefa);
    await prisma.tarefa.delete({ where: { id: idTarefa } });
  },
};
