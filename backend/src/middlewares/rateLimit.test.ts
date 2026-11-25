import assert from "node:assert/strict";
import test from "node:test";
import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { criarLimitadorPorUsuario } from "./rateLimit.js";

test("criarLimitadorPorUsuario bloqueia excesso com 429 e libera após janela", async () => {
  const limitador = criarLimitadorPorUsuario(2, 30, "Limite atingido");
  const req = { ip: "127.0.0.1" } as Request;
  const res = { locals: { user: { id: "user-1" } } } as unknown as Response;

  const chamar = () => {
    let erroCapturado: unknown = null;
    limitador(req, res, (err?: unknown) => {
      if (err) erroCapturado = err;
    });
    return erroCapturado;
  };

  assert.equal(chamar(), null);
  assert.equal(chamar(), null);
  const bloqueado = chamar();
  assert.ok(bloqueado instanceof AppError && bloqueado.statusCode === 429);
  assert.equal((bloqueado as AppError).message, "Limite atingido");

  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(chamar(), null);
});
