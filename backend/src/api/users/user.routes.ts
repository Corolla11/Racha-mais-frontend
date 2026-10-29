import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { userController } from "./user.controller.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get("/me", userController.obterPerfil);
userRoutes.get("/:id", userController.obter);
