import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { validarSomaPartes } = await import("../parte.service.js");

function esperarAppError(operacao: () => unknown, statusCode: number) {
  assert.throws(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("validação da soma de Partes", () => {
  it("permite que o total seja exatamente igual ao total da tarefa", () => {
    assert.doesNotThrow(() =>
      validarSomaPartes(
        new Prisma.Decimal("75.25"),
        "24.75",
        new Prisma.Decimal("100.00"),
      ),
    );
  });

  it("considera soma nula como zero", () => {
    assert.doesNotThrow(() =>
      validarSomaPartes(null, "100.00", new Prisma.Decimal("100.00")),
    );
  });

  it("rejeita soma acima do total da tarefa", () => {
    esperarAppError(
      () =>
        validarSomaPartes(
          new Prisma.Decimal("75.25"),
          "24.76",
          new Prisma.Decimal("100.00"),
        ),
      409,
    );
  });
});
