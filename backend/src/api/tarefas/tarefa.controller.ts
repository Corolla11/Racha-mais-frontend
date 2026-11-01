import type { Request, Response } from "express";
import { z } from "zod";
import { StatusAndamento, TipoTarefa } from "../../generated/prisma/enums.js";
import { tarefaService } from "./tarefa.service.js";

const tarefaSchema = z
  .object({
    idGrupo: z.string("O ID do grupo é obrigatório").trim().min(1, "O ID do grupo é obrigatório"),
    nome: z.string("O nome da tarefa é obrigatório").trim().min(1, "O nome da tarefa é obrigatório").max(100, "O nome da tarefa deve ter no máximo 100 caracteres"),
    descricao: z.string("A descrição deve ser um texto").trim().max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
    valorTotal: z.number("O valor total deve ser um número").nonnegative("O valor total não pode ser negativo").max(99_999_999.99, "O valor total deve ser no máximo 99.999.999,99").optional(),
    dataInicio: z.coerce.date("A data inicial é inválida"),
    dataFinal: z.coerce.date("A data final é inválida"),
    tipoTarefa: z.enum(TipoTarefa, "Tipo de tarefa inválido"),
    statusAndamento: z.enum(StatusAndamento, "Status de andamento inválido").optional(),
  })
  .refine(
    (d) => !d.dataInicio || !d.dataFinal || d.dataFinal >= d.dataInicio,
    "A data final deve ser igual ou posterior à data inicial",
  );

export const tarefaController = {
  async criar(req: Request, res: Response) {
    const dados = tarefaSchema.parse(req.body);
    const tarefa = await tarefaService.criar(res.locals.user.id, dados);
    res.status(201).json(tarefa);
  },

  async listar(req: Request, res: Response) {
    const filtros = tarefaSchema
      .pick({ idGrupo: true, tipoTarefa: true, statusAndamento: true })
      .partial()
      .parse(req.query);
    res.json(await tarefaService.listar(res.locals.user.id, filtros));
  },

  async obter(req: Request, res: Response) {
    res.json(
      await tarefaService.obter(res.locals.user.id, String(req.params.id)),
    );
  },

  async atualizar(req: Request, res: Response) {
    const dados = tarefaSchema
      .omit({ idGrupo: true })
      .partial()
      .parse(req.body);
    const tarefa = await tarefaService.atualizar(
      res.locals.user.id,
      String(req.params.id),
      dados,
    );
    res.json(tarefa);
  },

  async excluir(req: Request, res: Response) {
    await tarefaService.excluir(res.locals.user.id, String(req.params.id));
    res.status(204).send();
  },
};
