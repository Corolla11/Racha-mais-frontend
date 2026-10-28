import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  Wallet,
  ExternalLink,
  FileScan,
  Home,
  Lightbulb,
  Mail,
  MessageCircle,
  MessagesSquare,
  PlayCircle,
  Plus,
  QrCode,
  Repeat,
  ScanLine,
  Search,
  ShieldCheck,
  Smile,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Users,
  Headset,
  Zap,
  Hand,
} from "lucide-react";

import Aba from "../components/aba-perfil";

type Categoria = "all" | "ia" | "pix" | "lembretes" | "seguranca" | "grupos";

interface Pergunta {
  id: string;
  pergunta: string;
  texto: string;
  conteudo: ReactNode;
}

interface GrupoFaq {
  id: string;
  titulo: string;
  icone: ReactNode;
  corIcone: string;
  categorias: Categoria[];
  itens: Pergunta[];
}

const filtros: { id: Categoria; nome: string }[] = [
  { id: "all", nome: "Todas as dúvidas" },
  { id: "ia", nome: "Divisão com IA ✨" },
  { id: "pix", nome: "Pagamentos & Pix" },
  { id: "lembretes", nome: "Cobrança sem Constrangimento" },
  { id: "seguranca", nome: "Segurança & Privacidade" },
  { id: "grupos", nome: "Grupos & Participantes" },
];

const populares = [
  {
    alvo: "faq-ia-1",
    icone: <FileScan size={22} />,
    hover: "group-hover:bg-primary group-hover:text-text-primary",
    cor: "text-tertiary",
    bolha: "bg-primary/10",
    titulo: "Como a IA divide os gastos automaticamente?",
    texto:
      "Envie foto da nota fiscal ou digite em linguagem livre. O motor OCR e IA extrai itens, taxas de serviço e divide com precisão.",
    cta: "Ler explicação",
  },
  {
    alvo: "faq-pix-2",
    icone: <ShieldCheck size={22} />,
    hover: "group-hover:bg-secondary group-hover:text-white",
    cor: "text-secondary",
    bolha: "bg-blue-100/60",
    titulo: "Existe alguma taxa ou cobrança escondida?",
    texto:
      "Zero mensalidades ocultas. O Pix é transferido de participante para recebedor sem intermediação ou retenção percentual.",
    cta: "Ver política de taxas",
  },
  {
    alvo: "faq-lembrete-1",
    icone: <Smile size={22} />,
    hover: "group-hover:bg-primary group-hover:text-text-primary",
    cor: "text-tertiary",
    bolha: "bg-primary/10",
    titulo: "Como funcionam os lembretes educados via WhatsApp?",
    texto:
      "O bot do Racha+ assume o papel chato de cobrar. Envia mensagens cordiais com resumo claro e link Pix Copia e Cola.",
    cta: "Exemplos de lembretes",
  },
  {
    alvo: "faq-pix-1",
    icone: <Building2 size={22} />,
    hover: "group-hover:bg-primary group-hover:text-text-primary",
    cor: "text-tertiary",
    bolha: "bg-blue-100/60",
    titulo: "Preciso ter conta no mesmo banco que meus amigos?",
    texto:
      "Não! Usamos o protocolo aberto do Banco Central. Qualquer banco ou carteira digital (Nubank, Itaú, Inter, etc.) funciona normalmente.",
    cta: "Ver compatibilidade",
  },
];

