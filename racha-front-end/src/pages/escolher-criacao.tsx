import { useEffect, useRef, useState, type FormEvent } from "react";
import AppShell from "../components/app-shell";
import Link from "../components/app-link";
import Icon from "../components/icon";

type Preset = {
  id: string;
  rotulo: string;
  emoji: string;
  texto: string;
  titulo: string;
  categoria: string;
  categoriaId: string;
  categoriaIcone: string;
  membros: string[];
  itens: { nome: string; valor: string }[];
  total: string;
};

// Exemplos prontos de descrição (a análise abaixo é só uma prévia local)
const PRESETS: Preset[] = [
  {
    id: "viagem",
    rotulo: "Viagem de Férias",
    emoji: "✈️",
    texto:
      "Viagem para Florianópolis em Novembro de 2025 com 6 amigos: Camila, Lucas, Pedro, Mariana, Guilherme e Rodrigo. Teremos aluguel da casa de praia por R$ 2.400, churrasco de boas-vindas com carne e bebidas estimado em R$ 450 pago pela Mariana, e passeio de barco por R$ 720 pago pela Camila.",
    titulo: "Viagem Florianópolis 2025",
    categoria: "Férias & Lazer",
    categoriaId: "viagem",
    categoriaIcone: "flight_takeoff",
    membros: ["Camila", "Lucas", "Pedro", "Mariana", "Guilherme", "Rodrigo"],
    itens: [
      { nome: "Aluguel Casa de Praia", valor: "R$ 2.400" },
      { nome: "Churrasco Boas-Vindas", valor: "R$ 450" },
      { nome: "Passeio de Barco", valor: "R$ 720" },
    ],
    total: "R$ 3.570",
  },
  {
    id: "churrasco",
    rotulo: "Churrasco de Fim de Semana",
    emoji: "🍖",
    texto:
      "Churrasco de Domingo no sítio com Bruno, Larissa, Rafa e eu. Compramos picanha e fraldinha por R$ 280 pago pelo Bruno, cerveja e refrigerante por R$ 160 pago por Larissa, e carvão e acompanhamentos por R$ 70 pago por Rafa.",
    titulo: "Churrasco de Domingo no Sítio",
    categoria: "Confraternização",
    categoriaId: "evento",
    categoriaIcone: "outdoor_grill",
    membros: ["Bruno", "Larissa", "Rafa", "Você"],
    itens: [
      { nome: "Carnes Nobres", valor: "R$ 280" },
      { nome: "Bebidas", valor: "R$ 160" },
      { nome: "Carvão & Acompanhamentos", valor: "R$ 70" },
    ],
    total: "R$ 510",
  },
  {
    id: "republica",
    rotulo: "Moradia Compartilhada / República",
    emoji: "🏠",
    texto:
      "Gastos mensais República Pinheiros: Amanda, Carlos e Felipe. Aluguel de R$ 3.100, conta de luz de R$ 240, internet fibra de R$ 130 pago pelo Carlos e compras de limpeza do mês no valor de R$ 180 pago pela Amanda.",
    titulo: "República Pinheiros - Despesas",
    categoria: "Moradia & Contas",
    categoriaId: "republica",
    categoriaIcone: "home",
    membros: ["Amanda", "Carlos", "Felipe"],
    itens: [
      { nome: "Aluguel Apartamento", valor: "R$ 3.100" },
      { nome: "Energia Elétrica", valor: "R$ 240" },
      { nome: "Internet Fibra", valor: "R$ 130" },
      { nome: "Material de Limpeza", valor: "R$ 180" },
    ],
    total: "R$ 3.650",
  },
  {
    id: "futebol",
    rotulo: "Futebol Semanal",
    emoji: "⚽",
    texto:
      "Pelada Semanal no Society Quinta-feira com 10 pessoas: Gabriel, Thiago, Matheus, Leo, Daniel, Vítor, Caio, Enzo, Renan e Marcelo. Aluguel da quadra de 2 horas por R$ 320 e 2 bolas de futebol society por R$ 180 pago pelo Gabriel.",
    titulo: "Futebol Society Quinta-Feira",
    categoria: "Esportes",
    categoriaId: "outro",
    categoriaIcone: "sports_soccer",
    membros: ["Gabriel", "Thiago", "Matheus", "Leo", "Daniel", "Vítor", "Caio", "Enzo", "Renan", "Marcelo"],
    itens: [
      { nome: "Reserva Quadra 2h", valor: "R$ 320" },
      { nome: "2x Bolas Society", valor: "R$ 180" },
    ],
    total: "R$ 500",
  },
];

