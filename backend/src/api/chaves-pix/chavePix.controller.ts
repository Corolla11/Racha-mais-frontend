import type { Request, Response } from "express";
import { z } from "zod";
import { TipoChave } from "../../generated/prisma/enums.js";
import { chavePixService } from "./chavePix.service.js";

const chavePixSchema = z.object({
  idUser: z.string("O ID do usuário deve ser um texto").trim().min(1, "O ID do usuário é obrigatório"),
  tipoChave: z.enum(TipoChave, "Tipo de chave Pix inválido"),
  chave: z.string("A chave Pix é obrigatória").trim().min(1, "A chave Pix é obrigatória").max(100, "A chave Pix deve ter no máximo 100 caracteres"),
});

export const chavePixController = {
  async criar(req: Request, res: Response) {
    const dados = chavePixSchema.omit({ idUser: true }).parse(req.body);
    const chavePix = await chavePixService.criar(res.locals.user.id, dados);
    res.status(201).json(chavePix);
  },

  async listar(req: Request, res: Response) {
    const filtros = chavePixSchema
      .pick({ idUser: true, tipoChave: true })
      .partial()
      .parse(req.query);
    res.json(await chavePixService.listar(res.locals.user.id, filtros));
  },

  async obter(req: Request, res: Response) {
    res.json(
      await chavePixService.obter(res.locals.user.id, String(req.params.id)),
    );
  },

  async atualizar(req: Request, res: Response) {
    const dados = chavePixSchema.omit({ idUser: true }).partial().parse(req.body);
    const chavePix = await chavePixService.atualizar(
      res.locals.user.id,
      String(req.params.id),
      dados,
    );
    res.json(chavePix);
  },

  async excluir(req: Request, res: Response) {
    await chavePixService.excluir(res.locals.user.id, String(req.params.id));
    res.status(204).send();
  },
};
