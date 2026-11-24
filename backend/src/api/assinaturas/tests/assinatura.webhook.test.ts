import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { AppError } from "../../../errors/AppError.js";
import { StatusAssinaturaPro } from "../../../generated/prisma/enums.js";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/racha_test";

const { prisma } = await import("../../../lib/prisma.js");
const { assinaturaService } = await import("../assinatura.service.js");

const originalTransaction = prisma.$transaction;

function mockTransaction(tx: unknown) {
  Object.defineProperty(prisma, "$transaction", {
    value: async (cb: (client: unknown) => Promise<unknown>) => cb(tx),
    configurable: true,
    writable: true,
  });
}

describe("assinaturaService.processarWebhook", () => {
  afterEach(() => {
    Object.defineProperty(prisma, "$transaction", {
      value: originalTransaction,
      configurable: true,
      writable: true,
    });
  });

  it("ignora evento duplicado de forma idempotente", async () => {
    let updateCalls = 0;
    mockTransaction({
      eventoAbacatePay: { createMany: async () => ({ count: 0 }) },
      assinaturaPro: {
        updateMany: async () => {
          updateCalls += 1;
          return { count: 1 };
        },
      },
    });

    await assinaturaService.processarWebhook({
      id: "evt_duplicado",
      event: "subscription.completed",
      data: { subscription: { id: "sub_1", checkoutId: "chk_1" } },
    });
    assert.equal(updateCalls, 0);
  });

  it("ativa assinatura pendente no evento subscription.completed", async () => {
    let args: unknown = null;
    mockTransaction({
      eventoAbacatePay: { createMany: async () => ({ count: 1 }) },
      assinaturaPro: {
        updateMany: async (payload: unknown) => {
          args = payload;
          return { count: 1 };
        },
      },
    });

    await assinaturaService.processarWebhook({
      id: "evt_ok",
      event: "subscription.completed",
      data: { subscription: { id: "sub_1", checkoutId: "chk_1" } },
    });

    assert.deepEqual(args, {
      where: {
        providerCheckoutId: "chk_1",
        status: StatusAssinaturaPro.PENDENTE,
      },
      data: {
        providerSubscriptionId: "sub_1",
        status: StatusAssinaturaPro.ATIVA,
      },
    });
  });

  it("cancela assinatura no evento subscription.cancelled", async () => {
    let args: unknown = null;
    mockTransaction({
      eventoAbacatePay: { createMany: async () => ({ count: 1 }) },
      assinaturaPro: {
        updateMany: async (payload: unknown) => {
          args = payload;
          return { count: 1 };
        },
      },
    });

    await assinaturaService.processarWebhook({
      id: "evt_cancel",
      event: "subscription.cancelled",
      data: { subscription: { id: "sub_1" } },
    });

    assert.deepEqual(args, {
      where: { providerSubscriptionId: "sub_1" },
      data: { status: StatusAssinaturaPro.CANCELADA },
    });
  });

  it("rejeita subscription.completed sem checkoutId obrigatório", async () => {
    mockTransaction({
      eventoAbacatePay: { createMany: async () => ({ count: 1 }) },
      assinaturaPro: { updateMany: async () => ({ count: 0 }) },
    });

    await assert.rejects(
      () =>
        assinaturaService.processarWebhook({
          id: "evt_invalido",
          event: "subscription.completed",
          data: { subscription: { id: "sub_1" } },
        }),
      (erro: unknown) => erro instanceof AppError && erro.statusCode === 400,
    );
  });
});
