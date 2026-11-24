import type { Request, Response } from "express";
import { z } from "zod";
import { StatusAndamento } from "../../generated/prisma/enums.js";
import { parteService } from "./parte.service.js";

const valorSchema = z
  .union([
    z.string().regex(/^\d+(?:\.\d{1,2})?$/, "O valor deve ser positivo e ter até duas casas decimais"),
    z.number().positive("O valor da parte deve ser maior que zero"),
  ])
  .transform((v) => Number(v))
  .refine((n) => Number.isFinite(n) && n > 0, "O valor da parte deve ser maior que zero")
  .refine((n) => n <= 9999999999.99, "O valor excede o limite permitido pelo banco")
  .transform((n) => n.toFixed(2));

const criarParteSchema = z
  .object({
    idUser: z.string("idUser é obrigatório").trim().min(1, "idUser é obrigatório"),
    descricao: z.string("A descrição deve ser um texto").trim().optional(),
    valor: valorSchema,
  })
  .strict();

const atualizarParteSchema = z
  .object({
    descricao: z.string("A descrição deve ser um texto").trim().optional(),
    valor: valorSchema.optional(),
    status: z.enum(StatusAndamento, "Status inválido").optional(),
  })
  .strict();

export const parteController = {
  async criar(req: Request, res: Response) {
    const dados = criarParteSchema.parse(req.body);
    const parte = await parteService.criar(
      res.locals.user.id,
      String(req.params.idTarefa),
      dados,
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
    const dados = atualizarParteSchema.parse(req.body);
    res.json(
      await parteService.atualizar(
        res.locals.user.id,
        String(req.params.id),
        dados,
      ),
    );
  },

  async remover(req: Request, res: Response) {
    await parteService.remover(res.locals.user.id, String(req.params.id));
    res.status(204).send();
  },
};
