import { apiRequest } from "./api";

/**
 * Pontos de entrada centralizados para todas as rotas do backend (atuais e futuras).
 * Para ajustar qualquer rota ou contrato dos módulos futuros (notificações, pagamentos, IA),
 * basta alterar os caminhos ou payloads abaixo.
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
  // Módulos futuros (basta ajustar a rota quando forem criados no backend)
  notificacoes: {
    base: "/notificacoes",
    marcarLida: (id: string | number) => `/notificacoes/${encodeURIComponent(String(id))}/lida`,
    marcarTodasLidas: "/notificacoes/ler-todas",
    preferencias: "/notificacoes/preferencias",
  },
  pagamentos: {
    base: "/pagamentos",
    informar: "/pagamentos/informar",
    confirmar: (id: string) => `/pagamentos/${encodeURIComponent(id)}/confirmar`,
    contestar: (id: string) => `/pagamentos/${encodeURIComponent(id)}/contestar`,
    assinatura: "/pagamentos/assinatura",
  },
  ia: {
    sugerirGrupo: "/ia/sugerir-grupo",
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

export type IaSugestaoGrupo = {
  nome?: string;
  categoria?: string;
  descricao?: string;
  itens?: { titulo: string; valor: number }[];
};

// Adapters minimalistas para os módulos futuros (Notificações, Pagamentos e IA)
export const futureModules = {
  notificacoes: {
    listar: () => apiRequest<unknown[]>(ENDPOINTS.notificacoes.base),
    marcarLida: (id: string | number) =>
      apiRequest(ENDPOINTS.notificacoes.marcarLida(id), { method: "PATCH" }),
    marcarTodasLidas: () =>
      apiRequest(ENDPOINTS.notificacoes.marcarTodasLidas, { method: "POST" }),
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
