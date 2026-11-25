import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { conviteController } from "./convite.controller.js";

export const conviteGrupoRoutes = Router({ mergeParams: true });
conviteGrupoRoutes.use(requireAuth);
conviteGrupoRoutes.post("/", conviteController.criar);
conviteGrupoRoutes.get("/", conviteController.listar);
conviteGrupoRoutes.delete("/:idConvite", conviteController.cancelar);

export const convitePublicoRoutes = Router();
convitePublicoRoutes.get("/:token", conviteController.obterPorToken);
convitePublicoRoutes.post("/:token/aceitar", requireAuth, conviteController.aceitar);
