import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Racha+ API",
    version: "1.0.0",
    description: "Documentação da API do backend Racha+ gerada automaticamente.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor Local",
    },
  ],
};

const outputFile = "./src/lib/swagger-output.json";
const routesEndpoints = ["./src/routes.ts", "./src/lib/routes.doc.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routesEndpoints, doc);
