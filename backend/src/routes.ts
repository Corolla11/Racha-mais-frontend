import { Router } from "express";
import { chavePixRoutes } from "./api/chaves-pix/chavePix.routes.js";
import {
  conviteGrupoRoutes,
  convitePublicoRoutes,
} from "./api/convites/convite.routes.js";
import { tarefaRoutes } from "./api/tarefas/tarefa.routes.js";
import { userRoutes } from "./api/users/user.routes.js";
import { grupoRoutes } from "./api/grupos/grupo.routes.js";
import { membroRoutes } from "./api/membros/membro.routes.js";
import { parteRoutes, parteTarefaRoutes } from "./api/partes/parte.routes.js";
import { uploadRoutes } from "./api/uploads/upload.routes.js";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/grupos/:idGrupo/membros", membroRoutes);
routes.use("/grupos/:idGrupo/convites", conviteGrupoRoutes);
routes.use("/grupos", grupoRoutes);
routes.use("/convites", convitePublicoRoutes);
routes.use("/tarefas/:idTarefa/partes", parteTarefaRoutes);
routes.use("/partes", parteRoutes);
routes.use("/tarefas", tarefaRoutes);
routes.use("/chaves-pix", chavePixRoutes);
routes.use("/users", userRoutes);
routes.use("/uploads", uploadRoutes);
