import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlarmClock,
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  BellRing,
  ChartColumn,
  CheckCheck,
  CheckCircle2,
  CircleAlert,
  CircleCheckBig,
  ClipboardList,
  Clock,
  Copy,
  ExternalLink,
  FolderArchive,
  HandCoins,
  Inbox,
  Info,
  Lightbulb,
  ListTodo,
  Mail,
  MessageCircle,
  PartyPopper,
  QrCode,
  RadioTower,
  Receipt,
  ReceiptText,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  UserPlus,
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
  onPrimaryFixed: "#331200",

  secondary: "#ab3425",
  secondaryFixed: "#ffdad4",

  tertiary: "#855300",
  tertiaryContainer: "#ed9800",
  tertiaryFixed: "#ffddb8",
  onTertiaryFixed: "#2a1700",

  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",

  surfaceLowest: "#ffffff",
  surfaceLow: "#eff4ff",
  surfaceContainer: "#e6eeff",
  surfaceHigh: "#dee9fc",
  surfaceHighest: "#d9e3f6",

  onSurface: "#121c2a",
  onSurfaceVariant: "#564338",
  inverseSurface: "#27313f",
  inverseOnSurface: "#eaf1ff",
};

/* =====================================================
   DADOS DEMONSTRATIVOS
====================================================== */

type Categoria = "invites" | "payments" | "tasks" | "system";
type Secao = "Hoje" | "Ontem" | "Esta Semana";
type Tom = "primary" | "tertiary" | "secondary";

type Acao =
  | { tipo: "comprovante" }
  | { tipo: "convite" }
  | { tipo: "tarefa" }
  | { tipo: "pix" }
  | { tipo: "relatorio" };

interface Notificacao {
  id: number;
  secao: Secao;
  categoria: Categoria;
  lida: boolean;
  tom: Tom;
  icone: LucideIcon;
  titulo: string;
  selo: string;
  corSelo: { fundo: string; texto: string };
  descricao: ReactNode;
  quando: string;
  acao?: Acao;
  resolvida?: string;
}

const TONS: Record<Tom, { borda: string; fundoIcone: string; corIcone: string }> = {
  primary: { borda: C.primaryContainer, fundoIcone: `${C.primaryFixedDim}66`, corIcone: C.primary },
  tertiary: { borda: C.tertiaryContainer, fundoIcone: C.tertiaryFixed, corIcone: C.tertiary },
  secondary: { borda: C.secondary, fundoIcone: C.secondaryFixed, corIcone: C.secondary },
};

const SELO_NEUTRO = { fundo: C.surfaceContainer, texto: C.onSurfaceVariant };
const SELO_ALERTA = { fundo: C.errorContainer, texto: C.onErrorContainer };

const destaque = (texto: string) => (
  <strong className="font-semibold" style={{ color: C.onSurface }}>
    {texto}
  </strong>
);

