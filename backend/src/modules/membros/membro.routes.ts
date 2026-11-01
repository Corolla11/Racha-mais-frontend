import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { membroController } from "./membro.controller.js";

export const membroRoutes = Router({ mergeParams: true });

membroRoutes.use(requireAuth);

membroRoutes.post("/", membroController.adicionar);
membroRoutes.get("/", membroController.listar);
membroRoutes.patch("/:idUser", membroController.atualizarFuncao);
membroRoutes.delete("/:idUser", membroController.remover);
