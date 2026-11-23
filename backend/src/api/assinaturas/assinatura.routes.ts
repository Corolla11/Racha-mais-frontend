import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { assinaturaController } from "./assinatura.controller.js";

export const assinaturaRoutes = Router();

assinaturaRoutes.use(requireAuth);
assinaturaRoutes.get(
  "/grupos/:idGrupo",
  assinaturaController.obterDoGrupo,
);
assinaturaRoutes.post(
  "/grupos/:idGrupo/pro/checkout",
  assinaturaController.criarCheckout,
);
assinaturaRoutes.post(
  "/grupos/:idGrupo/cancel",
  assinaturaController.cancelarDoGrupo,
);
