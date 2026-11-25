import type { Request, Response } from "express";
import { z } from "zod";
import { userService } from "./user.service.js";

const atualizarPerfilSchema = z
  .object({
    name: z
      .string("O nome deve ser um texto")
      .trim()
      .min(1, "O nome não pode ficar vazio")
      .max(100, "O nome deve ter no máximo 100 caracteres")
      .optional(),
    bio: z
      .string("A bio deve ser um texto")
      .trim()
      .max(120, "A bio deve ter no máximo 120 caracteres")
      .optional(),
    cidade: z
      .string("A cidade deve ser um texto")
      .trim()
      .max(100, "A cidade deve ter no máximo 100 caracteres")
      .optional(),
    telefone: z
      .string("O telefone deve ser um texto")
      .trim()
      .max(20, "O telefone deve ter no máximo 20 caracteres")
      .optional(),
    image: z
      .string("A imagem deve ser um texto")
      .trim()
      .min(1)
      .max(255)
      .nullable()
      .optional(),
  })
  .strict()
  .refine(
    (d) =>
      d.name !== undefined ||
      d.bio !== undefined ||
      d.cidade !== undefined ||
      d.telefone !== undefined ||
      d.image !== undefined,
    "Informe ao menos um campo para atualizar",
  );

export const userController = {
  async obterPerfil(_req: Request, res: Response) {
    res.json(await userService.obterPerfil(res.locals.user.id));
  },

  async atualizarPerfil(req: Request, res: Response) {
    const dados = atualizarPerfilSchema.parse(req.body);
    res.json(await userService.atualizarPerfil(res.locals.user.id, dados));
  },

  async desativarConta(_req: Request, res: Response) {
    await userService.desativarConta(res.locals.user.id);
    res.status(204).send();
  },

  async obter(req: Request, res: Response) {
    res.json(
      await userService.obter(res.locals.user.id, String(req.params.id)),
    );
  },

  async obterAvatar(req: Request, res: Response) {
    res.json(
      await userService.obterAvatar(res.locals.user.id, String(req.params.id)),
    );
  },
};