const NOTIFICACOES_INICIAIS: Notificacao[] = [
  {
    id: 1,
    secao: "Hoje",
    categoria: "payments",
    lida: false,
    tom: "primary",
    icone: QrCode,
    titulo: "Pagamento Informado — Viagem Florianópolis",
    selo: "Pix Pendente",
    corSelo: { fundo: C.surfaceHigh, texto: C.onSurfaceVariant },
    descricao: (
      <>
        {destaque("Mariana S.")} informou o pagamento de{" "}
        <span className="font-semibold" style={{ color: C.primary }}>R$ 112,50</span>{" "}
        referente à tarefa {destaque("“Comprar bebidas, gelo e carvão”")}.
      </>
    ),
    quando: "Há 15 minutos",
    acao: { tipo: "comprovante" },
  },
  {
    id: 2,
    secao: "Hoje",
    categoria: "invites",
    lida: false,
    tom: "tertiary",
    icone: PartyPopper,
    titulo: "Novo Convite — Churrasco de Aniversário do Leo",
    selo: "Grupo Privado",
    corSelo: { fundo: C.tertiaryFixed, texto: C.onTertiaryFixed },
    descricao: (
      <>
        {destaque("Leo M.")} convidou você para integrar o rateio coletivo com{" "}
        {destaque("8 participantes confirmados")}. Cota estimada: R$ 65,00 por
        pessoa.
      </>
    ),
    quando: "Há 1 hora",
    acao: { tipo: "convite" },
  },
  {
    id: 3,
    secao: "Hoje",
    categoria: "tasks",
    lida: false,
    tom: "secondary",
    icone: AlarmClock,
    titulo: "Lembrete de Prazo — Alugar carro 7 lugares",
    selo: "Vence amanhã",
    corSelo: SELO_ALERTA,
    descricao: (
      <>
        O prazo da tarefa atribuída a você no grupo{" "}
        {destaque("“Viagem Florianópolis”")} encerra amanhã às{" "}
        {destaque("11:30")}. Após a reserva, anexe o comprovante com o valor
        total estimado.
      </>
    ),
    quando: "Há 3 horas",
    acao: { tipo: "tarefa" },
  },
  {
    id: 4,
    secao: "Ontem",
    categoria: "payments",
    lida: false,
    tom: "primary",
    icone: HandCoins,
    titulo: "Cota Pendente — Apê 302 República",
    selo: "Cobrança",
    corSelo: SELO_ALERTA,
    descricao: (
      <>
        {destaque("Lucas M.")} solicitou o acerto da sua cota de{" "}
        <strong className="text-base font-bold" style={{ color: C.onSurface }}>R$ 85,00</strong>{" "}
        referente ao fechamento da fatura {destaque("“Internet Fibra 600MB”")}.
      </>
    ),
    quando: "Ontem às 18:40",
    acao: { tipo: "pix" },
  },
  {
    id: 5,
    secao: "Ontem",
    categoria: "payments",
    lida: true,
    tom: "primary",
    icone: CheckCircle2,
    titulo: "Pagamento Confirmado!",
    selo: "Liquidado",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        {destaque("Rodrigo M.")} confirmou o recebimento do seu pagamento de{" "}
        {destaque("R$ 70,00")} na tarefa <span className="italic">“Passagens de Balsa”</span>.
        Seu saldo no grupo agora está zerado.
      </>
    ),
    quando: "Ontem às 14:15",
  },
  {
    id: 6,
    secao: "Ontem",
    categoria: "tasks",
    lida: true,
    tom: "primary",
    icone: CircleCheckBig,
    titulo: "Tarefa Finalizada",
    selo: "Concluído",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        {destaque("Carla T.")} marcou {destaque("“Check-in na casa do Airbnb”")}{" "}
        como concluída no grupo {destaque("Viagem Florianópolis")}. As
        instruções de entrada estão no chat do grupo.
      </>
    ),
    quando: "Ontem às 10:20",
  },
  {
    id: 7,
    secao: "Esta Semana",
    categoria: "system",
    lida: true,
    tom: "primary",
    icone: FolderArchive,
    titulo: "Grupo Encerrado — Viagem Serra da Canastra",
    selo: "100% Liquidado",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        O grupo foi liquidado com total conformidade entre todos os 6 membros
        e movido para o arquivo de histórico. O balanço final de R$ 2.450,00
        está fechado.
      </>
    ),
    quando: "Terça, 21 Mai",
    acao: { tipo: "relatorio" },
  },
  {
    id: 8,
    secao: "Esta Semana",
    categoria: "system",
    lida: true,
    tom: "primary",
    icone: ShieldAlert,
    titulo: "Segurança da Conta",
    selo: "Dispositivo",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        Novo acesso autenticado detectado utilizando navegador{" "}
        {destaque("Chrome no macOS")} em {destaque("Florianópolis, SC")} (IP
        177.136.**.**). Se você não reconhece esta sessão, revogue
        imediatamente o acesso nas configurações.
      </>
    ),
    quando: "Seg, 20 Mai",
  },
];

const FILTROS: { id: Categoria | "all"; nome: string; icone: LucideIcon }[] = [
  { id: "all", nome: "Todas", icone: Inbox },
  { id: "invites", nome: "Convites de Grupos", icone: UserPlus },
  { id: "payments", nome: "Pagamentos & Pix", icone: Banknote },
  { id: "tasks", nome: "Tarefas & Prazos", icone: ListTodo },
  { id: "system", nome: "Avisos do Sistema", icone: Shield },
];

