import { apiRequest } from "./api.ts";

/**
 * Pontos de entrada centralizados para todas as rotas do backend.
 */
export const ENDPOINTS = {
  users: {
    me: "/users/me",
    byId: (id: string) => `/users/${encodeURIComponent(id)}`,
  },
  chavesPix: {
    base: "/chaves-pix",
    byId: (id: string) => `/chaves-pix/${encodeURIComponent(id)}`,
  },
  grupos: {
    base: "/grupos",
    byId: (id: string) => `/grupos/${encodeURIComponent(id)}`,
    membros: (idGrupo: string) => `/grupos/${encodeURIComponent(idGrupo)}/membros`,
    membroById: (idGrupo: string, idUser: string) =>
      `/grupos/${encodeURIComponent(idGrupo)}/membros/${encodeURIComponent(idUser)}`,
  },
  tarefas: {
    base: "/tarefas",
    byId: (id: string) => `/tarefas/${encodeURIComponent(id)}`,
    partes: (idTarefa: string) => `/tarefas/${encodeURIComponent(idTarefa)}/partes`,
  },
  partes: {
    byId: (id: string) => `/partes/${encodeURIComponent(id)}`,
  },
  notificacoes: {
    base: "/notificacoes",
    marcarLida: (id: string | number) => `/notificacoes/${encodeURIComponent(String(id))}/lida`,
    marcarTodasLidas: "/notificacoes/lidas",
    preferencias: "/notificacoes/preferencias",
  },
  planos: {
    base: "/planos",
  },
  pagamentos: {
    base: "/pagamentos",
    informar: "/pagamentos/informar",
    confirmar: (id: string) => `/pagamentos/${encodeURIComponent(id)}/confirmar`,
    contestar: (id: string) => `/pagamentos/${encodeURIComponent(id)}/contestar`,
    assinatura: "/pagamentos/assinatura",
  },
  ia: {
    sugerirGrupo: "/ia/grupos/rascunho",
  },
} as const;

export type TipoChavePix = "telefone" | "cpf" | "email" | "aleatoria";

export type ChavePixApi = {
  id: string;
  idUser: string;
  tipoChave: TipoChavePix;
  chave: string;
};

export type UserProfileApi = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  chavesPix: ChavePixApi[];
};

export type TipoNotificacaoApi =
  | "MEMBRO_ADICIONADO"
  | "TAREFA_CRIADA"
  | "COBRANCA_CRIADA"
  | "PRAZO_PROXIMO"
  | "PRAZO_VENCIDO";

export type NotificacaoApi = {
  id: string;
  tipo: TipoNotificacaoApi;
  titulo: string;
  mensagem: string;
  idGrupo: string | null;
  idTarefa: string | null;
  idParte: string | null;
  lidaEm: string | null;
  createdAt: string;
};

export type NotificacoesResponseApi = {
  notificacoes: NotificacaoApi[];
  naoLidas: number;
  pagina: number;
  limite: number;
  temMais: boolean;
};

export type PlanoApi = {
  id: string;
  nome: string;
  ciclo: "mensal" | "anual";
  valorCentavos: number;
  moeda: string;
  beneficios: string[];
};

export type IaSugestaoGrupo = {
  nome?: string;
  categoria?: string;
  descricao?: string;
  itens?: { titulo: string; valor: number }[];
};

export const futureModules = {
  notificacoes: {
    listar: (params?: { naoLidas?: boolean; pagina?: number; limite?: number }) => {
      const qs = new URLSearchParams();
      if (params?.naoLidas) qs.set("naoLidas", "true");
      if (params?.pagina) qs.set("pagina", String(params.pagina));
      if (params?.limite) qs.set("limite", String(params.limite));
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return apiRequest<NotificacoesResponseApi>(`${ENDPOINTS.notificacoes.base}${suffix}`);
    },
    marcarLida: (id: string | number) =>
      apiRequest<void>(ENDPOINTS.notificacoes.marcarLida(id), { method: "PATCH" }),
    marcarTodasLidas: () =>
      apiRequest<{ atualizadas: number }>(ENDPOINTS.notificacoes.marcarTodasLidas, { method: "PATCH" }),
    salvarPreferencias: (prefs: Record<string, boolean>) =>
      apiRequest(ENDPOINTS.notificacoes.preferencias, { method: "PUT", body: prefs }),
  },
  pagamentos: {
    informar: (payload: { idParte?: string; idTarefa: string; idUser: string; comprovante?: string }) =>
      apiRequest(ENDPOINTS.pagamentos.informar, { method: "POST", body: payload }),
    confirmar: (id: string) =>
      apiRequest(ENDPOINTS.pagamentos.confirmar(id), { method: "PATCH" }),
    contestar: (id: string, motivo: string) =>
      apiRequest(ENDPOINTS.pagamentos.contestar(id), { method: "PATCH", body: { motivo } }),
  },
  ia: {
    sugerirGrupo: (prompt: string) =>
      apiRequest<IaSugestaoGrupo>(ENDPOINTS.ia.sugerirGrupo, {
        method: "POST",
        body: { prompt },
      }),
  },
};
