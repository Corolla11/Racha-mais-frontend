import "dotenv/config";
import app from "./app.js";
import { iniciarAgendadorDeNotificacoes } from "./modules/notificacoes/notificacao.service.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  iniciarAgendadorDeNotificacoes();
});
