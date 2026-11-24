import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { notificacaoController } from "./notificacao.controller.js";

export const notificacaoRoutes = Router();

notificacaoRoutes.use(requireAuth);
notificacaoRoutes.get("/", notificacaoController.listar);
notificacaoRoutes.patch("/lidas", notificacaoController.marcarTodasLidas);
notificacaoRoutes.patch("/:id/lida", notificacaoController.marcarLida);
