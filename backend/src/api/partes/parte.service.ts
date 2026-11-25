import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
  Funcao,
  StatusAndamento,
  TipoNotificacao,
} from "../../generated/prisma/enums.js";
import {
  erroPrismaComCodigo,
  exigirGrupoAberto,
  transacionarTarefa,
} from "../../lib/grupo-helpers.js";
import { prisma } from "../../lib/prisma.js";
import { criarUrlLeituraAssinada } from "../../lib/s3.js";

type DadosParte = {
  idUser?: string;
  descricao?: string;
  valor?: string;
  status?: StatusAndamento;
  comprovanteKey?: string | null;
  comprovanteNome?: string | null;
  motivoContestacao?: string | null;
};

type AlteracoesParte = {
  descricao?: string;
  valor?: string;
  status?: StatusAndamento;
  comprovanteKey?: string | null;
  comprovanteNome?: string | null;
  motivoContestacao?: string | null;
};

export function validarSomaPartes(
  somaAtual: Prisma.Decimal | null,
  valorNovo: string,
  valorTotal: Prisma.Decimal,
): void {
  const soma = somaAtual ?? new Prisma.Decimal(0);
  if (soma.plus(valorNovo).gt(valorTotal)) {
    throw new AppError(
      409,
      "A soma das partes não pode ultrapassar o valor total da tarefa",
    );
  }
}

async function exigirTarefa(idTarefa: string) {
  const tarefa = await prisma.tarefa.findUnique({
    where: { id: idTarefa },
    select: {
      id: true,
      idGrupo: true,
      idUser: true,
      nome: true,
      dataFinal: true,
      valorTotal: true,
    },
  });
  if (!tarefa) throw new AppError(404, "Tarefa não encontrada");
  return tarefa;
}

async function buscarMembro(idUser: string, idGrupo: string) {
  return prisma.membro.findUnique({
    where: { idUser_idGrupo: { idUser, idGrupo } },
    select: { idUser: true, idGrupo: true, funcao: true },
  });
}

async function exigirMembroDaTarefa(idUser: string, idTarefa: string) {
  const tarefa = await exigirTarefa(idTarefa);
  const membro = await buscarMembro(idUser, tarefa.idGrupo);
  if (!membro) throw new AppError(403, "Você não participa do grupo desta tarefa");
  return { tarefa, membro };
}

function podeGerenciar(
  idSolicitante: string,
  tarefa: { idUser: string },
  membro: { funcao: string } | null,
) {
  return (
    tarefa.idUser === idSolicitante || membro?.funcao === Funcao.dono
  );
}

const selecaoParte = {
  id: true,
  idUser: true,
  idTarefa: true,
  descricao: true,
  valor: true,
  status: true,
  comprovanteKey: true,
  comprovanteNome: true,
  motivoContestacao: true,
  user: { select: { id: true, name: true, image: true } },
};

