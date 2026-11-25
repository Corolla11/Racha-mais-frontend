import { AppError } from "../../errors/AppError.js";
import { TipoChave } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

export type CriarChavePixDados = {
  tipoChave: TipoChave;
  chave: string;
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cpfValido(digitos: string): boolean {
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;
  for (let t = 9; t < 11; t += 1) {
    let soma = 0;
    for (let i = 0; i < t; i += 1) {
      soma += Number(digitos[i]) * (t + 1 - i);
    }
    const resto = (soma * 10) % 11;
    const esperado = resto === 10 ? 0 : resto;
    if (Number(digitos[t]) !== esperado) return false;
  }
  return true;
}

export function normalizarEValidarChavePix(
  tipoChave: TipoChave,
  chave: string,
): string {
  const limpa = chave.trim();
  if (!limpa) {
    throw new AppError(400, "A chave Pix é obrigatória");
  }

  if (tipoChave === TipoChave.telefone) {
    let digitos = limpa.replace(/\D/g, "");
    if (
      (digitos.length === 12 || digitos.length === 13) &&
      digitos.startsWith("55")
    ) {
      digitos = digitos.slice(2);
    }
    if (digitos.length !== 10 && digitos.length !== 11) {
      throw new AppError(
        400,
        "Informe um telefone válido com DDD (10 ou 11 dígitos)",
      );
    }
    return `+55${digitos}`;
  }

  if (tipoChave === TipoChave.cpf) {
    const digitos = limpa.replace(/\D/g, "");
    if (!cpfValido(digitos)) {
      throw new AppError(400, "Informe um CPF válido com 11 dígitos");
    }
    return digitos;
  }

  if (tipoChave === TipoChave.email) {
    const email = limpa.toLowerCase();
    if (email.length > 77 || !REGEX_EMAIL.test(email)) {
      throw new AppError(
        400,
        "Informe um endereço de e-mail válido (até 77 caracteres)",
      );
    }
    return email;
  }

  const aleatoria = limpa.toLowerCase();
  if (!REGEX_UUID.test(aleatoria)) {
    throw new AppError(
      400,
      "Informe uma chave aleatória válida no formato UUID (36 caracteres)",
    );
  }
  return aleatoria;
}

const visivelAoUsuario = (idUser: string) => ({
  OR: [
    { idUser },
    { user: { membros: { some: { grupo: { membros: { some: { idUser } } } } } } },
  ],
});

export const chavePixService = {
  async criar(idUser: string, dados: CriarChavePixDados) {
    const chave = normalizarEValidarChavePix(dados.tipoChave, dados.chave);
    return prisma.chavePix.create({
      data: { tipoChave: dados.tipoChave, chave, idUser },
    });
  },

  async listar(
    idUser: string,
    filtros: { idUser?: string; tipoChave?: TipoChave },
  ) {
    return prisma.chavePix.findMany({
      where: {
        ...filtros,
        idUser: filtros.idUser ?? idUser,
        ...visivelAoUsuario(idUser),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async obter(idUser: string, idChave: string) {
    return prisma.chavePix.findFirstOrThrow({
      where: { id: idChave, ...visivelAoUsuario(idUser) },
    });
  },

  async atualizar(
    idUser: string,
    idChave: string,
    dados: Partial<CriarChavePixDados>,
  ) {
    if (dados.tipoChave === undefined && dados.chave === undefined) {
      throw new AppError(400, "Informe tipoChave ou chave para atualizar");
    }
    const atual = await prisma.chavePix.findFirstOrThrow({
      where: { id: idChave, idUser },
    });
    const tipoFinal = dados.tipoChave ?? atual.tipoChave;
    const chaveFinal = normalizarEValidarChavePix(
      tipoFinal,
      dados.chave ?? atual.chave,
    );
    return prisma.chavePix.update({
      where: { id: idChave, idUser },
      data: { tipoChave: tipoFinal, chave: chaveFinal },
    });
  },

  async excluir(idUser: string, idChave: string) {
    await prisma.chavePix.delete({ where: { id: idChave, idUser } });
  },
};
