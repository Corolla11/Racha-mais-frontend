import test from "node:test";
import assert from "node:assert/strict";
import { formatarChavePix, validarChavePix } from "../src/lib/pix-format.ts";

test("formatarChavePix aplica máscaras estritas E.164, cpf, email e aleatoria", () => {
  assert.equal(formatarChavePix("telefone", "11987654321"), "+55 (11) 98765-4321");
  assert.equal(formatarChavePix("telefone", "+5511987654321"), "+55 (11) 98765-4321");
  assert.equal(formatarChavePix("cpf", "123.456.789-09abc"), "123.456.789-09");
  assert.equal(formatarChavePix("email", "  Ana@Racha.Test "), "ana@racha.test");
  assert.equal(formatarChavePix("email", `${"a".repeat(80)}@b.co`).length, 77);
  assert.equal(
    formatarChavePix("aleatoria", "123E4567E89B12D3A456426614174000!@#"),
    "123e4567-e89b-12d3-a456-426614174000",
  );
});

test("validarChavePix valida formato BR Code conforme o tipo selecionado", () => {
  assert.equal(validarChavePix("telefone", "+55 (11) 98765-4321"), null);
  assert.notEqual(validarChavePix("telefone", "+55 (12) 345"), null);

  assert.equal(validarChavePix("cpf", "123.456.789-09"), null);
  assert.notEqual(validarChavePix("cpf", "111.111.111-11"), null);
  assert.notEqual(validarChavePix("cpf", "123.456.789-00"), null);

  assert.equal(validarChavePix("email", "ana@racha.test"), null);
  assert.notEqual(validarChavePix("email", "invalido"), null);
  assert.notEqual(validarChavePix("email", `${"a".repeat(70)}@racha.com`), null);

  assert.equal(
    validarChavePix("aleatoria", "123e4567-e89b-12d3-a456-426614174000"),
    null,
  );
  assert.notEqual(validarChavePix("aleatoria", "chave-curta"), null);
});