const grupos: GrupoFaq[] = [
  {
    id: "g1",
    titulo: "1. Primeiros Passos e Criação de Grupos",
    icone: <UserPlus size={19} />,
    corIcone: "text-secondary",
    categorias: ["grupos", "ia"],
    itens: [
      {
        id: "faq-grupo-1",
        pergunta:
          "Preciso que todos os meus amigos tenham cadastro para pagar a cota?",
        texto:
          "cadastro link whatsapp organizador convidados pix copia e cola qr code sem app senha",
        conteudo: (
          <>
            <p>
              <strong className="font-semibold text-text-primary">
                Absolutamente não!
              </strong>{" "}
              Essa é uma das principais facilidades do Racha+. Apenas o
              organizador do evento, churrasco ou república precisa criar a
              sala.
            </p>
            <p>
              Os demais convidados recebem um link seguro único via WhatsApp.
              Ao abrir no navegador do celular, eles já visualizam a
              discriminação dos itens, valor devido individual e a chave Pix
              (com botão direto de "Copia e Cola" ou QR Code dinâmico).
            </p>
            <div className="flex items-center gap-3 rounded-xl bg-input p-4">
              <Zap size={22} className="shrink-0 text-secondary" />
              <span className="text-[13px] text-text-primary">
                Zero fricção: sem baixar app na hora, sem formulários cansativos
                ou cadastros com senhas.
              </span>
            </div>
          </>
        ),
      },
      {
        id: "faq-grupo-2",
        pergunta:
          "Posso criar divisões desiguais (ex: quem não bebe paga menos)?",
        texto:
          "divisão desigual consumo exclusão item cotas peso percentual cerveja bebida",
        conteudo: (
          <>
            <p>
              Sim, de maneira super simples! O Racha+ oferece suporte completo
              a divisões por consumo individualizado, cotas ponderadas ou
              proporção customizada.
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-4">
              <li>
                <strong className="font-semibold text-text-primary">
                  Exclusão por item:
                </strong>{" "}
                marque que cerveja e drinques são divididos somente entre quem
                consumiu bebidas alcoólicas.
              </li>
              <li>
                <strong className="font-semibold text-text-primary">
                  Cotas por peso:
                </strong>{" "}
                atribua pesos diferentes (ex: hóspedes de casal vs. solteiro no
                aluguel da casa de praia).
              </li>
              <li>
                <strong className="font-semibold text-text-primary">
                  Divisão por percentual:
                </strong>{" "}
                defina porcentagens de rateio personalizadas com total
                transparência para o grupo.
              </li>
            </ul>
          </>
        ),
      },
      {
        id: "faq-ia-1",
        pergunta:
          "Como o escaneamento de nota fiscal e texto livre por IA funciona?",
        texto:
          "ia nota fiscal cupom foto pdf ocr itens taxas gorjeta frete atribuição texto livre churrasco",
        conteudo: (
          <>
            <p>
              Basta tirar uma foto do cupom fiscal da compra do supermercado ou
              do restaurante, ou encaminhar o comprovante em PDF. Nosso modelo
              de visão computacional e linguagem extrai:
            </p>
            <div className="grid grid-cols-1 gap-3 py-1 sm:grid-cols-3">
              {[
                ["Etapa 1", "Leitura de Itens", "Nome, valor unitário e quantidade exata"],
                ["Etapa 2", "Taxas e Gorjeta", "Rateio justo dos 10% ou frete"],
                ["Etapa 3", "Atribuição", "Toque no nome dos amigos que consumiram"],
              ].map(([etapa, titulo, texto]) => (
                <div
                  key={etapa}
                  className="flex flex-col gap-1 rounded-xl bg-input p-3 text-center"
                >
                  <span className="text-[11px] font-semibold uppercase text-secondary">
                    {etapa}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {titulo}
                  </span>
                  <span className="text-[13px]">{texto}</span>
                </div>
              ))}
            </div>
            <p>
              Você também pode simplesmente digitar:{" "}
              <em className="rounded bg-input px-2 py-0.5 font-normal text-text-primary">
                "Gastei R$ 180 no churrasco ontem, carne com Leo e cerveja
                comigo e Julia"
              </em>{" "}
              e a IA monta o rateio pronto para revisão.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "g2",
    titulo: "2. Pagamentos, Pix e Confirmação Automática",
    icone: <Wallet size={19} />,
    corIcone: "text-tertiary",
    categorias: ["pix", "seguranca"],
    itens: [
      {
        id: "faq-pix-1",
        pergunta: "O dinheiro das contas passa pela conta bancária do Racha+?",
        texto:
          "dinheiro conta bancária intermediário saldo pix direto segurança banco compatibilidade nubank itaú inter taxa",
        conteudo: (
          <>
            <p>
              <strong className="font-semibold text-text-primary">Não!</strong>{" "}
              Para garantir total segurança e transparência financeira, nós não
              somos intermediários nem retemos o saldo dos usuários.
            </p>
            <p>
              O dinheiro vai diretamente da conta bancária de quem deve para a
              chave Pix de quem pagou a despesa original. O Racha+ atua como
              orquestrador inteligente que gera a cobrança Pix correta (com
              centavos exatos para fácil identificação) e gerencia o status de
              conciliação.
            </p>
          </>
        ),
      },
      {
        id: "faq-pix-2",
        pergunta:
          "Como o Racha+ sabe que uma pessoa já realizou o pagamento?",
        texto:
          "pagamento conciliação comprovante upload open finance bacen baixa confirmação organizador recebido taxa escondida",
        conteudo: (
          <>
            <p>Existem 3 formas ultra-rápidas de conciliação no sistema:</p>
            <div className="flex flex-col gap-3">
              {[
                [
                  <ScanLine key="i" size={19} />,
                  "Upload de Comprovante:",
                  "O pagador envia o print ou PDF do comprovante bancário no link. Nossa IA lê o ID de transação Pix e valida instantaneamente.",
                ],
                [
                  <Hand key="i" size={19} />,
                  "Confirmação em 1 Toque pelo Organizador:",
                  'O organizador recebe uma notificação instantânea e pode marcar como "Recebido" direto no app ou pelo WhatsApp.',
                ],
                [
                  <Repeat key="i" size={19} />,
                  "Open Finance Bacen (Opcional):",
                  "Para quem conectar a conta bancária via Open Finance, a baixa é 100% automatizada e imediata no painel.",
                ],
              ].map(([icone, titulo, texto]) => (
                <div key={titulo as string} className="flex items-start gap-3">
                  <span className="mt-0.5 text-secondary">{icone}</span>
                  <div>
                    <strong className="font-semibold text-text-primary">
                      {titulo}
                    </strong>
                    <p className="text-[13px]">{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: "g3",
    titulo: "3. Lembretes e Cobranças Amigáveis",
    icone: <MessageCircle size={19} />,
    corIcone: "text-tertiary",
    categorias: ["lembretes", "seguranca"],
    itens: [
      {
        id: "faq-lembrete-1",
        pergunta: "Meus amigos vão se incomodar com a mensagem do WhatsApp?",
        texto:
          "lembrete whatsapp bot mensagem educada constrangimento climão exemplo notificação pizza",
        conteudo: (
          <>
            <p>
              Desenvolvemos a inteligência de lembretes justamente para acabar
              com o "climão". O bot do Racha+ se apresenta com tom descontraído
              e educado, sem culpabilizar ninguém.
            </p>
            <div className="flex flex-col gap-2 rounded-xl bg-input p-4 text-text-primary">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-secondary">
                  Exemplo de Notificação Real
                </span>
                <span className="text-[11px] text-text-secondary">
                  WhatsApp Oficial
                </span>
              </div>

              <div className="flex flex-col gap-2 rounded-xl bg-surface p-4 text-[13px] shadow-sm">
                <p>
                  "Oi Leo! Tudo bem? Aqui é o bot do <strong>Racha+</strong> 🍕
                  Passando rapidinho para avisar que a cota da pizza de sexta
                  com a galera deu <strong>R$ 34,50</strong>."
                </p>
                <p>
                  "Segue a chave Pix Copia e Cola facilitada para acertar
                  direto com o Gui em 10 segundos: [Link Seguro]"
                </p>
              </div>
            </div>
            <p>
              O destinatário tem o conforto de conferir a conta e pagar sem
              cobrança constrangedora feita diretamente por uma pessoa física.
            </p>
          </>
        ),
      },
      {
        id: "faq-lembrete-2",
        pergunta: "Como pausar ou personalizar os horários dos lembretes?",
        texto:
          "pausar personalizar horário lembretes silencioso frequência configurações do grupo diária vencimento",
        conteudo: (
          <>
            <p>
              Você tem total controle. Dentro de qualquer grupo criado, acesse
              as <em>Configurações do Grupo &gt; Lembretes Inteligentes</em>.
              Você pode:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-4">
              <li>
                Definir <strong>horário silencioso</strong> (por exemplo,
                nenhum lembrete após as 20h ou antes das 10h).
              </li>
              <li>
                Escolher a <strong>frequência</strong>: diária, a cada 3 dias
                ou somente no dia do vencimento estipulado.
              </li>
              <li>
                Pausar individualmente para participantes que você já sabe que
                irão pagar em outra data.
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
];

const statusSistema = [
  { icone: <QrCode size={16} />, nome: "Motor Pix & Bacen", valor: "Operando normal" },
  { icone: <Bot size={16} />, nome: "IA de Leitura de Recibos", valor: "0.4s latência" },
  { icone: <MessagesSquare size={16} />, nome: "Disparo WhatsApp API", valor: "Sem filas" },
];

function Faq() {
  const navigate = useNavigate();

  const [abaAberta, setAbaAberta] = useState(false);
  const [categoria, setCategoria] = useState<Categoria>("all");
  const [busca, setBusca] = useState("");
  const [abertos, setAbertos] = useState<string[]>(["faq-grupo-1"]);
  const [destaque, setDestaque] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(false);

  const termo = busca.trim().toLowerCase();

  function alternar(id: string) {
    setAbertos((lista) =>
      lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id],
    );
  }

  function irPara(id: string) {
    setCategoria("all");
    setBusca("");
    setAbertos((lista) => (lista.includes(id) ? lista : [...lista, id]));
    setDestaque(id);

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);

    setTimeout(() => setDestaque(null), 2000);
  }

  const gruposVisiveis = grupos
    .filter((g) => categoria === "all" || g.categorias.includes(categoria))
    .map((g) => ({
      ...g,
      itens: termo
        ? g.itens.filter((p) =>
            `${p.pergunta} ${p.texto}`.toLowerCase().includes(termo),
          )
        : g.itens,
    }))
    .filter((g) => g.itens.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-surface px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3F6FA]">
            <span className="text-xs font-bold text-secondary">R+</span>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">Racha+</p>

            <p className="text-[9px] text-text-secondary">
              Divisão Inteligente
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <button
            type="button"
            onClick={() => navigate("/meus-grupos")}
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Meus Grupos
          </button>

          <button
            type="button"
            onClick={() => navigate("/criar-grupo")}
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Criar com IA
          </button>

          <button
            type="button"
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Histórico &amp; Pix
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="text-xs text-gray-700 transition hover:text-secondary"
          >
            Perfil
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/criar-grupo")}
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-text-primary transition hover:bg-tertiary hover:text-white sm:flex"
          >
            <Plus size={14} />
            Novo Grupo
          </button>

          <button
            type="button"
            aria-label="Notificações"
            onClick={() => navigate("/notificacoes")}
            className="relative text-gray-600"
          >
            <Bell size={17} />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAbaAberta(!abaAberta)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
            >
              <img
                src="https://i.pravatar.cc/100?img=47"
                alt="Foto de perfil"
                className="h-9 w-9 rounded-full object-cover"
              />

              <div className="hidden text-left xl:block">
                <p className="text-xs font-semibold">Mariana S.</p>

                <p className="text-[9px] text-text-secondary">Online</p>
              </div>

              <ChevronDown
                size={15}
                className={`text-gray-500 transition-transform ${
                  abaAberta ? "rotate-180" : ""
                }`}
              />
            </button>

            {abaAberta && <Aba />}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="relative w-full flex-1 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[-8rem] -z-0 h-72 w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 via-blue-200/20 to-transparent blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-6 py-8">
          {/* HERO */}
          <section className="mx-auto flex w-full max-w-[880px] flex-col items-center gap-6 text-center">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-text-secondary"
            >
              <button
                type="button"
                onClick={() => navigate("/meus-grupos")}
                className="flex items-center gap-1 transition hover:text-tertiary"
              >
                <Home size={14} />
                Início
              </button>
              <span className="text-gray-300">/</span>
              <span>Central de Ajuda</span>
              <span className="text-gray-300">/</span>
              <span className="rounded-full bg-input px-2 py-0.5 font-semibold text-text-primary">
                Perguntas Frequentes (FAQ)
              </span>
            </nav>

            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-[11px] font-semibold text-secondary shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Central de Conhecimento Racha+ 2.0
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Como podemos ajudar você hoje?
              </h1>

              <p className="max-w-[640px] text-base text-text-secondary">
                Tudo o que você precisa saber sobre divisão com IA, liquidação
                instantânea via Pix, cálculo de contas e cobranças sem atrito
                entre amigos.
              </p>
            </div>

            <div className="relative mt-2 flex w-full items-center rounded-xl bg-surface p-2 shadow-md transition focus-within:shadow-xl">
              <Search size={24} className="ml-3 shrink-0 text-secondary" />

              <input
                type="text"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === "Escape") setBusca("");
                }}
                aria-label="Buscar na central de ajuda"
                placeholder="Buscar por dúvida, funcionalidade ou palavra-chave... ex: taxa, Pix, recibo..."
                className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
              />

              <div className="hidden items-center gap-2 pr-2 sm:flex">
                <span className="whitespace-nowrap rounded-lg bg-input px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  ESC para limpar
                </span>

                <button
                  type="button"
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-tertiary hover:text-white active:scale-95"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-2 pt-2">
              {filtros.map((item) => {
                const ativo = categoria === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategoria(item.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                      ativo
                        ? "bg-secondary text-white"
                        : "bg-surface text-text-secondary hover:bg-input hover:text-text-primary"
                    }`}
                  >
                    {item.nome}
                  </button>
                );
              })}
            </div>
          </section>

          {/* TÓPICOS POPULARES */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={22} className="fill-primary text-primary" />

                <h2 className="text-xl font-semibold tracking-tight">
                  Tópicos mais consultados
                </h2>
              </div>

              <span className="rounded-full bg-input px-3 py-1 text-[11px] font-semibold text-text-secondary">
                Atualizado em tempo real
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {populares.map((card) => (
                <button
                  key={card.alvo}
                  type="button"
                  onClick={() => irPara(card.alvo)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface p-6 text-left shadow-sm transition hover:shadow-md"
                >
                  <div
                    className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full transition-transform group-hover:scale-150 ${card.bolha}`}
                  />

                  <div className="z-10 flex flex-col gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-input transition-colors ${card.cor} ${card.hover}`}
                    >
                      {card.icone}
                    </div>

                    <h3 className="line-clamp-2 text-[17px] font-semibold">
                      {card.titulo}
                    </h3>

                    <p className="text-[13px] text-text-secondary">
                      {card.texto}
                    </p>
                  </div>

                  <div className="z-10 flex items-center gap-1 pt-4 text-xs font-semibold text-secondary transition-transform group-hover:translate-x-1">
                    {card.cta}
                    <ArrowRight size={15} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ACORDEÃO + LATERAL */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="flex w-full flex-col gap-8 lg:col-span-8">
              {gruposVisiveis.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl bg-surface p-12 text-center shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-input text-secondary">
                    <Search size={22} />
                  </div>

                  <h3 className="text-base font-semibold">
                    Nenhuma dúvida encontrada
                  </h3>

                  <p className="max-w-md text-xs text-text-secondary">
                    Tente outra palavra-chave ou fale com nosso time de suporte
                    ao lado.
                  </p>
                </div>
              )}

              {gruposVisiveis.map((grupo) => (
                <div key={grupo.id} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 pb-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-surface ${grupo.corIcone}`}
                    >
                      {grupo.icone}
                    </div>

                    <h3 className="text-lg font-semibold">{grupo.titulo}</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    {grupo.itens.map((item) => {
                      const aberto = termo
                        ? true
                        : abertos.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          id={item.id}
                          className={`overflow-hidden rounded-xl bg-surface shadow-sm transition ${
                            destaque === item.id ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <button
                            type="button"
                            aria-expanded={aberto}
                            onClick={() => alternar(item.id)}
                            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-input/60"
                          >
                            <span className="text-[17px] font-semibold">
                              {item.pergunta}
                            </span>

                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-input text-secondary transition-transform duration-200 ${
                                aberto ? "rotate-180" : ""
                              }`}
                            >
                              <ChevronDown size={19} />
                            </span>
                          </button>

                          {aberto && (
                            <div className="flex flex-col gap-4 px-6 pb-6 pt-1 text-sm text-text-secondary">
                              {item.conteudo}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4">
              <div className="flex flex-col gap-5 rounded-xl bg-surface p-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-text-primary shadow-sm">
                    <Headset size={26} />
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-[17px] font-semibold">
                      Não encontrou o que procurava?
                    </h3>
                    <span className="text-[11px] text-text-secondary">
                      Nosso time humano responde rápido
                    </span>
                  </div>
                </div>

                <p className="text-sm text-text-secondary">
                  Tire dúvidas complexas sobre rateio de empresas, eventos
                  grandes ou integração bancária com nossa equipe de suporte.
                </p>

                <div className="flex flex-col gap-3">
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
                  >
                    <MessageCircle size={19} />
                    Falar via WhatsApp
                  </a>

                  <a
                    href="mailto:suporte@racha.plus"
                    className="flex w-full items-center justify-between rounded-xl bg-input px-4 py-3 text-left text-sm font-semibold transition hover:bg-background"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={19} className="text-secondary" />

                      <div className="flex flex-col">
                        <span className="leading-none">suporte@racha.plus</span>
                        <span className="mt-0.5 text-[11px] font-normal text-text-secondary">
                          Resposta em ~15 minutos
                        </span>
                      </div>
                    </div>

                    <ExternalLink size={15} className="text-gray-400" />
                  </a>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {[
                    { icone: <PlayCircle size={18} />, nome: "Guia em vídeo de 2 minutos" },
                    { icone: <Users size={18} />, nome: "Comunidade & Dicas de Usuários" },
                  ].map((link) => (
                    <button
                      key={link.nome}
                      type="button"
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-text-secondary transition hover:bg-input hover:text-text-primary"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-secondary">{link.icone}</span>
                        {link.nome}
                      </span>

                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#2E7D32]" />

                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Status do Ecossistema
                    </span>
                  </div>

                  <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[11px] font-semibold text-[#2E7D32]">
                    100% Operacional
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-1 text-[13px] text-text-secondary">
                  {statusSistema.map((s) => (
                    <div key={s.nome} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="text-secondary">{s.icone}</span>
                        {s.nome}
                      </span>

                      <span className="font-medium text-text-primary">
                        {s.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl bg-gradient-to-br from-input to-blue-100/70 p-5">
                <div className="flex items-center gap-2 text-xs text-tertiary">
                  <Lightbulb size={19} />
                  <span className="font-semibold">Dica Racha+ Pro</span>
                </div>

                <p className="text-[13px] text-text-secondary">
                  Em viagens longas, adicione despesas à medida que ocorrem. Ao
                  final, a ferramenta calcula a{" "}
                  <strong>compensação mínima de transferências</strong>,
                  evitando que todos façam dezenas de Pix entre si!
                </p>
              </div>
            </aside>
          </div>

          {/* FEEDBACK */}
          <section className="mt-4 flex flex-col items-center justify-between gap-4 rounded-xl bg-surface p-6 text-center shadow-sm sm:flex-row sm:text-left">
            <div className="flex flex-col gap-1">
              <h4 className="text-[17px] font-semibold">
                Esta página foi útil para você?
              </h4>

              <p className="text-[13px] text-text-secondary">
                Seu feedback nos ajuda a aprimorar as respostas e
                funcionalidades do Racha+.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {feedback ? (
                <span className="inline-flex items-center gap-2 rounded-xl bg-input px-4 py-2 text-xs font-semibold">
                  <CircleCheckBig size={18} className="text-[#2E7D32]" />
                  Obrigado pelo seu feedback!
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setFeedback(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-input px-4 py-2 text-xs font-semibold transition hover:bg-background active:scale-95"
                  >
                    <ThumbsUp size={17} className="text-tertiary" />
                    Sim, ajudou
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedback(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-input px-4 py-2 text-xs font-semibold transition hover:bg-background active:scale-95"
                  >
                    <ThumbsDown size={17} className="text-text-secondary" />
                    Ainda tenho dúvidas
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="mt-12 w-full bg-surface py-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-secondary">Racha+</span>

            <span className="text-xs text-text-secondary">
              • Organização descomplicada de despesas e tarefas coletivas
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary">
            <button type="button" className="transition hover:text-secondary">
              Sobre
            </button>

            <button type="button" className="transition hover:text-secondary">
              Segurança Pix
            </button>

            <button type="button" className="transition hover:text-secondary">
              Privacidade
            </button>

            <span>© 2025 Racha+. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Faq;
