import { Router } from "express";
import { criarLimitadorPorUsuario } from "../../middlewares/rateLimit.js";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { conviteController } from "./convite.controller.js";

export const conviteGrupoRoutes = Router({ mergeParams: true });
conviteGrupoRoutes.use(requireAuth);
conviteGrupoRoutes.post(
  "/",
  criarLimitadorPorUsuario(
    10,
    60_000,
    "Muitos convites enviados. Aguarde um minuto e tente novamente.",
  ),
  conviteController.criar,
);
conviteGrupoRoutes.get("/", conviteController.listar);
conviteGrupoRoutes.delete("/:idConvite", conviteController.cancelar);

export const convitePublicoRoutes = Router();
convitePublicoRoutes.get("/:token", conviteController.obterPorToken);
convitePublicoRoutes.post("/:token/aceitar", requireAuth, conviteController.aceitar);
