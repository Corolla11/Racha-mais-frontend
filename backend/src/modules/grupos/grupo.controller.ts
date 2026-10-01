import type { Request, Response } from "express";
import { grupoService } from "./grupo.service.js";

export const grupoController = {
  async criar(req: Request, res: Response) {
    const grupo = await grupoService.criar(res.locals.user.id, req.body ?? {});
    res.status(201).json(grupo);
  },

  async listar(_req: Request, res: Response) {
    res.json(await grupoService.listar(res.locals.user.id));
  },

  async obter(req: Request, res: Response) {
    const id = String(req.params.id);
    res.json(await grupoService.obter(res.locals.user.id, id));
  },

  async atualizar(req: Request, res: Response) {
    const id = String(req.params.id);
    const grupo = await grupoService.atualizar(
      res.locals.user.id,
      id,
      req.body ?? {},
    );
    res.json(grupo);
  },

  async excluir(req: Request, res: Response) {
    const id = String(req.params.id);
    await grupoService.excluir(res.locals.user.id, id);
    res.status(204).send();
  },
};
