import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { grupoController } from "./grupo.controller.js";

export const grupoRoutes = Router();

grupoRoutes.use(requireAuth);

grupoRoutes.post("/", grupoController.criar);
grupoRoutes.get("/", grupoController.listar);
grupoRoutes.get("/:id", grupoController.obter);
grupoRoutes.patch("/:id", grupoController.atualizar);
grupoRoutes.delete("/:id", grupoController.excluir);
