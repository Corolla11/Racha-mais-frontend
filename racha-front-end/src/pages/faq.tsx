import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  BellRing,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  Crown,
  Headset,
  Info,
  ListChecks,
  Mail,
  MessageCircle,
  MonitorPlay,
  Play,
  QrCode,
  Search,
  SearchX,
  Send,
  ShieldCheck,
  Star,
  TriangleAlert,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import AppShell from "../components/app-shell";
import { useAppNavigate as useNavigate } from "../lib/navigation";

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
  onPrimaryFixedVariant: "#763300",
  onPrimaryContainer: "#6a2d00",

  secondary: "#ab3425",
  secondaryFixed: "#ffdad4",

  tertiary: "#855300",
  tertiaryContainer: "#ed9800",
  tertiaryFixed: "#ffddb8",
  onTertiaryContainer: "#5b3700",

  error: "#ba1a1a",
  outline: "#897266",
  outlineVariant: "#ddc1b3",

  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e6eeff",
  surfaceHigh: "#dee9fc",
  surfaceHighest: "#d9e3f6",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
};

const EMAIL_SUPORTE = "suporte@plusracha.com.br";

/* =====================================================
   CONTEÚDO
====================================================== */

type Categoria = "groups" | "tasks" | "payments" | "audit" | "plans";

interface Pergunta {
  id: string;
  categoria: Categoria;
  pergunta: string;
  // Texto simples usado pela busca
  palavras: string;
  resposta: ReactNode;
}

interface Secao {
  id: string;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  fundo: string;
  cor: string;
  perguntas: Pergunta[];
}

const forte = (texto: string, cor: string = C.onSurface) => (
  <strong className="font-semibold" style={{ color: cor }}>
    {texto}
  </strong>
);

