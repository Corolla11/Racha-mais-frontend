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
          comprovanteKey: true,
          comprovanteNome: true,
          motivoContestacao: true,
        },
      },
    });
  });

  it("sincroniza partes atomicamente dentro de transacionarTarefa ao atualizar", async () => {
    let removidos: string[] = [];
    let criados = 0;
    mockProp(prisma.tarefa, "findUniqueOrThrow", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "u1",
      valorTotal: new Prisma.Decimal("100.00"),
      dataInicio: new Date("2026-03-01T00:00:00Z"),
      dataFinal: new Date("2026-03-02T00:00:00Z"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u1",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        membro: { count: async () => 2 },
        parte: {
          findMany: async () => [
            { id: "p1", idUser: "u1" },
            { id: "p-antiga", idUser: "u-removido" },
          ],
          deleteMany: async ({ where }: { where: { id: { in: string[] } } }) => {
            removidos = where.id.in;
            return { count: 1 };
          },
          update: async () => ({}),
          createMany: async ({ data }: { data: unknown[] }) => {
            criados = data.length;
            return { count: data.length };
          },
        },
        tarefa: {
          update: async () => ({ id: "t1", partes: [] }),
        },
      }),
    );

    await tarefaService.atualizar("u1", "t1", {
      valorTotal: 80,
      partes: [
        { idUser: "u1", valor: "40.00" },
        { idUser: "u2", valor: "40.00" },
      ],
    });
    assert.deepEqual(removidos, ["p-antiga"]);
    assert.equal(criados, 1);
  });

  it("rejeita sync de partes com participante duplicado, soma acima do total ou usuário fora do grupo", async () => {
    mockProp(prisma.tarefa, "findUniqueOrThrow", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "u1",
      valorTotal: new Prisma.Decimal("100.00"),
      dataInicio: new Date("2026-03-01T00:00:00Z"),
      dataFinal: new Date("2026-03-02T00:00:00Z"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u1",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));

    await assert.rejects(
      () =>
        tarefaService.atualizar("u1", "t1", {
          partes: [
            { idUser: "u1", valor: "30.00" },
            { idUser: "u1", valor: "30.00" },
          ],
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 400,
    );

    await assert.rejects(
      () =>
        tarefaService.atualizar("u1", "t1", {
          valorTotal: 50,
          partes: [{ idUser: "u1", valor: "60.00" }],
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 409,
    );

    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        membro: { count: async () => 0 },
      }),
    );

    await assert.rejects(
      () =>
        tarefaService.atualizar("u1", "t1", {
          partes: [{ idUser: "intruso", valor: "20.00" }],
        }),
      (err: unknown) => err instanceof AppError && err.statusCode === 400,
    );
  });
});
