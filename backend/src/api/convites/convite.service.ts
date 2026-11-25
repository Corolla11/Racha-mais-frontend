import { createHash, randomBytes } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import { Funcao, TipoNotificacao } from "../../generated/prisma/enums.js";
import { sendGroupInviteEmail } from "../../lib/email.js";
import {
  erroPrismaComCodigo,
  exigirDono,
  exigirDonoNaTransacao,
  exigirGrupoAberto,
  exigirMembro,
  transacionarGrupo,
} from "../../lib/grupo-helpers.js";
import { prisma } from "../../lib/prisma.js";

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export function hashTokenConvite(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function mascararEmail(email: string): string {
  const [local, dominio] = email.split("@");
  if (!local || !dominio) return "***";
  const visivel = local.slice(0, 2);
  return `${visivel}***@${dominio}`;
}

function urlFrontend(): string {
  const origem =
    process.env.FRONTEND_URL?.trim() ||
    process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")[0]?.trim() ||
    "http://localhost:5173";
  return origem.replace(/\/$/, "");
}

export const conviteService = {
  async criar(idSolicitante: string, idGrupo: string, emailRaw: string) {
    const email = emailRaw.trim().toLowerCase();
    await exigirDono(idSolicitante, idGrupo);
    await exigirGrupoAberto(prisma, idGrupo);

    const usuarioAlvo = await prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });
    if (usuarioAlvo) {
      if (usuarioAlvo.deletedAt !== null) {
        throw new AppError(409, "Esta conta foi desativada");
      }
      const jaMembro = await prisma.membro.findUnique({
        where: { idUser_idGrupo: { idUser: usuarioAlvo.id, idGrupo } },
        select: { idUser: true },
      });
      if (jaMembro) {
        throw new AppError(409, "Este usuário já participa do grupo");
      }
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashTokenConvite(token);
    const expiresAt = new Date(Date.now() + SETE_DIAS_MS);

    const [grupo, convidante] = await Promise.all([
      prisma.grupo.findUniqueOrThrow({
        where: { id: idGrupo },
        select: { nome: true },
      }),
      prisma.user.findUniqueOrThrow({
        where: { id: idSolicitante },
        select: { name: true },
      }),
    ]);

    const convite = await transacionarGrupo(idGrupo, async (tx) => {
      await exigirDonoNaTransacao(tx, idSolicitante, idGrupo);
      await exigirGrupoAberto(tx, idGrupo);
      return tx.conviteGrupo.upsert({
        where: { idGrupo_email: { idGrupo, email } },
        update: {
          tokenHash,
          convidadoPorId: idSolicitante,
          expiresAt,
          aceitoEm: null,
        },
        create: {
          idGrupo,
          email,
          tokenHash,
          convidadoPorId: idSolicitante,
          expiresAt,
        },
        select: {
          id: true,
          idGrupo: true,
          email: true,
          expiresAt: true,
          createdAt: true,
        },
      });
    });

    const link = `${urlFrontend()}/convite/${token}`;
    try {
      await sendGroupInviteEmail({
        to: email,
        groupName: grupo.nome,
        inviterName: convidante.name,
        url: link,
      });
    } catch {
      await prisma.conviteGrupo
        .delete({ where: { id: convite.id } })
        .catch(() => {});
      throw new AppError(502, "Não foi possível enviar o e-mail de convite");
    }

    return convite;
  },

  async listar(idSolicitante: string, idGrupo: string) {
    await exigirMembro(idSolicitante, idGrupo);
    return prisma.conviteGrupo.findMany({
      where: {
        idGrupo,
        aceitoEm: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  },

  async cancelar(idSolicitante: string, idGrupo: string, idConvite: string) {
    await exigirDono(idSolicitante, idGrupo);
    await exigirGrupoAberto(prisma, idGrupo);
    const resultado = await prisma.conviteGrupo.deleteMany({
      where: { id: idConvite, idGrupo },
    });
    if (resultado.count === 0) {
      throw new AppError(404, "Convite não encontrado");
    }
  },

  async obterPorToken(token: string) {
    const tokenHash = hashTokenConvite(token);
    const convite = await prisma.conviteGrupo.findUnique({
      where: { tokenHash },
      select: {
        idGrupo: true,
        email: true,
        expiresAt: true,
        aceitoEm: true,
        grupo: { select: { nome: true, encerradoEm: true } },
        convidadoPor: { select: { name: true } },
      },
    });
    if (!convite) throw new AppError(404, "Convite não encontrado");
    if (convite.aceitoEm !== null) {
      throw new AppError(409, "Este convite já foi aceito");
    }
    if (convite.expiresAt <= new Date()) {
      throw new AppError(410, "Este convite expirou");
    }
    if (convite.grupo.encerradoEm !== null) {
      throw new AppError(409, "Este grupo foi encerrado");
    }

    return {
      idGrupo: convite.idGrupo,
      nomeGrupo: convite.grupo.nome,
      nomeConvidante: convite.convidadoPor.name,
      emailMascarado: mascararEmail(convite.email),
      expiresAt: convite.expiresAt,
    };
  },

  async aceitar(idUser: string, userEmail: string, token: string) {
    const tokenHash = hashTokenConvite(token);
    const convite = await prisma.conviteGrupo.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        idGrupo: true,
        email: true,
        expiresAt: true,
        aceitoEm: true,
        grupo: { select: { nome: true } },
      },
    });
    if (!convite) throw new AppError(404, "Convite não encontrado");
    if (convite.aceitoEm !== null) {
      throw new AppError(409, "Este convite já foi aceito");
    }
    if (convite.expiresAt <= new Date()) {
      throw new AppError(410, "Este convite expirou");
    }
    if (userEmail.trim().toLowerCase() !== convite.email) {
      throw new AppError(
        403,
        "Este convite foi enviado para outro endereço de e-mail",
      );
    }

    await transacionarGrupo(convite.idGrupo, async (tx) => {
      await exigirGrupoAberto(tx, convite.idGrupo);
      const marcado = await tx.conviteGrupo.updateMany({
        where: { id: convite.id, aceitoEm: null },
        data: { aceitoEm: new Date() },
      });
      if (marcado.count === 0) {
        throw new AppError(409, "Este convite já foi aceito");
      }

      try {
        await tx.membro.create({
          data: { idUser, idGrupo: convite.idGrupo, funcao: Funcao.membro },
        });
        await tx.notificacao.createMany({
          data: [
            {
              idUser,
              tipo: TipoNotificacao.MEMBRO_ADICIONADO,
              titulo: "Você entrou em um grupo",
              mensagem: `Você aceitou o convite para o grupo "${convite.grupo.nome}".`,
              idGrupo: convite.idGrupo,
              chaveEvento: `convite-aceito:${convite.id}:${idUser}`,
            },
          ],
          skipDuplicates: true,
        });
      } catch (erro) {
        if (!erroPrismaComCodigo(erro, "P2002")) throw erro;
      }
    });

    return {
      idGrupo: convite.idGrupo,
      nomeGrupo: convite.grupo.nome,
    };
  },
};
