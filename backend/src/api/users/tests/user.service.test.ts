import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { userService } = await import("../user.service.js");

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origUser = { ...prisma.user };
const origTx = prisma.$transaction;

describe("userService", () => {
  afterEach(() => {
    Object.assign(prisma.user, origUser);
    mockProp(prisma, "$transaction", origTx);
  });

  it("obterPerfil busca apenas o próprio usuário ativo", async () => {
    let argsUsados: unknown = null;
    mockProp(prisma.user, "findFirstOrThrow", async (args: unknown) => {
      argsUsados = args;
      return { id: "u1", name: "Ana" };
    });

    await userService.obterPerfil("u1");
    assert.deepEqual((argsUsados as { where: unknown }).where, {
      id: "u1",
      deletedAt: null,
    });
  });

  it("atualizarPerfil rejeita payload vazio e atualiza campos permitidos", async () => {
    await assert.rejects(
      () => userService.atualizarPerfil("u1", {}),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );

    let updateArgs: unknown = null;
    mockProp(prisma.user, "update", async (args: unknown) => {
      updateArgs = args;
      return { id: "u1", name: "Ana Nova", bio: "Org", cidade: "SP", telefone: "" };
    });

    await userService.atualizarPerfil("u1", { name: "Ana Nova", bio: "Org" });
    assert.deepEqual((updateArgs as { where: unknown; data: unknown }).where, {
      id: "u1",
    });
    assert.deepEqual((updateArgs as { data: unknown }).data, {
      name: "Ana Nova",
      bio: "Org",
    });
  });

  it("desativarConta marca deletedAt e revoga sessões na transação", async () => {
    let deletedAtDefinido = false;
    let sessoesRevogadas = false;

    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        user: {
          update: async ({ data }: { data: { deletedAt?: Date } }) => {
            deletedAtDefinido = data.deletedAt instanceof Date;
            return { id: "u1" };
          },
        },
        session: {
          deleteMany: async ({ where }: { where: { userId: string } }) => {
            sessoesRevogadas = where.userId === "u1";
            return { count: 1 };
          },
        },
      }),
    );

    await userService.desativarConta("u1");
    assert.equal(deletedAtDefinido, true);
    assert.equal(sessoesRevogadas, true);
  });

  it("obter restringe visualização ao próprio usuário ou co-membros de grupo", async () => {
    let argsUsados: unknown = null;
    mockProp(prisma.user, "findFirstOrThrow", async (args: unknown) => {
      argsUsados = args;
      return { id: "u2", name: "Bruno" };
    });

    await userService.obter("u1", "u2");
    assert.deepEqual((argsUsados as { where: unknown }).where, {
      id: "u2",
      deletedAt: null,
      OR: [
        { id: "u1" },
        {
          membros: {
            some: { grupo: { membros: { some: { idUser: "u1" } } } },
          },
        },
      ],
    });
  });
});
