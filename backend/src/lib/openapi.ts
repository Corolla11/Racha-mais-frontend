const jsonBody = (properties: Record<string, unknown>, required?: string[]) => ({
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        ...(required ? { required } : {}),
        properties,
      },
    },
  },
});

const paramId = (name: string, description: string) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string" },
});

const resOk = (description = "Sucesso") => ({ "200": { description } });
const resCreated = (description = "Criado") => ({ "201": { description } });
const resNoContent = (description = "Sem conteúdo") => ({ "204": { description } });

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Racha+ API",
    version: "1.0.0",
    description: "Documentação das rotas da aplicação Racha+.",
  },
  paths: {
    "/health": {
      get: { tags: ["Health"], summary: "Verificar status da API", responses: resOk() },
    },
    "/users/me": {
      get: { tags: ["Usuários"], summary: "Obter perfil autenticado", responses: resOk() },
      patch: {
        tags: ["Usuários"],
        summary: "Atualizar perfil autenticado",
        requestBody: jsonBody({
          name: { type: "string" },
          bio: { type: "string" },
          cidade: { type: "string" },
          telefone: { type: "string" },
          image: { type: ["string", "null"], example: "avatares/user-id/uuid.webp" },
        }),
        responses: resOk(),
      },
      delete: { tags: ["Usuários"], summary: "Desativar própria conta", responses: resNoContent() },
    },
    "/users/{id}": {
      get: {
        tags: ["Usuários"],
        summary: "Obter usuário por ID (co-membro)",
        parameters: [paramId("id", "ID do usuário")],
        responses: resOk(),
      },
    },
    "/users/{id}/avatar": {
      get: {
        tags: ["Usuários"],
        summary: "Gerar URL assinada de leitura do avatar",
        parameters: [paramId("id", "ID do usuário")],
        responses: resOk(),
      },
    },
    "/uploads/presign": {
      post: {
        tags: ["Uploads"],
        summary: "Gerar URL pré-assinada S3 (PUT) para comprovante ou avatar",
        requestBody: jsonBody(
          {
            tipo: { type: "string", enum: ["comprovante", "avatar"] },
            idParte: { type: "string" },
            contentType: { type: "string", example: "image/jpeg" },
            sizeBytes: { type: "integer", example: 102400 },
          },
          ["tipo", "contentType", "sizeBytes"],
        ),
        responses: resOk(),
      },
    },
    "/grupos": {
      get: { tags: ["Grupos"], summary: "Listar grupos do usuário", responses: resOk() },
      post: {
        tags: ["Grupos"],
        summary: "Criar grupo",
        requestBody: jsonBody(
          { nome: { type: "string" }, descricao: { type: "string" } },
          ["nome"],
        ),
        responses: resCreated(),
      },
    },
    "/grupos/{id}": {
      get: {
        tags: ["Grupos"],
        summary: "Obter detalhes do grupo",
        parameters: [paramId("id", "ID do grupo")],
        responses: resOk(),
      },
      patch: {
        tags: ["Grupos"],
        summary: "Atualizar grupo",
        parameters: [paramId("id", "ID do grupo")],
        requestBody: jsonBody({ nome: { type: "string" }, descricao: { type: "string" } }),
        responses: resOk(),
      },
      delete: {
        tags: ["Grupos"],
        summary: "Excluir grupo",
        parameters: [paramId("id", "ID do grupo")],
        responses: resNoContent(),
      },
    },
    "/grupos/{id}/encerrar": {
      post: {
        tags: ["Grupos"],
        summary: "Encerrar grupo (somente leitura)",
        parameters: [paramId("id", "ID do grupo")],
        responses: resOk(),
      },
    },
    "/grupos/{idGrupo}/membros": {
      get: {
        tags: ["Membros"],
        summary: "Listar membros do grupo",
        parameters: [paramId("idGrupo", "ID do grupo")],
        responses: resOk(),
      },
      post: {
        tags: ["Membros"],
        summary: "Adicionar membro por idUser ou email",
        parameters: [paramId("idGrupo", "ID do grupo")],
        requestBody: jsonBody({ idUser: { type: "string" }, email: { type: "string" } }),
        responses: resCreated(),
      },
    },
    "/grupos/{idGrupo}/membros/{idUser}": {
      patch: {
        tags: ["Membros"],
        summary: "Alterar função do membro (dono/membro)",
        parameters: [paramId("idGrupo", "ID do grupo"), paramId("idUser", "ID do usuário")],
        requestBody: jsonBody({ funcao: { type: "string", enum: ["dono", "membro"] } }, ["funcao"]),
        responses: resOk(),
      },
      delete: {
        tags: ["Membros"],
        summary: "Remover membro ou sair do grupo",
        parameters: [paramId("idGrupo", "ID do grupo"), paramId("idUser", "ID do usuário")],
        responses: resNoContent(),
      },
    },
    "/grupos/{idGrupo}/convites": {
      get: {
        tags: ["Convites"],
        summary: "Listar convites pendentes do grupo",
        parameters: [paramId("idGrupo", "ID do grupo")],
        responses: resOk(),
      },
      post: {
        tags: ["Convites"],
        summary: "Enviar convite por e-mail",
        parameters: [paramId("idGrupo", "ID do grupo")],
        requestBody: jsonBody({ email: { type: "string", format: "email" } }, ["email"]),
        responses: resCreated(),
      },
    },
    "/grupos/{idGrupo}/convites/{idConvite}": {
      delete: {
        tags: ["Convites"],
        summary: "Cancelar convite pendente",
        parameters: [paramId("idGrupo", "ID do grupo"), paramId("idConvite", "ID do convite")],
        responses: resNoContent(),
      },
    },
    "/convites/{token}": {
      get: {
        tags: ["Convites"],
        summary: "Consultar convite público por token",
        parameters: [paramId("token", "Token do convite")],
        responses: resOk(),
      },
    },
    "/convites/{token}/aceitar": {
      post: {
        tags: ["Convites"],
        summary: "Aceitar convite de grupo",
        parameters: [paramId("token", "Token do convite")],
        responses: resOk(),
      },
    },
    "/tarefas": {
      get: {
        tags: ["Tarefas"],
        summary: "Listar tarefas (filtros opcionais: idGrupo, tipoTarefa, statusAndamento)",
        parameters: [
          { name: "idGrupo", in: "query", schema: { type: "string" } },
          { name: "tipoTarefa", in: "query", schema: { type: "string" } },
          { name: "statusAndamento", in: "query", schema: { type: "string" } },
        ],
        responses: resOk(),
      },
      post: {
        tags: ["Tarefas"],
        summary: "Criar tarefa",
        requestBody: jsonBody(
          {
            idGrupo: { type: "string" },
            nome: { type: "string" },
            descricao: { type: "string" },
            valorTotal: { type: "number" },
            dataInicio: { type: "string", format: "date-time" },
            dataFinal: { type: "string", format: "date-time" },
            tipoTarefa: { type: "string", enum: ["comum", "contribuinte", "meta", "recorrente"] },
          },
          ["idGrupo", "nome", "dataInicio", "dataFinal", "tipoTarefa"],
        ),
        responses: resCreated(),
      },
    },
    "/tarefas/{id}": {
      get: {
        tags: ["Tarefas"],
        summary: "Obter tarefa por ID",
        parameters: [paramId("id", "ID da tarefa")],
        responses: resOk(),
      },
      patch: {
        tags: ["Tarefas"],
        summary: "Atualizar tarefa (com sync atômico opcional de partes)",
        parameters: [paramId("id", "ID da tarefa")],
        requestBody: jsonBody({
          nome: { type: "string" },
          descricao: { type: "string" },
          valorTotal: { type: "number" },
          dataInicio: { type: "string", format: "date-time" },
          dataFinal: { type: "string", format: "date-time" },
          statusAndamento: { type: "string" },
          partes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                idUser: { type: "string" },
                valor: { type: "string", example: "50.00" },
                descricao: { type: "string" },
              },
            },
          },
        }),
        responses: resOk(),
      },
      delete: {
        tags: ["Tarefas"],
        summary: "Excluir tarefa",
        parameters: [paramId("id", "ID da tarefa")],
        responses: resNoContent(),
      },
    },
    "/tarefas/{idTarefa}/partes": {
      get: {
        tags: ["Partes"],
        summary: "Listar partes de uma tarefa",
        parameters: [paramId("idTarefa", "ID da tarefa")],
        responses: resOk(),
      },
      post: {
        tags: ["Partes"],
        summary: "Criar parte/cota na tarefa",
        parameters: [paramId("idTarefa", "ID da tarefa")],
        requestBody: jsonBody(
          { idUser: { type: "string" }, descricao: { type: "string" }, valor: { type: "string" } },
          ["idUser", "valor"],
        ),
        responses: resCreated(),
      },
    },
    "/partes/{id}": {
      get: {
        tags: ["Partes"],
        summary: "Obter parte por ID",
        parameters: [paramId("id", "ID da parte")],
        responses: resOk(),
      },
      patch: {
        tags: ["Partes"],
        summary: "Atualizar parte (status, comprovanteKey, comprovanteNome, motivoContestacao)",
        parameters: [paramId("id", "ID da parte")],
        requestBody: jsonBody({
          descricao: { type: "string" },
          valor: { type: "string" },
          status: { type: "string" },
          comprovanteKey: { type: ["string", "null"] },
          comprovanteNome: { type: ["string", "null"] },
          motivoContestacao: { type: ["string", "null"] },
        }),
        responses: resOk(),
      },
      delete: {
        tags: ["Partes"],
        summary: "Excluir parte",
        parameters: [paramId("id", "ID da parte")],
        responses: resNoContent(),
      },
    },
    "/partes/{id}/comprovante": {
      get: {
        tags: ["Partes"],
        summary: "Gerar URL assinada de leitura do comprovante da parte",
        parameters: [paramId("id", "ID da parte")],
        responses: resOk(),
      },
    },
    "/chaves-pix": {
      get: { tags: ["Chaves Pix"], summary: "Listar chaves Pix visíveis", responses: resOk() },
      post: {
        tags: ["Chaves Pix"],
        summary: "Cadastrar chave Pix",
        requestBody: jsonBody(
          {
            tipoChave: { type: "string", enum: ["telefone", "cpf", "email", "aleatoria"] },
            chave: { type: "string" },
          },
          ["tipoChave", "chave"],
        ),
        responses: resCreated(),
      },
    },
    "/chaves-pix/{id}": {
      get: {
        tags: ["Chaves Pix"],
        summary: "Obter chave Pix por ID",
        parameters: [paramId("id", "ID da chave Pix")],
        responses: resOk(),
      },
      patch: {
        tags: ["Chaves Pix"],
        summary: "Atualizar chave Pix",
        parameters: [paramId("id", "ID da chave Pix")],
        requestBody: jsonBody({ tipoChave: { type: "string" }, chave: { type: "string" } }),
        responses: resOk(),
      },
      delete: {
        tags: ["Chaves Pix"],
        summary: "Excluir chave Pix",
        parameters: [paramId("id", "ID da chave Pix")],
        responses: resNoContent(),
      },
    },
    "/notificacoes": {
      get: { tags: ["Notificações"], summary: "Listar notificações do usuário", responses: resOk() },
    },
    "/notificacoes/preferencias": {
      put: {
        tags: ["Notificações"],
        summary: "Atualizar preferências de notificação",
        requestBody: jsonBody({ notificarDespesas: { type: "boolean" } }, ["notificarDespesas"]),
        responses: resOk(),
      },
    },
    "/notificacoes/lidas": {
      patch: { tags: ["Notificações"], summary: "Marcar todas como lidas", responses: resOk() },
    },
    "/notificacoes/{id}/lida": {
      patch: {
        tags: ["Notificações"],
        summary: "Marcar notificação como lida",
        parameters: [paramId("id", "ID da notificação")],
        responses: resNoContent(),
      },
    },
    "/planos": {
      get: { tags: ["Assinaturas"], summary: "Listar planos Pro disponíveis", responses: resOk() },
    },
    "/assinaturas/grupos/{idGrupo}": {
      get: {
        tags: ["Assinaturas"],
        summary: "Consultar assinatura Pro do grupo",
        parameters: [paramId("idGrupo", "ID do grupo")],
        responses: resOk(),
      },
    },
    "/assinaturas/grupos/{idGrupo}/pro/checkout": {
      post: {
        tags: ["Assinaturas"],
        summary: "Criar checkout Pro na AbacatePay",
        parameters: [paramId("idGrupo", "ID do grupo")],
        requestBody: jsonBody({ ciclo: { type: "string", enum: ["mensal", "anual"] } }, ["ciclo"]),
        responses: resCreated(),
      },
    },
    "/assinaturas/grupos/{idGrupo}/cancel": {
      post: {
        tags: ["Assinaturas"],
        summary: "Cancelar assinatura/checkout Pro do grupo",
        parameters: [paramId("idGrupo", "ID do grupo")],
        responses: resOk(),
      },
    },
    "/ia/grupos/rascunho": {
      post: {
        tags: ["IA"],
        summary: "Gerar rascunho de grupo com Gemini",
        requestBody: jsonBody({ prompt: { type: "string" } }, ["prompt"]),
        responses: resOk(),
      },
    },
    "/internal/cron/lembretes": {
      get: {
        tags: ["Cron"],
        summary: "Executar emissão de lembretes de prazo (Authorization: Bearer CRON_SECRET)",
        responses: resOk(),
      },
    },
  },
} as const;
