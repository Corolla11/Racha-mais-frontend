import test from "node:test";
import assert from "node:assert/strict";
import { cotasDaTarefa, mapearTarefasDoGrupo } from "../src/lib/grupo-dados.ts";

test("mapearTarefasDoGrupo preserva data/hora no fuso local e mapeia comprovante/contestação", () => {
  const dataLocal = new Date(2026, 10, 25, 22, 30, 0);
  const membros = [
    { id: "u1", nome: "Ana", selecionado: true },
    { id: "u2", nome: "Bruno", selecionado: true },
  ];

  const { mapeadas, novosPagamentos, novasPartes } = mapearTarefasDoGrupo(
    [
      {
        id: "t1",
        idGrupo: "g1",
        idUser: "u1",
        nome: "Mercado",
        descricao: null,
        valorTotal: "100.00",
        dataInicio: dataLocal.toISOString(),
        dataFinal: dataLocal.toISOString(),
        statusAndamento: "EM_ANDAMENTO",
        partes: [
          {
            id: "p1",
            idUser: "u1",
            valor: "50.00",
            status: "FINALIZADA",
            comprovanteKey: "comprovantes/p1/comp.png",
            comprovanteNome: "comp.png",
          },
          {
            id: "p2",
            idUser: "u2",
            valor: "50.00",
            status: "AGENDADA",
            motivoContestacao: "Valor incompleto",
          },
        ],
      },
    ],
    membros,
    "u1",
  );

  assert.equal(mapeadas[0].dataLimite, "2026-11-25");
  assert.equal(mapeadas[0].horario, "22:30");
  assert.equal(novasPartes["t1:u1"], "p1");
  assert.deepEqual(novosPagamentos["t1:u1"], {
    status: "confirmado",
    receiptKey: "comprovantes/p1/comp.png",
    receiptName: "comp.png",
  });
  assert.deepEqual(novosPagamentos["t1:u2"], {
    status: "contestado",
    reason: "Valor incompleto",
  });

  const cotas = cotasDaTarefa(mapeadas[0], novosPagamentos);
  assert.equal(cotas.length, 2);
  assert.equal(cotas[0].pago, true);
  assert.equal(cotas[1].pago, false);
});
