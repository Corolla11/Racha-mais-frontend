import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { assinaturaController } from "./api/assinaturas/assinatura.controller.js";
import { assinaturaRoutes } from "./api/assinaturas/assinatura.routes.js";
import { planoRoutes } from "./api/assinaturas/plano.routes.js";
import { notificacaoController } from "./api/notificacoes/notificacao.controller.js";
import { notificacaoRoutes } from "./api/notificacoes/notificacao.routes.js";
import { iaRoutes } from "./api/ia/ia.routes.js";
import { routes } from "./routes.js";

const app = express();

app.all("/api/auth/*splat", toNodeHandler(auth));
app.post(
  "/webhooks/abacatepay",
  express.raw({ type: "application/json" }),
  assinaturaController.receberWebhook,
);

app.use(express.json());

app.use("/planos", planoRoutes);
app.use("/assinaturas", assinaturaRoutes);
app.use("/notificacoes", notificacaoRoutes);
app.get("/internal/cron/lembretes", notificacaoController.executarCronLembretes);
app.use("/ia", iaRoutes);
// Centralizador de rotas da aplicação
app.use(routes);

app.use(errorHandler);

export default app;
