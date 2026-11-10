import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../../errors/AppError.js";
import { validarRascunhoGrupo } from "./grupo-ia.service.js";

test("validarRascunhoGrupo", () => {
  assert.deepEqual(
    validarRascunhoGrupo({
      nome: "Viagem da turma",
      descricao: "Organização das despesas da viagem.",
    }),
    {
      nome: "Viagem da turma",
      descricao: "Organização das despesas da viagem.",
    },
  );

  assert.throws(
    () => validarRascunhoGrupo({ nome: "", descricao: "Descrição" }),
    (error: unknown) =>
      error instanceof AppError && error.statusCode === 502,
  );

  assert.throws(
    () =>
      validarRascunhoGrupo({
        nome: "Grupo",
        descricao: "Descrição",
        campoExtra: "não permitido",
      }),
    (error: unknown) =>
      error instanceof AppError && error.statusCode === 502,
  );
});
