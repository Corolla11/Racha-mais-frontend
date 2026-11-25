import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { TipoChave } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { chavePixService, normalizarEValidarChavePix } = await import(
  "../chavePix.service.js"
);

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origChavePix = { ...prisma.chavePix };

describe("chavePixService", () => {
  afterEach(() => {
    Object.assign(prisma.chavePix, origChavePix);
  });

  it("normaliza e valida todos os tipos de chave Pix", () => {
    assert.equal(
      normalizarEValidarChavePix(TipoChave.telefone, "(11) 99999-8888"),
      "+5511999998888",
    );
    assert.equal(
      normalizarEValidarChavePix(TipoChave.telefone, "+55 (11) 99999-8888"),
      "+5511999998888",
    );
    assert.equal(
      normalizarEValidarChavePix(TipoChave.cpf, "123.456.789-09"),
      "12345678909",
    );
    assert.equal(
      normalizarEValidarChavePix(TipoChave.email, "  Ana@Racha.COM "),
      "ana@racha.com",
    );
    assert.equal(
      normalizarEValidarChavePix(
        TipoChave.aleatoria,
        "123E4567-E89B-12D3-A456-426614174000",
      ),
      "123e4567-e89b-12d3-a456-426614174000",
    );

    assert.throws(
      () => normalizarEValidarChavePix(TipoChave.cpf, "111.111.111-11"),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
    assert.throws(
      () => normalizarEValidarChavePix(TipoChave.cpf, "123.456.789-00"),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
    assert.throws(
      () => normalizarEValidarChavePix(TipoChave.telefone, "12345"),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
    assert.throws(
      () => normalizarEValidarChavePix(TipoChave.email, `${"a".repeat(70)}@racha.com`),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
    assert.throws(
      () => normalizarEValidarChavePix(TipoChave.aleatoria, "curta"),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
  });

  it("rejeita atualização vazia ou com tipo incompatível com a chave existente", async () => {
    await assert.rejects(
      () => chavePixService.atualizar("u1", "c1", {}),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );

    mockProp(prisma.chavePix, "findFirstOrThrow", async () => ({
      id: "c1",
      idUser: "u1",
      tipoChave: TipoChave.email,
      chave: "ana@racha.com",
    }));

    await assert.rejects(
      () => chavePixService.atualizar("u1", "c1", { tipoChave: TipoChave.cpf }),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
  });

  it("restringe leitura por grupo em comum e atualização/exclusão ao dono", async () => {
    let filtroObter: unknown = null;
    let filtroDelete: unknown = null;

    mockProp(prisma.chavePix, "findFirstOrThrow", async (args: unknown) => {
      filtroObter = args;
      return { id: "c1" };
    });
    mockProp(prisma.chavePix, "delete", async (args: unknown) => {
      filtroDelete = args;
      return { id: "c1" };
    });

    await chavePixService.obter("u1", "c1");
    await chavePixService.excluir("u1", "c1");

    assert.deepEqual(filtroObter, {
      where: {
        id: "c1",
        OR: [
          { idUser: "u1" },
          {
            user: {
              membros: { some: { grupo: { membros: { some: { idUser: "u1" } } } } },
            },
          },
        ],
      },
    });
    assert.deepEqual(filtroDelete, { where: { id: "c1", idUser: "u1" } });
  });
});
