import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  ehOrganizador,
  extrairEmail,
  lerRascunho,
  limparRascunho,
  salvarRascunho,
} from "../src/lib/grupo-rascunho.ts";

function criarStorageMock() {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  };
}

const rascunhoValido = {
  nome: "Churrasco da Turma",
  categoria: "evento",
  data: "Sábado",
  moeda: "BRL",
  descricao: "Levar bebida",
  membros: [
    {
      id: 1,
      nome: "Mariana",
      contato: "mariana@pix.me",
      iniciais: "MS",
      etiqueta: "Você (Admin)",
      admin: true,
      adiantado: 0,
    },
  ],
  rateio: "igual",
  itens: [],
  total: 0,
  cota: 0,
};

beforeEach(() => {
  globalThis.sessionStorage = criarStorageMock();
});

test("salva, lê e limpa rascunho de grupo no sessionStorage", () => {
  assert.equal(lerRascunho(), null);
  salvarRascunho(rascunhoValido);
  assert.deepEqual(lerRascunho(), rascunhoValido);
  limparRascunho();
  assert.equal(lerRascunho(), null);
});

test("ignora JSON inválido ou estrutura incompleta no sessionStorage", () => {
  globalThis.sessionStorage.setItem("racha-grupo-rascunho", "{invalido");
  assert.equal(lerRascunho(), null);

  globalThis.sessionStorage.setItem("racha-grupo-rascunho", JSON.stringify({ nome: "Sem membros" }));
  assert.equal(lerRascunho(), null);
});

test("não lança erro quando sessionStorage indisponível", () => {
  globalThis.sessionStorage = {
    getItem: () => { throw new Error("quota"); },
    setItem: () => { throw new Error("quota"); },
    removeItem: () => { throw new Error("quota"); },
  };
  assert.doesNotThrow(() => salvarRascunho(rascunhoValido));
  assert.equal(lerRascunho(), null);
  assert.doesNotThrow(() => limparRascunho());
});

test("ehOrganizador identifica etiqueta iniciada por Você", () => {
  assert.equal(ehOrganizador(rascunhoValido.membros[0]), true);
  assert.equal(
    ehOrganizador({ ...rascunhoValido.membros[0], etiqueta: "Convidado" }),
    false,
  );
});

test("extrairEmail encontra e-mail em texto livre e retorna null quando ausente", () => {
  assert.equal(extrairEmail("Chave Pix vinculada: mariana.silva@pix.me"), "mariana.silva@pix.me");
  assert.equal(extrairEmail("pedro.alves@banco.com.br"), "pedro.alves@banco.com.br");
  assert.equal(extrairEmail("WhatsApp: (11) 98722-1044"), null);
  assert.equal(extrairEmail(""), null);
});
