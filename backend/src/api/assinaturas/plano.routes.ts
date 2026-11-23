import { Router } from "express";
import { assinaturaController } from "./assinatura.controller.js";

export const planoRoutes = Router();

planoRoutes.get("/", assinaturaController.listarPlanos);
