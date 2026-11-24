import type { Request, Response } from "express";
import { z } from "zod";
import { grupoIaService } from "./grupo-ia.service.js";

const gerarRascunhoSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, "Descreva melhor o grupo que deseja criar")
    .max(2000, "A descrição deve ter no máximo 2.000 caracteres"),
});

export const iaController = {
  async gerarRascunhoGrupo(req: Request, res: Response) {
    const { prompt } = gerarRascunhoSchema.parse(req.body);
    res.json(await grupoIaService.gerarRascunho(prompt));
  },
};
