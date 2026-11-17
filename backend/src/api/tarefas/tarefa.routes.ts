import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { tarefaController } from "./tarefa.controller.js";

export const tarefaRoutes = Router();

tarefaRoutes.use(requireAuth);

tarefaRoutes.post("/", tarefaController.criar);
tarefaRoutes.get("/", tarefaController.listar);
tarefaRoutes.get("/:id", tarefaController.obter);
tarefaRoutes.patch("/:id", tarefaController.atualizar);
tarefaRoutes.delete("/:id", tarefaController.excluir);
