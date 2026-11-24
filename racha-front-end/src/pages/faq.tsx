import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";

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
  /** Nome do ícone do Material Symbols. */
  icone: string;
  /** Classes de fundo/texto do ícone da seção. */
  cores: string;
  perguntas: Pergunta[];
}

const forte = (texto: string, cor = "text-on-surface") => <strong className={`font-semibold ${cor}`}>{texto}</strong>;

const SECOES: Secao[] = [
  {
    id: "tarefas",
    titulo: "Tarefas e Divisão Justa de Despesas",
    descricao: "Entenda a regra central do Racha+: toda despesa está conectada a uma ação clara.",
    icone: "checklist",
    cores: "bg-primary-fixed text-primary",
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
              No {forte("Racha+")}, a divisão não é cega nem genérica. Cada valor gasto precisa estar atrelado a uma{" "}
              {forte("Tarefa específica")} (por exemplo: "Compra de Bebidas para o Churrasco" ou "Combustível da
              Van").
            </p>
            <p>
              Ao cadastrar a tarefa, o organizador marca exatamente quem participa daquela atividade. O valor total
              lançado é fatiado {forte("em partes iguais exclusivamente entre os participantes assinalados", "text-primary")}.
              Se um amigo não for beber ou não for ao passeio, basta desmarcá-lo da tarefa para que nenhuma fração seja
              cobrada dele.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-space-sm font-label-sm text-label-sm text-on-surface">
              <Icon name="verified" size={18} className="shrink-0 text-primary-container" />
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
            <div className="flex items-start gap-space-sm rounded-xl bg-surface-container p-space-md text-on-surface">
              <Icon name="info" size={22} className="mt-0.5 shrink-0 text-tertiary" />
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md font-bold text-on-tertiary-container">
                  Regra Arquitetural do Racha+
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Não. No Racha+, {forte("toda despesa requer obrigatoriamente uma tarefa mãe")}. Esse método impede
                  "gastos fantasmas", notas soltas sem contexto e garante rastreabilidade e auditoria instantânea para
                  qualquer membro do grupo.
                </p>
              </div>
            </div>
            <p>
              Precisa registrar um gasto rápido? Basta clicar em {forte("+ Nova Tarefa")}, dar um nome objetivo (ex:
              "Farmácia - Remédios de Uso Geral"), definir os beneficiados e salvar o valor com a foto da notinha.
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
              Marcar uma tarefa como concluída sinaliza operacionalmente que a responsabilidade ou compra foi realizada
              com sucesso pelo encarregado.
            </p>
            <div className="flex items-start gap-space-sm rounded-lg bg-surface-container-high p-space-sm text-on-surface">
              <Icon name="warning" size={20} className="shrink-0 text-secondary" />
              <span className="font-body-sm text-body-sm">
                <strong>Importante:</strong> Concluir a tarefa não quita as dívidas automaticamente! A liquidação
                financeira entre os membros depende dos pagamentos individuais via Pix e de suas respectivas aprovações.
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
    icone: "qr_code_2",
    cores: "bg-tertiary-fixed text-tertiary",
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
            <ol className="flex flex-col gap-space-sm font-body-sm text-body-sm">
              {[
                <>Abra o grupo e localize a tarefa pendente ou acesse a aba {forte('"Meus Saldos"')}.</>,
                <>Clique no botão primário {forte('"Acertar Pagamento"', "text-primary")}.</>,
                <>
                  O aplicativo exibirá instantaneamente a chave Pix cadastrada pelo pagador original e um{" "}
                  {forte("QR Code Pix Copia e Cola")} com o valor exato calculado.
                </>,
                <>Abra o app do seu banco, pague via Pix e tire uma captura de tela do comprovante.</>,
                <>Volte ao Racha+ e anexe a imagem/PDF do comprovante no botão {forte('"Informar Pagamento"')}.</>,
              ].map((passo, indice) => (
                <li key={indice} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-[12px] font-bold text-on-primary-fixed">
                    {indice + 1}
                  </span>
                  <span>{passo}</span>
                </li>
              ))}
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
              Assim que o devedor anexa o recibo, o responsável pelo recebimento recebe uma notificação instantânea. A
              conferência ocorre através de um ciclo de 4 estados:
            </p>
            <div className="grid grid-cols-1 gap-space-sm pt-1 sm:grid-cols-2">
              {[
                { t: "1. Pendente", d: "Aguardando o participante realizar o Pix.", c: "bg-outline" },
                { t: "2. Informado", d: "Comprovante enviado pelo devedor sob verificação.", c: "bg-tertiary" },
                { t: "3. Confirmado", d: "Recebedor validou o crédito no extrato bancário.", c: "bg-primary-container" },
                { t: "4. Contestado", d: "Valor divergente ou comprovante ilegível para reenvio.", c: "bg-error" },
              ].map((estado) => (
                <div key={estado.t} className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-space-sm">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${estado.c}`} />
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">{estado.t}</span>
                  </span>
                  <span className="font-body-sm text-body-sm">{estado.d}</span>
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
              {forte("Zero taxas!")} O Racha+ não funciona como carteira digital fechada e não custodia o dinheiro do
              grupo.
            </p>
            <p>
              Todas as transferências são liquidadas ponto a ponto (peer-to-peer) direto da sua conta bancária para a
              conta do seu amigo via Pix. Você nunca paga porcentagem ou taxa de saque pelo Racha+.
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
    icone: "groups",
    cores: "bg-secondary-fixed text-secondary",
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
              Dentro de qualquer grupo ativo, acesse o botão {forte('"Convidar Membros"')} no topo da página. O Racha+
              gera:
            </p>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm">
              {[
                { icone: "link", texto: "Um link direto pronto para compartilhar no WhatsApp ou Telegram;" },
                { icone: "pin", texto: 'Um código único que qualquer usuário logado pode digitar em "Entrar com link ou código";' },
                { icone: "qr_code_2", texto: "Um QR Code na tela para seus amigos escanearem na hora da reunião presencial." },
              ].map((item) => (
                <li key={item.icone} className="flex items-start gap-2">
                  <Icon name={item.icone} size={18} className="mt-0.5 shrink-0 text-primary-container" />
                  {item.texto}
                </li>
              ))}
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
              Para preservar a segurança financeira de todos os envolvidos, o encerramento definitivo só é liberado
              pela nossa {forte("Regra de Auditoria")} quando:
            </p>
            <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container p-space-md">
              {[
                "100% das tarefas foram marcadas como concluídas;",
                "Todos os comprovantes foram aprovados e o saldo pendente do grupo está em R$ 0,00.",
              ].map((texto) => (
                <span key={texto} className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                  <Icon name="check_circle" size={20} filled className="shrink-0 text-primary-container" />
                  {texto}
                </span>
              ))}
            </div>
            <p className="font-body-sm text-body-sm">
              Após encerrado, o grupo é congelado em modo somente-leitura, com o histórico disponível para consulta.
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
    icone: "workspace_premium",
    cores: "bg-primary-fixed-dim text-on-primary-fixed-variant",
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

const CATEGORIAS: { id: Categoria | "all"; nome: string; icone?: string }[] = [
  { id: "all", nome: "Todas as Dúvidas" },
  { id: "groups", nome: "Criando e Convidando", icone: "group_add" },
  { id: "tasks", nome: "Tarefas & Divisão", icone: "checklist" },
  { id: "payments", nome: "Pagamentos & Pix", icone: "sync_alt" },
  { id: "audit", nome: "Encerramento & Auditoria", icone: "verified_user" },
  { id: "plans", nome: "Conta & Assinaturas", icone: "star" },
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
        TODAS.filter((p) => (categoria === "all" || p.categoria === categoria) && corresponde(p, busca)).map((p) => p.id),
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
    <AppShell title="Ajuda & FAQ" bare>
      <div className="flex w-full flex-col">
        <div className="mx-auto w-full max-w-6xl space-y-space-lg px-gutter-mobile py-space-md sm:px-gutter sm:py-space-xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <Link to="/meus-grupos" className="flex items-center gap-1 transition-colors hover:text-primary">
              <Icon name="home" size={16} />
              <span>Início</span>
            </Link>
            <Icon name="chevron_right" size={14} className="text-outline-variant" />
            <span className="font-semibold text-on-surface">Ajuda &amp; Suporte</span>
          </nav>

          {/* =====================================================
              CABEÇALHO E BUSCA
          ====================================================== */}

          <div className="flex flex-col gap-space-md">
            <div className="flex max-w-4xl flex-col gap-space-xs">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
                Base de Conhecimento Racha+
              </span>
              <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight text-on-surface">
                Central de Ajuda &amp; Perguntas Frequentes
              </h1>
              <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
                Tire suas dúvidas sobre criação de grupos, divisão de despesas em tarefas, acertos via Pix e
                gerenciamento de assinaturas com total transparência.
              </p>
            </div>

            <form
              role="search"
              onSubmit={(event) => event.preventDefault()}
              className="flex w-full max-w-3xl flex-col items-center gap-1 rounded-xl bg-surface-container-lowest p-1.5 shadow-sm transition-all focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary-container sm:flex-row"
            >
              <div className="relative flex w-full flex-1 items-center px-2">
                <Icon name="search" size={22} className="mr-2 shrink-0 text-outline" />
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
                  className="w-full bg-transparent py-2 font-body-md text-body-md text-on-surface outline-none placeholder:text-outline"
                />
                {busca && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={() => {
                      setBusca("");
                      campoBusca.current?.focus();
                    }}
                    className="rounded-full p-1 text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  >
                    <Icon name="close" size={18} />
                  </button>
                )}
              </div>
              <div className="flex w-full items-center gap-space-sm px-1 pb-1 sm:w-auto sm:pb-0">
                <span className="hidden items-center gap-1 rounded-lg bg-surface-container-low px-2.5 py-1.5 font-label-sm text-label-sm text-outline md:inline-flex">
                  <kbd className="font-semibold">ESC</kbd> limpa
                </span>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary active:scale-95 sm:w-auto"
                >
                  Buscar
                  <Icon name="arrow_forward" size={18} />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="mr-1 font-label-sm text-label-sm text-on-surface-variant">Buscas comuns:</span>
              {BUSCAS_COMUNS.map((termo) => (
                <button
                  key={termo}
                  type="button"
                  onClick={() => buscarRapido(termo)}
                  className="rounded-full bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-on-surface transition-all hover:bg-primary-container hover:text-on-primary"
                >
                  {termo}
                </button>
              ))}
            </div>
          </div>

          {/* =====================================================
              CATEGORIAS
          ====================================================== */}

          <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-1.5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 overflow-x-auto px-0.5 py-0.5">
              {CATEGORIAS.map((item) => {
                const ativo = categoria === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setCategoria(item.id)}
                    className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 font-label-md text-label-md transition-all ${
                      ativo
                        ? "bg-inverse-surface font-semibold text-inverse-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    {item.icone && <Icon name={item.icone} size={18} />}
                    <span>{item.nome}</span>
                    {item.id === "all" && <span className="ml-1 text-label-sm opacity-70">({TODAS.length})</span>}
                  </button>
                );
              })}
            </div>
            <span className="hidden shrink-0 items-center gap-1 pr-3 font-label-sm text-label-sm text-on-surface-variant lg:flex">
              <Icon name="help" size={16} className="text-primary" />
              {visiveis.size} {visiveis.size === 1 ? "resposta encontrada" : "respostas encontradas"}
            </span>
          </div>

          <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
            {/* =====================================================
                PERGUNTAS
            ====================================================== */}

            <div className="flex flex-col gap-space-xl lg:col-span-8">
              {SECOES.map((secao) => {
                const perguntas = secao.perguntas.filter((p) => visiveis.has(p.id));
                if (perguntas.length === 0) return null;
                return (
                  <section key={secao.id} className="space-y-space-md" aria-labelledby={`secao-${secao.id}`}>
                    <div className="flex items-center gap-space-md">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${secao.cores}`}>
                        <Icon name={secao.icone} size={24} />
                      </div>
                      <div>
                        <h2
                          id={`secao-${secao.id}`}
                          className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface"
                        >
                          {secao.titulo}
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{secao.descricao}</p>
                      </div>
                    </div>

                    <div className="space-y-space-sm">
                      {perguntas.map((p) => {
                        const expandida = aberta === p.id;
                        return (
                          <div
                            key={p.id}
                            className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 hover:shadow-md"
                          >
                            {expandida && <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-primary-container" />}
                            <h3>
                              <button
                                type="button"
                                aria-expanded={expandida}
                                aria-controls={`resposta-${p.id}`}
                                onClick={() => setAberta(expandida ? null : p.id)}
                                className="flex w-full items-center justify-between gap-space-md p-space-md text-left sm:px-space-lg"
                              >
                                <span className="font-label-lg text-label-lg text-on-surface">{p.pergunta}</span>
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                                    expandida ? "rotate-180 bg-primary-fixed text-primary" : "bg-surface-container-low text-on-surface-variant"
                                  }`}
                                >
                                  <Icon name="expand_more" size={20} />
                                </span>
                              </button>
                            </h3>
                            <div
                              id={`resposta-${p.id}`}
                              role="region"
                              hidden={!expandida}
                              className="space-y-space-sm px-space-md pb-space-md font-body-md text-body-md text-on-surface-variant sm:px-space-lg sm:pb-space-lg"
                            >
                              {p.resposta}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {visiveis.size === 0 && (
                <div className="flex flex-col items-center justify-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-outline">
                    <Icon name="search_off" size={28} />
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Nenhum resultado encontrado</h3>
                  <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
                    Não encontramos nenhuma resposta correspondente à sua busca. Experimente pesquisar por outras
                    palavras-chave ou contate nosso time de atendimento direto.
                  </p>
                  <button
                    type="button"
                    onClick={limparTudo}
                    className="mt-2 rounded-lg bg-primary-container px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary active:scale-95"
                  >
                    Ver todas as perguntas
                  </button>
                </div>
              )}
            </div>

            {/* =====================================================
                LATERAL
            ====================================================== */}

            <aside className="flex flex-col gap-space-md lg:sticky lg:top-20 lg:col-span-4">
              {/* Suporte */}
              <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg">
                <div className="flex items-center gap-space-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <Icon name="support_agent" size={22} />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Fale com o Suporte</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Atendimento humano e resolutivo</p>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Não encontrou o que precisava? Nossa equipe está disponível para ajudar você e seu grupo.
                </p>

                <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <Icon name="chat" size={20} className="text-[#25D366]" />
                      WhatsApp Oficial
                    </span>
                    <Etiqueta>Em breve</Etiqueta>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tire dúvidas sobre pagamentos, chaves e faturamento diretamente no app.
                  </p>
                  <button
                    type="button"
                    disabled
                    title="O número oficial de WhatsApp ainda não foi definido."
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 font-label-md text-label-md text-on-primary opacity-60 shadow-sm"
                  >
                    <Icon name="send" size={18} />
                    Iniciar conversa no WhatsApp
                  </button>
                </div>

                <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <Icon name="mail" size={20} className="text-primary" />
                      Suporte por E-mail
                    </span>
                    <Etiqueta>Até 2h</Etiqueta>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Envie relatórios complexos, anexos e solicitações de dados.
                  </p>
                  <a
                    href={`mailto:${EMAIL_SUPORTE}`}
                    className="mt-1 flex items-center gap-1 font-label-sm text-label-sm font-bold text-primary hover:underline"
                  >
                    {EMAIL_SUPORTE}
                    <Icon name="arrow_forward" size={14} />
                  </a>
                </div>
              </div>

              {/* Tutoriais */}
              <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface">
                    <Icon name="smart_display" size={22} className="text-tertiary-container" />
                    Tutoriais Rápidos
                  </h3>
                  <Etiqueta>Em breve</Etiqueta>
                </div>
                {[
                  { tipo: "Vídeo · 3 min", titulo: "Dominando o Racha+", texto: "Como criar o primeiro grupo e vincular tarefas.", icone: "play_arrow", fundo: "bg-gradient-to-br from-primary-fixed to-primary-fixed-dim" },
                  { tipo: "Artigo · 5 min", titulo: "Viagem Sem Brigas", texto: "Estratégias práticas para dividir passeios e refeições.", icone: "menu_book", fundo: "bg-gradient-to-br from-tertiary-fixed to-surface-container-high" },
                ].map((tutorial) => (
                  <div key={tutorial.titulo} className="flex gap-3 rounded-lg bg-surface-container-low p-2">
                    <div className={`flex h-16 w-24 shrink-0 items-center justify-center rounded-lg ${tutorial.fundo}`} aria-hidden="true">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-primary shadow-md">
                        <Icon name={tutorial.icone} size={18} filled />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col justify-center gap-0.5">
                      <span className="font-label-sm text-label-sm text-outline">{tutorial.tipo}</span>
                      <h4 className="truncate font-label-md text-label-md text-on-surface">{tutorial.titulo}</h4>
                      <p className="line-clamp-1 font-body-sm text-body-sm text-on-surface-variant">{tutorial.texto}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status dos serviços */}
              <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-high/60 p-space-md">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    Status dos Serviços
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-emerald-700">
                    Operacional
                  </span>
                </div>
                <div className="flex flex-col font-body-sm text-body-sm text-on-surface-variant">
                  {[
                    { nome: "Pix Copia e Cola", icone: "sync_alt" },
                    { nome: "Notificações Push & E-mail", icone: "notifications_active" },
                    { nome: "Armazenamento de Recibos", icone: "cloud_upload" },
                  ].map((servico, indice, lista) => (
                    <div
                      key={servico.nome}
                      className={`flex items-center justify-between py-1.5 ${indice < lista.length - 1 ? "border-b border-surface-container" : ""}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon name={servico.icone} size={16} className="text-outline" />
                        {servico.nome}
                      </span>
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface">Disponível</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-md">
            <article id="termos" className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm scroll-mt-24 space-y-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Termos de Uso</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                O Racha+ organiza o cálculo e o registro colaborativo de despesas entre participantes de um grupo. Cada usuário é responsável pela exatidão dos valores lançados e pela quitação externa via Pix junto ao recebedor.
              </p>
            </article>
            <article id="privacidade" className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm scroll-mt-24 space-y-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Política de Privacidade</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Seus dados cadastrais e chaves Pix são usados exclusivamente para identificação nos grupos e instruções de acerto entre participantes, sem venda ou compartilhamento externo.
              </p>
            </article>
          </section>
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
    <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
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
      corSelo: "bg-primary-fixed text-primary",
      preco: "R$ 12",
      periodo: "/mês ou R$ 80/ano",
      itens: ["Até 15 grupos ativos", "Armazenamento de 500 comprovantes em HD", "Exportação completa em PDF e Excel"],
      fundo: "bg-surface-container-low",
      acao: "Ver detalhes",
      destaque: false,
    },
    {
      nome: "Plano Pro+",
      selo: "Ilimitado",
      corSelo: "bg-tertiary-container text-on-tertiary",
      preco: "R$ 20",
      periodo: "/mês ou R$ 200/ano",
      itens: ["Grupos ilimitados e membros sem teto", "Comprovantes e fotos sem limite", "Conciliação bancária assistida via IA"],
      fundo: "bg-surface-container",
      acao: "Assinar Pro+",
      destaque: true,
    },
  ];

  return (
    <>
      <p>
        O plano {forte("Gratuito")} já oferece criação de grupos e divisão padrão. Para quem precisa de mais poder de
        organização, oferecemos:
      </p>
      <div className="grid grid-cols-1 gap-space-sm md:grid-cols-2">
        {planos.map((plano) => (
          <div key={plano.nome} className={`flex flex-col justify-between gap-space-sm rounded-xl p-space-md ${plano.fundo}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-label-lg text-on-surface">{plano.nome}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${plano.corSelo}`}>{plano.selo}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-numeric-stat text-numeric-stat text-on-surface">{plano.preco}</span>
                <span className="font-body-sm text-body-sm">{plano.periodo}</span>
              </div>
              <ul className="mt-3 space-y-1.5 font-body-sm text-body-sm">
                {plano.itens.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Icon name="check" size={16} className="shrink-0 text-primary-container" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => navigate("/assinatura")}
              className={`mt-2 rounded-lg px-3 py-2 text-center font-label-md text-label-md transition-colors ${
                plano.destaque
                  ? "bg-primary-container text-on-primary shadow-sm hover:bg-primary"
                  : "bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary"
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
