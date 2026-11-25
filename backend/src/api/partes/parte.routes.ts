import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { parteController } from "./parte.controller.js";

export const parteTarefaRoutes = Router({ mergeParams: true });
parteTarefaRoutes.use(requireAuth);
parteTarefaRoutes.post("/", parteController.criar);
parteTarefaRoutes.get("/", parteController.listar);

export const parteRoutes = Router();
parteRoutes.use(requireAuth);
parteRoutes.get("/:id", parteController.obter);
parteRoutes.patch("/:id", parteController.atualizar);
parteRoutes.delete("/:id", parteController.remover);
