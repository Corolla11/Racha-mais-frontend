import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError, ForbiddenError } from "../../../errors/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { Funcao } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { tarefaService } = await import("../tarefa.service.js");

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origTarefa = { ...prisma.tarefa };
const origGrupo = { ...prisma.grupo };
const origMembro = { ...prisma.membro };
const origTx = prisma.$transaction;

describe("tarefaService", () => {
  afterEach(() => {
    Object.assign(prisma.tarefa, origTarefa);
    Object.assign(prisma.grupo, origGrupo);
    Object.assign(prisma.membro, origMembro);
    mockProp(prisma, "$transaction", origTx);
  });

  it("rejeita atualização quando apenas dataFinal é enviada e fica anterior a dataInicio", async () => {
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma.tarefa, "findUniqueOrThrow", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "u1",
      dataInicio: new Date("2026-11-20T10:00:00Z"),
      dataFinal: new Date("2026-11-25T10:00:00Z"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u1",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));

    await assert.rejects(
      () =>
        tarefaService.atualizar("u1", "t1", {
          dataFinal: new Date("2026-11-10T10:00:00Z"),
        }),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
  });

  it("rejeita atualização quando novo valorTotal é menor que a soma das partes", async () => {
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma.tarefa, "findUniqueOrThrow", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "u1",
      dataInicio: new Date("2026-11-20T10:00:00Z"),
      dataFinal: new Date("2026-11-25T10:00:00Z"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u1",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        parte: {
          aggregate: async () => ({ _sum: { valor: new Prisma.Decimal("100.00") } }),
        },
      }),
    );

    await assert.rejects(
      () => tarefaService.atualizar("u1", "t1", { valorTotal: 50 }),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 409,
    );
  });

  it("bloqueia membro comum que não criou a tarefa ao atualizar", async () => {
    mockProp(prisma.tarefa, "findUniqueOrThrow", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      dataInicio: new Date("2026-11-20T10:00:00Z"),
      dataFinal: new Date("2026-11-25T10:00:00Z"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "outro-membro",
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));

    await assert.rejects(
      () => tarefaService.atualizar("outro-membro", "t1", { nome: "Outro" }),
      (erro: unknown) => erro instanceof ForbiddenError,
    );
  });

  it("inclui partes ao listar tarefas do grupo", async () => {
    let queryRecebida: unknown = null;
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u1",
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));
    mockProp(prisma.tarefa, "findMany", async (args: unknown) => {
      queryRecebida = args;
      return [];
    });

    await tarefaService.listar("u1", { idGrupo: "g1" });
    assert.deepEqual((queryRecebida as { include?: unknown }).include, {
      partes: {
        select: {
          id: true,
          idUser: true,
          valor: true,
          status: true,
        },
      },
    });
  });
});
