import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { NextFunction, Request, Response } from "express";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { auth } = await import("../lib/auth.js");
const { prisma } = await import("../lib/prisma.js");
const { requireAuth } = await import("./requireAuth.js");

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origGetSession = auth.api.getSession;
const origUser = { ...prisma.user };

function criarRes() {
  const res = {
    statusCode: 200,
    body: null as unknown,
    locals: {} as Record<string, unknown>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe("requireAuth", () => {
  afterEach(() => {
    mockProp(auth.api, "getSession", origGetSession);
    Object.assign(prisma.user, origUser);
  });

  it("retorna 401 quando não há sessão", async () => {
    mockProp(auth.api, "getSession", async () => null);
    const req = { headers: {} } as Request;
    const res = criarRes();
    let nextCalled = false;

    await requireAuth(req, res, (() => {
      nextCalled = true;
    }) as NextFunction);

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it("retorna 401 quando usuário está desativado (deletedAt !== null)", async () => {
    mockProp(auth.api, "getSession", async () => ({
      user: { id: "u1", email: "ana@racha.test" },
      session: { id: "s1" },
    }));
    mockProp(prisma.user, "findUnique", async () => ({
      deletedAt: new Date(),
    }));
    const req = { headers: {} } as Request;
    const res = criarRes();
    let nextCalled = false;

    await requireAuth(req, res, (() => {
      nextCalled = true;
    }) as NextFunction);

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: "Conta desativada" });
  });

  it("chama next() e popula res.locals quando usuário está ativo", async () => {
    mockProp(auth.api, "getSession", async () => ({
      user: { id: "u1", email: "ana@racha.test" },
      session: { id: "s1" },
    }));
    mockProp(prisma.user, "findUnique", async () => ({ deletedAt: null }));
    const req = { headers: {} } as Request;
    const res = criarRes();
    let nextCalled = false;

    await requireAuth(req, res, (() => {
      nextCalled = true;
    }) as NextFunction);

    assert.equal(nextCalled, true);
    assert.deepEqual(res.locals.user, { id: "u1", email: "ana@racha.test" });
  });
});
