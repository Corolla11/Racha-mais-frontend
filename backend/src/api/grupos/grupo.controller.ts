import type { Request, Response } from "express";
import { z } from "zod";
import { grupoService } from "./grupo.service.js";

const grupoSchema = z.object({
  nome: z
    .string("O nome do grupo é obrigatório")
    .trim()
    .min(1, "O nome do grupo é obrigatório")
    .max(100, "O nome do grupo deve ter no máximo 100 caracteres"),
  descricao: z.string("A descrição deve ser um texto").trim().optional(),
});

export const grupoController = {
  async criar(req: Request, res: Response) {
    const dados = grupoSchema.parse(req.body);
    const grupo = await grupoService.criar(res.locals.user.id, dados);
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
    const dados = grupoSchema.partial().parse(req.body);
    const grupo = await grupoService.atualizar(res.locals.user.id, id, dados);
    res.json(grupo);
  },

  async encerrar(req: Request, res: Response) {
    const id = String(req.params.id);
    res.json(await grupoService.encerrar(res.locals.user.id, id));
  },

  async excluir(req: Request, res: Response) {
    const id = String(req.params.id);
    await grupoService.excluir(res.locals.user.id, id);
    res.status(204).send();
  },
};
