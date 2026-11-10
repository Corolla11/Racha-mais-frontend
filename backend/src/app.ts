import express from "express";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { assinaturaController } from "./api/assinaturas/assinatura.controller.js";
import { assinaturaRoutes } from "./api/assinaturas/assinatura.routes.js";
import { planoRoutes } from "./api/assinaturas/plano.routes.js";
import { notificacaoRoutes } from "./modules/notificacoes/notificacao.routes.js";
import { iaRoutes } from "./modules/ia/ia.routes.js";
import { routes } from "./routes.js";
import swaggerDocument from "./lib/swagger-output.json" with { type: "json" };

const app = express();

app.all("/api/auth/*splat", toNodeHandler(auth));
app.post(
  "/webhooks/abacatepay",
  express.raw({ type: "application/json" }),
  assinaturaController.receberWebhook,
);

app.use(express.json());

// Documentação da API com Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/planos", planoRoutes);
app.use("/assinaturas", assinaturaRoutes);
app.use("/notificacoes", notificacaoRoutes);
app.use("/ia", iaRoutes);
// Centralizador de rotas da aplicação
app.use(routes);

app.use(errorHandler);

export default app;
