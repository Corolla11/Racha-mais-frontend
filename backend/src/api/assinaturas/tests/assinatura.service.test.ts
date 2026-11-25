import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { CicloPlano, Funcao, StatusAssinaturaPro } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const {
  assinaturaService,
  validarCicloPlano,
  verificarAssinaturaWebhook,
  verificarSecretWebhook,
} = await import("../assinatura.service.js");

function mockProp(obj: object, prop: string, value: unknown) {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

const origMembro = { ...prisma.membro };
const origAssinatura = { ...prisma.assinaturaPro };
const origTx = prisma.$transaction;
const origFetch = globalThis.fetch;

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

describe("assinaturaService.criarCheckout", () => {
  afterEach(() => {
    Object.assign(prisma.membro, origMembro);
    Object.assign(prisma.assinaturaPro, origAssinatura);
    mockProp(prisma, "$transaction", origTx);
    globalThis.fetch = origFetch;
  });

  it("reaproveita checkout PENDENTE existente do mesmo ciclo", async () => {
    process.env.ABACATEPAY_PRO_MONTHLY_PRODUCT_ID = "prod_m";
    process.env.ABACATEPAY_RETURN_URL = "https://app.racha.test/retorno";
    process.env.ABACATEPAY_COMPLETION_URL = "https://app.racha.test/ok";

    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        membro: {
          findUnique: async () => ({ idUser: "dono", idGrupo: "g1", funcao: Funcao.dono }),
        },
        assinaturaPro: {
          findUnique: async () => ({
            id: "ass-1",
            ciclo: CicloPlano.mensal,
            status: StatusAssinaturaPro.PENDENTE,
            valorCentavos: 490,
            checkoutUrl: "https://pay.abacate.test/c1",
          }),
        },
      }),
    );

    const res = await assinaturaService.criarCheckout("dono", "g1", "mensal");
    assert.equal(res.checkoutUrl, "https://pay.abacate.test/c1");
    assert.equal(res.status, StatusAssinaturaPro.PENDENTE);
  });

  it("rejeita divergência de preço (409) e só marca FALHOU quando status ainda é PENDENTE", async () => {
    process.env.ABACATEPAY_API_KEY = "ak_test";
    process.env.ABACATEPAY_PRO_MONTHLY_PRODUCT_ID = "prod_m";
    process.env.ABACATEPAY_RETURN_URL = "https://app.racha.test/retorno";
    process.env.ABACATEPAY_COMPLETION_URL = "https://app.racha.test/ok";

    let whereUpdateMany: unknown = null;
    mockProp(prisma.membro, "findUnique", async () => ({
      idUser: "dono",
      idGrupo: "g1",
      funcao: Funcao.dono,
    }));
    mockProp(prisma, "$transaction", async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        $executeRaw: async () => 1,
        membro: {
          findUnique: async () => ({ idUser: "dono", idGrupo: "g1", funcao: Funcao.dono }),
        },
        assinaturaPro: {
          findUnique: async () => null,
          create: async () => ({ id: "ass-1", status: StatusAssinaturaPro.PENDENTE }),
        },
      }),
    );
    mockProp(prisma.assinaturaPro, "updateMany", async ({ where }: { where: unknown }) => {
      whereUpdateMany = where;
      return { count: 1 };
    });

    globalThis.fetch = async (url) => {
      const s = String(url);
      if (s.includes("/subscriptions/create")) {
        return new Response(
          JSON.stringify({
            success: true,
            data: { id: "chk_1", url: "https://pay.abacate.test/chk_1", amount: 999 },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ success: true, data: { id: "chk_1" } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    await assert.rejects(
      () => assinaturaService.criarCheckout("dono", "g1", "mensal"),
      (err: unknown) => err instanceof AppError && err.statusCode === 409,
    );
    assert.deepEqual(whereUpdateMany, {
      idGrupo: "g1",
      status: StatusAssinaturaPro.PENDENTE,
    });
  });
});
