import { AppError } from "../../errors/AppError.js";
import { Funcao } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { membroRepository } from "./membro.repository.js";

async function exigirGrupo(idGrupo: string) {
  if (!(await membroRepository.buscarGrupo(idGrupo))) {
    throw new AppError(404, "Grupo não encontrado");
  }
}

async function exigirMembro(idUser: string, idGrupo: string) {
  const membro = await membroRepository.buscarMembro(idUser, idGrupo);
  if (membro) return membro;
  await exigirGrupo(idGrupo);
  throw new AppError(403, "Você não participa deste grupo");
}

async function exigirDono(idUser: string, idGrupo: string) {
  const membro = await exigirMembro(idUser, idGrupo);
  if (membro.funcao !== Funcao.dono) {
    throw new AppError(403, "Apenas o dono do grupo pode fazer isso");
  }
}

async function exigirDonoNaTransacao(
  idUser: string,
  idGrupo: string,
  tx: Prisma.TransactionClient,
) {
  const membro = await membroRepository.buscarMembroNaTransacao(
    tx,
    idUser,
    idGrupo,
  );
  if (!membro || membro.funcao !== Funcao.dono) {
    throw new AppError(403, "Apenas o dono do grupo pode fazer isso");
  }
}

function validarDestino(
  dados: { idUser?: unknown; email?: unknown },
): { tipo: "id"; valor: string } | { tipo: "email"; valor: string } {
  const temId = dados.idUser !== undefined;
  const temEmail = dados.email !== undefined;
  if (temId === temEmail) {
    throw new AppError(400, "Informe exatamente um dos campos idUser ou email");
  }

  const campo = temId ? dados.idUser : dados.email;
  if (typeof campo !== "string" || campo.trim().length === 0) {
    throw new AppError(400, "idUser ou email deve ser um texto válido");
  }
  return temId
    ? { tipo: "id", valor: campo.trim() }
    : { tipo: "email", valor: campo.trim() };
}

export const membroService = {
  async adicionar(
    idSolicitante: string,
    idGrupo: string,
    dados: { idUser?: unknown; email?: unknown },
  ) {
    await exigirDono(idSolicitante, idGrupo);
    const destino = validarDestino(dados);
    const usuario =
      destino.tipo === "id"
        ? await membroRepository.buscarUsuario(destino.valor)
        : await membroRepository.buscarUsuarioPorEmail(destino.valor);
    if (!usuario) throw new AppError(404, "Usuário não encontrado");

    return membroRepository.transacionarGrupo(idGrupo, async (tx) => {
      await exigirDonoNaTransacao(idSolicitante, idGrupo, tx);
      return membroRepository.criarNaTransacao(tx, usuario.id, idGrupo);
    });
  },

  async listar(idSolicitante: string, idGrupo: string) {
    await exigirMembro(idSolicitante, idGrupo);
    return membroRepository.listarPorGrupo(idGrupo);
  },

  async atualizarFuncao(
    idSolicitante: string,
    idGrupo: string,
    idUser: string,
    dados: { funcao?: unknown },
  ) {
    await exigirDono(idSolicitante, idGrupo);
    if (!Object.values(Funcao).includes(dados.funcao as Funcao)) {
      throw new AppError(400, "A função deve ser dono ou membro");
    }

    return membroRepository.transacionarGrupo(idGrupo, async (tx) => {
      await exigirDonoNaTransacao(idSolicitante, idGrupo, tx);
      const membro = await membroRepository.buscarMembroNaTransacao(
        tx,
        idUser,
        idGrupo,
      );
      if (!membro) throw new AppError(404, "Membro não encontrado");

      const funcao = dados.funcao as Funcao;
      if (membro.funcao === Funcao.dono && funcao !== Funcao.dono) {
        const quantidadeDonos = await membroRepository.contarDonosNaTransacao(
          tx,
          idGrupo,
        );
        if (quantidadeDonos <= 1) {
          throw new AppError(409, "O grupo precisa ter ao menos um dono");
        }
      }

      return membroRepository.atualizarFuncaoNaTransacao(
        tx,
        idUser,
        idGrupo,
        funcao,
      );
    });
  },

  async remover(idSolicitante: string, idGrupo: string, idUser: string) {
    if (idSolicitante === idUser) {
      await exigirMembro(idSolicitante, idGrupo);
    } else {
      await exigirDono(idSolicitante, idGrupo);
    }

    await membroRepository.transacionarGrupo(idGrupo, async (tx) => {
      const solicitante = await membroRepository.buscarMembroNaTransacao(
        tx,
        idSolicitante,
        idGrupo,
      );
      if (!solicitante) {
        throw new AppError(403, "Você não participa deste grupo");
      }

      const membro = await membroRepository.buscarMembroNaTransacao(
        tx,
        idUser,
        idGrupo,
      );
      if (!membro) throw new AppError(404, "Membro não encontrado");

      const estaSaindo = idSolicitante === idUser;
      if (!estaSaindo && solicitante.funcao !== Funcao.dono) {
        throw new AppError(403, "Apenas o dono pode remover outros membros");
      }

      if (membro.funcao === Funcao.dono) {
        const quantidadeDonos = await membroRepository.contarDonosNaTransacao(
          tx,
          idGrupo,
        );
        if (quantidadeDonos <= 1) {
          throw new AppError(409, "O grupo precisa ter ao menos um dono");
        }
      }

      await membroRepository.removerNaTransacao(tx, idUser, idGrupo);
    });
  },
};
