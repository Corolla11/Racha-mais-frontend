// Rascunho do grupo montado na criação manual e revisado na confirmação.

export interface MembroRascunho {
  id: number;
  nome: string;
  contato: string;
  iniciais: string;
  etiqueta: string;
  admin: boolean;
  adiantado: number;
}

export interface ItemRascunho {
  id: number;
  titulo: string;
  tipo: "tarefa";
  responsavel: string;
  detalhe: string;
  valor: number;
  pago: boolean;
  participantesIds?: string[];
  dataLimite?: string;
  descricao?: string;
}

export interface GrupoRascunho {
  nome: string;
  categoria: string;
  data: string;
  moeda: string;
  descricao: string;
  membros: MembroRascunho[];
  rateio: string;
  itens: ItemRascunho[];
  total: number;
  cota: number;
}

const CHAVE = "racha-demo-created-group";

export function salvarRascunho(grupo: GrupoRascunho) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(grupo));
  } catch {
    // Sem sessionStorage o rascunho segue apenas pelo estado da navegação
  }
}

export function lerRascunho(): GrupoRascunho | null {
  try {
    const bruto = sessionStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto) as Partial<GrupoRascunho>;
    if (typeof dados.nome !== "string" || !Array.isArray(dados.membros)) return null;
    return dados as GrupoRascunho;
  } catch {
    return null;
  }
}

export function limparRascunho() {
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    // nada a limpar
  }
}

// O primeiro membro marcado como "Você" representa quem está criando o grupo
export function ehOrganizador(membro: MembroRascunho) {
  return membro.etiqueta.startsWith("Você");
}

// Extrai um e-mail do campo de contato livre ("WhatsApp: ...", "Chave Pix: ...")
export function extrairEmail(contato: string) {
  return contato.match(/[^\s@:]+@[^\s@]+\.[^\s@]+/)?.[0] ?? null;
}
