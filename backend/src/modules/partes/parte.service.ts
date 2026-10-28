import { AppError } from "../../errors/AppError.js";
import { Funcao, StatusAndamento } from "../../generated/prisma/enums.js";
import { Prisma } from "../../generated/prisma/client.js";
import { parteRepository } from "./parte.repository.js";
import {
  validarCamposPermitidos,
  validarDescricao,
  validarSomaPartes,
  validarStatus,
  validarValor,
} from "./parte.validation.js";

type DadosParte = {
  idUser?: unknown;
  descricao?: unknown;
  valor?: unknown;
  status?: unknown;
};

type AlteracoesParte = {
  descricao?: string;
  valor?: string;
  status?: StatusAndamento;
};

function comoDecimal(valor: Prisma.Decimal | null): Prisma.Decimal {
  return valor ?? new Prisma.Decimal(0);
}

async function exigirTarefa(idTarefa: string) {
  const tarefa = await parteRepository.buscarTarefa(idTarefa);
  if (!tarefa) throw new AppError(404, "Tarefa não encontrada");
  return tarefa;
}

async function exigirMembroDaTarefa(idUser: string, idTarefa: string) {
  const tarefa = await exigirTarefa(idTarefa);
  const membro = await parteRepository.buscarMembro(idUser, tarefa.idGrupo);
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

export const parteService = {
  async criar(idSolicitante: string, idTarefa: string, dados: DadosParte) {
    validarCamposPermitidos(dados, ["idUser", "descricao", "valor"]);
    const tarefa = await exigirTarefa(idTarefa);
    const membro = await parteRepository.buscarMembro(
      idSolicitante,
      tarefa.idGrupo,
    );
    if (!podeGerenciar(idSolicitante, tarefa, membro)) {
      throw new AppError(
        403,
        "Apenas o criador da tarefa ou o dono do grupo pode criar partes",
      );
    }

    if (typeof dados.idUser !== "string" || dados.idUser.trim() === "") {
      throw new AppError(400, "idUser é obrigatório");
    }
    const idUser = dados.idUser.trim();
    const membroAtribuido = await parteRepository.buscarMembro(
      idUser,
      tarefa.idGrupo,
    );
    if (!membroAtribuido) {
      throw new AppError(
        400,
        "O usuário atribuído deve ser membro do grupo da tarefa",
      );
    }
    if (dados.descricao !== undefined && typeof dados.descricao !== "string") {
      throw new AppError(400, "A descrição deve ser um texto");
    }
    const descricao = dados.descricao?.trim() ?? "";
    const valor = validarValor(dados.valor);

    return parteRepository.transacionarTarefa(idTarefa, async (tx) => {
      const { _sum } = await parteRepository.somarNaTransacao(tx, idTarefa);
      validarSomaPartes(_sum.valor, valor, tarefa.valorTotal);
      return parteRepository.criarNaTransacao(tx, {
        idUser,
        idTarefa,
        descricao,
        valor,
      });
    });
  },

  async listar(idSolicitante: string, idTarefa: string) {
    await exigirMembroDaTarefa(idSolicitante, idTarefa);
    return parteRepository.listarPorTarefa(idTarefa);
  },

  async obter(idSolicitante: string, id: string) {
    const parte = await parteRepository.buscarPorId(id);
    if (!parte) throw new AppError(404, "Parte não encontrada");
    await exigirMembroDaTarefa(idSolicitante, parte.idTarefa);
    return parte;
  },

  async atualizar(idSolicitante: string, id: string, dados: DadosParte) {
    validarCamposPermitidos(dados, ["descricao", "valor", "status"]);
    const parte = await parteRepository.buscarPorId(id);
    if (!parte) throw new AppError(404, "Parte não encontrada");
    const tarefa = await exigirTarefa(parte.idTarefa);
    const membro = await parteRepository.buscarMembro(
      idSolicitante,
      tarefa.idGrupo,
    );

    const alteracoes: AlteracoesParte = {};
    if (dados.descricao !== undefined) {
      alteracoes.descricao = validarDescricao(dados.descricao);
    }
    if (dados.valor !== undefined) {
      alteracoes.valor = validarValor(dados.valor);
    }
    if (dados.status !== undefined) {
      alteracoes.status = validarStatus(dados.status);
    }
    if (Object.keys(alteracoes).length === 0) {
      throw new AppError(400, "Informe descrição, valor ou status para atualizar");
    }

    const podeGerenciarParte = podeGerenciar(idSolicitante, tarefa, membro);
    const somenteStatus =
      Object.keys(alteracoes).length === 1 && alteracoes.status !== undefined;
    if (!podeGerenciarParte && !membro) {
      throw new AppError(403, "Você não participa do grupo desta tarefa");
    }
    if (!podeGerenciarParte && !(idSolicitante === parte.idUser && somenteStatus)) {
      throw new AppError(
        403,
        "Você só pode atualizar o status da sua própria parte",
      );
    }

    if (alteracoes.valor !== undefined) {
      const valorNovo = alteracoes.valor;
      return parteRepository.transacionarTarefa(parte.idTarefa, async (tx) => {
        const parteAtual = await parteRepository.buscarNaTransacao(tx, id);
        if (!parteAtual) throw new AppError(404, "Parte não encontrada");
        const { _sum } = await parteRepository.somarNaTransacao(
          tx,
          parte.idTarefa,
          id,
        );
        validarSomaPartes(_sum.valor, valorNovo, tarefa.valorTotal);
        return parteRepository.atualizarNaTransacao(tx, id, alteracoes);
      });
    }

    return parteRepository.atualizar(id, alteracoes);
  },

  async remover(idSolicitante: string, id: string) {
    const parte = await parteRepository.buscarPorId(id);
    if (!parte) throw new AppError(404, "Parte não encontrada");
    const tarefa = await exigirTarefa(parte.idTarefa);
    const membro = await parteRepository.buscarMembro(
      idSolicitante,
      tarefa.idGrupo,
    );
    if (!podeGerenciar(idSolicitante, tarefa, membro)) {
      throw new AppError(
        403,
        "Apenas o criador da tarefa ou o dono do grupo pode remover partes",
      );
    }
    await parteRepository.remover(id);
  },
};