const SECOES: Secao[] = [
  {
    id: "tarefas",
    titulo: "Tarefas e Divisão Justa de Despesas",
    descricao: "Entenda a regra central do Racha+: toda despesa está conectada a uma ação clara.",
    icone: ListChecks,
    fundo: C.primaryFixed,
    cor: C.primary,
    perguntas: [
      {
        id: "divisao",
        categoria: "tasks",
        pergunta: "Como funciona a divisão de valores entre os membros?",
        palavras:
          "divisão de tarefas valores membros tarefa específica participantes partes iguais desmarcar cobrado justo",
        resposta: (
          <>
            <p>
              No {forte("Racha+")}, a divisão não é cega nem genérica. Cada
              valor gasto precisa estar atrelado a uma {forte("Tarefa específica")}{" "}
              (por exemplo: "Compra de Bebidas para o Churrasco" ou
              "Combustível da Van").
            </p>
            <p>
              Ao cadastrar a tarefa, o organizador marca exatamente quem
              participa daquela atividade. O valor total lançado é fatiado{" "}
              {forte("em partes iguais exclusivamente entre os participantes assinalados", C.primary)}.
              Se um amigo não for beber ou não for ao passeio, basta
              desmarcá-lo da tarefa para que nenhuma fração seja cobrada dele.
            </p>
            <div
              className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium"
              style={{ backgroundColor: C.surfaceLow, color: C.onSurface }}
            >
              <BadgeCheck className="h-[18px] w-[18px] shrink-0" style={{ color: C.primaryContainer }} />
              Resultado: contas 100% justas e sem ressentimentos no grupo.
            </div>
          </>
        ),
      },
      {
        id: "despesa-sem-tarefa",
        categoria: "tasks",
        pergunta: "Posso criar uma despesa sem vinculá-la a uma tarefa?",
        palavras:
          "despesa sem tarefa vincular tarefa mãe gastos fantasmas rastreabilidade auditoria nova tarefa notinha",
        resposta: (
          <>
            <div
              className="flex items-start gap-2 rounded-xl p-4"
              style={{ backgroundColor: C.surfaceContainer, color: C.onSurface }}
            >
              <Info className="mt-0.5 h-[22px] w-[22px] shrink-0" style={{ color: C.tertiary }} />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold" style={{ color: C.onTertiaryContainer }}>
                  Regra Arquitetural do Racha+
                </span>
                <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  Não. No Racha+, {forte("toda despesa requer obrigatoriamente uma tarefa mãe")}.
                  Esse método impede "gastos fantasmas", notas soltas sem
                  contexto e garante rastreabilidade e auditoria instantânea
                  para qualquer membro do grupo.
                </p>
              </div>
            </div>
            <p>
              Precisa registrar um gasto rápido? Basta clicar em{" "}
              {forte("+ Nova Tarefa")}, dar um nome objetivo (ex: "Farmácia -
              Remédios de Uso Geral"), definir os beneficiados e salvar o valor
              com a foto da notinha.
            </p>
          </>
        ),
      },
      {
        id: "tarefa-concluida",
        categoria: "tasks",
        pergunta: 'O que acontece quando marco uma tarefa como "Concluída"?',
        palavras:
          "tarefa concluída responsabilidade compra realizada não quita dívidas liquidação pagamentos pix aprovações",
        resposta: (
          <>
            <p>
              Marcar uma tarefa como concluída sinaliza operacionalmente que a
              responsabilidade ou compra foi realizada com sucesso pelo
              encarregado.
            </p>
            <div
              className="flex items-center gap-2 rounded-lg p-2"
              style={{ backgroundColor: C.surfaceHigh, color: C.onSurface }}
            >
              <TriangleAlert className="h-5 w-5 shrink-0" style={{ color: C.secondary }} />
              <span className="text-sm">
                <strong>Importante:</strong> Concluir a tarefa não quita as
                dívidas automaticamente! A liquidação financeira entre os
                membros depende dos pagamentos individuais via Pix e de suas
                respectivas aprovações.
              </span>
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: "pagamentos",
    titulo: "Pagamentos, Chaves Pix e Comprovantes",
    descricao: "Transferências diretas sem intermediários e auditoria visual de recibos.",
    icone: QrCode,
    fundo: C.tertiaryFixed,
    cor: C.tertiary,
    perguntas: [
      {
        id: "acertar-cota",
        categoria: "payments",
        pergunta: "Como acertar minha cota usando o Pix no Racha+?",
        palavras:
          "acertar cota pix chave pix chaves qr code copia e cola pagar comprovante informar pagamento saldos",
        resposta: (
          <>
            <p>O processo foi desenhado para ser feito em menos de 30 segundos:</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              <li>Abra o grupo e localize a tarefa pendente ou acesse a aba {forte('"Meus Saldos"')}.</li>
              <li>Clique no botão primário {forte('"Acertar Pagamento"', C.primary)}.</li>
              <li>
                O aplicativo exibirá instantaneamente a chave Pix cadastrada
                pelo pagador original e um {forte("QR Code Pix Copia e Cola")} com o
                valor exato calculado.
              </li>
              <li>Abra o app do seu banco, pague via Pix e tire uma captura de tela do comprovante.</li>
              <li>Volte ao Racha+ e anexe a imagem/PDF do comprovante no botão {forte('"Informar Pagamento"')}.</li>
            </ol>
          </>
        ),
      },
      {
        id: "confirmar-pagamento",
        categoria: "payments",
        pergunta: "Como o responsável confirma que o pagamento caiu na conta?",
        palavras:
          "responsável confirma pagamento comprovantes recibo notificação estados pendente informado confirmado contestado",
        resposta: (
          <>
            <p>
              Assim que o devedor anexa o recibo, o responsável pelo
              recebimento recebe uma notificação instantânea. A conferência
              ocorre através de um ciclo de 4 estados:
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
              {[
                { t: "1. Pendente", d: "Aguardando o participante realizar o Pix.", c: C.outline },
                { t: "2. Informado", d: "Comprovante enviado pelo devedor sob verificação.", c: C.tertiary },
                { t: "3. Confirmado", d: "Recebedor validou o crédito no extrato bancário.", c: C.primaryContainer },
                { t: "4. Contestado", d: "Valor divergente ou comprovante ilegível para reenvio.", c: C.error },
              ].map((estado) => (
                <div
                  key={estado.t}
                  className="flex flex-col gap-1 rounded-lg p-2"
                  style={{ backgroundColor: C.surfaceLow }}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: estado.c }} />
                    <span className="text-xs font-bold" style={{ color: C.onSurface }}>
                      {estado.t}
                    </span>
                  </span>
                  <span className="text-sm">{estado.d}</span>
                </div>
              ))}
            </div>
          </>
        ),
      },
      {
        id: "taxas",
        categoria: "payments",
        pergunta: "O Racha+ cobra taxas sobre as transferências Pix?",
        palavras:
          "taxas transferências pix zero carteira digital custodia peer to peer banco central porcentagem saque",
        resposta: (
          <>
            <p>
              {forte("Zero taxas!")} O Racha+ não funciona como carteira
              digital fechada e não custodia o dinheiro do grupo.
            </p>
            <p>
              Todas as transferências são liquidadas ponto a ponto
              (peer-to-peer) direto da sua conta bancária para a conta do seu
              amigo via Pix. Você nunca paga porcentagem ou taxa de saque pelo
              Racha+.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "grupos",
    titulo: "Grupos e Gestão Colaborativa",
    descricao: "Convites, papéis de membros e critérios para fechamento seguro do grupo.",
    icone: Users,
    fundo: C.secondaryFixed,
    cor: C.secondary,
    perguntas: [
      {
        id: "convidar",
        categoria: "groups",
        pergunta: "Como convidar amigos para o meu grupo?",
        palavras:
          "convidar amigos grupo convidar membros link whatsapp telegram código 6 dígitos entrar em grupo qr code",
        resposta: (
          <>
            <p>
              Dentro de qualquer grupo ativo, acesse o botão{" "}
              {forte('"Convidar Membros"')} no topo da página. O Racha+ gera:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Um link direto pronto para compartilhar no WhatsApp ou Telegram;</li>
              <li>Um código único que qualquer usuário logado pode digitar em "Entrar com link ou código";</li>
              <li>Um QR Code na tela para seus amigos escanearem na hora da reunião presencial.</li>
            </ul>
          </>
        ),
      },
      {
        id: "encerrar",
        categoria: "audit",
        pergunta: "Quando e como posso encerrar um grupo definitivamente?",
        palavras:
          "encerrar grupo encerramento arquivamento auditoria tarefas concluídas comprovantes aprovados saldo zero somente leitura relatório pdf",
        resposta: (
          <>
            <p>
              Para preservar a segurança financeira de todos os envolvidos, o
              encerramento definitivo só é liberado pela nossa{" "}
              {forte("Regra de Auditoria")} quando:
            </p>
            <div
              className="flex flex-col gap-2 rounded-xl p-4"
              style={{ backgroundColor: C.surfaceContainer }}
            >
              {[
                "100% das tarefas foram marcadas como concluídas;",
                "Todos os comprovantes foram aprovados e o saldo pendente do grupo está em R$ 0,00.",
              ].map((texto) => (
                <span
                  key={texto}
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: C.onSurface }}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: C.primaryContainer }} />
                  {texto}
                </span>
              ))}
            </div>
            <p className="text-sm">
              Após encerrado, o grupo é congelado em modo somente-leitura, com
              o histórico disponível para consulta.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "planos",
    titulo: "Planos e Assinaturas",
    descricao: "Conheça os recursos ilimitados para viagens frequentes e repúblicas.",
    icone: Crown,
    fundo: C.primaryFixedDim,
    cor: C.onPrimaryFixedVariant,
    perguntas: [
      {
        id: "planos-pro",
        categoria: "plans",
        pergunta: "Quais as vantagens dos planos Pro e Pro+?",
        palavras:
          "planos pro pro+ assinatura gratuito grupos ativos comprovantes exportação pdf excel ilimitado preço mensal anual",
        resposta: <PlanosResposta />,
      },
    ],
  },
];

const TODAS = SECOES.flatMap((secao) => secao.perguntas);

const CATEGORIAS: { id: Categoria | "all"; nome: string; icone?: LucideIcon }[] = [
  { id: "all", nome: "Todas as Dúvidas" },
  { id: "groups", nome: "Criando e Convidando", icone: UserPlus },
  { id: "tasks", nome: "Tarefas & Divisão", icone: ListChecks },
  { id: "payments", nome: "Pagamentos & Pix", icone: ArrowLeftRight },
  { id: "audit", nome: "Encerramento & Auditoria", icone: ShieldCheck },
  { id: "plans", nome: "Conta & Assinaturas", icone: Star },
];

const BUSCAS_COMUNS = ["Divisão de tarefas", "Chaves Pix", "Encerrar grupo", "Planos Pro", "Comprovantes"];

// Remove acentos e caixa para comparar textos
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Cada palavra da busca precisa aparecer (pelo radical) na pergunta
function corresponde(pergunta: Pergunta, busca: string) {
  const termos = normalizar(busca).split(/\s+/).filter((t) => t.length >= 2 && t !== "de" && t !== "do" && t !== "da");
  if (termos.length === 0) return true;
  const alvo = normalizar(`${pergunta.pergunta} ${pergunta.palavras}`);
  return termos.every((termo) => alvo.includes(termo.length > 5 ? termo.slice(0, termo.length - 2) : termo));
}

export default function Faq() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "all">("all");
  const [aberta, setAberta] = useState<string | null>(null);
  const campoBusca = useRef<HTMLInputElement>(null);

  // Esc limpa a busca
  useEffect(() => {
    function aoPressionar(event: KeyboardEvent) {
      if (event.key === "Escape" && busca) {
        setBusca("");
        campoBusca.current?.blur();
      }
    }
    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [busca]);

  const visiveis = useMemo(
    () =>
      new Set(
        TODAS.filter(
          (p) => (categoria === "all" || p.categoria === categoria) && corresponde(p, busca),
        ).map((p) => p.id),
      ),
    [busca, categoria],
  );

  function buscarRapido(termo: string) {
    setBusca(termo);
    setCategoria("all");
    campoBusca.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function limparTudo() {
    setBusca("");
    setCategoria("all");
  }

  return (
    <AppShell title="Ajuda & FAQ">
      <div className="flex w-full flex-col font-jakarta" style={{ color: C.onSurface }}>
        {/* =====================================================
            CABEÇALHO E BUSCA
        ====================================================== */}

        <div className="relative isolate mb-10 flex flex-col gap-4">
          <div
            className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-96 w-96 rounded-full blur-3xl"
            style={{ backgroundColor: `${C.primaryContainer}1a` }}
          />
          <div
            className="pointer-events-none absolute -top-20 right-10 -z-10 h-80 w-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${C.tertiaryContainer}1a` }}
          />

          <div className="flex max-w-4xl flex-col gap-1">
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1"
              style={{ backgroundColor: C.surfaceHigh }}
            >
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: C.primaryContainer }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.onSurfaceVariant }}>
                Base de Conhecimento Racha+
              </span>
            </div>
            <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-[2rem]">
              Central de Ajuda &amp; Perguntas Frequentes
            </h1>
            <p className="text-lg" style={{ color: C.onSurfaceVariant }}>
              Tire suas dúvidas sobre criação de grupos, divisão de despesas em
              tarefas, acertos via Pix e gerenciamento de assinaturas com total
              transparência.
            </p>
          </div>

          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="mt-2 flex w-full max-w-3xl flex-col items-center gap-1 rounded-xl bg-white p-1 shadow-md transition-all focus-within:shadow-xl sm:flex-row"
          >
            <div className="relative flex w-full flex-1 items-center px-2">
              <Search className="mr-2 h-6 w-6 shrink-0" style={{ color: C.outline }} />
              <label htmlFor="busca-faq" className="sr-only">
                Buscar na central de ajuda
              </label>
              <input
                ref={campoBusca}
                id="busca-faq"
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="O que você está procurando? Ex: como dividir tarefas, comprovante Pix, encerrar grupo..."
                className="w-full bg-transparent py-2 text-base outline-none placeholder:text-[#897266]"
              />
              {busca && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setBusca("");
                    campoBusca.current?.focus();
                  }}
                  className="cursor-pointer rounded-full p-1 transition-colors hover:bg-[#e6eeff]"
                  style={{ color: C.outline }}
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              )}
            </div>
            <div className="flex w-full items-center gap-2 px-1 pb-1 sm:w-auto sm:pb-0">
              <span
                className="hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs md:inline-flex"
                style={{ backgroundColor: C.surfaceLow, color: C.outline }}
              >
                <kbd className="font-semibold">ESC</kbd> limpa
              </span>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#ff8c42] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-95 sm:w-auto"
              >
                Buscar
                <ArrowRight className="h-[18px] w-[18px]" />
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="mr-1 text-xs font-medium" style={{ color: C.outline }}>
              Buscas comuns:
            </span>
            {BUSCAS_COMUNS.map((termo) => (
              <button
                key={termo}
                type="button"
                onClick={() => buscarRapido(termo)}
                className="cursor-pointer rounded-full bg-[#e6eeff] px-3 py-1 text-xs font-medium transition-all hover:bg-[#ff8c42] hover:text-white"
              >
                {termo}
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================
            CATEGORIAS
        ====================================================== */}

        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIAS.map((item) => {
            const ativo = categoria === item.id;
            const Icone = item.icone;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={ativo}
                onClick={() => setCategoria(item.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  ativo ? "shadow-sm" : "bg-white hover:bg-[#eff4ff] hover:text-[#121c2a]"
                }`}
                style={
                  ativo
                    ? { backgroundColor: C.primaryContainer, color: "#fff" }
                    : { color: C.onSurfaceVariant }
                }
              >
                {Icone && <Icone className="h-[18px] w-[18px]" />}
                <span>{item.nome}</span>
                {item.id === "all" && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={
                      ativo
                        ? { backgroundColor: `${C.onPrimaryContainer}33`, color: "#fff" }
                        : { backgroundColor: C.surfaceContainer }
                    }
                  >
                    {TODAS.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* =====================================================
              PERGUNTAS
          ====================================================== */}

          <div className="flex flex-col gap-10 lg:col-span-8">
            {SECOES.map((secao) => {
              const perguntas = secao.perguntas.filter((p) => visiveis.has(p.id));
              if (perguntas.length === 0) return null;
              const Icone = secao.icone;
              return (
                <section key={secao.id} className="flex flex-col gap-2" aria-labelledby={`secao-${secao.id}`}>
                  <div className="flex items-center gap-2 pb-1">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: secao.fundo, color: secao.cor }}
                    >
                      <Icone className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 id={`secao-${secao.id}`} className="text-xl font-bold">
                        {secao.titulo}
                      </h2>
                      <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                        {secao.descricao}
                      </p>
                    </div>
                  </div>

                  {perguntas.map((p) => {
                    const expandida = aberta === p.id;
                    return (
                      <div
                        key={p.id}
                        className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
                      >
                        <h3>
                          <button
                            type="button"
                            aria-expanded={expandida}
                            aria-controls={`resposta-${p.id}`}
                            onClick={() => setAberta(expandida ? null : p.id)}
                            className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left"
                          >
                            <span className="text-base font-semibold">{p.pergunta}</span>
                            <ChevronDown
                              className={`h-[22px] w-[22px] shrink-0 transition-transform duration-200 ${
                                expandida ? "rotate-180" : ""
                              }`}
                              style={{ color: C.outline }}
                            />
                          </button>
                        </h3>
                        <div
                          id={`resposta-${p.id}`}
                          role="region"
                          hidden={!expandida}
                          className="space-y-2 px-4 pb-4 pt-1 text-base"
                          style={{ color: C.onSurfaceVariant }}
                        >
                          {p.resposta}
                        </div>
                      </div>
                    );
                  })}
                </section>
              );
            })}

            {visiveis.size === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-10 text-center shadow-sm">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.surfaceHigh, color: C.outline }}
                >
                  <SearchX className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Nenhum resultado encontrado</h3>
                <p className="max-w-md text-base" style={{ color: C.onSurfaceVariant }}>
                  Não encontramos nenhuma resposta correspondente à sua busca.
                  Experimente pesquisar por outras palavras-chave ou contate
                  nosso time de atendimento direto.
                </p>
                <button
                  type="button"
                  onClick={limparTudo}
                  className="mt-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                  style={{ backgroundColor: C.primary }}
                >
                  Ver todas as perguntas
                </button>
              </div>
            )}
          </div>

          {/* =====================================================
              LATERAL
          ====================================================== */}

          <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:col-span-4">
            {/* Suporte */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: C.primaryFixed, color: C.primary }}
                >
                  <Headset className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Fale com o Suporte</h3>
                  <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    Atendimento humano e resolutivo
                  </p>
                </div>
              </div>
              <p className="text-base" style={{ color: C.onSurfaceVariant }}>
                Não encontrou o que precisava? Nossa equipe está disponível
                para ajudar você e seu grupo.
              </p>

              <div className="flex flex-col gap-2 rounded-xl p-2" style={{ backgroundColor: C.surfaceLow }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <MessageCircle className="h-[22px] w-[22px]" style={{ color: "#25D366" }} />
                    WhatsApp Oficial
                  </span>
                  <Etiqueta>Em breve</Etiqueta>
                </div>
                <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  Tire dúvidas sobre pagamentos, chaves e faturamento
                  diretamente no app.
                </p>
                <button
                  type="button"
                  disabled
                  title="O número oficial de WhatsApp ainda não foi definido."
                  className="mt-1 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white opacity-60 shadow-sm"
                  style={{ backgroundColor: C.primaryContainer }}
                >
                  <Send className="h-[18px] w-[18px]" />
                  Iniciar conversa no WhatsApp
                </button>
              </div>

              <div className="flex flex-col gap-1 rounded-xl p-2" style={{ backgroundColor: C.surfaceLow }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <Mail className="h-[22px] w-[22px]" style={{ color: C.primary }} />
                    Suporte por E-mail
                  </span>
                  <Etiqueta>Até 2h</Etiqueta>
                </div>
                <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  Envie relatórios complexos, anexos e solicitações de dados.
                </p>
                <a
                  href={`mailto:${EMAIL_SUPORTE}`}
                  className="mt-1 flex items-center gap-1 text-xs font-bold hover:underline"
                  style={{ color: C.primary }}
                >
                  {EMAIL_SUPORTE}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Tutoriais */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <MonitorPlay className="h-6 w-6" style={{ color: C.tertiaryContainer }} />
                  Tutoriais Rápidos
                </h3>
                <Etiqueta>Em breve</Etiqueta>
              </div>
              {[
                { tipo: "Vídeo · 3 min", titulo: "Dominando o Racha+", texto: "Como criar o primeiro grupo e vincular tarefas.", icone: Play, fundo: `linear-gradient(135deg, ${C.primaryFixed}, ${C.primaryFixedDim})` },
                { tipo: "Artigo · 5 min", titulo: "Viagem Sem Brigas", texto: "Estratégias práticas para dividir passeios e refeições.", icone: BookOpen, fundo: `linear-gradient(135deg, ${C.tertiaryFixed}, ${C.surfaceHigh})` },
              ].map((tutorial) => {
                const Icone = tutorial.icone;
                return (
                  <div key={tutorial.titulo} className="flex gap-2 rounded-xl p-2">
                    <div
                      className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: tutorial.fundo }}
                      aria-hidden="true"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md">
                        <Icone className="h-4 w-4" style={{ color: C.primary }} />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col justify-center gap-0.5">
                      <span className="text-xs font-semibold" style={{ color: C.outline }}>
                        {tutorial.tipo}
                      </span>
                      <h4 className="truncate text-sm font-bold">{tutorial.titulo}</h4>
                      <p className="line-clamp-1 text-sm" style={{ color: C.onSurfaceVariant }}>
                        {tutorial.texto}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status dos serviços */}
            <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  Status dos Serviços
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  Operacional
                </span>
              </div>
              <div className="flex flex-col gap-2 pt-1 text-sm" style={{ color: C.onSurfaceVariant }}>
                {[
                  { nome: "Pix Copia e Cola", icone: ArrowLeftRight },
                  { nome: "Notificações Push & E-mail", icone: BellRing },
                  { nome: "Armazenamento de Recibos", icone: CloudUpload },
                ].map((servico, indice, lista) => {
                  const Icone = servico.icone;
                  return (
                    <div
                      key={servico.nome}
                      className={`flex items-center justify-between py-1 ${indice < lista.length - 1 ? "border-b" : ""}`}
                      style={{ borderColor: C.surfaceContainer }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icone className="h-4 w-4" style={{ color: C.outline }} />
                        {servico.nome}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: C.onSurface }}>
                        Disponível
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
====================================================== */

function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: C.surfaceHighest, color: C.onSurfaceVariant }}
    >
      {children}
    </span>
  );
}

function PlanosResposta() {
  const navigate = useNavigate();
  const planos = [
    {
      nome: "Plano Pro",
      selo: "Popular",
      corSelo: { fundo: C.primaryFixed, texto: C.primary },
      preco: "R$ 12",
      periodo: "/mês ou R$ 80/ano",
      itens: ["Até 15 grupos ativos", "Armazenamento de 500 comprovantes em HD", "Exportação completa em PDF e Excel"],
      fundo: C.surfaceLow,
      acao: "Ver detalhes",
      destaque: false,
    },
    {
      nome: "Plano Pro+",
      selo: "Ilimitado",
      corSelo: { fundo: C.tertiaryContainer, texto: "#fff" },
      preco: "R$ 20",
      periodo: "/mês ou R$ 200/ano",
      itens: ["Grupos ilimitados e membros sem teto", "Comprovantes e fotos sem limite", "Conciliação bancária assistida via IA"],
      fundo: C.surfaceContainer,
      acao: "Assinar Pro+",
      destaque: true,
    },
  ];

  return (
    <>
      <p>
        O plano {forte("Gratuito")} já oferece criação de grupos e divisão
        padrão. Para quem precisa de mais poder de organização, oferecemos:
      </p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className="flex flex-col justify-between gap-2 rounded-xl p-4"
            style={{ backgroundColor: plano.fundo }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ color: C.onSurface }}>
                  {plano.nome}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ backgroundColor: plano.corSelo.fundo, color: plano.corSelo.texto }}
                >
                  {plano.selo}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold" style={{ color: C.onSurface }}>
                  {plano.preco}
                </span>
                <span className="text-sm">{plano.periodo}</span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {plano.itens.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0" style={{ color: C.primaryContainer }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => navigate("/assinatura")}
              className={`mt-2 cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
                plano.destaque
                  ? "bg-[#ff8c42] text-white shadow-sm hover:opacity-95"
                  : "bg-[#d9e3f6] text-[#121c2a] hover:bg-[#9b4500] hover:text-white"
              }`}
            >
              {plano.acao}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