// Atalhos do cartão "Criar com IA" (abrem o assistente já preenchido)
const CASOS_DE_USO = [
  { preset: "viagem", rotulo: "Viagens com amigos", icone: "flight_takeoff", cor: "text-primary" },
  { preset: "churrasco", rotulo: "Churrascos e festas", icone: "outdoor_grill", cor: "text-secondary" },
  { preset: "republica", rotulo: "Contas da república", icone: "cottage", cor: "text-tertiary" },
];

const RECURSOS_MANUAL = [
  "Controle total sobre parâmetros",
  "Definição manual de participantes",
  "Personalização detalhada",
];

export default function EscolherCriacao() {
  const [assistente, setAssistente] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [sugestaoPronta, setSugestaoPronta] = useState(false);
  const blocoAssistente = useRef<HTMLDivElement>(null);

  // Leva o usuário até o assistente quando ele é aberto
  useEffect(() => {
    if (assistente) {
      blocoAssistente.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [assistente]);

  const preset = PRESETS.find((item) => item.texto === descricao.trim());

  function abrirAssistente(texto?: string) {
    if (texto) {
      setDescricao(texto);
      setSugestaoPronta(false);
    }
    setAssistente(true);
  }

  function fecharAssistente() {
    setAssistente(false);
    setSugestaoPronta(false);
  }

  function gerarSugestao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSugestaoPronta(true);
  }

  if (assistente) {
    return (
      <AppShell title="Criar grupo com IA">
        <div
          ref={blocoAssistente}
          className="mx-auto flex w-full max-w-3xl scroll-mt-24 flex-col gap-space-lg py-space-md sm:py-space-lg"
        >
          {/* Caminho e etapa */}
          <nav
            aria-label="Navegação estrutural"
            className="flex items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant"
          >
            <div className="flex flex-wrap items-center gap-space-xs">
              <Link to="/meus-grupos" className="transition-colors hover:text-primary">
                Meus Grupos
              </Link>
              <Icon name="chevron_right" size={16} className="text-outline" />
              <button
                type="button"
                onClick={fecharAssistente}
                className="cursor-pointer transition-colors hover:text-primary"
              >
                Criar Novo Grupo
              </button>
              <Icon name="chevron_right" size={16} className="text-outline" />
              <span className="font-label-md font-semibold text-on-surface" aria-current="page">
                Assistente de IA
              </span>
            </div>
            <div className="hidden items-center gap-space-xs rounded-full bg-surface-container-high px-space-sm py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-container sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
              <span>Passo 2 de 2 • Automático</span>
            </div>
          </nav>

          {/* Título */}
          <header className="flex flex-col gap-space-xs text-left">
            <div className="inline-flex w-fit items-center gap-space-xs rounded-lg bg-surface-container px-space-sm py-1 font-label-sm text-label-sm font-semibold text-primary">
              <Icon name="auto_awesome" size={18} />
              <span>Processamento com Linguagem Natural</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
              Criar Grupo com Assistente IA
            </h1>
            <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Escreva ou cole os planos do grupo em linguagem natural. A IA
              criará o grupo, categorias e primeiras tarefas de rateio
              instantaneamente.
            </p>
          </header>

          {/* Formulário */}
          <form
            onSubmit={gerarSugestao}
            className="relative flex flex-col gap-space-md overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-container/10 blur-3xl" />

            <div className="relative flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm font-medium text-on-surface-variant">
                Sugestões Rápidas de Prompt:
              </span>
              <div className="flex flex-wrap items-center gap-space-xs">
                {PRESETS.map((item) => {
                  const ativo = preset?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => abrirAssistente(item.texto)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-space-md py-1.5 font-label-sm text-label-sm transition-all active:scale-95 ${
                        ativo
                          ? "bg-primary-fixed text-on-primary-fixed ring-1 ring-primary-container"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <span aria-hidden="true">{item.emoji}</span>
                      <span>{item.rotulo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative flex flex-col gap-space-xs">
              <label htmlFor="descricao-plano" className="sr-only">
                Descrição detalhada dos custos e pessoas do grupo
              </label>
              <div className="relative">
                <textarea
                  id="descricao-plano"
                  required
                  rows={6}
                  value={descricao}
                  onChange={(event) => {
                    setDescricao(event.target.value);
                    setSugestaoPronta(false);
                  }}
                  placeholder="Descreva os custos, pessoas e objetivos do grupo..."
                  className="min-h-[140px] w-full resize-y rounded-lg bg-surface-container-low p-space-md pb-10 font-body-md text-body-md text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
                <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded bg-surface-container-lowest/80 px-2 py-0.5 font-label-sm text-label-sm text-outline backdrop-blur">
                  <span>{descricao.length}</span>
                  <span>caracteres</span>
                </div>
              </div>
            </div>

            <div className="relative flex items-start gap-space-sm rounded-lg bg-surface-container p-space-md text-on-surface">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-primary-container">
                <Icon name="lightbulb" size={18} />
              </div>
              <p className="pt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                <strong className="font-label-sm font-semibold text-on-surface">Dica:</strong>{" "}
                Mencione o nome do grupo, pessoas envolvidas e valores
                aproximados para um resultado mais preciso. Você poderá ajustar
                todos os detalhes após a geração.
              </p>
            </div>

            <div className="relative flex flex-col-reverse items-center justify-between gap-space-md pt-space-sm sm:flex-row">
              <button
                type="button"
                onClick={fecharAssistente}
                className="w-full cursor-pointer rounded-lg bg-surface-container-high px-space-lg py-2.5 text-center font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-variant sm:w-auto"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-xl py-3 font-label-lg text-label-lg text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all hover:bg-primary-container/90 active:scale-[0.98] sm:w-auto"
              >
                <Icon name="auto_awesome" size={20} filled />
                <span>Processar e Gerar Grupo com IA</span>
              </button>
            </div>
          </form>

          {/* Prévia da sugestão */}
          {sugestaoPronta && (
            <section
              aria-live="polite"
              className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm sm:p-space-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <Icon name="smart_toy" size={20} className="text-primary" />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    {preset ? "Reconhecimento em Tempo Real" : "Sugestão inicial"}
                  </h2>
                </div>
                <span className="rounded-full bg-surface-container-high px-space-sm py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                  Pré-visualização dinâmica
                </span>
              </div>

              {preset ? (
                <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
                  <div className="flex flex-col justify-between rounded-lg bg-surface-container-lowest p-space-md shadow-[0_1px_3px_0_rgba(31,41,55,0.04)]">
                    <div className="flex flex-col gap-space-xs">
                      <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
                        Nome Sugerido
                      </span>
                      <span className="font-headline-sm text-headline-sm font-bold leading-snug text-on-surface">
                        {preset.titulo}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-space-md font-label-sm text-label-sm text-primary">
                      <Icon name={preset.categoriaIcone} size={16} />
                      <span>Categoria: {preset.categoria}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-lg bg-surface-container-lowest p-space-md shadow-[0_1px_3px_0_rgba(31,41,55,0.04)]">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
                          Participantes
                        </span>
                        <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface">
                          {preset.membros.length} pessoas
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {preset.membros.map((membro) => (
                          <span
                            key={membro}
                            className="rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface"
                          >
                            {membro}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="flex items-center gap-1 pt-space-sm font-label-sm text-label-sm text-on-surface-variant">
                      <Icon name="group" size={16} className="text-tertiary" />
                      <span>Rateio automático em {preset.membros.length} partes</span>
                    </span>
                  </div>

                  <div className="flex flex-col justify-between rounded-lg bg-surface-container-lowest p-space-md shadow-[0_1px_3px_0_rgba(31,41,55,0.04)]">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
                          Despesas Mapeadas
                        </span>
                        <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-label-sm text-label-sm font-bold text-on-surface">
                          {preset.itens.length} itens
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 pt-1 font-body-sm text-body-sm text-on-surface">
                        {preset.itens.map((item) => (
                          <div key={item.nome} className="flex items-center justify-between gap-space-sm">
                            <span className="truncate">{item.nome}</span>
                            <span className="shrink-0 font-semibold">{item.valor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-space-sm font-label-md text-label-md text-on-surface">
                      <span>Total Inicial:</span>
                      <span className="font-numeric-stat text-numeric-stat leading-none text-primary-container">
                        {preset.total}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg bg-surface-container-lowest p-space-md font-body-sm text-body-sm text-on-surface-variant shadow-[0_1px_3px_0_rgba(31,41,55,0.04)]">
                  Organize tarefas para hospedagem, transporte e alimentação.
                  Selecione os participantes e o valor de cada tarefa na
                  revisão.
                </p>
              )}

              <div className="flex flex-col items-start justify-between gap-space-md sm:flex-row sm:items-center">
                <div className="flex items-start gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
                  <Icon name="verified_user" size={16} className="mt-0.5 shrink-0 text-tertiary-container" />
                  <span>
                    Prévia do assistente com modelo local. A integração com IA
                    ainda não está conectada — nenhum lançamento ou cobrança Pix
                    é executado sem confirmação.
                  </span>
                </div>
                <Link
                  to="/criar-grupo/manual"
                  state={preset ? { nome: preset.titulo, categoria: preset.categoriaId } : undefined}
                  className="flex shrink-0 items-center gap-space-xs rounded-lg bg-primary-container px-space-md py-2 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container/90 active:scale-[0.98]"
                >
                  Revisar e personalizar
                  <Icon name="arrow_forward" size={18} />
                </Link>
              </div>
            </section>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Criar grupo">
      <div className="mx-auto w-full max-w-4xl py-space-md sm:py-space-xl">
        {/* Caminho */}
        <nav aria-label="Navegação estrutural" className="mb-space-lg flex items-center gap-space-xs text-on-surface-variant">
          <Link to="/meus-grupos" className="flex items-center gap-1 font-label-sm text-label-sm transition-colors hover:text-primary">
            <Icon name="groups" size={16} />
            <span>Meus Grupos</span>
          </Link>
          <Icon name="chevron_right" size={14} className="text-outline" />
          <span className="font-label-sm text-label-sm font-semibold text-on-surface" aria-current="page">
            Criar Novo Grupo
          </span>
        </nav>

        {/* Título */}
        <header className="mx-auto mb-space-xl max-w-2xl text-center">
          <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-label-sm text-on-surface shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
            Passo 1 de 2 • Modo de Criação
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
            Como você deseja começar seu grupo?
          </h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Escolha a forma mais conveniente para configurar seus rateios e
            convidar pessoas sem fricção.
          </p>
        </header>

        {/* Opções */}
        <div className="grid grid-cols-1 items-stretch gap-space-lg md:grid-cols-2">
          {/* Com IA */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-space-xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary-fixed/30 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-primary-container via-tertiary-container to-secondary-container" />
            <div className="relative">
              <div className="mb-space-lg flex items-center justify-between gap-space-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-3 py-1 font-label-sm text-label-sm font-semibold text-on-primary-fixed-variant">
                  <Icon name="auto_awesome" size={16} filled className="text-primary" />
                  Recomendado &amp; Mais Rápido
                </span>
                <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-outline-variant">01</span>
              </div>
              <div className="mb-space-md flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container to-secondary-container text-on-primary shadow-lg shadow-primary-container/20 transition-transform duration-300 group-hover:scale-105">
                <Icon name="neurology" size={28} filled />
              </div>
              <h2 className="mb-space-xs font-headline-sm text-headline-sm text-on-surface">
                Criar com Inteligência Artificial
              </h2>
              <p className="mb-space-lg font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                Digite ou cole uma descrição em texto livre (como roteiro de
                viagem, compras de churrasco ou lista de gastos) e nossa IA
                estrutura os itens e participantes automaticamente.
              </p>
              <div className="mb-space-lg space-y-space-xs">
                <span className="block font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
                  Perfeito para
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CASOS_DE_USO.map((caso) => (
                    <button
                      key={caso.preset}
                      type="button"
                      onClick={() => abrirAssistente(PRESETS.find((item) => item.id === caso.preset)?.texto)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-highest"
                    >
                      <Icon name={caso.icone} size={14} className={caso.cor} />
                      {caso.rotulo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative mt-space-xs pt-space-md">
              <button
                type="button"
                onClick={() => abrirAssistente()}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-container font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container/90 hover:shadow-primary-container/30 active:scale-[0.99] group-hover:gap-3"
              >
                <span>Criar com IA</span>
                <Icon name="arrow_forward" size={20} />
              </button>
            </div>
          </div>

          {/* Manual */}
          <div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-space-xl">
            <div>
              <div className="mb-space-lg flex items-center justify-between gap-space-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                  <Icon name="tune" size={16} />
                  Personalização Total
                </span>
                <span className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-outline-variant">02</span>
              </div>
              <div className="mb-space-md flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container-high text-on-surface transition-transform duration-300 group-hover:scale-105">
                <Icon name="edit_note" size={28} className="text-on-surface-variant" />
              </div>
              <h2 className="mb-space-xs font-headline-sm text-headline-sm text-on-surface">
                Criar Manualmente
              </h2>
              <p className="mb-space-lg font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                Preencha passo a passo os detalhes do grupo: nome, categoria,
                imagem de capa, moeda e adicione participantes do seu jeito.
              </p>
              <div className="mb-space-lg space-y-2.5">
                <span className="block font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
                  Recursos
                </span>
                {RECURSOS_MANUAL.map((texto) => (
                  <div key={texto} className="flex items-center gap-2 text-on-surface">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                      <Icon name="check" size={14} filled className="text-primary" />
                    </div>
                    <span className="font-body-sm text-body-sm">{texto}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-space-xs pt-space-md">
              <Link
                to="/criar-grupo/manual"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-surface-container-low font-label-md text-label-md font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container active:scale-[0.99] group-hover:gap-3"
              >
                <span>Configurar Passo a Passo</span>
                <Icon name="arrow_forward" size={20} className="text-on-surface-variant" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dica */}
        <div className="mt-space-lg flex flex-col items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm sm:flex-row sm:p-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm">
              <Icon name="tips_and_updates" size={22} />
            </div>
            <div>
              <p className="font-label-md text-label-md font-semibold text-on-surface">
                Na dúvida sobre qual escolher?
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Você sempre poderá alterar todas as regras, itens, taxas e
                membros após a criação do grupo.
              </p>
            </div>
          </div>
          <Link
            to="/faq"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container-lowest px-space-md py-2 font-label-sm text-label-sm font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
          >
            <Icon name="help_outline" size={18} className="text-outline" />
            <span>Central de Ajuda</span>
          </Link>
        </div>

        {/* Sinais de confiança */}
        <div className="mt-space-xl flex flex-wrap items-center justify-center gap-x-space-xl gap-y-space-sm font-label-sm text-label-sm text-on-surface-variant opacity-80">
          <div className="flex items-center gap-1.5">
            <Icon name="lock" size={16} className="text-tertiary" />
            <span>Criptografia de ponta a ponta</span>
          </div>
          <span className="inline-block h-1 w-1 rounded-full bg-outline-variant" />
          <div className="flex items-center gap-1.5">
            <Icon name="currency_exchange" size={16} className="text-primary" />
            <span>Múltiplas moedas suportadas</span>
          </div>
          <span className="inline-block h-1 w-1 rounded-full bg-outline-variant" />
          <div className="flex items-center gap-1.5">
            <Icon name="share" size={16} className="text-secondary" />
            <span>Convites rápidos via link ou WhatsApp</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
