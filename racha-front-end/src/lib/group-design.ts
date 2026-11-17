export const groupCover = "/images/florianopolis-cover.jpg";
export interface GroupSettings { category: string; cover: string; start: string; end: string; description: string }
export const initialGroupSettings: GroupSettings = {
  category: "Viagem",
  cover: groupCover,
  start: "2025-11-14",
  end: "2025-11-19",
  description: "Regras combinadas:\n1. Casa e combustível divididos igualmente entre todos.\n2. Bebidas alcoólicas rateadas apenas entre quem consome, selecionando os participantes na tarefa.",
};
