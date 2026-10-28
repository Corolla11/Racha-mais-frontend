import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { chavePixController } from "./chavePix.controller.js";

export const chavePixRoutes = Router();

chavePixRoutes.use(requireAuth);

chavePixRoutes.post("/", chavePixController.criar);
chavePixRoutes.get("/", chavePixController.listar);
chavePixRoutes.get("/:id", chavePixController.obter);
chavePixRoutes.patch("/:id", chavePixController.atualizar);
chavePixRoutes.delete("/:id", chavePixController.excluir);
