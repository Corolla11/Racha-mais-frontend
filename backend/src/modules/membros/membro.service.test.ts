import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { AppError } from "../../errors/AppError.js";
import { Funcao } from "../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { membroRepository } = await import("./membro.repository.js");
const { membroService } = await import("./membro.service.js");

async function esperarAppError(operacao: () => Promise<unknown>, statusCode: number) {
  await assert.rejects(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("membroService", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("exige exatamente um entre idUser ou email ao adicionar membro", async () => {
    mock.method(membroRepository, "buscarMembro", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    } as never));

    await esperarAppError(() => membroService.adicionar("dono", "g1", {}), 400);
    await esperarAppError(
      () => membroService.adicionar("dono", "g1", { idUser: "u2", email: "u2@teste.com" }),
      400,
    );
  });

  it("retorna 404 ao adicionar usuário inexistente", async () => {
    mock.method(membroRepository, "buscarMembro", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    } as never));
    mock.method(membroRepository, "buscarUsuarioPorEmail", async () => null);

    await esperarAppError(
      () => membroService.adicionar("dono", "g1", { email: "naoexiste@teste.com" }),
      404,
    );
  });

  it("impede rebaixar o único dono do grupo", async () => {
    mock.method(membroRepository, "buscarMembro", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    } as never));
    mock.method(membroRepository, "transacionarGrupo", async (_idGrupo: string, op: (tx: never) => Promise<unknown>) =>
      op({} as never),
    );
    mock.method(membroRepository, "buscarMembroNaTransacao", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    } as never));
    mock.method(membroRepository, "contarDonosNaTransacao", async () => 1);

    await esperarAppError(
      () => membroService.atualizarFuncao("dono", "g1", "dono", { funcao: Funcao.membro }),
      409,
    );
  });

  it("impede membro comum de remover outro membro", async () => {
    mock.method(membroRepository, "buscarMembro", async () => ({
      idUser: "m1",
      idGrupo: "g1",
      funcao: Funcao.membro,
    } as never));

    await esperarAppError(() => membroService.remover("m1", "g1", "m2"), 403);
  });

  it("permite que membro comum saia do próprio grupo", async () => {
    mock.method(membroRepository, "buscarMembro", async () => ({
      idUser: "m1",
      idGrupo: "g1",
      funcao: Funcao.membro,
    } as never));
    mock.method(membroRepository, "transacionarGrupo", async (_idGrupo: string, op: (tx: never) => Promise<unknown>) =>
      op({} as never),
    );
    mock.method(membroRepository, "buscarMembroNaTransacao", async () => ({
      idUser: "m1",
      idGrupo: "g1",
      funcao: Funcao.membro,
    } as never));
    const removerMock = mock.method(membroRepository, "removerNaTransacao", async () => ({} as never));

    await membroService.remover("m1", "g1", "m1");
    assert.equal(removerMock.mock.callCount(), 1);
  });

  it("impede saída do último dono do grupo", async () => {
    mock.method(membroRepository, "buscarMembro", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    } as never));
    mock.method(membroRepository, "transacionarGrupo", async (_idGrupo: string, op: (tx: never) => Promise<unknown>) =>
      op({} as never),
    );
    mock.method(membroRepository, "buscarMembroNaTransacao", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    } as never));
    mock.method(membroRepository, "contarDonosNaTransacao", async () => 1);

    await esperarAppError(() => membroService.remover("dono", "g1", "dono"), 409);
  });
});
