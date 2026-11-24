import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import { errorHandler } from "./errorHandler.js";

function criarResponseMock() {
  let statusCode = 200;
  let body: unknown = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  };
  return {
    res: res as never,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
  };
}

describe("errorHandler", () => {
  it("retorna status e mensagem de AppError", () => {
    const mockRes = criarResponseMock();
    errorHandler(new AppError(403, "Sem permissão"), {} as never, mockRes.res, () => {});
    assert.equal(mockRes.statusCode, 403);
    assert.deepEqual(mockRes.body, { error: "Sem permissão" });
  });

  it("retorna 400 para ZodError com mensagens concatenadas", () => {
    const mockRes = criarResponseMock();
    const resultado = z
      .object({ nome: z.string("Nome obrigatório"), valor: z.number("Valor inválido") })
      .safeParse({});
    assert.equal(resultado.success, false);

    errorHandler(resultado.error, {} as never, mockRes.res, () => {});
    assert.equal(mockRes.statusCode, 400);
    assert.deepEqual(mockRes.body, { error: "Nome obrigatório; Valor inválido" });
  });

  it("mapeia Prisma P2025 para 404 e P2002 para 409", () => {
    const res404 = criarResponseMock();
    const erro404 = new Prisma.PrismaClientKnownRequestError("not found", {
      code: "P2025",
      clientVersion: "7.0.0",
    });
    errorHandler(erro404, {} as never, res404.res, () => {});
    assert.equal(res404.statusCode, 404);

    const res409 = criarResponseMock();
    const erro409 = new Prisma.PrismaClientKnownRequestError("unique", {
      code: "P2002",
      clientVersion: "7.0.0",
    });
    errorHandler(erro409, {} as never, res409.res, () => {});
    assert.equal(res409.statusCode, 409);
  });

  it("retorna 500 genérico sem expor detalhes de erro desconhecido", () => {
    const mockRes = criarResponseMock();
    const originalError = console.error;
    console.error = () => {};
    try {
      errorHandler(new Error("senha secreta do banco"), {} as never, mockRes.res, () => {});
    } finally {
      console.error = originalError;
    }
    assert.equal(mockRes.statusCode, 500);
    assert.deepEqual(mockRes.body, { error: "Erro interno do servidor" });
  });
});
