import type { Request, Response } from "express";
import { AppError } from "../../errors/AppError.js";
import {
  assinaturaService,
  validarCicloPlano,
  verificarAssinaturaWebhook,
  verificarSecretWebhook,
} from "./assinatura.service.js";

export const assinaturaController = {
  listarPlanos(_req: Request, res: Response) {
    res.json({ planos: assinaturaService.listarPlanos() });
  },

  async obterDoGrupo(req: Request, res: Response) {
    res.json(
      await assinaturaService.obterDoGrupo(
        res.locals.user.id,
        String(req.params.idGrupo),
      ),
    );
  },

  async criarCheckout(req: Request, res: Response) {
    const ciclo = validarCicloPlano(req.body?.ciclo);
    if (!ciclo) throw new AppError(400, "Ciclo deve ser mensal ou anual");
    res.status(201).json(
      await assinaturaService.criarCheckout(
        res.locals.user.id,
        String(req.params.idGrupo),
        ciclo,
      ),
    );
  },

  async cancelarDoGrupo(req: Request, res: Response) {
    res.json(
      await assinaturaService.cancelarDoGrupo(
        res.locals.user.id,
        String(req.params.idGrupo),
      ),
    );
  },

  async receberWebhook(req: Request, res: Response) {
    if (!Buffer.isBuffer(req.body)) {
      throw new AppError(400, "Corpo do webhook inválido");
    }
    const secret =
      typeof req.query.webhookSecret === "string"
        ? req.query.webhookSecret
        : undefined;
    if (!verificarSecretWebhook(secret)) {
      return res.status(401).json({ error: "Webhook não autorizado" });
    }
    if (
      !verificarAssinaturaWebhook(
        req.body,
        req.get("X-Webhook-Signature"),
      )
    ) {
      return res.status(401).json({ error: "Assinatura do webhook inválida" });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(req.body.toString("utf8"));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AppError(400, "JSON do webhook inválido");
      }
      throw error;
    }

    await assinaturaService.processarWebhook(payload);
    res.status(200).json({ ok: true });
  },
};
