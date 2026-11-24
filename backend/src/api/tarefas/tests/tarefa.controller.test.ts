import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { Request, Response } from "express";
import { ZodError } from "zod";
import { tarefaController } from "../tarefa.controller.js";
import { tarefaService } from "../tarefa.service.js";

describe("tarefaController", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("valida query de listagem sem falhar por refinement do Zod v4", async () => {
    const stubListar = mock.method(tarefaService, "listar", async () => []);
    let jsonPayload: unknown;
    const req = { query: { idGrupo: "grupo-1" } } as unknown as Request;
    const res = {
      locals: { user: { id: "user-1" } },
      json(payload: unknown) {
        jsonPayload = payload;
        return this;
      },
    } as unknown as Response;

    await tarefaController.listar(req, res);

    assert.equal(stubListar.mock.callCount(), 1);
    assert.deepEqual(stubListar.mock.calls[0].arguments, ["user-1", { idGrupo: "grupo-1" }]);
    assert.deepEqual(jsonPayload, []);
  });

  it("valida atualização parcial e rejeita dataFinal < dataInicio", async () => {
    const stubAtualizar = mock.method(tarefaService, "atualizar", async () => ({ id: "t-1" }));
    let jsonPayload: unknown;
    const reqOk = {
      params: { id: "t-1" },
      body: { nome: "Nova tarefa", valorTotal: 200 },
    } as unknown as Request;
    const res = {
      locals: { user: { id: "user-1" } },
      json(payload: unknown) {
        jsonPayload = payload;
        return this;
      },
    } as unknown as Response;

    await tarefaController.atualizar(reqOk, res);

    assert.equal(stubAtualizar.mock.callCount(), 1);
    assert.deepEqual(stubAtualizar.mock.calls[0].arguments, [
      "user-1",
      "t-1",
      { nome: "Nova tarefa", valorTotal: 200 },
    ]);
    assert.deepEqual(jsonPayload, { id: "t-1" });

    const reqInvalido = {
      params: { id: "t-1" },
      body: {
        dataInicio: "2026-03-10T00:00:00.000Z",
        dataFinal: "2026-03-01T00:00:00.000Z",
      },
    } as unknown as Request;

    await assert.rejects(
      () => tarefaController.atualizar(reqInvalido, res),
      (err: unknown) => err instanceof ZodError,
    );
  });
});
