import type { TipoChavePix } from "./endpoints.ts";
import { normalizarChavePix } from "./pix-format.ts";

export type DadosBrCode = {
  chave: string;
  tipoChave?: TipoChavePix;
  nomeRecebedor: string;
  cidadeRecebedor?: string;
  valor?: number;
  txid?: string;
  descricao?: string;
};

const encoder = new TextEncoder();

function byteLength(valor: string): number {
  return encoder.encode(valor).length;
}

export function tlv(tag: string, valor: string): string {
  const tamanho = byteLength(valueOrEmpty(valor));
  return `${tag}${String(tamanho).padStart(2, "0")}${valor}`;
}

function valueOrEmpty(v: string): string {
  return v ?? "";
}

export function sanitizarTextoBrCode(
  texto: string,
  maxLen: number,
  fallback: string,
): string {
  const limpo = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
    .slice(0, maxLen)
    .trim();
  return limpo || fallback;
}

export function normalizarChaveParaBrCode(
  chave: string,
  tipoChave?: TipoChavePix,
): string {
  return tipoChave ? normalizarChavePix(tipoChave, chave) : chave.trim();
}

export function normalizarTxid(txid?: string): string {
  if (!txid) return "***";
  const limpo = txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25);
  return limpo || "***";
}

export function crc16Ccitt(payload: string): string {
  const bytes = encoder.encode(payload);
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function montarTag26(chave: string, descricao?: string): string {
  const gui = tlv("00", "br.gov.bcb.pix");
  const campoChave = tlv("01", chave);
  let base = `${gui}${campoChave}`;
  if (descricao) {
    const descLimpa = descricao
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9 .,-]/g, "")
      .trim()
      .slice(0, 50);
    if (descLimpa) {
      const subtagDesc = tlv("02", descLimpa);
      if (byteLength(base) + byteLength(subtagDesc) <= 99) {
        base += subtagDesc;
      }
    }
  }
  return tlv("26", base);
}

export function gerarBrCode(dados: DadosBrCode): string {
  const chave = normalizarChaveParaBrCode(dados.chave, dados.tipoChave);
  if (!chave) {
    throw new Error("Chave Pix obrigatória para gerar BR Code.");
  }

  const montar = (descricao?: string) => {
    const partes = [
      tlv("00", "01"),
      montarTag26(chave, descricao),
      tlv("52", "0000"),
      tlv("53", "986"),
    ];
    if (typeof dados.valor === "number" && Number.isFinite(dados.valor) && dados.valor > 0) {
      partes.push(tlv("54", dados.valor.toFixed(2)));
    }
    partes.push(
      tlv("58", "BR"),
      tlv("59", sanitizarTextoBrCode(dados.nomeRecebedor, 25, "RACHA MAIS")),
      tlv("60", sanitizarTextoBrCode(dados.cidadeRecebedor ?? "", 15, "BRASIL")),
      tlv("62", tlv("05", normalizarTxid(dados.txid))),
    );
    const semCrc = `${partes.join("")}6304`;
    return `${semCrc}${crc16Ccitt(semCrc)}`;
  };

  let codigo = montar(dados.descricao);
  if (codigo.length > 512 && dados.descricao) {
    codigo = montar(undefined);
  }
  if (codigo.length > 512) {
    throw new Error("BR Code excede o limite de 512 caracteres.");
  }
  return codigo;
}
