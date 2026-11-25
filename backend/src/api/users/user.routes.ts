import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { userController } from "./user.controller.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get("/me", userController.obterPerfil);
userRoutes.patch("/me", userController.atualizarPerfil);
userRoutes.delete("/me", userController.desativarConta);
userRoutes.get("/:id", userController.obter);
