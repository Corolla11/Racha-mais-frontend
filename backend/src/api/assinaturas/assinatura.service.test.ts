import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const {
  assinaturaService,
  validarCicloPlano,
  verificarAssinaturaWebhook,
  verificarSecretWebhook,
} = await import("./assinatura.service.js");

describe("catálogo e validação do plano Pro", () => {
  it("expõe os preços mensal e anual em centavos e benefícios ainda vazios", () => {
    assert.deepEqual(assinaturaService.listarPlanos(), [
      {
        id: "pro-mensal",
        nome: "Pro",
        ciclo: "mensal",
        valorCentavos: 490,
        moeda: "BRL",
        beneficios: [],
      },
      {
        id: "pro-anual",
        nome: "Pro",
        ciclo: "anual",
        valorCentavos: 4990,
        moeda: "BRL",
        beneficios: [],
      },
    ]);
  });

  it("aceita apenas ciclos mensal e anual", () => {
    assert.equal(validarCicloPlano("mensal"), "mensal");
    assert.equal(validarCicloPlano("anual"), "anual");
    assert.equal(validarCicloPlano("semanal"), null);
    assert.equal(validarCicloPlano(undefined), null);
  });
});

describe("validação de webhook AbacatePay", () => {
  it("valida o secret configurado sem comparação insegura", () => {
    process.env.ABACATEPAY_WEBHOOK_SECRET = "segredo-de-teste";
    assert.equal(verificarSecretWebhook("segredo-de-teste"), true);
    assert.equal(verificarSecretWebhook("segredo-incorreto"), false);
  });

  it("valida HMAC-SHA256 sobre o corpo bruto", () => {
    const chave = "chave-publica-de-teste";
    const corpo = Buffer.from('{"id":"evt_1","event":"subscription.completed"}');
    process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY = chave;
    const assinatura = createHmac("sha256", chave)
      .update(corpo)
      .digest("base64");

    assert.equal(verificarAssinaturaWebhook(corpo, assinatura), true);
    assert.equal(verificarAssinaturaWebhook(corpo, "assinatura-invalida"), false);
  });
});
