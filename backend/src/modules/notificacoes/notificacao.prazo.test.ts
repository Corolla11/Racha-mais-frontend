import assert from "node:assert/strict";
import test from "node:test";
import { TipoNotificacao } from "../../generated/prisma/enums.js";
import { construirLembretesDePrazo } from "./notificacao.prazo.js";

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
