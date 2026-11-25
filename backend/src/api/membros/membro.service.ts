import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import { Funcao, TipoNotificacao } from "../../generated/prisma/enums.js";
import {
  erroPrismaComCodigo,
  exigirDono,
  exigirDonoNaTransacao,
  exigirGrupoAberto,
  exigirMembro,
  transacionarGrupo,
} from "../../lib/grupo-helpers.js";
import { prisma } from "../../lib/prisma.js";

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
        ? await prisma.user.findUnique({ where: { id: destino.valor }, select: { id: true } })
        : await prisma.user.findUnique({ where: { email: destino.valor }, select: { id: true } });
    if (!usuario) throw new AppError(404, "Usuário não encontrado");

    return transacionarGrupo(idGrupo, async (tx) => {
      await exigirDonoNaTransacao(tx, idSolicitante, idGrupo);
      await exigirGrupoAberto(tx, idGrupo);
      try {
        const membro = await tx.membro.create({
          data: { idUser: usuario.id, idGrupo, funcao: Funcao.membro },
          select: {
            idUser: true,
            idGrupo: true,
            funcao: true,
            user: { select: { id: true, name: true, image: true } },
          },
        });
        const grupo = await tx.grupo.findUniqueOrThrow({
          where: { id: idGrupo },
          select: { nome: true },
        });
        await tx.notificacao.createMany({
          data: [
            {
              idUser: usuario.id,
              tipo: TipoNotificacao.MEMBRO_ADICIONADO,
              titulo: "Você foi adicionado a um grupo",
              mensagem: `Você agora faz parte do grupo "${grupo.nome}".`,
              idGrupo,
              chaveEvento: `membro-adicionado:${idGrupo}:${usuario.id}:${randomUUID()}`,
            },
          ],
          skipDuplicates: true,
        });
        return membro;
      } catch (erro) {
        if (erroPrismaComCodigo(erro, "P2002")) {
          throw new AppError(409, "Este usuário já participa do grupo");
        }
        if (erroPrismaComCodigo(erro, "P2003")) {
          throw new AppError(404, "Usuário não encontrado");
        }
        throw erro;
      }
    });
  },

  async listar(idSolicitante: string, idGrupo: string) {
    await exigirMembro(idSolicitante, idGrupo);
    return prisma.membro.findMany({
      where: { idGrupo },
      orderBy: { user: { name: "asc" } },
      select: {
        idUser: true,
        idGrupo: true,
        funcao: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
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

    return transacionarGrupo(idGrupo, async (tx) => {
      await exigirDonoNaTransacao(tx, idSolicitante, idGrupo);
      await exigirGrupoAberto(tx, idGrupo);
      const membro = await tx.membro.findUnique({
        where: { idUser_idGrupo: { idUser, idGrupo } },
      });
      if (!membro) throw new AppError(404, "Membro não encontrado");

      const funcao = dados.funcao as Funcao;
      if (membro.funcao === Funcao.dono && funcao !== Funcao.dono) {
        const quantidadeDonos = await tx.membro.count({
          where: { idGrupo, funcao: Funcao.dono },
        });
        if (quantidadeDonos <= 1) {
          throw new AppError(409, "O grupo precisa ter ao menos um dono");
        }
      }

      return tx.membro.update({
        where: { idUser_idGrupo: { idUser, idGrupo } },
        data: { funcao },
        select: {
          idUser: true,
          idGrupo: true,
          funcao: true,
          user: { select: { id: true, name: true, image: true } },
        },
      });
    });
  },

  async remover(idSolicitante: string, idGrupo: string, idUser: string) {
    if (idSolicitante === idUser) {
      await exigirMembro(idSolicitante, idGrupo);
    } else {
      await exigirDono(idSolicitante, idGrupo);
    }

    await transacionarGrupo(idGrupo, async (tx) => {
      await exigirGrupoAberto(tx, idGrupo);
      const solicitante = await tx.membro.findUnique({
        where: { idUser_idGrupo: { idUser: idSolicitante, idGrupo } },
      });
      if (!solicitante) {
        throw new AppError(403, "Você não participa deste grupo");
      }

      const membro = await tx.membro.findUnique({
        where: { idUser_idGrupo: { idUser, idGrupo } },
      });
      if (!membro) throw new AppError(404, "Membro não encontrado");

      const estaSaindo = idSolicitante === idUser;
      if (!estaSaindo && solicitante.funcao !== Funcao.dono) {
        throw new AppError(403, "Apenas o dono pode remover outros membros");
      }

      if (membro.funcao === Funcao.dono) {
        const quantidadeDonos = await tx.membro.count({
          where: { idGrupo, funcao: Funcao.dono },
        });
        if (quantidadeDonos <= 1) {
          throw new AppError(409, "O grupo precisa ter ao menos um dono");
        }
      }

      await tx.membro.delete({
        where: { idUser_idGrupo: { idUser, idGrupo } },
      });
    });
  },
};
