import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { parteController } from "./parte.controller.js";

export const parteRoutes = Router({ mergeParams: true });

parteRoutes.use(requireAuth);

parteRoutes.post("/", parteController.criar);
parteRoutes.get("/", parteController.listar);
parteRoutes.get("/:id", parteController.obter);
parteRoutes.patch("/:id", parteController.atualizar);
parteRoutes.delete("/:id", parteController.remover);
