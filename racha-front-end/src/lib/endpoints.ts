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
    encerrar: (id: string) => `/grupos/${encodeURIComponent(id)}/encerrar`,
    membros: (idGrupo: string) => `/grupos/${encodeURIComponent(idGrupo)}/membros`,
    membroById: (idGrupo: string, idUser: string) =>
      `/grupos/${encodeURIComponent(idGrupo)}/membros/${encodeURIComponent(idUser)}`,
    convites: (idGrupo: string) => `/grupos/${encodeURIComponent(idGrupo)}/convites`,
    conviteById: (idGrupo: string, idConvite: string) =>
      `/grupos/${encodeURIComponent(idGrupo)}/convites/${encodeURIComponent(idConvite)}`,
  },
  convites: {
    porToken: (token: string) => `/convites/${encodeURIComponent(token)}`,
    aceitar: (token: string) => `/convites/${encodeURIComponent(token)}/aceitar`,
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
  assinaturas: {
    doGrupo: (idGrupo: string) => `/assinaturas/grupos/${encodeURIComponent(idGrupo)}`,
    checkoutPro: (idGrupo: string) =>
      `/assinaturas/grupos/${encodeURIComponent(idGrupo)}/pro/checkout`,
    cancelar: (idGrupo: string) =>
      `/assinaturas/grupos/${encodeURIComponent(idGrupo)}/cancel`,
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
  bio?: string;
  cidade?: string;
  telefone?: string;
  notificarDespesas?: boolean;
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

export type AssinaturaGrupoApi = {
  isPro: boolean;
  assinatura: {
    ciclo: "mensal" | "anual";
    status: "PENDENTE" | "ATIVA" | "CANCELADA" | "FALHOU";
    valorCentavos: number;
    checkoutUrl: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
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
  },
  ia: {
    sugerirGrupo: (prompt: string) =>
      apiRequest<IaSugestaoGrupo>(ENDPOINTS.ia.sugerirGrupo, {
        method: "POST",
        body: { prompt },
      }),
  },
};
