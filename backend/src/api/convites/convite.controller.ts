import type { Request, Response } from "express";
import { z } from "zod";
import { conviteService } from "./convite.service.js";

const criarConviteSchema = z
  .object({
    email: z.string("O e-mail é obrigatório").trim().email("Informe um e-mail válido"),
  })
  .strict();

export const conviteController = {
  async criar(req: Request, res: Response) {
    const { email } = criarConviteSchema.parse(req.body);
    const convite = await conviteService.criar(
      res.locals.user.id,
      String(req.params.idGrupo),
      email,
    );
    res.status(201).json(convite);
  },

  async listar(req: Request, res: Response) {
    res.json(
      await conviteService.listar(
        res.locals.user.id,
        String(req.params.idGrupo),
      ),
    );
  },

  async cancelar(req: Request, res: Response) {
    await conviteService.cancelar(
      res.locals.user.id,
      String(req.params.idGrupo),
      String(req.params.idConvite),
    );
    res.status(204).send();
  },

  async obterPorToken(req: Request, res: Response) {
    res.json(await conviteService.obterPorToken(String(req.params.token)));
  },

  async aceitar(req: Request, res: Response) {
    res.json(
      await conviteService.aceitar(
        res.locals.user.id,
        String(res.locals.user.email ?? ""),
        String(req.params.token),
      ),
    );
  },
};
