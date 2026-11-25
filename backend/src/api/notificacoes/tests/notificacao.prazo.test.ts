import assert from "node:assert/strict";
import test from "node:test";
import { TipoNotificacao } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { verificarCronSecret } = await import("../notificacao.controller.js");
const { construirLembretesDePrazo, notificacaoService } = await import(
  "../notificacao.service.js"
);

test("construirLembretesDePrazo", async (t) => {
  const agora = new Date("2026-03-01T12:00:00.000Z");
  const base = {
    idUser: "user-1",
    idTarefa: "tarefa-1",
    tarefa: {
      idGrupo: "grupo-1",
      nome: "Aluguel",
      dataFinal: new Date(agora.getTime() + 60_000),
    },
  };

  await t.test("classifica prazo futuro como próximo", () => {
    const [notificacao] = construirLembretesDePrazo(
      [{ ...base, id: "parte-1" }],
      agora,
    );

    assert.equal(notificacao.tipo, TipoNotificacao.PRAZO_PROXIMO);
    assert.equal(notificacao.idUser, "user-1");
    assert.equal(notificacao.idParte, "parte-1");
  });

  await t.test("classifica prazo vencido e cria chave idempotente", () => {
    const parte = {
      ...base,
      id: "parte-2",
      tarefa: { ...base.tarefa, dataFinal: new Date(agora.getTime() - 60_000) },
    };
    const [primeira] = construirLembretesDePrazo([parte], agora);
    const [segunda] = construirLembretesDePrazo([parte], agora);

    assert.equal(primeira.tipo, TipoNotificacao.PRAZO_VENCIDO);
    assert.equal(primeira.chaveEvento, segunda.chaveEvento);
    assert.match(primeira.mensagem, /venceu/);
  });
});

test("emitirLembretesDePrazo usa lock transacional em $transaction", async (t) => {
  const originalTransaction = prisma.$transaction;
  t.after(() => {
    Object.defineProperty(prisma, "$transaction", {
      value: originalTransaction,
      configurable: true,
      writable: true,
    });
  });

  await t.test("pula consulta quando lock transacional não é obtido", async () => {
    let consultouPartes = false;
    Object.defineProperty(prisma, "$transaction", {
      value: async (cb: (tx: unknown) => Promise<unknown>) =>
        cb({
          $queryRaw: async () => [{ locked: false }],
          parte: {
            findMany: async () => {
              consultouPartes = true;
              return [];
            },
          },
        }),
      configurable: true,
      writable: true,
    });

    const resultado = await notificacaoService.emitirLembretesDePrazo(new Date());
    assert.deepEqual(resultado, { count: 0 });
    assert.equal(consultouPartes, false);
  });

  await t.test("insere notificações quando lock transacional é obtido e filtra usuário/grupo ativo", async () => {
    let inseridos = 0;
    let whereRecebido: unknown = null;
    const agora = new Date("2026-03-01T12:00:00.000Z");
    Object.defineProperty(prisma, "$transaction", {
      value: async (cb: (tx: unknown) => Promise<unknown>) =>
        cb({
          $queryRaw: async () => [{ locked: true }],
          parte: {
            findMany: async (args: { where?: unknown }) => {
              whereRecebido = args.where;
              return [
                {
                  id: "parte-1",
                  idUser: "user-1",
                  idTarefa: "tarefa-1",
                  tarefa: {
                    idGrupo: "grupo-1",
                    nome: "Aluguel",
                    dataFinal: new Date(agora.getTime() + 60_000),
                  },
                },
              ];
            },
          },
          notificacao: {
            createMany: async ({ data }: { data: unknown[] }) => {
              inseridos = data.length;
              return { count: data.length };
            },
          },
        }),
      configurable: true,
      writable: true,
    });

    const resultado = await notificacaoService.emitirLembretesDePrazo(agora);
    assert.deepEqual(resultado, { count: 1 });
    assert.equal(inseridos, 1);
    assert.deepEqual((whereRecebido as { user?: unknown }).user, {
      notificarDespesas: true,
      deletedAt: null,
    });
    assert.deepEqual(
      (whereRecebido as { tarefa?: { grupo?: unknown } }).tarefa?.grupo,
      { encerradoEm: null },
    );
  });
});

test("salvarPreferencias atualiza notificarDespesas no usuário", async (t) => {
  const origUser = { ...prisma.user };
  t.after(() => {
    Object.assign(prisma.user, origUser);
  });

  let updateArgs: unknown = null;
  Object.defineProperty(prisma.user, "update", {
    value: async (args: unknown) => {
      updateArgs = args;
      return { notificarDespesas: false };
    },
    configurable: true,
    writable: true,
  });

  const res = await notificacaoService.salvarPreferencias("user-1", false);
  assert.deepEqual(res, { notificarDespesas: false });
  assert.deepEqual(updateArgs, {
    where: { id: "user-1" },
    data: { notificarDespesas: false },
    select: { notificarDespesas: true },
  });
});

test("verificarCronSecret valida Bearer CRON_SECRET em tempo constante", (t) => {
  const original = process.env.CRON_SECRET;
  t.after(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  process.env.CRON_SECRET = "segredo-super-forte-123";
  assert.equal(verificarCronSecret("Bearer segredo-super-forte-123"), true);
  assert.equal(verificarCronSecret("Bearer errado"), false);
  assert.equal(verificarCronSecret("segredo-super-forte-123"), false);
  assert.equal(verificarCronSecret(undefined), false);

  delete process.env.CRON_SECRET;
  assert.equal(verificarCronSecret("Bearer "), false);
});
