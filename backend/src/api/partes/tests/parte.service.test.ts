import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { Funcao, StatusAndamento } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { parteService } = await import("../parte.service.js");

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origTarefa = { ...prisma.tarefa };
const origGrupo = { ...prisma.grupo };
const origMembro = { ...prisma.membro };
const origParte = { ...prisma.parte };
const origTx = prisma.$transaction;

async function esperarAppError(operacao: () => Promise<unknown>, statusCode: number) {
  await assert.rejects(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("parteService", () => {
  afterEach(() => {
    Object.assign(prisma.tarefa, origTarefa);
    Object.assign(prisma.grupo, origGrupo);
    Object.assign(prisma.membro, origMembro);
    Object.assign(prisma.parte, origParte);
    mockProp(prisma, "$transaction", origTx);
  });

  it("bloqueia criação de parte por membro comum que não criou a tarefa", async () => {
    mockProp(prisma.tarefa, "findUnique", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "membro-comum",
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));

    await esperarAppError(
      () => parteService.criar("membro-comum", "t1", { idUser: "membro-comum", valor: "50.00" }),
      403,
    );
  });

  it("rejeita criação quando soma das partes ultrapassa valorTotal da tarefa", async () => {
    mockProp(prisma.tarefa, "findUnique", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mockProp(prisma.membro, "findUnique", async ({ where }: { where: { idUser_idGrupo: { idUser: string } } }) => ({
      idUser: where.idUser_idGrupo.idUser,
      idGrupo: "g1",
      funcao: where.idUser_idGrupo.idUser === "criador" ? Funcao.dono : Funcao.membro,
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        tarefa: {
          findUnique: async () => ({ valorTotal: new Prisma.Decimal("100.00") }),
        },
        parte: {
          aggregate: async () => ({ _sum: { valor: new Prisma.Decimal("80.00") } }),
        },
      }),
    );

    await esperarAppError(
      () => parteService.criar("criador", "t1", { idUser: "u2", valor: "25.00" }),
      409,
    );
  });

  it("revalida valorTotal da tarefa dentro da transação contra redução concorrente", async () => {
    mockProp(prisma.tarefa, "findUnique", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mockProp(prisma.membro, "findUnique", async ({ where }: { where: { idUser_idGrupo: { idUser: string } } }) => ({
      idUser: where.idUser_idGrupo.idUser,
      idGrupo: "g1",
      funcao: where.idUser_idGrupo.idUser === "criador" ? Funcao.dono : Funcao.membro,
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        tarefa: {
          findUnique: async () => ({ valorTotal: new Prisma.Decimal("90.00") }),
        },
        parte: {
          aggregate: async () => ({ _sum: { valor: new Prisma.Decimal("80.00") } }),
        },
      }),
    );

    await esperarAppError(
      () => parteService.criar("criador", "t1", { idUser: "u2", valor: "15.00" }),
      409,
    );
  });

  it("permite membro comum atualizar apenas o status da própria parte e bloqueia outros campos", async () => {
    let updateCalls = 0;
    mockProp(prisma.parte, "findUnique", async () => ({
      id: "p1",
      idUser: "u2",
      idTarefa: "t1",
      descricao: "Cota",
      valor: new Prisma.Decimal("50.00"),
      status: StatusAndamento.AGENDADA,
      user: { id: "u2", name: "Ana", image: null },
      tarefa: { id: "t1", idGrupo: "g1" },
    }));
    mockProp(prisma.tarefa, "findUnique", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u2",
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma.parte, "update", async () => {
      updateCalls += 1;
      return { id: "p1", status: StatusAndamento.EM_ANDAMENTO };
    });

    await parteService.atualizar("u2", "p1", { status: StatusAndamento.EM_ANDAMENTO });
    assert.equal(updateCalls, 1);

    await esperarAppError(() => parteService.atualizar("u2", "p1", { valor: "10.00" }), 403);
    await esperarAppError(
      () => parteService.atualizar("u3", "p1", { status: StatusAndamento.EM_ANDAMENTO }),
      403,
    );
  });

  it("permite membro comum informar pagamento com comprovanteKey válida e limpar motivoContestacao", async () => {
    let dataRecebida: unknown = null;
    mockProp(prisma.parte, "findUnique", async () => ({
      id: "p1",
      idUser: "u2",
      idTarefa: "t1",
      descricao: "Cota",
      valor: new Prisma.Decimal("50.00"),
      status: StatusAndamento.AGENDADA,
      comprovanteKey: null,
      comprovanteNome: null,
      motivoContestacao: "Valor errado",
      user: { id: "u2", name: "Ana", image: null },
      tarefa: { id: "t1", idGrupo: "g1" },
    }));
    mockProp(prisma.tarefa, "findUnique", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u2",
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));
    mockProp(prisma.grupo, "findUnique", async () => ({ encerradoEm: null }));
    mockProp(prisma.parte, "update", async ({ data }: { data: unknown }) => {
      dataRecebida = data;
      return { id: "p1", status: StatusAndamento.EM_ANDAMENTO };
    });

    await parteService.atualizar("u2", "p1", {
      status: StatusAndamento.EM_ANDAMENTO,
      comprovanteKey: "comprovantes/p1/recibo.pdf",
      comprovanteNome: "recibo.pdf",
      motivoContestacao: null,
    });

    assert.deepEqual(dataRecebida, {
      status: StatusAndamento.EM_ANDAMENTO,
      comprovanteKey: "comprovantes/p1/recibo.pdf",
      comprovanteNome: "recibo.pdf",
      motivoContestacao: null,
    });
  });
});
