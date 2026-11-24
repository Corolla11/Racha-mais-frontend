import type { Request, Response } from "express";
import { z } from "zod";
import { Funcao } from "../../generated/prisma/enums.js";
import { membroService } from "./membro.service.js";

const adicionarMembroSchema = z
  .object({
    idUser: z.string("idUser deve ser um texto válido").trim().min(1, "idUser deve ser um texto válido").optional(),
    email: z.string("email deve ser um texto válido").trim().min(1, "email deve ser um texto válido").optional(),
  })
  .refine(
    (d) => (d.idUser !== undefined) !== (d.email !== undefined),
    "Informe exatamente um dos campos idUser ou email",
  );

const atualizarFuncaoSchema = z.object({
  funcao: z.enum(Funcao, "A função deve ser dono ou membro"),
});

export const membroController = {
  async adicionar(req: Request, res: Response) {
    const idGrupo = String(req.params.idGrupo);
    const dados = adicionarMembroSchema.parse(req.body);
    const membro = await membroService.adicionar(res.locals.user.id, idGrupo, dados);
    res.status(201).json(membro);
  },

  async listar(req: Request, res: Response) {
    const idGrupo = String(req.params.idGrupo);
    res.json(await membroService.listar(res.locals.user.id, idGrupo));
  },

  async atualizarFuncao(req: Request, res: Response) {
    const idGrupo = String(req.params.idGrupo);
    const idUser = String(req.params.idUser);
    const dados = atualizarFuncaoSchema.parse(req.body);
    const membro = await membroService.atualizarFuncao(
      res.locals.user.id,
      idGrupo,
      idUser,
      dados,
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
