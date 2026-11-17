import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";
import { StatusAndamento } from "../../generated/prisma/enums.js";
import {
  validarCamposPermitidos,
  validarDescricao,
  validarSomaPartes,
  validarStatus,
  validarValor,
} from "./parte.validation.js";

function esperarAppError(operacao: () => unknown, statusCode: number) {
  assert.throws(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("validação de valor da Parte", () => {
  it("normaliza valores inteiros e decimais para duas casas", () => {
    assert.equal(validarValor(12), "12.00");
    assert.equal(validarValor("0.5"), "0.50");
    assert.equal(validarValor("9999999999.99"), "9999999999.99");
  });

  it("rejeita valores inválidos, negativos, zero e com precisão acima de centavos", () => {
    for (const valor of [undefined, null, "", "1,20", "1.234", "-1", 0, "0.00"]) {
      esperarAppError(() => validarValor(valor), 400);
    }
  });

  it("rejeita valor acima do limite de DECIMAL(12,2)", () => {
    esperarAppError(() => validarValor("10000000000.00"), 400);
  });
});

describe("validação de campos e status da Parte", () => {
  it("aceita somente campos autorizados para a operação", () => {
    assert.doesNotThrow(() =>
      validarCamposPermitidos(
        { idUser: "user-1", descricao: "cota", valor: "12.50" },
        ["idUser", "descricao", "valor"],
      ),
    );
    esperarAppError(
      () =>
        validarCamposPermitidos(
          { idUser: "user-1", idTarefa: "task-1" },
          ["idUser", "descricao", "valor"],
        ),
      400,
    );
  });

  it("normaliza descrição e rejeita tipo incorreto", () => {
    assert.equal(validarDescricao("  hospedagem  "), "hospedagem");
    esperarAppError(() => validarDescricao(123), 400);
  });

  it("aceita status do enum e rejeita status desconhecido", () => {
    assert.equal(validarStatus("FINALIZADA"), StatusAndamento.FINALIZADA);
    esperarAppError(() => validarStatus("PAGO"), 400);
  });
});

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