const SECOES: Secao[] = ["Hoje", "Ontem", "Esta Semana"];

const CODIGO_PIX =
  "00020126580014br.gov.bcb.pix0136lucas.moura@racha.app520400005303986540585.005802BR5913Lucas Moura6009SAO PAULO62070503***6304E5F6";

function dataPorExtenso(diasAtras: number) {
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  return data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

type Modal = "comprovante" | "pix" | "tarefa" | "configuracoes" | null;

export default function Notificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);
  const [filtro, setFiltro] = useState<Categoria | "all">("all");
  const [modal, setModal] = useState<Modal>(null);
  const [aviso, setAviso] = useState("");
  const [canais, setCanais] = useState({ push: true, whatsapp: true, email: true });

  // Esconde o aviso depois de alguns segundos
  useEffect(() => {
    if (!aviso) return;
    const id = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(id);
  }, [aviso]);

  // Fecha modais com Esc
  useEffect(() => {
    if (!modal) return;
    function aoPressionar(event: KeyboardEvent) {
      if (event.key === "Escape") setModal(null);
    }
    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [modal]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const contagem = useMemo(() => {
    const total: Record<string, { total: number; naoLidas: number }> = {};
    for (const item of FILTROS) total[item.id] = { total: 0, naoLidas: 0 };
    for (const n of notificacoes) {
      for (const chave of ["all", n.categoria]) {
        total[chave].total++;
        if (!n.lida) total[chave].naoLidas++;
      }
    }
    return total;
  }, [notificacoes]);

  const visiveis = notificacoes.filter((n) => filtro === "all" || n.categoria === filtro);

  function atualizar(id: number, mudancas: Partial<Notificacao>) {
    setNotificacoes((anteriores) =>
      anteriores.map((n) => (n.id === id ? { ...n, ...mudancas } : n)),
    );
  }

  function marcarTodasComoLidas() {
    setNotificacoes((anteriores) => anteriores.map((n) => ({ ...n, lida: true })));
    setAviso("Todas as notificações foram marcadas como lidas.");
  }

  function confirmarRecebimento() {
    atualizar(1, { lida: true, resolvida: "Recebimento confirmado" });
    setModal(null);
    setAviso("Pagamento de Mariana S. (R$ 112,50) confirmado.");
  }

  function responderConvite(aceito: boolean) {
    atualizar(2, { lida: true, resolvida: aceito ? "Convite aceito" : "Convite recusado" });
    setAviso(aceito ? "Você entrou no grupo Churrasco de Aniversário do Leo." : "Convite recusado.");
  }

  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(CODIGO_PIX);
      setAviso("Código Pix copiado!");
    } catch {
      setAviso("Não foi possível copiar. Selecione o código manualmente.");
    }
  }

  function notificarPagamento() {
    atualizar(4, { lida: true, resolvida: "Pagamento informado a Lucas M." });
    setModal(null);
    setAviso("Lucas M. foi avisado do seu Pix.");
  }

  function alternarCanal(canal: keyof typeof canais) {
    setCanais((anteriores) => ({ ...anteriores, [canal]: !anteriores[canal] }));
  }

  return (
    <AppShell title="Notificações & Avisos">
      <div className="flex w-full flex-col font-jakarta" style={{ color: C.onSurface }}>
        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: C.primaryFixed, color: C.primary }}
            >
              <BellRing className="h-7 w-7" fill="currentColor" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
                  Notificações e Avisos
                </h1>
                {naoLidas > 0 && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: C.secondary }}
                  >
                    {naoLidas} não {naoLidas === 1 ? "lida" : "lidas"}
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                Acompanhe confirmações Pix, convites de grupos, pendências de
                tarefas e atualizações em tempo real.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={marcarTodasComoLidas}
              disabled={naoLidas === 0}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-[#e6eeff] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-[18px] w-[18px]" style={{ color: C.primary }} />
              Marcar todas como lidas
            </button>
            <button
              type="button"
              onClick={() => setModal("configuracoes")}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-[#e6eeff] active:scale-[0.98]"
            >
              <SlidersHorizontal className="h-[18px] w-[18px]" style={{ color: C.onSurfaceVariant }} />
              Configurar alertas
            </button>
          </div>
        </div>

        {/* =====================================================
            FILTROS
        ====================================================== */}

        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          {FILTROS.map((item) => {
            const Icone = item.icone;
            const ativo = filtro === item.id;
            const dados = contagem[item.id];
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={ativo}
                onClick={() => setFiltro(item.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                  ativo ? "" : "bg-white hover:bg-[#e6eeff] hover:text-[#121c2a]"
                }`}
                style={
                  ativo
                    ? { backgroundColor: C.primaryContainer, color: "#fff" }
                    : { color: C.onSurfaceVariant }
                }
              >
                <Icone className="h-[18px] w-[18px]" />
                <span>
                  {item.nome} ({dados.total})
                </span>
                {item.id !== "all" && dados.naoLidas > 0 && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ativo ? "#fff" : C.secondary }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* =====================================================
              FEED
          ====================================================== */}

          <div className="flex flex-col gap-10 lg:col-span-8">
            {SECOES.map((secao, indice) => {
              const itens = visiveis.filter((n) => n.secao === secao);
              if (itens.length === 0) return null;
              const novas = itens.filter((n) => !n.lida).length;
              return (
                <section key={secao} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold">{secao}</h2>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={
                          novas > 0
                            ? { backgroundColor: C.primaryFixed, color: C.onPrimaryFixed }
                            : { backgroundColor: C.surfaceHighest, color: C.onSurfaceVariant }
                        }
                      >
                        {novas > 0
                          ? `${novas} ${novas === 1 ? "nova" : "novas"}`
                          : `${itens.length} ${itens.length === 1 ? "registro" : "registros"}`}
                      </span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
                      {indice < 2 ? dataPorExtenso(indice) : "Anteriores"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {itens.map((n) => (
                      <CartaoNotificacao
                        key={n.id}
                        notificacao={n}
                        onAbrir={() => !n.lida && atualizar(n.id, { lida: true })}
                      >
                        <AcoesNotificacao
                          notificacao={n}
                          onComprovante={() => setModal("comprovante")}
                          onConfirmar={confirmarRecebimento}
                          onConvite={responderConvite}
                          onTarefa={() => setModal("tarefa")}
                          onPix={() => setModal("pix")}
                          onRelatorio={() =>
                            setAviso("O relatório final ficará disponível no histórico do grupo.")
                          }
                        />
                      </CartaoNotificacao>
                    ))}
                  </div>
                </section>
              );
            })}

            {visiveis.length === 0 && (
              <p
                className="rounded-xl bg-white p-8 text-center text-sm shadow-sm"
                style={{ color: C.onSurfaceVariant }}
              >
                Nenhuma notificação nesta categoria.
              </p>
            )}
          </div>

          {/* =====================================================
              LATERAL
          ====================================================== */}

          <aside className="flex flex-col gap-6 lg:col-span-4">
            {/* Canais ativos */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: C.primaryFixed, color: C.primary }}
                  >
                    <RadioTower className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Canais Ativos</h3>
                </div>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: Object.values(canais).some(Boolean)
                      ? C.primaryContainer
                      : C.surfaceHighest,
                  }}
                />
              </div>
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                Configure os canais integrados para não perder prazos de
                fechamento e repasses.
              </p>
              <ListaCanais canais={canais} onAlternar={alternarCanal} />
              <button
                type="button"
                onClick={() => setModal("configuracoes")}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[#dee9fc]"
                style={{ backgroundColor: C.surfaceContainer }}
              >
                <Settings2 className="h-[18px] w-[18px]" />
                Gerenciar canais
              </button>
            </div>

            {/* Pendências rápidas */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: C.secondaryFixed, color: C.secondary }}
                  >
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Pendências Rápidas</h3>
                </div>
                <span className="text-xs font-bold" style={{ color: C.secondary }}>
                  Ação urgente
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                <Pendencia
                  numero={notificacoes.filter((n) => n.categoria === "invites" && !n.resolvida).length}
                  titulo="Convites de grupo"
                  detalhe="Aguardando sua resposta"
                  fundo={C.tertiaryFixed}
                  cor={C.tertiary}
                  onAbrir={() => setFiltro("invites")}
                />
                <Pendencia
                  numero={notificacoes.find((n) => n.id === 1)?.resolvida ? 0 : 1}
                  titulo="Comprovante de pagamento"
                  detalhe="Aguardando conferência"
                  fundo={C.primaryFixed}
                  cor={C.primary}
                  onAbrir={() => setModal("comprovante")}
                />
                <Pendencia
                  numero={1}
                  titulo="Tarefa com prazo"
                  detalhe="Expira nas próximas 24h"
                  fundo={C.secondaryFixed}
                  cor={C.secondary}
                  onAbrir={() => setModal("tarefa")}
                />
              </div>
            </div>

            {/* Dica */}
            <div
              className="relative flex flex-col gap-3 overflow-hidden rounded-xl p-6 shadow-sm"
              style={{
                background: `linear-gradient(to bottom right, ${C.primaryFixed}, ${C.surfaceLow}, ${C.surfaceContainer})`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: C.primaryContainer }}
                >
                  <Lightbulb className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">Dica Racha+</span>
              </div>
              <p className="text-base font-medium leading-relaxed">
                Ative as notificações do WhatsApp para receber o código Copia e
                Cola do Pix assim que um amigo ratear uma despesa.
              </p>
              <button
                type="button"
                onClick={() => navigate("/faq")}
                className="relative z-10 inline-flex w-fit cursor-pointer items-center gap-1 text-sm font-semibold transition-colors hover:text-[#ff8c42]"
                style={{ color: C.primary }}
              >
                Como funciona a integração
                <ArrowRight className="h-4 w-4" />
              </button>
              <QrCode
                className="pointer-events-none absolute -bottom-2 -right-2 h-12 w-12 select-none"
                style={{ color: `${C.primaryFixedDim}66` }}
                aria-hidden="true"
              />
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          MODAIS
      ====================================================== */}

      {modal === "comprovante" && (
        <JanelaModal titulo="Comprovante de Pagamento" icone={Receipt} onFechar={() => setModal(null)}>
          <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase" style={{ color: C.onSurfaceVariant }}>
                Instituição Bancária
              </span>
              <span className="text-sm font-bold" style={{ color: C.primary }}>Banco Inter S.A.</span>
            </div>
            <div className="h-px" style={{ backgroundColor: C.surfaceContainer }} />
            <div className="flex flex-col">
              <span className="text-xs" style={{ color: C.onSurfaceVariant }}>Valor transferido via Pix</span>
              <span className="text-[1.75rem] font-bold">R$ 112,50</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-xs" style={{ color: C.onSurfaceVariant }}>Pagador</span>
                <span className="text-sm font-semibold">Mariana Silva</span>
              </div>
              <div>
                <span className="block text-xs" style={{ color: C.onSurfaceVariant }}>Destinatário</span>
                <span className="text-sm font-semibold">Você</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg p-2.5" style={{ backgroundColor: C.surfaceLow }}>
              <span className="text-xs" style={{ color: C.onSurfaceVariant }}>Referente ao rateio:</span>
              <span className="text-sm font-medium">“Comprar bebidas, gelo e carvão”</span>
              <span className="text-xs" style={{ color: C.primary }}>Grupo: Viagem Florianópolis</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs" style={{ color: C.onSurfaceVariant }}>
              <span>ID Pix: E00416968202405241420x992</span>
              <span>24/05 • 14:18</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notificacoes.find((n) => n.id === 1)?.resolvida ? (
              <p className="flex-1 text-sm font-semibold" style={{ color: C.tertiary }}>
                Pagamento já confirmado.
              </p>
            ) : (
              <button
                type="button"
                onClick={confirmarRecebimento}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff8c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9b4500]"
              >
                <BadgeCheck className="h-[18px] w-[18px]" />
                Confirmar e Liquidar
              </button>
            )}
            <BotaoSecundario onClick={() => setModal(null)}>Fechar</BotaoSecundario>
          </div>
        </JanelaModal>
      )}

      {modal === "pix" && (
        <JanelaModal titulo="Pagar Cota via Pix" icone={QrCode} onFechar={() => setModal(null)}>
          <div className="text-center">
            <span className="text-xs" style={{ color: C.onSurfaceVariant }}>
              Você está pagando para {destaque("Lucas M.")}
            </span>
            <div className="mt-1 text-[2.5rem] font-extrabold leading-tight" style={{ color: C.primary }}>
              R$ 85,00
            </div>
            <span className="text-xs" style={{ color: C.onSurfaceVariant }}>
              Grupo: Apê 302 República • Internet Fibra
            </span>
          </div>
          <div className="mx-auto flex flex-col items-center rounded-xl bg-white p-4 shadow-inner">
            <QrCode className="h-44 w-44" strokeWidth={1.2} aria-hidden="true" />
            <span className="mt-2 text-xs" style={{ color: C.onSurfaceVariant }}>
              Aponte a câmera do app do seu banco
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="codigo-pix" className="text-left text-xs font-semibold">
              Pix Copia e Cola:
            </label>
            <div className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: C.surfaceLow }}>
              <input
                id="codigo-pix"
                readOnly
                value={CODIGO_PIX}
                onFocus={(event) => event.target.select()}
                className="w-full truncate bg-transparent text-xs outline-none"
                style={{ color: C.onSurfaceVariant }}
              />
              <button
                type="button"
                onClick={copiarPix}
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#ff8c42] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#9b4500]"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={notificarPagamento}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[#e6eeff]"
            style={{ backgroundColor: C.surfaceHighest }}
          >
            <Send className="h-[18px] w-[18px]" />
            Já fiz o Pix • Notificar Lucas
          </button>
        </JanelaModal>
      )}

      {modal === "tarefa" && (
        <JanelaModal titulo="Alugar carro 7 lugares" icone={AlarmClock} onFechar={() => setModal(null)}>
          <div className="flex flex-col gap-2 rounded-lg p-4" style={{ backgroundColor: C.surfaceLow }}>
            <p className="text-sm">
              <span style={{ color: C.onSurfaceVariant }}>Grupo: </span>
              <strong>Viagem Florianópolis</strong>
            </p>
            <p className="text-sm">
              <span style={{ color: C.onSurfaceVariant }}>Prazo: </span>
              <strong>Amanhã às 11:30</strong>
            </p>
            <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
              Após a reserva, anexe o comprovante com o valor total estimado.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/grupo")}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ff8c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9b4500]"
            >
              <ExternalLink className="h-[18px] w-[18px]" />
              Abrir no grupo
            </button>
            <BotaoSecundario onClick={() => setModal(null)}>Fechar</BotaoSecundario>
          </div>
        </JanelaModal>
      )}

      {modal === "configuracoes" && (
        <JanelaModal titulo="Configurar alertas" icone={SlidersHorizontal} onFechar={() => setModal(null)}>
          <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
            Escolha por onde quer receber cobranças, confirmações de Pix e
            lembretes de prazo.
          </p>
          <ListaCanais canais={canais} onAlternar={alternarCanal} />
          <p className="flex items-start gap-1.5 text-xs" style={{ color: C.onSurfaceVariant }}>
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.tertiary }} />
            Prévia: as preferências ainda não são salvas na sua conta.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setModal(null);
                setAviso("Preferências de alerta atualizadas.");
              }}
              className="cursor-pointer rounded-lg bg-[#ff8c42] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9b4500]"
            >
              Concluir
            </button>
          </div>
        </JanelaModal>
      )}

      {/* Aviso flutuante */}
      {aviso && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[110] flex items-center gap-2 rounded-xl px-4 py-2 font-jakarta text-sm font-semibold shadow-xl"
          style={{ backgroundColor: C.inverseSurface, color: C.inverseOnSurface }}
        >
          <CheckCircle2 className="h-[18px] w-[18px]" style={{ color: C.tertiaryFixed }} />
          {aviso}
        </div>
      )}
    </AppShell>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
====================================================== */

function CartaoNotificacao({
  notificacao: n,
  onAbrir,
  children,
}: {
  notificacao: Notificacao;
  onAbrir: () => void;
  children: ReactNode;
}) {
  const tom = TONS[n.tom];
  const Icone = n.icone;
  return (
    <article
      onClick={onAbrir}
      className={`relative flex flex-col items-start gap-4 rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:bg-[#eff4ff] sm:flex-row ${
        n.lida ? "opacity-90 hover:opacity-100" : "border-l-4"
      }`}
      style={n.lida ? undefined : { borderLeftColor: tom.borda }}
    >
      <div className="relative shrink-0">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={
            n.lida
              ? { backgroundColor: C.surfaceHigh, color: n.icone === CheckCircle2 ? C.primary : C.onSurfaceVariant }
              : { backgroundColor: tom.fundoIcone, color: tom.corIcone }
          }
        >
          <Icone className="h-6 w-6" />
        </div>
        {!n.lida && (
          <span
            className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: tom.borda }}
            aria-label="Não lida"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col items-start justify-between gap-1 sm:flex-row sm:gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[17px] font-semibold leading-snug">{n.titulo}</h3>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: n.corSelo.fundo, color: n.corSelo.texto }}
              >
                {n.selo}
              </span>
            </div>
            <p className="mt-1 text-base" style={{ color: C.onSurfaceVariant }}>
              {n.descricao}
            </p>
          </div>
          <span
            className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium"
            style={{ color: C.onSurfaceVariant }}
          >
            <Clock className="h-3.5 w-3.5" />
            {n.quando}
          </span>
        </div>
        {children}
      </div>
    </article>
  );
}

function AcoesNotificacao({
  notificacao: n,
  onComprovante,
  onConfirmar,
  onConvite,
  onTarefa,
  onPix,
  onRelatorio,
}: {
  notificacao: Notificacao;
  onComprovante: () => void;
  onConfirmar: () => void;
  onConvite: (aceito: boolean) => void;
  onTarefa: () => void;
  onPix: () => void;
  onRelatorio: () => void;
}) {
  if (!n.acao) return null;

  const resolvida = n.resolvida && (
    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.tertiary }}>
      <CheckCircle2 className="h-4 w-4" />
      {n.resolvida}
    </span>
  );

  switch (n.acao.tipo) {
    case "comprovante":
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <BotaoSecundario onClick={onComprovante} icone={ReceiptText}>
              Ver Comprovante
            </BotaoSecundario>
            {!n.resolvida && (
              <BotaoPrimario onClick={onConfirmar} icone={CheckCircle2}>
                Confirmar Recebimento
              </BotaoPrimario>
            )}
          </div>
          {resolvida || (
            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.primaryContainer }} />
              Aguardando sua conferência
            </span>
          )}
        </div>
      );
    case "convite":
      return (
        <>
          <div className="flex flex-wrap items-center gap-3 py-1">
            <div className="flex -space-x-2">
              {[
                { t: "LM", f: C.primaryFixed, c: C.primary },
                { t: "AB", f: C.surfaceHigh, c: C.onSurface },
                { t: "GS", f: C.tertiaryFixed, c: C.tertiary },
                { t: "+5", f: C.surfaceHighest, c: C.onSurfaceVariant },
              ].map((a) => (
                <span
                  key={a.t}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white"
                  style={{ backgroundColor: a.f, color: a.c }}
                >
                  {a.t}
                </span>
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
              Data do evento: 08/06 no Espaço Gourmet
            </span>
          </div>
          {resolvida || (
            <div className="flex items-center gap-2 pt-1">
              <BotaoPrimario onClick={() => onConvite(true)} icone={UserPlus}>
                Aceitar Convite
              </BotaoPrimario>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onConvite(false);
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all hover:bg-[#ffdad6] hover:text-[#ba1a1a] active:scale-95"
                style={{ backgroundColor: C.surfaceContainer, color: C.onSurfaceVariant }}
              >
                <X className="h-[18px] w-[18px]" />
                Recusar
              </button>
            </div>
          )}
        </>
      );
    case "tarefa":
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <BotaoSecundario onClick={onTarefa} icone={ExternalLink}>
            Ver Tarefa
          </BotaoSecundario>
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: C.secondary }}>
            <CircleAlert className="h-4 w-4" />
            Restam 21h para expirar
          </span>
        </div>
      );
    case "pix":
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {resolvida || (
            <BotaoPrimario onClick={onPix} icone={ArrowLeftRight}>
              Pagar com Pix
            </BotaoPrimario>
          )}
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: C.onSurfaceVariant }}>
            <Info className="h-4 w-4" style={{ color: C.tertiary }} />
            Chave Pix cadastrada automaticamente
          </span>
        </div>
      );
    case "relatorio":
      return (
        <div className="pt-1">
          <BotaoSecundario onClick={onRelatorio} icone={ChartColumn}>
            Ver Relatório Final
          </BotaoSecundario>
        </div>
      );
  }
}

function BotaoPrimario({
  onClick,
  icone: Icone,
  children,
}: {
  onClick: () => void;
  icone: LucideIcon;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#ff8c42] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9b4500] active:scale-95"
    >
      <Icone className="h-[18px] w-[18px]" />
      {children}
    </button>
  );
}

function BotaoSecundario({
  onClick,
  icone: Icone,
  children,
}: {
  onClick: () => void;
  icone?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all hover:bg-[#dee9fc] active:scale-95"
      style={{ backgroundColor: C.surfaceContainer, color: C.onSurface }}
    >
      {Icone && <Icone className="h-[18px] w-[18px]" />}
      {children}
    </button>
  );
}

function ListaCanais({
  canais,
  onAlternar,
}: {
  canais: { push: boolean; whatsapp: boolean; email: boolean };
  onAlternar: (canal: "push" | "whatsapp" | "email") => void;
}) {
  const itens = [
    { id: "push" as const, nome: "Push no Navegador", detalhe: "Alertas sonoros & desktop", icone: Bell, cor: C.primary },
    { id: "whatsapp" as const, nome: "WhatsApp Instantâneo", detalhe: "Cobranças e Pix Copia & Cola", icone: MessageCircle, cor: C.tertiary },
    { id: "email" as const, nome: "E-mail Diário / Resumo", detalhe: "Consolidação às 19:00", icone: Mail, cor: C.onSurfaceVariant },
  ];
  return (
    <div className="flex flex-col gap-3">
      {itens.map((item) => {
        const Icone = item.icone;
        const ligado = canais[item.id];
        return (
          <label
            key={item.id}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2.5 transition-colors hover:bg-[#e6eeff]"
            style={{ backgroundColor: C.surfaceLow }}
          >
            <span className="flex items-center gap-3">
              <Icone className="h-[22px] w-[22px] shrink-0" style={{ color: item.cor }} />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{item.nome}</span>
                <span className="text-xs" style={{ color: C.onSurfaceVariant }}>{item.detalhe}</span>
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={ligado}
              onChange={() => onAlternar(item.id)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#9b4500]"
              style={{ backgroundColor: ligado ? C.primaryContainer : C.surfaceHighest }}
            >
              <span
                className={`absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  ligado ? "translate-x-5" : ""
                }`}
              />
            </span>
          </label>
        );
      })}
    </div>
  );
}

function Pendencia({
  numero,
  titulo,
  detalhe,
  fundo,
  cor,
  onAbrir,
}: {
  numero: number;
  titulo: string;
  detalhe: string;
  fundo: string;
  cor: string;
  onAbrir: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-[#e6eeff]"
      style={{ backgroundColor: C.surfaceLow }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ backgroundColor: fundo, color: cor }}
      >
        {numero}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{titulo}</span>
        <span className="block text-sm" style={{ color: C.onSurfaceVariant }}>{detalhe}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0" style={{ color: C.primary }} />
    </button>
  );
}

function JanelaModal({
  titulo,
  icone: Icone,
  onFechar,
  children,
}: {
  titulo: string;
  icone: LucideIcon;
  onFechar: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#27313f66] p-4 font-jakarta backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onFechar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{ color: C.onSurface }}
      >
        <div className="flex items-center justify-between p-4" style={{ backgroundColor: C.surfaceLow }}>
          <div className="flex items-center gap-2">
            <Icone className="h-[22px] w-[22px]" style={{ color: C.primary }} />
            <span className="text-lg font-semibold">{titulo}</span>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="cursor-pointer rounded-lg p-1 transition-colors hover:bg-[#e6eeff]"
            style={{ color: C.onSurfaceVariant }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
