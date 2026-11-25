import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { Funcao } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { grupoService } = await import("../grupo.service.js");

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origGrupo = { ...prisma.grupo };
const origMembro = { ...prisma.membro };
const origTx = prisma.$transaction;

async function esperarAppError(operacao: () => Promise<unknown>, statusCode: number) {
  await assert.rejects(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("grupoService", () => {
  afterEach(() => {
    Object.assign(prisma.grupo, origGrupo);
    Object.assign(prisma.membro, origMembro);
    mockProp(prisma, "$transaction", origTx);
  });

  it("cria grupo normalizando nome e descrição", async () => {
    let recebido: unknown = null;
    mockProp(prisma.grupo, "create", async (args: unknown) => {
      recebido = args;
      return { id: "g1" };
    });

    await grupoService.criar("u1", { nome: "  Viagem Floripa  ", descricao: "  Férias  " });
    assert.deepEqual(recebido, {
      data: {
        nome: "Viagem Floripa",
        descricao: "Férias",
        membros: { create: { idUser: "u1", funcao: Funcao.dono } },
      },
    });
  });

  it("rejeita criação com nome vazio ou acima de 100 caracteres", async () => {
    await esperarAppError(async () => grupoService.criar("u1", { nome: "   " }), 400);
    await esperarAppError(async () => grupoService.criar("u1", { nome: "a".repeat(101) }), 400);
  });

  it("retorna 403 ao obter grupo existente do qual o usuário não participa e 404 se não existe", async () => {
    mockProp(prisma.membro, "findUnique", async () => null);
    mockProp(prisma.grupo, "count", async ({ where }: { where: { id: string } }) =>
      where.id === "g-existe" ? 1 : 0,
    );

    await esperarAppError(() => grupoService.obter("u1", "g-existe"), 403);
    await esperarAppError(() => grupoService.obter("u1", "g-inexistente"), 404);
  });

  it("bloqueia atualização por membro comum e exige ao menos nome ou descrição", async () => {
    mockProp(prisma.membro, "findUnique", async ({ where }: { where: { idUser_idGrupo: { idUser: string } } }) =>
      where.idUser_idGrupo.idUser === "u-membro"
        ? { idUser: "u-membro", idGrupo: "g1", funcao: Funcao.membro }
        : { idUser: "u-dono", idGrupo: "g1", funcao: Funcao.dono },
    );

    await esperarAppError(() => grupoService.atualizar("u-membro", "g1", { nome: "Novo" }), 403);
    await esperarAppError(() => grupoService.atualizar("u-dono", "g1", {}), 400);
  });

  it("impede exclusão de grupo com assinatura Pro ativa ou pendente", async () => {
    let deleteCalls = 0;
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u-dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        membro: {
          findUnique: async () => ({
            idUser: "u-dono",
            idGrupo: "g1",
            funcao: Funcao.dono,
          }),
        },
        assinaturaPro: { count: async () => 1 },
        grupo: {
          delete: async () => {
            deleteCalls += 1;
            return {};
          },
        },
      }),
    );

    await esperarAppError(() => grupoService.excluir("u-dono", "g1"), 409);
    assert.equal(deleteCalls, 0);
  });

  it("impede exclusão de grupo com cobranças e permite encerrar para manter histórico", async () => {
    let deleteCalls = 0;
    let encerradoAtualizado = false;
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "u-dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        membro: {
          findUnique: async () => ({
            idUser: "u-dono",
            idGrupo: "g1",
            funcao: Funcao.dono,
          }),
        },
        assinaturaPro: { count: async () => 0 },
        parte: { count: async () => 1 },
        tarefa: { count: async () => 0 },
        grupo: {
          findUniqueOrThrow: async () => ({ id: "g1", encerradoEm: null }),
          update: async ({ data }: { data: { encerradoEm?: Date } }) => {
            encerradoAtualizado = data.encerradoEm instanceof Date;
            return { id: "g1", encerradoEm: data.encerradoEm };
          },
          delete: async () => {
            deleteCalls += 1;
            return {};
          },
        },
      }),
    );

    await esperarAppError(() => grupoService.excluir("u-dono", "g1"), 409);
    assert.equal(deleteCalls, 0);

    await grupoService.encerrar("u-dono", "g1");
    assert.equal(encerradoAtualizado, true);
  });
});
