import type { Request, Response } from "express";
import { parteService } from "./parte.service.js";

export const parteController = {
  async criar(req: Request, res: Response) {
    const parte = await parteService.criar(
      res.locals.user.id,
      String(req.params.idTarefa),
      req.body ?? {},
    );
    res.status(201).json(parte);
  },

  async listar(req: Request, res: Response) {
    res.json(
      await parteService.listar(
        res.locals.user.id,
        String(req.params.idTarefa),
      ),
    );
  },

  async obter(req: Request, res: Response) {
    res.json(
      await parteService.obter(res.locals.user.id, String(req.params.id)),
    );
  },

  async atualizar(req: Request, res: Response) {
    res.json(
      await parteService.atualizar(
        res.locals.user.id,
        String(req.params.id),
        req.body ?? {},
      ),
    );
  },

  async remover(req: Request, res: Response) {
    await parteService.remover(res.locals.user.id, String(req.params.id));
    res.status(204).send();
  },
};
