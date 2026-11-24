import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  CicloPlano,
  Funcao,
  StatusAssinaturaPro,
} from "../../generated/prisma/enums.js";
import { AppError } from "../../errors/AppError.js";
import { postAbacatePay } from "../../lib/abacatePay.js";
import { prisma } from "../../lib/prisma.js";

const VALOR_MENSAL_CENTAVOS = 490;
const VALOR_ANUAL_CENTAVOS = 4990;

const checkoutSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  amount: z.number().int().nonnegative(),
});

const assinaturaCanceladaSchema = z.object({
  id: z.string(),
  status: z.literal("CANCELLED"),
});

const checkoutExcluidoSchema = z.object({
  id: z.string(),
});

const webhookSchema = z.object({
  id: z.string().min(1),
  event: z.string().min(1),
  data: z.object({
    subscription: z
      .object({
        id: z.string().optional(),
        checkoutId: z.string().nullable().optional(),
      })
      .optional(),
  }),
});

type Ciclo = "mensal" | "anual";

function definirCiclo(ciclo: Ciclo): CicloPlano {
  return ciclo === "mensal" ? CicloPlano.mensal : CicloPlano.anual;
}

function valorDoCiclo(ciclo: Ciclo): number {
  return ciclo === "mensal"
    ? VALOR_MENSAL_CENTAVOS
    : VALOR_ANUAL_CENTAVOS;
}

function produtoDoCiclo(ciclo: Ciclo): string {
  const id =
    ciclo === "mensal"
      ? process.env.ABACATEPAY_PRO_MONTHLY_PRODUCT_ID
      : process.env.ABACATEPAY_PRO_ANNUAL_PRODUCT_ID;
  if (!id?.trim()) {
    throw new AppError(
      503,
      `O produto Pro ${ciclo} não está configurado na AbacatePay`,
    );
  }
  return id.trim();
}

function urlDeCheckout(
  nome: "ABACATEPAY_RETURN_URL" | "ABACATEPAY_COMPLETION_URL",
) {
  const url = process.env[nome]?.trim();
  if (!url) throw new AppError(503, `${nome} não está configurada`);
  if (!z.string().url().safeParse(url).success) {
    throw new AppError(503, `${nome} deve ser uma URL válida`);
  }
  return url;
}

