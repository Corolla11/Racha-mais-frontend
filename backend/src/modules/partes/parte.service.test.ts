import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";
import { Funcao, StatusAndamento } from "../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { parteRepository } = await import("./parte.repository.js");
const { parteService } = await import("./parte.service.js");

async function esperarAppError(operacao: () => Promise<unknown>, statusCode: number) {
  await assert.rejects(operacao, (erro: unknown) => {
    assert.ok(erro instanceof AppError);
    assert.equal(erro.statusCode, statusCode);
    return true;
  });
}

describe("parteService", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("bloqueia criação de parte por membro comum que não criou a tarefa", async () => {
    mock.method(parteRepository, "buscarTarefa", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mock.method(parteRepository, "buscarMembro", async () => ({
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
    mock.method(parteRepository, "buscarTarefa", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mock.method(parteRepository, "buscarMembro", async (idUser: string) => ({
      idUser,
      idGrupo: "g1",
      funcao: idUser === "criador" ? Funcao.dono : Funcao.membro,
    }));
    mock.method(parteRepository, "transacionarTarefa", async (_idTarefa: string, op: (tx: never) => Promise<unknown>) =>
      op({} as never),
    );
    mock.method(parteRepository, "somarNaTransacao", async () => ({
      _sum: { valor: new Prisma.Decimal("80.00") },
    } as never));

    await esperarAppError(
      () => parteService.criar("criador", "t1", { idUser: "u2", valor: "25.00" }),
      409,
    );
  });

  it("permite membro comum atualizar apenas o status da própria parte e bloqueia outros campos", async () => {
    mock.method(parteRepository, "buscarPorId", async () => ({
      id: "p1",
      idUser: "u2",
      idTarefa: "t1",
      descricao: "Cota",
      valor: new Prisma.Decimal("50.00"),
      status: StatusAndamento.AGENDADA,
      user: { id: "u2", name: "Ana", image: null },
      tarefa: { id: "t1", idGrupo: "g1" },
    }));
    mock.method(parteRepository, "buscarTarefa", async () => ({
      id: "t1",
      idGrupo: "g1",
      idUser: "criador",
      nome: "Mercado",
      dataFinal: new Date(),
      valorTotal: new Prisma.Decimal("100.00"),
    }));
    mock.method(parteRepository, "buscarMembro", async (idUser: string) => ({
      idUser,
      idGrupo: "g1",
      funcao: Funcao.membro,
    }));
    const atualizarMock = mock.method(parteRepository, "atualizar", async () => ({
      id: "p1",
      status: StatusAndamento.EM_ANDAMENTO,
    } as never));

    await parteService.atualizar("u2", "p1", { status: StatusAndamento.EM_ANDAMENTO });
    assert.equal(atualizarMock.mock.callCount(), 1);

    await esperarAppError(() => parteService.atualizar("u2", "p1", { valor: "10.00" }), 403);
    await esperarAppError(
      () => parteService.atualizar("u3", "p1", { status: StatusAndamento.EM_ANDAMENTO }),
      403,
    );
  });
});
