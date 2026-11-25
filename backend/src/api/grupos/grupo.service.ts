import { AppError } from "../../errors/AppError.js";
import { Funcao } from "../../generated/prisma/enums.js";
import {
  exigirDono,
  exigirDonoNaTransacao,
  exigirGrupoAberto,
  exigirMembro,
  transacionarGrupo,
} from "../../lib/grupo-helpers.js";
import { prisma } from "../../lib/prisma.js";

function validarNome(nome: unknown): string {
  if (typeof nome !== "string" || nome.trim().length === 0) {
    throw new AppError(400, "O nome do grupo é obrigatório");
  }
  if (nome.trim().length > 100) {
    throw new AppError(
      400,
      "O nome do grupo deve ter no máximo 100 caracteres",
    );
  }
  return nome.trim();
}

function validarDescricao(descricao: unknown): string | undefined {
  if (descricao === undefined) return undefined;
  if (typeof descricao !== "string") {
    throw new AppError(400, "A descrição deve ser um texto");
  }
  return descricao.trim();
}

export const grupoService = {
  criar(idUser: string, dados: { nome?: unknown; descricao?: unknown }) {
    return prisma.grupo.create({
      data: {
        nome: validarNome(dados.nome),
        descricao: validarDescricao(dados.descricao) ?? "",
        membros: { create: { idUser, funcao: Funcao.dono } },
      },
    });
  },

  listar(idUser: string) {
    return prisma.grupo.findMany({
      where: { membros: { some: { idUser } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async obter(idUser: string, idGrupo: string) {
    await exigirMembro(idUser, idGrupo);
    return prisma.grupo.findUnique({
      where: { id: idGrupo },
      include: {
        membros: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });
  },

  async atualizar(
    idUser: string,
    idGrupo: string,
    dados: { nome?: unknown; descricao?: unknown },
  ) {
    await exigirDono(idUser, idGrupo);

    const alteracoes: { nome?: string; descricao?: string } = {};
    if (dados.nome !== undefined) alteracoes.nome = validarNome(dados.nome);
    const descricao = validarDescricao(dados.descricao);
    if (descricao !== undefined) alteracoes.descricao = descricao;

    if (Object.keys(alteracoes).length === 0) {
      throw new AppError(400, "Informe nome ou descrição para atualizar");
    }

    await exigirGrupoAberto(prisma, idGrupo);
    return prisma.grupo.update({ where: { id: idGrupo }, data: alteracoes });
  },

  async encerrar(idUser: string, idGrupo: string) {
    await exigirDono(idUser, idGrupo);
    return transacionarGrupo(idGrupo, async (tx) => {
      await exigirDonoNaTransacao(tx, idUser, idGrupo);
      const atual = await tx.grupo.findUniqueOrThrow({
        where: { id: idGrupo },
      });
      if (atual.encerradoEm !== null) return atual;
      return tx.grupo.update({
        where: { id: idGrupo },
        data: { encerradoEm: new Date() },
      });
    });
  },

  async excluir(idUser: string, idGrupo: string) {
    await exigirDono(idUser, idGrupo);
    await transacionarGrupo(idGrupo, async (tx) => {
      await exigirDonoNaTransacao(tx, idUser, idGrupo);
      const assinaturaAtivaOuPendente = await tx.assinaturaPro.count({
        where: {
          idGrupo,
          status: { in: ["ATIVA", "PENDENTE"] },
        },
      });
      if (assinaturaAtivaOuPendente > 0) {
        throw new AppError(
          409,
          "Cancele o checkout ou a assinatura Pro antes de excluir o grupo",
        );
      }
      const [partesCount, tarefasComValorCount] = await Promise.all([
        tx.parte.count({ where: { tarefa: { idGrupo } } }),
        tx.tarefa.count({ where: { idGrupo, valorTotal: { gt: 0 } } }),
      ]);
      if (partesCount > 0 || tarefasComValorCount > 0) {
        throw new AppError(
          409,
          "Grupos com cobranças ou pagamentos não podem ser excluídos; encerre o grupo para manter o histórico",
        );
      }
      await tx.grupo.delete({ where: { id: idGrupo } });
    });
  },
};
