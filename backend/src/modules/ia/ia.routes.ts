import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { iaController } from "./ia.controller.js";

export const iaRoutes = Router();

iaRoutes.use(requireAuth);
iaRoutes.post("/grupos/rascunho", iaController.gerarRascunhoGrupo);
