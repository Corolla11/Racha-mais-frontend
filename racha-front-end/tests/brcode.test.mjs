import test from "node:test";
import assert from "node:assert/strict";
import { crc16Ccitt, gerarBrCode, sanitizarTextoBrCode, tlv } from "../src/lib/brcode.ts";

test("tlv usa contagem em bytes UTF-8", () => {
  assert.equal(tlv("00", "br.gov.bcb.pix"), "0014br.gov.bcb.pix");
  assert.equal(tlv("59", "José"), "5905José");
});

test("sanitizarTextoBrCode remove acentos, símbolos e aplica limites", () => {
  assert.equal(
    sanitizarTextoBrCode("João da Silva & Cia!", 25, "RACHA MAIS"),
    "JOAO DA SILVA CIA",
  );
  assert.equal(sanitizarTextoBrCode("São Paulo", 15, "BRASIL"), "SAO PAULO");
  assert.equal(sanitizarTextoBrCode("", 15, "BRASIL"), "BRASIL");
});

test("gerarBrCode segue tags obrigatórias, omite valor zero e calcula CRC16", () => {
  const semValor = gerarBrCode({
    chave: "(11) 99999-8888",
    tipoChave: "telefone",
    nomeRecebedor: "Ana María",
    cidadeRecebedor: "Fortaleza",
    valor: 0,
  });

  assert.ok(semValor.startsWith("000201"));
  assert.ok(semValor.includes("0014br.gov.bcb.pix"));
  assert.ok(semValor.includes("0114+5511999998888"));
  assert.ok(semValor.includes("52040000"));
  assert.ok(semValor.includes("5303986"));
  assert.ok(!semValor.includes("54040.00"));
  assert.ok(semValor.includes("5802BR"));
  assert.ok(semValor.includes("5909ANA MARIA"));
  assert.ok(semValor.includes("6009FORTALEZA"));
  assert.ok(semValor.includes("62070503***"));
  assert.match(semValor, /6304[0-9A-F]{4}$/);
  assert.ok(semValor.length <= 512);

  const corpoSemCrc = semValor.slice(0, -4);
  assert.equal(semValor.slice(-4), crc16Ccitt(corpoSemCrc));

  const comValor = gerarBrCode({
    chave: "123.456.789-09",
    tipoChave: "cpf",
    nomeRecebedor: "Bruno",
    valor: 1500.5,
    txid: "task-123_abc",
  });
  assert.ok(comValor.includes("54071500.50"));
  assert.ok(comValor.includes("0510task123abc"));
});
