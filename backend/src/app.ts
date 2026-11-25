import express from "express";
import { apiReference } from "@scalar/express-api-reference";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { openApiSpec } from "./lib/openapi.js";
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

if (process.env.NODE_ENV !== "production") {
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });
  app.use(
    "/reference",
    apiReference({
      sources: [
        { title: "Racha+ API", slug: "racha", url: "/openapi.json" },
        {
          title: "Autenticação (Better Auth)",
          slug: "auth",
          url: "/api/auth/open-api/generate-schema",
        },
      ],
    }),
  );
}

app.use("/planos", planoRoutes);
app.use("/assinaturas", assinaturaRoutes);
app.use("/notificacoes", notificacaoRoutes);
app.get("/internal/cron/lembretes", notificacaoController.executarCronLembretes);
app.use("/ia", iaRoutes);
// Centralizador de rotas da aplicação
app.use(routes);

app.use(errorHandler);

export default app;