export const parteService = {
  async criar(idSolicitante: string, idTarefa: string, dados: DadosParte) {
    const tarefa = await exigirTarefa(idTarefa);
    const membro = await buscarMembro(idSolicitante, tarefa.idGrupo);
    if (!podeGerenciar(idSolicitante, tarefa, membro)) {
      throw new AppError(
        403,
        "Apenas o criador da tarefa ou o dono do grupo pode criar partes",
      );
    }
    await exigirGrupoAberto(prisma, tarefa.idGrupo);

    if (!dados.idUser) {
      throw new AppError(400, "idUser é obrigatório");
    }
    const idUser = dados.idUser;
    const membroAtribuido = await buscarMembro(idUser, tarefa.idGrupo);
    if (!membroAtribuido) {
      throw new AppError(
        400,
        "O usuário atribuído deve ser membro do grupo da tarefa",
      );
    }
    const descricao = dados.descricao ?? "";
    const valor = dados.valor!;

    return transacionarTarefa(idTarefa, async (tx) => {
      const tarefaAtual = await tx.tarefa.findUnique({
        where: { id: idTarefa },
        select: { valorTotal: true },
      });
      if (!tarefaAtual) throw new AppError(404, "Tarefa não encontrada");
      const { _sum } = await tx.parte.aggregate({
        where: { idTarefa },
        _sum: { valor: true },
      });
      validarSomaPartes(_sum.valor, valor, tarefaAtual.valorTotal);

      const parte = await tx.parte.create({
        data: { idUser, idGrupo: tarefa.idGrupo, idTarefa, descricao, valor },
        select: {
          ...selecaoParte,
          tarefa: { select: { nome: true, idGrupo: true } },
        },
      });
      const destinatario = await tx.user.findUnique({
        where: { id: parte.idUser },
        select: { notificarDespesas: true },
      });
      if (destinatario?.notificarDespesas !== false) {
        await tx.notificacao.createMany({
          data: [
            {
              idUser: parte.idUser,
              tipo: TipoNotificacao.COBRANCA_CRIADA,
              titulo: "Nova cobrança",
              mensagem: `Você recebeu uma cobrança de ${Number(parte.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} na tarefa "${parte.tarefa.nome}".`,
              idGrupo: parte.tarefa.idGrupo,
              idTarefa: parte.idTarefa,
              idParte: parte.id,
              chaveEvento: `cobranca-criada:${parte.id}`,
            },
          ],
          skipDuplicates: true,
        });
      }
      const { tarefa: _tarefa, ...resposta } = parte;
      return resposta;
    });
  },

  async listar(idSolicitante: string, idTarefa: string) {
    await exigirMembroDaTarefa(idSolicitante, idTarefa);
    return prisma.parte.findMany({
      where: { idTarefa },
      orderBy: { createdAt: "asc" },
      select: selecaoParte,
    });
  },

  async obter(idSolicitante: string, id: string) {
    const parte = await prisma.parte.findUnique({
      where: { id },
      select: { ...selecaoParte, tarefa: { select: { id: true, idGrupo: true } } },
    });
    if (!parte) throw new AppError(404, "Parte não encontrada");
    await exigirMembroDaTarefa(idSolicitante, parte.idTarefa);
    return parte;
  },

  async obterComprovante(idSolicitante: string, id: string) {
    const parte = await prisma.parte.findUnique({
      where: { id },
      select: {
        id: true,
        idTarefa: true,
        comprovanteKey: true,
        comprovanteNome: true,
      },
    });
    if (!parte) throw new AppError(404, "Parte não encontrada");
    await exigirMembroDaTarefa(idSolicitante, parte.idTarefa);
    if (!parte.comprovanteKey) {
      throw new AppError(404, "Esta parte não possui comprovante");
    }
    const url = await criarUrlLeituraAssinada({ key: parte.comprovanteKey });
    return { url, nome: parte.comprovanteNome };
  },

  async atualizar(idSolicitante: string, id: string, dados: DadosParte) {
    const parte = await prisma.parte.findUnique({
      where: { id },
      select: { ...selecaoParte, tarefa: { select: { id: true, idGrupo: true } } },
    });
    if (!parte) throw new AppError(404, "Parte não encontrada");
    const tarefa = await exigirTarefa(parte.idTarefa);
    const membro = await buscarMembro(idSolicitante, tarefa.idGrupo);

    const alteracoes: AlteracoesParte = {};
    if (dados.descricao !== undefined) alteracoes.descricao = dados.descricao;
    if (dados.valor !== undefined) alteracoes.valor = dados.valor;
    if (dados.status !== undefined) alteracoes.status = dados.status;
    if (dados.comprovanteKey !== undefined) {
      if (
        dados.comprovanteKey !== null &&
        !dados.comprovanteKey.startsWith(`comprovantes/${id}/`)
      ) {
        throw new AppError(400, "Chave de comprovante inválida para esta parte");
      }
      alteracoes.comprovanteKey = dados.comprovanteKey;
    }
    if (dados.comprovanteNome !== undefined) {
      alteracoes.comprovanteNome = dados.comprovanteNome;
    }
    if (dados.motivoContestacao !== undefined) {
      alteracoes.motivoContestacao = dados.motivoContestacao;
    }
    if (Object.keys(alteracoes).length === 0) {
      throw new AppError(400, "Informe descrição, valor, status ou comprovante para atualizar");
    }

    const podeGerenciarParte = podeGerenciar(idSolicitante, tarefa, membro);
    const somenteAtualizacaoPropria = Object.keys(alteracoes).every(
      (k) =>
        k === "status" ||
        k === "comprovanteKey" ||
        k === "comprovanteNome" ||
        (k === "motivoContestacao" && alteracoes.motivoContestacao === null),
    );
    if (!podeGerenciarParte && !membro) {
      throw new AppError(403, "Você não participa do grupo desta tarefa");
    }
    if (!podeGerenciarParte && !(idSolicitante === parte.idUser && somenteAtualizacaoPropria)) {
      throw new AppError(
        403,
        "Você só pode atualizar o status e o comprovante da sua própria parte",
      );
    }
    await exigirGrupoAberto(prisma, tarefa.idGrupo);

    if (alteracoes.valor !== undefined) {
      const valorNovo = alteracoes.valor;
      return transacionarTarefa(parte.idTarefa, async (tx) => {
        const tarefaAtual = await tx.tarefa.findUnique({
          where: { id: parte.idTarefa },
          select: { valorTotal: true },
        });
        if (!tarefaAtual) throw new AppError(404, "Tarefa não encontrada");
        const parteAtual = await tx.parte.findUnique({
          where: { id },
          select: { id: true, idUser: true, idTarefa: true, descricao: true, valor: true, status: true },
        });
        if (!parteAtual) throw new AppError(404, "Parte não encontrada");
        const { _sum } = await tx.parte.aggregate({
          where: { idTarefa: parte.idTarefa, id: { not: id } },
          _sum: { valor: true },
        });
        validarSomaPartes(_sum.valor, valorNovo, tarefaAtual.valorTotal);
        return tx.parte.update({
          where: { id },
          data: alteracoes,
          select: selecaoParte,
        });
      });
    }

    return prisma.parte
      .update({
        where: { id },
        data: alteracoes,
        select: selecaoParte,
      })
      .catch((erro: unknown) => {
        if (erroPrismaComCodigo(erro, "P2025")) {
          throw new AppError(404, "Parte não encontrada");
        }
        throw erro;
      });
  },

  async remover(idSolicitante: string, id: string) {
    const parte = await prisma.parte.findUnique({
      where: { id },
      select: { id: true, idTarefa: true },
    });
    if (!parte) throw new AppError(404, "Parte não encontrada");
    const tarefa = await exigirTarefa(parte.idTarefa);
    const membro = await buscarMembro(idSolicitante, tarefa.idGrupo);
    if (!podeGerenciar(idSolicitante, tarefa, membro)) {
      throw new AppError(
        403,
        "Apenas o criador da tarefa ou o dono do grupo pode remover partes",
      );
    }
    await exigirGrupoAberto(prisma, tarefa.idGrupo);
    await prisma.parte.delete({ where: { id } }).catch((erro: unknown) => {
      if (erroPrismaComCodigo(erro, "P2025")) {
        throw new AppError(404, "Parte não encontrada");
      }
      throw erro;
    });
  },
};
