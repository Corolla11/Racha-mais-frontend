import type { Request, Response } from "express";
import { userService } from "./user.service.js";

export const userController = {
  async obterPerfil(_req: Request, res: Response) {
    res.json(await userService.obterPerfil(res.locals.user.id));
  },

  async obter(req: Request, res: Response) {
    res.json(
      await userService.obter(res.locals.user.id, String(req.params.id)),
    );
  },
};
