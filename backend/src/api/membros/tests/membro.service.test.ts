import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { Funcao } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { membroService } = await import("../membro.service.js");

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origMembro = { ...prisma.membro };
const origUser = { ...prisma.user };
const origTx = prisma.$transaction;

async function esperarAppError(operacao: () => Promise<unknown>, statusCode: number) {
  await assert.rejects(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("membroService", () => {
  afterEach(() => {
    Object.assign(prisma.membro, origMembro);
    Object.assign(prisma.user, origUser);
    mockProp(prisma, "$transaction", origTx);
  });

  it("exige exatamente um entre idUser ou email ao adicionar membro", async () => {
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));

    await esperarAppError(() => membroService.adicionar("dono", "g1", {}), 400);
    await esperarAppError(
      () => membroService.adicionar("dono", "g1", { idUser: "u2", email: "u2@teste.com" }),
      400,
    );
  });

  it("retorna 404 ao adicionar usuário inexistente e normaliza e-mail em minúsculas", async () => {
    let emailBuscado: string | undefined;
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma.user, "findUnique", async ({ where }: { where: { email?: string } }) => {
      emailBuscado = where.email;
      return null;
    });

    await esperarAppError(
      () => membroService.adicionar("dono", "g1", { email: "  NaoExiste@Teste.COM " }),
      404,
    );
    assert.equal(emailBuscado, "naoexiste@teste.com");
  });

  it("rejeita com 409 ao adicionar conta desativada", async () => {
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma.user, "findUnique", async () => ({
      id: "u-off",
      deletedAt: new Date("2026-01-01T00:00:00Z"),
    }));

    await esperarAppError(
      () => membroService.adicionar("dono", "g1", { email: "off@teste.com" }),
      409,
    );
  });

  it("impede rebaixar o único dono do grupo", async () => {
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        grupo: { findUnique: async () => ({ encerradoEm: null }) },
        membro: {
          findUnique: async () => ({ idUser: "dono", idGrupo: "g1", funcao: Funcao.dono }),
          count: async () => 1,
        },
      }),
    );

    await esperarAppError(
      () => membroService.atualizarFuncao("dono", "g1", "dono", { funcao: Funcao.membro }),
      409,
    );
  });

  it("impede membro comum de remover outro membro", async () => {
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "m1",
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));

    await esperarAppError(() => membroService.remover("m1", "g1", "m2"), 403);
  });

  it("permite que membro comum saia do próprio grupo", async () => {
    let deleteCalls = 0;
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "m1",
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        grupo: { findUnique: async () => ({ encerradoEm: null }) },
        membro: {
          findUnique: async () => ({ idUser: "m1", idGrupo: "g1", funcao: Funcao.membro }),
          delete: async () => {
            deleteCalls += 1;
            return {};
          },
        },
      }),
    );

    await membroService.remover("m1", "g1", "m1");
    assert.equal(deleteCalls, 1);
  });

  it("impede saída do último dono do grupo", async () => {
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        grupo: { findUnique: async () => ({ encerradoEm: null }) },
        membro: {
          findUnique: async () => ({ idUser: "dono", idGrupo: "g1", funcao: Funcao.dono }),
          count: async () => 1,
        },
      }),
    );

    await esperarAppError(() => membroService.remover("dono", "g1", "dono"), 409);
  });
});
