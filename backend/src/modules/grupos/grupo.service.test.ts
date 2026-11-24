import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { AppError } from "../../errors/AppError.js";
import { Funcao } from "../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { grupoRepository } = await import("./grupo.repository.js");
const { grupoService } = await import("./grupo.service.js");

async function esperarAppError(operacao: () => Promise<unknown>, statusCode: number) {
  await assert.rejects(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("grupoService", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("cria grupo normalizando nome e descrição", async () => {
    let recebido: { idUser: string; dados: { nome: string; descricao: string } } | null = null;
    mock.method(grupoRepository, "criarComDono", async (idUser: string, dados: { nome: string; descricao: string }) => {
      recebido = { idUser, dados };
      return { id: "g1", ...dados } as never;
    });

    await grupoService.criar("u1", { nome: "  Viagem Floripa  ", descricao: "  Férias  " });
    assert.deepEqual(recebido, {
      idUser: "u1",
      dados: { nome: "Viagem Floripa", descricao: "Férias" },
    });
  });

  it("rejeita criação com nome vazio ou acima de 100 caracteres", async () => {
    await esperarAppError(async () => grupoService.criar("u1", { nome: "   " }), 400);
    await esperarAppError(async () => grupoService.criar("u1", { nome: "a".repeat(101) }), 400);
  });

  it("retorna 403 ao obter grupo existente do qual o usuário não participa e 404 se não existe", async () => {
    mock.method(grupoRepository, "buscarMembro", async () => null);
    mock.method(grupoRepository, "existe", async (id: string) => id === "g-existe");

    await esperarAppError(() => grupoService.obter("u1", "g-existe"), 403);
    await esperarAppError(() => grupoService.obter("u1", "g-inexistente"), 404);
  });

  it("bloqueia atualização por membro comum e exige ao menos nome ou descrição", async () => {
    mock.method(grupoRepository, "buscarMembro", async (idUser: string) =>
      idUser === "u-membro"
        ? ({ idUser, idGrupo: "g1", funcao: Funcao.membro } as never)
        : ({ idUser, idGrupo: "g1", funcao: Funcao.dono } as never),
    );

    await esperarAppError(() => grupoService.atualizar("u-membro", "g1", { nome: "Novo" }), 403);
    await esperarAppError(() => grupoService.atualizar("u-dono", "g1", {}), 400);
  });

  it("impede exclusão de grupo com assinatura Pro ativa ou pendente", async () => {
    mock.method(grupoRepository, "buscarMembro", async () => ({
      idUser: "u-dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    } as never));
    mock.method(grupoRepository, "temAssinaturaProAtivaOuPendente", async () => true);
    const excluirMock = mock.method(grupoRepository, "excluir", async () => ({} as never));

    await esperarAppError(() => grupoService.excluir("u-dono", "g1"), 409);
    assert.equal(excluirMock.mock.callCount(), 0);
  });
});
