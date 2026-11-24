import { TipoNotificacao } from "../../generated/prisma/enums.js";
import type { NovaNotificacao } from "./notificacao.repository.js";

type ParteComPrazo = {
  id: string;
  idUser: string;
  idTarefa: string;
  tarefa: { idGrupo: string; nome: string; dataFinal: Date };
};

function dataDoPrazo(dataFinal: Date): string {
  return dataFinal.toISOString();
}

export function construirLembretesDePrazo(
  partes: ParteComPrazo[],
  agora: Date,
): NovaNotificacao[] {
  return partes.map((parte) => {
    const dataFinal = parte.tarefa.dataFinal;
    const proximoDoPrazo = dataFinal > agora;
    const tipo = proximoDoPrazo
      ? TipoNotificacao.PRAZO_PROXIMO
      : TipoNotificacao.PRAZO_VENCIDO;

    return {
      idUser: parte.idUser,
      tipo,
      titulo: proximoDoPrazo ? "Prazo se aproximando" : "Prazo vencido",
      mensagem: proximoDoPrazo
        ? `A tarefa "${parte.tarefa.nome}" vence nas próximas 24 horas.`
        : `O prazo da tarefa "${parte.tarefa.nome}" venceu.`,
      idGrupo: parte.tarefa.idGrupo,
      idTarefa: parte.idTarefa,
      idParte: parte.id,
      chaveEvento: `prazo:${tipo}:${parte.id}:${dataDoPrazo(dataFinal)}`,
    };
  });
}
