import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Flame,
  Lightbulb,
  PlaneTakeoff,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "../components/app-link";

/* =====================================================
   TOKENS DO DESIGN

   Ficam aqui dentro (e não no tema do Tailwind) para que
   esta tela não interfira nas demais páginas do projeto.
====================================================== */

const C = {
  primary: "#9b4500",
  primaryContainer: "#ff8c42",
  primaryFixed: "#ffdbc9",
  primaryFixedDim: "#ffb68d",
  onPrimaryFixed: "#331200",

  tertiary: "#855300",
  tertiaryContainer: "#ed9800",

  surface: "#f8f9ff",
  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceHigh: "#dee9fc",
  surfaceHighest: "#d9e3f6",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
  outline: "#897266",
};

const EXEMPLOS = [
  {
    texto: "Churrasco com 8 amigos...",
    completo: "Churrasco com 8 amigos no sábado, com carne, bebidas e carvão.",
    icone: Flame,
    cor: C.primary,
  },
  {
    texto: "Viagem para o Rio...",
    completo: "Viagem para o Rio com 5 pessoas por 4 dias, dividindo hospedagem e transporte.",
    icone: PlaneTakeoff,
    cor: C.tertiary,
  },
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

  function abrirAssistente(texto?: string) {
    if (texto) {
      setDescricao(texto);
      setSugestaoPronta(false);
    }
    setAssistente(true);
  }

  function gerarSugestao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSugestaoPronta(true);
  }

  return (
    <div
      className="flex min-h-screen flex-col font-jakarta"
      style={{ backgroundColor: C.surface, color: C.onSurface }}
    >
      {/* =====================================================
          CABEÇALHO COM ETAPAS
      ====================================================== */}

      <header
        className="sticky top-0 z-50 h-16 w-full shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
        style={{ backgroundColor: C.surfaceLowest }}
      >
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            to="/meus-grupos"
            title="Fechar e voltar a Meus grupos"
            aria-label="Fechar e voltar a Meus grupos"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#eff4ff] hover:text-[#121c2a]"
            style={{ color: C.onSurfaceVariant }}
          >
            <X className="h-6 w-6" />
          </Link>

          <ol className="flex items-center gap-4 text-sm font-semibold" aria-label="Etapas">
            <li className="flex items-center gap-1" aria-current="step">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                style={{ backgroundColor: C.primaryContainer }}
              >
                1
              </span>
              <span>Criar</span>
            </li>
            <li aria-hidden="true" className="h-[2px] w-8" style={{ backgroundColor: C.surfaceHigh }} />
            <li className="flex items-center gap-1" style={{ color: C.onSurfaceVariant }}>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                style={{ backgroundColor: C.surfaceHigh }}
              >
                2
              </span>
              <span>Confirmar</span>
            </li>
          </ol>

          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="relative isolate flex flex-col items-center py-4 sm:py-10">
          {/* Brilho de fundo */}
          <div
            className="pointer-events-none absolute -top-10 -z-10 h-96 w-96 rounded-full blur-3xl"
            style={{ backgroundColor: `${C.primaryFixedDim}33` }}
          />

          {/* =====================================================
              TÍTULO
          ====================================================== */}

          <div className="mx-auto mb-10 max-w-xl px-4 text-center sm:px-0">
            <span
              className="mb-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider shadow-sm"
              style={{ backgroundColor: C.primaryFixed, color: C.onPrimaryFixed }}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Passo 1 de 2
            </span>
            <h1 className="mb-2 mt-1 text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
              Como você quer criar seu grupo?
            </h1>
            <p className="mx-auto max-w-md text-base" style={{ color: C.onSurfaceVariant }}>
              Escolha a forma mais rápida e conveniente para o seu momento.
            </p>
          </div>

          {/* =====================================================
              OPÇÕES
          ====================================================== */}

          <div className="mb-10 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {/* Com IA */}
            <div
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: C.surfaceLowest }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125"
                style={{ backgroundColor: `${C.primaryContainer}1a` }}
              />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between gap-2">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:rotate-6"
                    style={{
                      background: `linear-gradient(to bottom right, ${C.primaryContainer}, ${C.tertiaryContainer})`,
                    }}
                  >
                    <Sparkles className="h-[30px] w-[30px]" fill="currentColor" />
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-sm"
                    style={{ backgroundColor: C.primaryFixed, color: C.onPrimaryFixed }}
                  >
                    Mais rápido e inteligente ✨
                  </span>
                </div>

                <h2 className="mb-1 text-xl font-semibold transition-colors group-hover:text-[#9b4500]">
                  Criar com Inteligência Artificial
                </h2>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  Basta digitar ou ditar o que vai acontecer. A IA identifica os
                  participantes, calcula as despesas e monta as tarefas
                  automaticamente.
                </p>

                <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: C.surfaceLow }}>
                  <span
                    className="mb-1 block text-xs font-medium uppercase tracking-wider"
                    style={{ color: C.onSurfaceVariant }}
                  >
                    Exemplos prontos:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {EXEMPLOS.map((exemplo) => {
                      const Icone = exemplo.icone;
                      return (
                        <button
                          key={exemplo.texto}
                          type="button"
                          onClick={() => abrirAssistente(exemplo.completo)}
                          className="flex cursor-pointer items-center gap-1 rounded-md bg-white px-2.5 py-1 text-sm shadow-sm transition-shadow hover:shadow-md"
                        >
                          <Icone className="h-3.5 w-3.5" style={{ color: exemplo.cor }} />
                          "{exemplo.texto}"
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => abrirAssistente()}
                className="relative flex h-12 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#ff8c42] text-base font-semibold text-white shadow-md transition-all hover:bg-[#9b4500] active:scale-[0.98]"
              >
                <span>Continuar com IA</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Manual */}
            <div
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: C.surfaceLowest }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125"
                style={{ backgroundColor: `${C.surfaceHigh}66` }}
              />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between gap-2">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#dee9fc] transition-colors group-hover:bg-[#d9e3f6]"
                    style={{ color: C.onSurfaceVariant }}
                  >
                    <ClipboardList className="h-[30px] w-[30px]" />
                  </div>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: C.surfaceHigh, color: C.onSurfaceVariant }}
                  >
                    Controle total passo a passo
                  </span>
                </div>

                <h2 className="mb-1 text-xl font-semibold transition-colors group-hover:text-[#9b4500]">
                  Criar manualmente
                </h2>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  Insira você mesmo o nome do grupo, escolha a categoria e
                  convide seus amigos pelo WhatsApp ou e-mail com calma.
                </p>

                <div className="mb-6 space-y-1 rounded-lg p-4" style={{ backgroundColor: C.surfaceLow }}>
                  {["Configuração detalhada de rateio", "Categorias de despesas flexíveis"].map(
                    (texto) => (
                      <div key={texto} className="flex items-center gap-1 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C.tertiary }} />
                        <span>{texto}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <Link
                to="/criar-grupo/manual"
                className="relative flex h-12 w-full items-center justify-center gap-1 rounded-lg bg-[#dee9fc] text-base font-semibold transition-all hover:bg-[#d9e3f6] active:scale-[0.98]"
                style={{ color: C.onSurface }}
              >
                <span>Preencher manualmente</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* =====================================================
              ASSISTENTE (PRÉVIA)
          ====================================================== */}

          {assistente && (
            <div
              ref={blocoAssistente}
              className="mb-10 w-full max-w-3xl scroll-mt-24 rounded-xl p-6 shadow-sm"
              style={{ backgroundColor: C.surfaceLowest }}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Conte um pouco sobre o seu plano</h2>
                  <p className="mt-1 text-sm" style={{ color: C.onSurfaceVariant }}>
                    Prévia do assistente com modelo local. A integração com IA
                    ainda não está conectada.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Fechar assistente"
                  onClick={() => {
                    setAssistente(false);
                    setSugestaoPronta(false);
                  }}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#eff4ff]"
                  style={{ color: C.onSurfaceVariant }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={gerarSugestao} className="flex flex-col gap-3">
                <label htmlFor="descricao-plano" className="text-sm font-semibold">
                  O que vocês vão fazer?
                </label>
                <textarea
                  id="descricao-plano"
                  required
                  rows={3}
                  value={descricao}
                  onChange={(event) => {
                    setDescricao(event.target.value);
                    setSugestaoPronta(false);
                  }}
                  placeholder="Uma viagem com 6 amigos por uma semana…"
                  className="w-full resize-none rounded-lg p-4 text-base outline-none transition-all placeholder:text-[#897266] focus:bg-white focus:shadow-md focus:ring-2 focus:ring-[#ff8c42]"
                  style={{ backgroundColor: C.surfaceLow }}
                />
                <button
                  type="submit"
                  className="flex h-11 cursor-pointer items-center justify-center gap-1 self-start rounded-lg bg-[#ff8c42] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9b4500]"
                >
                  <Sparkles className="h-4 w-4" />
                  Visualizar sugestão
                </button>
              </form>

              {sugestaoPronta && (
                <div className="mt-5 rounded-lg p-4" style={{ backgroundColor: C.surfaceLow }}>
                  <h3 className="font-semibold">Sugestão inicial</h3>
                  <p className="mt-1 text-sm" style={{ color: C.onSurfaceVariant }}>
                    Organize tarefas para hospedagem, transporte e alimentação.
                    Selecione os participantes e o valor de cada tarefa na
                    revisão.
                  </p>
                  <Link
                    to="/criar-grupo/manual"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold transition-colors hover:text-[#ff8c42]"
                    style={{ color: C.primary }}
                  >
                    Revisar e personalizar
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Dica */}
          <div
            className="flex items-center gap-1 rounded-full px-4 py-2 text-center shadow-sm"
            style={{ backgroundColor: C.surfaceLow, color: C.onSurfaceVariant }}
          >
            <Lightbulb className="h-[18px] w-[18px] shrink-0" style={{ color: C.tertiary }} />
            <p className="text-sm">
              <strong className="font-semibold" style={{ color: C.onSurface }}>
                Dica:
              </strong>{" "}
              Você poderá alterar qualquer detalhe depois que o grupo for criado.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
