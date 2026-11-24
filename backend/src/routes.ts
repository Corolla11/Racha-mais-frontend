import { Router } from "express";
import { chavePixRoutes } from "./api/chaves-pix/chavePix.routes.js";
import { tarefaRoutes } from "./api/tarefas/tarefa.routes.js";
import { userRoutes } from "./api/users/user.routes.js";
import { grupoRoutes } from "./modules/grupos/grupo.routes.js";
import { membroRoutes } from "./modules/membros/membro.routes.js";
import { parteRoutes } from "./modules/partes/parte.routes.js";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/grupos/:idGrupo/membros", membroRoutes);
routes.use("/grupos", grupoRoutes);
routes.use("/tarefas/:idTarefa/partes", parteRoutes);
routes.use("/partes", parteRoutes);
routes.use("/tarefas", tarefaRoutes);
routes.use("/chaves-pix", chavePixRoutes);
routes.use("/users", userRoutes);
