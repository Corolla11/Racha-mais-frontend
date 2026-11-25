import { Router } from "express";
import { criarLimitadorPorUsuario } from "../../middlewares/rateLimit.js";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { iaController } from "./ia.controller.js";

export function criarLimitadorIa(limite = 10, janelaMs = 60_000) {
  return criarLimitadorPorUsuario(
    limite,
    janelaMs,
    "Muitas solicitações de IA. Aguarde um minuto e tente novamente.",
  );
}

export const iaRoutes = Router();

iaRoutes.use(requireAuth);
iaRoutes.post(
  "/grupos/rascunho",
  criarLimitadorIa(),
  iaController.gerarRascunhoGrupo,
);
