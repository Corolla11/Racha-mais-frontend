import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";
import { StatusAndamento } from "../../generated/prisma/enums.js";

export function validarValor(valor: unknown): string {
  if (
    (typeof valor !== "string" && typeof valor !== "number") ||
    !/^\d+(?:\.\d{1,2})?$/.test(String(valor))
  ) {
    throw new AppError(
      400,
      "O valor deve ser positivo e ter até duas casas decimais",
    );
  }
  const valorDecimal = new Prisma.Decimal(String(valor));
  if (!valorDecimal.isFinite() || valorDecimal.lte(0)) {
    throw new AppError(400, "O valor da parte deve ser maior que zero");
  }
  if (valorDecimal.gt("9999999999.99")) {
    throw new AppError(400, "O valor excede o limite permitido pelo banco");
  }
  return valorDecimal.toFixed(2);
}

export function validarDescricao(descricao: unknown): string {
  if (typeof descricao !== "string") {
    throw new AppError(400, "A descrição deve ser um texto");
  }
  return descricao.trim();
}

function isStatusAndamento(valor: string): valor is StatusAndamento {
  return Object.values(StatusAndamento).some((status) => status === valor);
}

export function validarStatus(status: unknown): StatusAndamento {
  if (typeof status !== "string" || !isStatusAndamento(status)) {
    throw new AppError(400, "Status inválido");
  }
  return status;
}

export function validarCamposPermitidos(
  dados: Record<string, unknown>,
  permitidos: readonly string[],
): void {
  const desconhecido = Object.keys(dados).find(
    (campo) => !permitidos.includes(campo),
  );
  if (desconhecido) {
    throw new AppError(400, `Campo não permitido: ${desconhecido}`);
  }
}

export function validarSomaPartes(
  somaAtual: Prisma.Decimal | null,
  valorNovo: string,
  valorTotal: Prisma.Decimal,
): void {
  const soma = somaAtual ?? new Prisma.Decimal(0);
  if (soma.plus(valorNovo).gt(valorTotal)) {
    throw new AppError(
      409,
      "A soma das partes não pode ultrapassar o valor total da tarefa",
    );
  }
}
