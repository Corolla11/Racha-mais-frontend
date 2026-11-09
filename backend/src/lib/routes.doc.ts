// #swagger.start
/*
  #swagger.path = '/health'
  #swagger.method = 'get'
  #swagger.tags = ['Health']
  #swagger.summary = 'Verificar status da API'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/'
  #swagger.method = 'post'
  #swagger.tags = ['Grupos']
  #swagger.summary = 'Criar novo grupo'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["nome"],
          properties: {
            nome: { type: "string", example: "Churrasco de Fim de Ano" },
            descricao: { type: "string", example: "Divisão das despesas do churrasco" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/'
  #swagger.method = 'get'
  #swagger.tags = ['Grupos']
  #swagger.summary = 'Listar grupos do usuário'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/{id}'
  #swagger.method = 'get'
  #swagger.tags = ['Grupos']
  #swagger.summary = 'Obter grupo por ID'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/{id}'
  #swagger.method = 'patch'
  #swagger.tags = ['Grupos']
  #swagger.summary = 'Atualizar grupo'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            nome: { type: "string", example: "Novo nome do grupo" },
            descricao: { type: "string", example: "Nova descrição" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/{id}'
  #swagger.method = 'delete'
  #swagger.tags = ['Grupos']
  #swagger.summary = 'Excluir grupo'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/{idGrupo}/membros/'
  #swagger.method = 'post'
  #swagger.tags = ['Membros']
  #swagger.summary = 'Adicionar membro ao grupo (informe idUser OU email)'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            idUser: { type: "string", example: "user_123" },
            email: { type: "string", example: "usuario@exemplo.com" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/{idGrupo}/membros/'
  #swagger.method = 'get'
  #swagger.tags = ['Membros']
  #swagger.summary = 'Listar membros do grupo'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/{idGrupo}/membros/{idUser}'
  #swagger.method = 'patch'
  #swagger.tags = ['Membros']
  #swagger.summary = 'Atualizar função do membro'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["funcao"],
          properties: {
            funcao: { type: "string", enum: ["dono", "membro"], example: "dono" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/grupos/{idGrupo}/membros/{idUser}'
  #swagger.method = 'delete'
  #swagger.tags = ['Membros']
  #swagger.summary = 'Remover membro do grupo'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/'
  #swagger.method = 'post'
  #swagger.tags = ['Tarefas']
  #swagger.summary = 'Criar nova tarefa'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["idGrupo", "nome", "dataInicio", "dataFinal", "tipoTarefa"],
          properties: {
            idGrupo: { type: "string", example: "grupo_123" },
            nome: { type: "string", example: "Carne e Bebidas" },
            descricao: { type: "string", example: "Compras no mercado" },
            valorTotal: { type: "number", example: 150.0 },
            dataInicio: { type: "string", format: "date-time", example: "2026-11-10T12:00:00.000Z" },
            dataFinal: { type: "string", format: "date-time", example: "2026-11-12T18:00:00.000Z" },
            tipoTarefa: { type: "string", enum: ["comum", "contribuinte", "meta", "recorrente"], example: "comum" },
            statusAndamento: { type: "string", enum: ["AGENDADA", "EM_ANDAMENTO", "FINALIZADA", "ATRASADA", "CANCELADA"], example: "AGENDADA" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/'
  #swagger.method = 'get'
  #swagger.tags = ['Tarefas']
  #swagger.summary = 'Listar tarefas'
  #swagger.parameters['idGrupo'] = { in: 'query', description: 'Filtrar por ID do grupo', type: 'string' }
  #swagger.parameters['tipoTarefa'] = { in: 'query', description: 'comum | contribuinte | meta | recorrente', type: 'string' }
  #swagger.parameters['statusAndamento'] = { in: 'query', description: 'AGENDADA | EM_ANDAMENTO | FINALIZADA | ATRASADA | CANCELADA', type: 'string' }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{id}'
  #swagger.method = 'get'
  #swagger.tags = ['Tarefas']
  #swagger.summary = 'Obter detalhes da tarefa'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{id}'
  #swagger.method = 'patch'
  #swagger.tags = ['Tarefas']
  #swagger.summary = 'Atualizar tarefa'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            nome: { type: "string", example: "Carne e Bebidas atualizado" },
            descricao: { type: "string", example: "Nova descrição" },
            valorTotal: { type: "number", example: 180.0 },
            dataInicio: { type: "string", format: "date-time", example: "2026-11-10T12:00:00.000Z" },
            dataFinal: { type: "string", format: "date-time", example: "2026-11-12T18:00:00.000Z" },
            tipoTarefa: { type: "string", enum: ["comum", "contribuinte", "meta", "recorrente"], example: "comum" },
            statusAndamento: { type: "string", enum: ["AGENDADA", "EM_ANDAMENTO", "FINALIZADA", "ATRASADA", "CANCELADA"], example: "EM_ANDAMENTO" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{id}'
  #swagger.method = 'delete'
  #swagger.tags = ['Tarefas']
  #swagger.summary = 'Excluir tarefa'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{idTarefa}/partes/'
  #swagger.method = 'post'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Criar parte vinculada à tarefa'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["valor"],
          properties: {
            idUser: { type: "string", example: "user_123" },
            valor: { type: "string", example: "50.00" },
            descricao: { type: "string", example: "Parte individual" },
            status: { type: "string", enum: ["AGENDADA", "EM_ANDAMENTO", "FINALIZADA", "ATRASADA", "CANCELADA"], example: "AGENDADA" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{idTarefa}/partes/'
  #swagger.method = 'get'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Listar partes da tarefa'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{idTarefa}/partes/{id}'
  #swagger.method = 'get'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Obter parte da tarefa'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{idTarefa}/partes/{id}'
  #swagger.method = 'patch'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Atualizar parte da tarefa'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            valor: { type: "string", example: "60.00" },
            descricao: { type: "string", example: "Valor ajustado" },
            status: { type: "string", enum: ["AGENDADA", "EM_ANDAMENTO", "FINALIZADA", "ATRASADA", "CANCELADA"], example: "FINALIZADA" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/tarefas/{idTarefa}/partes/{id}'
  #swagger.method = 'delete'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Excluir parte da tarefa'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/partes/'
  #swagger.method = 'post'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Criar parte de tarefa'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["idTarefa", "valor"],
          properties: {
            idTarefa: { type: "string", example: "tarefa_123" },
            idUser: { type: "string", example: "user_123" },
            valor: { type: "string", example: "50.00" },
            descricao: { type: "string", example: "Parte individual" },
            status: { type: "string", enum: ["AGENDADA", "EM_ANDAMENTO", "FINALIZADA", "ATRASADA", "CANCELADA"], example: "AGENDADA" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/partes/'
  #swagger.method = 'get'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Listar partes'
  #swagger.parameters['idTarefa'] = { in: 'query', description: 'Filtrar por ID da tarefa', type: 'string' }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/partes/{id}'
  #swagger.method = 'get'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Obter parte por ID'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/partes/{id}'
  #swagger.method = 'patch'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Atualizar parte'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            valor: { type: "string", example: "60.00" },
            descricao: { type: "string", example: "Valor ajustado" },
            status: { type: "string", enum: ["AGENDADA", "EM_ANDAMENTO", "FINALIZADA", "ATRASADA", "CANCELADA"], example: "FINALIZADA" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/partes/{id}'
  #swagger.method = 'delete'
  #swagger.tags = ['Partes']
  #swagger.summary = 'Excluir parte'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/chaves-pix/'
  #swagger.method = 'post'
  #swagger.tags = ['Chaves Pix']
  #swagger.summary = 'Cadastrar chave Pix'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["tipoChave", "chave"],
          properties: {
            tipoChave: { type: "string", enum: ["telefone", "cpf", "email", "aleatoria"], example: "email" },
            chave: { type: "string", example: "usuario@exemplo.com" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/chaves-pix/'
  #swagger.method = 'get'
  #swagger.tags = ['Chaves Pix']
  #swagger.summary = 'Listar chaves Pix'
  #swagger.parameters['idUser'] = { in: 'query', description: 'Filtrar por ID do usuário', type: 'string' }
  #swagger.parameters['tipoChave'] = { in: 'query', description: 'telefone | cpf | email | aleatoria', type: 'string' }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/chaves-pix/{id}'
  #swagger.method = 'get'
  #swagger.tags = ['Chaves Pix']
  #swagger.summary = 'Obter chave Pix por ID'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/chaves-pix/{id}'
  #swagger.method = 'patch'
  #swagger.tags = ['Chaves Pix']
  #swagger.summary = 'Atualizar chave Pix'
  #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            tipoChave: { type: "string", enum: ["telefone", "cpf", "email", "aleatoria"], example: "telefone" },
            chave: { type: "string", example: "11999999999" }
          }
        }
      }
    }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/chaves-pix/{id}'
  #swagger.method = 'delete'
  #swagger.tags = ['Chaves Pix']
  #swagger.summary = 'Excluir chave Pix'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/users/me'
  #swagger.method = 'get'
  #swagger.tags = ['Usuários']
  #swagger.summary = 'Obter perfil do usuário autenticado'
*/
// #swagger.end

// #swagger.start
/*
  #swagger.path = '/users/{id}'
  #swagger.method = 'get'
  #swagger.tags = ['Usuários']
  #swagger.summary = 'Obter usuário por ID'
*/
// #swagger.end
