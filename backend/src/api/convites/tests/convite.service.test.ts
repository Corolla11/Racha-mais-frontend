import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { Funcao } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { conviteService, hashTokenConvite, mascararEmail } = await import(
  "../convite.service.js"
);

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origConvite = { ...prisma.conviteGrupo };
const origMembro = { ...prisma.membro };
const origGrupo = { ...prisma.grupo };
const origUser = { ...prisma.user };
const origTx = prisma.$transaction;

describe("conviteService", () => {
  afterEach(() => {
    Object.assign(prisma.conviteGrupo, origConvite);
    Object.assign(prisma.membro, origMembro);
    Object.assign(prisma.grupo, origGrupo);
    Object.assign(prisma.user, origUser);
    mockProp(prisma, "$transaction", origTx);
  });

  it("mascararEmail oculta parte do usuário e hashTokenConvite gera sha256", () => {
    assert.equal(mascararEmail("ana.silva@racha.test"), "an***@racha.test");
    assert.equal(hashTokenConvite("abc").length, 64);
    assert.notEqual(hashTokenConvite("abc"), "abc");
  });

  it("obterPorToken valida inexistente, aceito, expirado e grupo encerrado", async () => {
    mockProp(prisma.conviteGrupo, "findUnique", async () => null);
    await assert.rejects(
      () => conviteService.obterPorToken("tok-1"),
      (e: unknown) => e instanceof AppError && e.statusCode === 404,
    );

    mockProp(prisma.conviteGrupo, "findUnique", async () => ({
      idGrupo: "g1",
      email: "ana@racha.test",
      expiresAt: new Date(Date.now() + 60_000),
      aceitoEm: new Date(),
      grupo: { nome: "Viagem", encerradoEm: null },
      convidadoPor: { name: "Bruno" },
    }));
    await assert.rejects(
      () => conviteService.obterPorToken("tok-1"),
      (e: unknown) => e instanceof AppError && e.statusCode === 409,
    );

    mockProp(prisma.conviteGrupo, "findUnique", async () => ({
      idGrupo: "g1",
      email: "ana@racha.test",
      expiresAt: new Date(Date.now() - 60_000),
      aceitoEm: null,
      grupo: { nome: "Viagem", encerradoEm: null },
      convidadoPor: { name: "Bruno" },
    }));
    await assert.rejects(
      () => conviteService.obterPorToken("tok-1"),
      (e: unknown) => e instanceof AppError && e.statusCode === 410,
    );

    mockProp(prisma.conviteGrupo, "findUnique", async () => ({
      idGrupo: "g1",
      email: "ana@racha.test",
      expiresAt: new Date(Date.now() + 60_000),
      aceitoEm: null,
      grupo: { nome: "Viagem", encerradoEm: new Date() },
      convidadoPor: { name: "Bruno" },
    }));
    await assert.rejects(
      () => conviteService.obterPorToken("tok-1"),
      (e: unknown) => e instanceof AppError && e.statusCode === 409,
    );
  });

  it("aceitar bloqueia e-mail diferente (403) e cria membro quando válido", async () => {
    mockProp(prisma.conviteGrupo, "findUnique", async () => ({
      id: "c1",
      idGrupo: "g1",
      email: "ana@racha.test",
      expiresAt: new Date(Date.now() + 60_000),
      aceitoEm: null,
      grupo: { nome: "Viagem" },
    }));

    await assert.rejects(
      () => conviteService.aceitar("u2", "outro@racha.test", "tok-1"),
      (e: unknown) => e instanceof AppError && e.statusCode === 403,
    );

    let membroCriado = false;
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        grupo: { findUnique: async () => ({ encerradoEm: null }) },
        conviteGrupo: { updateMany: async () => ({ count: 1 }) },
        membro: {
          create: async () => {
            membroCriado = true;
            return {};
          },
        },
        notificacao: { createMany: async () => ({ count: 1 }) },
      }),
    );

    const res = await conviteService.aceitar("u1", "ANA@racha.test", "tok-1");
    assert.equal(membroCriado, true);
    assert.deepEqual(res, { idGrupo: "g1", nomeGrupo: "Viagem" });
  });

  it("criar bloqueia usuário já membro (409) e remove convite órfão se envio de e-mail falhar", async () => {
    mockProp(prisma.membro, "findUnique", async ({ where }: { where: { idUser_idGrupo: { idUser: string } } }) =>
      where.idUser_idGrupo.idUser === "dono"
        ? { idUser: "dono", idGrupo: "g1", funcao: Funcao.dono }
        : { idUser: "u2" },
    );
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma.user, "findUnique", async () => ({ id: "u2", deletedAt: null }));

    await assert.rejects(
      () => conviteService.criar("dono", "g1", "u2@racha.test"),
      (e: unknown) => e instanceof AppError && e.statusCode === 409,
    );

    let conviteRemovido = false;
    mockProp(prisma.user, "findUnique", async () => null);
    mockProp(prisma.grupo, "findUniqueOrThrow", async () => ({ nome: "Viagem" }));
    mockProp(prisma.user, "findUniqueOrThrow", async () => ({ name: "Bruno" }));
    mockProp(prisma.conviteGrupo, "delete", async () => {
      conviteRemovido = true;
      return {};
    });
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        membro: { findUnique: async () => ({ idUser: "dono", idGrupo: "g1", funcao: Funcao.dono }) },
        grupo: { findUnique: async () => ({ encerradoEm: null }) },
        conviteGrupo: {
          upsert: async () => ({
            id: "c-orfao",
            idGrupo: "g1",
            email: "novo@racha.test",
            expiresAt: new Date(),
            createdAt: new Date(),
          }),
        },
      }),
    );

    const oldKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    try {
      await assert.rejects(
        () => conviteService.criar("dono", "g1", "novo@racha.test"),
        (e: unknown) => e instanceof AppError && e.statusCode === 502,
      );
      assert.equal(conviteRemovido, true);
    } finally {
      if (oldKey !== undefined) process.env.RESEND_API_KEY = oldKey;
    }
  });
});
