import type { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../errors/AppError.js";
import { notificacaoService } from "./notificacao.service.js";

export const notificacaoController = {
  async listar(req: Request, res: Response) {
    const querySchema = z.object({
      naoLidas: z.enum(["true", "false"]).optional(),
      pagina: z.coerce.number().int().min(1).default(1),
      limite: z.coerce.number().int().min(1).max(100).default(20),
    });
    const query = querySchema.safeParse(req.query);
    if (!query.success) throw new AppError(400, "Parâmetros de consulta inválidos");
    res.json(
      await notificacaoService.listar(res.locals.user.id, {
        naoLidas: query.data.naoLidas === "true",
        pagina: query.data.pagina,
        limite: query.data.limite,
      }),
    );
  },

  async marcarLida(req: Request, res: Response) {
    await notificacaoService.marcarLida(
      res.locals.user.id,
      String(req.params.id),
    );
    res.status(204).send();
  },

  async marcarTodasLidas(_req: Request, res: Response) {
    const resultado = await notificacaoService.marcarTodasLidas(
      res.locals.user.id,
    );
    res.json({ atualizadas: resultado.count });
  },
};
