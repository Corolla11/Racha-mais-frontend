import { AppError } from "../../errors/AppError.js";
import { Funcao } from "../../generated/prisma/enums.js";
import { grupoRepository } from "./grupo.repository.js";

function validarNome(nome: unknown): string {
  if (typeof nome !== "string" || nome.trim().length === 0) {
    throw new AppError(400, "O nome do grupo é obrigatório");
  }
  if (nome.trim().length > 100) {
    throw new AppError(
      400,
      "O nome do grupo deve ter no máximo 100 caracteres",
    );
  }
  return nome.trim();
}

function validarDescricao(descricao: unknown): string | undefined {
  if (descricao === undefined) return undefined;
  if (typeof descricao !== "string") {
    throw new AppError(400, "A descrição deve ser um texto");
  }
  return descricao.trim();
}

async function exigirMembro(idUser: string, idGrupo: string) {
  const membro = await grupoRepository.buscarMembro(idUser, idGrupo);
  if (membro) return membro;

  const existe = await grupoRepository.existe(idGrupo);
  throw existe
    ? new AppError(403, "Você não participa deste grupo")
    : new AppError(404, "Grupo não encontrado");
}

async function exigirDono(idUser: string, idGrupo: string) {
  const membro = await exigirMembro(idUser, idGrupo);
  if (membro.funcao !== Funcao.dono) {
    throw new AppError(403, "Apenas o dono do grupo pode fazer isso");
  }
}

export const grupoService = {
  criar(idUser: string, dados: { nome?: unknown; descricao?: unknown }) {
    return grupoRepository.criarComDono(idUser, {
      nome: validarNome(dados.nome),
      descricao: validarDescricao(dados.descricao) ?? "",
    });
  },

  listar(idUser: string) {
    return grupoRepository.listarPorUsuario(idUser);
  },

  async obter(idUser: string, idGrupo: string) {
    await exigirMembro(idUser, idGrupo);
    return grupoRepository.buscarPorId(idGrupo);
  },

  async atualizar(
    idUser: string,
    idGrupo: string,
    dados: { nome?: unknown; descricao?: unknown },
  ) {
    await exigirDono(idUser, idGrupo);

    const alteracoes: { nome?: string; descricao?: string } = {};
    if (dados.nome !== undefined) alteracoes.nome = validarNome(dados.nome);
    const descricao = validarDescricao(dados.descricao);
    if (descricao !== undefined) alteracoes.descricao = descricao;

    if (Object.keys(alteracoes).length === 0) {
      throw new AppError(400, "Informe nome ou descrição para atualizar");
    }

    return grupoRepository.atualizar(idGrupo, alteracoes);
  },

  async excluir(idUser: string, idGrupo: string) {
    await exigirDono(idUser, idGrupo);
    await grupoRepository.excluir(idGrupo);
  },
};
