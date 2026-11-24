import { AppError, ForbiddenError } from "../../errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
  Funcao,
  TipoNotificacao,
  type StatusAndamento,
  type TipoTarefa,
} from "../../generated/prisma/enums.js";
import {
  exigirMembro,
  transacionarTarefa,
} from "../../lib/grupo-helpers.js";
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
  return tarefa;
}

export const tarefaService = {
  async criar(idUser: string, dados: CriarTarefaDados) {
    await exigirMembro(idUser, dados.idGrupo);
    return prisma.$transaction(async (tx) => {
      const tarefa = await tx.tarefa.create({ data: { ...dados, idUser } });
      const [grupo, membros] = await Promise.all([
        tx.grupo.findUniqueOrThrow({
          where: { id: dados.idGrupo },
          select: { nome: true },
        }),
        tx.membro.findMany({
          where: { idGrupo: dados.idGrupo, idUser: { not: idUser } },
          select: { idUser: true },
        }),
      ]);
      const valorTotal = Number(tarefa.valorTotal);
      const detalhes = [
        `A tarefa "${tarefa.nome}" foi criada no grupo "${grupo.nome}".`,
        tarefa.descricao ? tarefa.descricao : undefined,
        valorTotal > 0
          ? `Valor total: ${valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`
          : undefined,
      ]
        .filter(Boolean)
        .join(" ");

      if (membros.length > 0) {
        await tx.notificacao.createMany({
          data: membros.map(({ idUser: idDestinatario }) => ({
            idUser: idDestinatario,
            tipo: TipoNotificacao.TAREFA_CRIADA,
            titulo: "Nova tarefa no grupo",
            mensagem: detalhes,
            idGrupo: dados.idGrupo,
            idTarefa: tarefa.id,
            chaveEvento: `tarefa-criada:${tarefa.id}:${idDestinatario}`,
          })),
          skipDuplicates: true,
        });
      }
      return tarefa;
    });
  },

  async listar(
    idUser: string,
    filtros: Partial<Pick<CriarTarefaDados, "idGrupo" | "tipoTarefa" | "statusAndamento">>,
  ) {
    if (filtros.idGrupo) await exigirMembro(idUser, filtros.idGrupo);

    return prisma.tarefa.findMany({
      where: { ...filtros, grupo: { membros: { some: { idUser } } } },
      include: {
        partes: {
          select: {
            id: true,
            idUser: true,
            valor: true,
            status: true,
          },
        },
      },
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
    const tarefaAtual = await exigirPermissaoEdicao(idUser, idTarefa);

    const dataInicio = dados.dataInicio ?? tarefaAtual.dataInicio;
    const dataFinal = dados.dataFinal ?? tarefaAtual.dataFinal;
    if (dataFinal < dataInicio) {
      throw new AppError(
        400,
        "A data final deve ser igual ou posterior à data inicial",
      );
    }

    if (dados.valorTotal !== undefined) {
      const novoValorTotal = new Prisma.Decimal(dados.valorTotal);
      return transacionarTarefa(idTarefa, async (tx) => {
        const { _sum } = await tx.parte.aggregate({
          where: { idTarefa },
          _sum: { valor: true },
        });
        const somaAtual = _sum.valor ?? new Prisma.Decimal(0);
        if (somaAtual.gt(novoValorTotal)) {
          throw new AppError(
            409,
            "O valor total da tarefa não pode ser menor que a soma das partes cadastradas",
          );
        }
        return tx.tarefa.update({ where: { id: idTarefa }, data: dados });
      });
    }

    return prisma.tarefa.update({ where: { id: idTarefa }, data: dados });
  },

  async excluir(idUser: string, idTarefa: string) {
    await exigirPermissaoEdicao(idUser, idTarefa);
    await prisma.tarefa.delete({ where: { id: idTarefa } });
  },
};
