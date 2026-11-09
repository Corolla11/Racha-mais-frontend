import express from "express";
import swaggerUi from "swagger-ui-express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { routes } from "./routes.js";
import swaggerDocument from "./lib/swagger-output.json" with { type: "json" };

const app = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// Documentação da API com Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Centralizador de rotas da aplicação
app.use(routes);

app.use(errorHandler);

export default app;
