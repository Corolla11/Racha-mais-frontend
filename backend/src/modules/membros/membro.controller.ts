import type { Request, Response } from "express";
import { membroService } from "./membro.service.js";

export const membroController = {
  async adicionar(req: Request, res: Response) {
    const idGrupo = String(req.params.idGrupo);
    const membro = await membroService.adicionar(
      res.locals.user.id,
      idGrupo,
      req.body ?? {},
    );
    res.status(201).json(membro);
  },

  async listar(req: Request, res: Response) {
    const idGrupo = String(req.params.idGrupo);
    res.json(await membroService.listar(res.locals.user.id, idGrupo));
  },

  async atualizarFuncao(req: Request, res: Response) {
    const idGrupo = String(req.params.idGrupo);
    const idUser = String(req.params.idUser);
    const membro = await membroService.atualizarFuncao(
      res.locals.user.id,
      idGrupo,
      idUser,
      req.body ?? {},
    );
    res.json(membro);
  },

  async remover(req: Request, res: Response) {
    const idGrupo = String(req.params.idGrupo);
    const idUser = String(req.params.idUser);
    await membroService.remover(res.locals.user.id, idGrupo, idUser);
    res.status(204).send();
  },
};
