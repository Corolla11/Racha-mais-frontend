import type { TipoChavePix } from "./endpoints.ts";

export type MetaTipoPix = {
  label: string;
  icon: string;
  placeholder: string;
  inputMode: "tel" | "numeric" | "email" | "text";
  maxLength: number;
  hint: string;
};

export const META_TIPO_PIX: Record<TipoChavePix, MetaTipoPix> = {
  telefone: {
    label: "Celular",
    icon: "smartphone",
    placeholder: "+55 (11) 99999-9999",
    inputMode: "tel",
    maxLength: 19,
    hint: "Formato E.164 obrigatório: +55, DDD e número.",
  },
  cpf: {
    label: "CPF",
    icon: "badge",
    placeholder: "000.000.000-00",
    inputMode: "numeric",
    maxLength: 14,
    hint: "Somente 11 dígitos numéricos válidos.",
  },
  email: {
    label: "E-mail",
    icon: "mail",
    placeholder: "voce@exemplo.com",
    inputMode: "email",
    maxLength: 77,
    hint: "E-mail válido em minúsculas (até 77 caracteres).",
  },
  aleatoria: {
    label: "Aleatória",
    icon: "key",
    placeholder: "123e4567-e89b-12d3-a456-426614174000",
    inputMode: "text",
    maxLength: 36,
    hint: "Chave aleatória EVP no formato UUID (36 caracteres).",
  },
};

function extrairDigitosTelefoneLocal(valor: string): string {
  let d = valor.replace(/\D/g, "");
  if (
    d.startsWith("55") &&
    (d.length > 11 || valor.trim().startsWith("+55"))
  ) {
    d = d.slice(2);
  }
  return d.slice(0, 11);
}

export function formatarChavePix(tipo: TipoChavePix, valor: string): string {
  if (tipo === "telefone") {
    const d = extrairDigitosTelefoneLocal(valor);
    if (!d) return "";
    if (d.length <= 2) return `+55 (${d}`;
    if (d.length <= 6) return `+55 (${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `+55 (${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `+55 (${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  if (tipo === "cpf") {
    const d = valor.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }

  if (tipo === "email") {
    return valor.replace(/\s+/g, "").toLowerCase().slice(0, 77);
  }

  const hex = valor.replace(/[^0-9a-fA-F]/g, "").toLowerCase().slice(0, 32);
  if (hex.length <= 8) return hex;
  if (hex.length <= 12) return `${hex.slice(0, 8)}-${hex.slice(8)}`;
  if (hex.length <= 16) return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12)}`;
  if (hex.length <= 20) return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16)}`;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export function validarChavePix(tipo: TipoChavePix, valor: string): string | null {
  const limpo = valor.trim();
  if (!limpo) return "Informe a chave Pix.";

  if (tipo === "telefone") {
    const d = extrairDigitosTelefoneLocal(limpo);
    if (d.length !== 10 && d.length !== 11) {
      return "Informe um celular/telefone válido com DDD (10 ou 11 dígitos).";
    }
    return null;
  }

  if (tipo === "cpf") {
    const d = limpo.replace(/\D/g, "");
    if (!cpfValido(d)) {
      return "Informe um CPF válido com 11 dígitos.";
    }
    return null;
  }

  if (tipo === "email") {
    if (limpo.length > 77 || !REGEX_EMAIL.test(limpo)) {
      return "Informe um endereço de e-mail válido (até 77 caracteres).";
    }
    return null;
  }

  if (!REGEX_UUID.test(limpo)) {
    return "Informe uma chave aleatória válida no formato UUID (ex.: 123e4567-e89b-12d3-a456-426614174000).";
  }

  return null;
}