function iguaisEmTempoConstante(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

async function exigirDonoDoGrupo(idUser: string, idGrupo: string) {
  const grupo = await prisma.grupo.findUnique({
    where: { id: idGrupo },
    select: { id: true },
  });
  if (!grupo) throw new AppError(404, "Grupo não encontrado");

  const membro = await prisma.membro.findUnique({
    where: { idUser_idGrupo: { idUser, idGrupo } },
    select: { funcao: true },
  });
  if (!membro) throw new AppError(403, "Você não participa deste grupo");
  if (membro.funcao !== Funcao.dono) {
    throw new AppError(403, "Apenas o dono do grupo pode gerenciar o plano Pro");
  }
}

export function verificarAssinaturaWebhook(
  corpo: Buffer,
  assinatura: string | undefined,
): boolean {
  const chave = process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY?.trim();
  if (!chave || !assinatura) return false;

  const esperada = createHmac("sha256", chave).update(corpo).digest("base64");
  return iguaisEmTempoConstante(esperada, assinatura);
}

export function verificarSecretWebhook(secret: string | undefined): boolean {
  const esperado = process.env.ABACATEPAY_WEBHOOK_SECRET?.trim();
  return Boolean(esperado && secret && iguaisEmTempoConstante(esperado, secret));
}

export const assinaturaService = {
  listarPlanos() {
    return [
      {
        id: "pro-mensal",
        nome: "Pro",
        ciclo: "mensal",
        valorCentavos: VALOR_MENSAL_CENTAVOS,
        moeda: "BRL",
        beneficios: [],
      },
      {
        id: "pro-anual",
        nome: "Pro",
        ciclo: "anual",
        valorCentavos: VALOR_ANUAL_CENTAVOS,
        moeda: "BRL",
        beneficios: [],
      },
    ];
  },

  async obterDoGrupo(idUser: string, idGrupo: string) {
    const grupo = await prisma.grupo.findUnique({
      where: { id: idGrupo },
      select: { id: true },
    });
    if (!grupo) throw new AppError(404, "Grupo não encontrado");

    const membro = await prisma.membro.findUnique({
      where: { idUser_idGrupo: { idUser, idGrupo } },
      select: { funcao: true },
    });
    if (!membro) throw new AppError(403, "Você não participa deste grupo");

    const assinatura = await prisma.assinaturaPro.findUnique({
      where: { idGrupo },
      select: {
        ciclo: true,
        status: true,
        valorCentavos: true,
        checkoutUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      isPro: assinatura?.status === StatusAssinaturaPro.ATIVA,
      assinatura: assinatura
        ? {
            ...assinatura,
            checkoutUrl:
              membro.funcao === Funcao.dono ? assinatura.checkoutUrl : null,
          }
        : null,
    };
  },

  async criarCheckout(idUser: string, idGrupo: string, ciclo: Ciclo) {
    await exigirDonoDoGrupo(idUser, idGrupo);
    const existente = await prisma.assinaturaPro.findUnique({
      where: { idGrupo },
    });

    if (existente?.status === StatusAssinaturaPro.ATIVA) {
      throw new AppError(409, "Este grupo já possui uma assinatura Pro ativa");
    }
    if (existente?.status === StatusAssinaturaPro.PENDENTE) {
      if (existente.ciclo === definirCiclo(ciclo) && existente.checkoutUrl) {
        return {
          checkoutUrl: existente.checkoutUrl,
          status: existente.status,
          ciclo: existente.ciclo,
          valorCentavos: existente.valorCentavos,
          moeda: "BRL",
        };
      }
      throw new AppError(
        409,
        "Já existe um checkout Pro pendente para este grupo",
      );
    }

    const productId = produtoDoCiclo(ciclo);
    const assinatura = existente
      ? await prisma.assinaturaPro.update({
          where: { idGrupo },
          data: {
            idUser,
            ciclo: definirCiclo(ciclo),
            status: StatusAssinaturaPro.PENDENTE,
            valorCentavos: valorDoCiclo(ciclo),
            providerCheckoutId: null,
            providerSubscriptionId: null,
            checkoutUrl: null,
          },
        })
      : await prisma.assinaturaPro.create({
          data: {
            idGrupo,
            idUser,
            ciclo: definirCiclo(ciclo),
            status: StatusAssinaturaPro.PENDENTE,
            valorCentavos: valorDoCiclo(ciclo),
          },
        });

    try {
      const checkout = await postAbacatePay(
        "/subscriptions/create",
        {
          items: [{ id: productId, quantity: 1 }],
          externalId: assinatura.id,
          returnUrl: urlDeCheckout("ABACATEPAY_RETURN_URL"),
          completionUrl: urlDeCheckout("ABACATEPAY_COMPLETION_URL"),
          methods: ["CARD"],
        },
        checkoutSchema,
      );

      if (checkout.amount !== valorDoCiclo(ciclo)) {
        await postAbacatePay(
          `/subscriptions/checkouts/delete?id=${encodeURIComponent(checkout.id)}`,
          {},
          checkoutExcluidoSchema,
        );
        throw new AppError(
          409,
          "O preço do produto Pro na AbacatePay não corresponde ao preço configurado no app",
        );
      }

      const atualizada = await prisma.assinaturaPro.update({
        where: { idGrupo },
        data: {
          providerCheckoutId: checkout.id,
          checkoutUrl: checkout.url,
        },
      });

      return {
        checkoutUrl: checkout.url,
        status: atualizada.status,
        ciclo: atualizada.ciclo,
        valorCentavos: atualizada.valorCentavos,
        moeda: "BRL",
      };
    } catch (error) {
      await prisma.assinaturaPro.update({
        where: { idGrupo },
        data: { status: StatusAssinaturaPro.FALHOU },
      });
      throw error;
    }
  },

  async cancelarDoGrupo(idUser: string, idGrupo: string) {
    await exigirDonoDoGrupo(idUser, idGrupo);
    const assinatura = await prisma.assinaturaPro.findUnique({
      where: { idGrupo },
    });
    if (!assinatura) {
      throw new AppError(409, "Não há assinatura Pro ativa para cancelar");
    }

    if (assinatura.status === StatusAssinaturaPro.CANCELADA) {
      return { status: assinatura.status };
    }

    if (assinatura.status === StatusAssinaturaPro.PENDENTE) {
      if (assinatura.providerCheckoutId) {
        await postAbacatePay(
          `/subscriptions/checkouts/delete?id=${encodeURIComponent(assinatura.providerCheckoutId)}`,
          {},
          checkoutExcluidoSchema,
        );
      }
    } else if (
      assinatura.status === StatusAssinaturaPro.ATIVA &&
      assinatura.providerSubscriptionId
    ) {
      await postAbacatePay(
        "/subscriptions/cancel",
        { id: assinatura.providerSubscriptionId },
        assinaturaCanceladaSchema,
      );
    } else {
      throw new AppError(409, "Não há assinatura Pro ativa para cancelar");
    }

    return prisma.assinaturaPro.update({
      where: { idGrupo },
      data: { status: StatusAssinaturaPro.CANCELADA },
      select: { status: true },
    });
  },

  async processarWebhook(corpo: unknown) {
    const evento = webhookSchema.parse(corpo);
    const assinatura = evento.data.subscription;

    await prisma.$transaction(async (tx) => {
      const insercaoEvento = await tx.eventoAbacatePay.createMany({
        data: { id: evento.id, evento: evento.event },
        skipDuplicates: true,
      });
      if (insercaoEvento.count === 0) return;

      if (evento.event === "subscription.completed") {
        if (!assinatura?.id || !assinatura.checkoutId) {
          throw new AppError(400, "Evento de assinatura sem IDs obrigatórios");
        }
        await tx.assinaturaPro.updateMany({
          where: {
            providerCheckoutId: assinatura.checkoutId,
            status: StatusAssinaturaPro.PENDENTE,
          },
          data: {
            providerSubscriptionId: assinatura.id,
            status: StatusAssinaturaPro.ATIVA,
          },
        });
      } else if (evento.event === "subscription.cancelled") {
        if (!assinatura?.id) {
          throw new AppError(400, "Evento de cancelamento sem ID de assinatura");
        }
        await tx.assinaturaPro.updateMany({
          where: { providerSubscriptionId: assinatura.id },
          data: { status: StatusAssinaturaPro.CANCELADA },
        });
      } else if (evento.event === "subscription.renewed") {
        if (!assinatura?.id) {
          throw new AppError(400, "Evento de renovação sem ID de assinatura");
        }
        await tx.assinaturaPro.updateMany({
          where: {
            providerSubscriptionId: assinatura.id,
            status: StatusAssinaturaPro.ATIVA,
          },
          data: { updatedAt: new Date() },
        });
      }
    });
  },
};

export function validarCicloPlano(valor: unknown): Ciclo | null {
  if (valor === "mensal" || valor === "anual") return valor;
  return null;
}
