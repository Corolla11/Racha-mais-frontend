import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { grupoRoutes } from "./modules/grupos/grupo.routes.js";
import { membroRoutes } from "./modules/membros/membro.routes.js";
import { parteRoutes } from "./modules/partes/parte.routes.js";

const app = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/grupos/:idGrupo/membros", membroRoutes);
app.use("/grupos", grupoRoutes);
app.use("/tarefas/:idTarefa/partes", parteRoutes);
app.use("/partes", parteRoutes);

app.use(errorHandler);

export default app;
