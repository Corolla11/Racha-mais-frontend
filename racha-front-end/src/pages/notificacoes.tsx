import { useEffect, useMemo, useState, type ReactNode } from "react";
import AppShell from "../components/app-shell";
import Link from "../components/app-link";
import Icon from "../components/icon";
import { futureModules } from "../lib/endpoints";
import { useAppNavigate as useNavigate } from "../lib/navigation";

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
  /** Nome do ícone do Material Symbols. */
  icone: string;
  /** "Rótulo — Assunto": o rótulo aparece em caixa alta na cor do tom. */
  titulo: string;
  selo: string;
  /** Classes de fundo/texto do selo. */
  corSelo: string;
  descricao: ReactNode;
  quando: string;
  /** Valor movimentado (pagamentos), usado no resumo da barra de filtros. */
  valor?: number;
  acao?: Acao;
  resolvida?: string;
}

const TONS: Record<Tom, { barra: string; icone: string; rotulo: string }> = {
  primary: { barra: "bg-primary-container", icone: "bg-primary-fixed text-primary", rotulo: "text-primary" },
  tertiary: { barra: "bg-tertiary-container", icone: "bg-tertiary-fixed text-on-tertiary-container", rotulo: "text-tertiary" },
  secondary: { barra: "bg-secondary-container", icone: "bg-secondary-fixed/40 text-secondary", rotulo: "text-secondary" },
};

const SELO_NEUTRO = "bg-surface-container text-on-surface";
const SELO_ALERTA = "bg-error-container text-on-error-container";

const destaque = (texto: string) => <strong className="font-semibold text-on-surface">{texto}</strong>;

const NOTIFICACOES_INICIAIS: Notificacao[] = [
  {
    id: 1,
    secao: "Hoje",
    categoria: "payments",
    lida: false,
    tom: "primary",
    icone: "qr_code_2",
    titulo: "Pagamento Informado — Viagem Florianópolis",
    selo: "Pix Pendente",
    corSelo: "bg-surface-container-high text-on-surface-variant",
    descricao: (
      <>
        {destaque("Mariana S.")} informou o pagamento de{" "}
        <span className="font-semibold text-primary">R$ 112,50</span> referente à tarefa{" "}
        {destaque("“Comprar bebidas, gelo e carvão”")}.
      </>
    ),
    quando: "Há 15 minutos",
    valor: 112.5,
    acao: { tipo: "comprovante" },
  },
  {
    id: 2,
    secao: "Hoje",
    categoria: "invites",
    lida: false,
    tom: "tertiary",
    icone: "celebration",
    titulo: "Novo Convite — Churrasco de Aniversário do Leo",
    selo: "Grupo Privado",
    corSelo: "bg-tertiary-fixed text-on-tertiary-fixed",
    descricao: (
      <>
        {destaque("Leo M.")} convidou você para integrar o rateio coletivo com{" "}
        {destaque("8 participantes confirmados")}. Cota estimada: R$ 65,00 por pessoa.
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
    icone: "alarm",
    titulo: "Lembrete de Prazo — Alugar carro 7 lugares",
    selo: "Vence amanhã",
    corSelo: SELO_ALERTA,
    descricao: (
      <>
        O prazo da tarefa atribuída a você no grupo {destaque("“Viagem Florianópolis”")} encerra amanhã às{" "}
        {destaque("11:30")}. Após a reserva, anexe o comprovante com o valor total estimado.
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
    tom: "secondary",
    icone: "payments",
    titulo: "Cota Pendente — Apê 302 República",
    selo: "Cobrança",
    corSelo: SELO_ALERTA,
    descricao: (
      <>
        {destaque("Lucas M.")} solicitou o acerto da sua cota de{" "}
        <strong className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface">R$ 85,00</strong>{" "}
        referente ao fechamento da fatura {destaque("“Internet Fibra 600MB”")}.
      </>
    ),
    quando: "Ontem às 18:40",
    valor: 85,
    acao: { tipo: "pix" },
  },
  {
    id: 5,
    secao: "Ontem",
    categoria: "payments",
    lida: true,
    tom: "primary",
    icone: "check_circle",
    titulo: "Pagamento Confirmado!",
    selo: "Liquidado",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        {destaque("Rodrigo M.")} confirmou o recebimento do seu pagamento de {destaque("R$ 70,00")} na tarefa{" "}
        <span className="italic">“Passagens de Balsa”</span>. Seu saldo no grupo agora está zerado.
      </>
    ),
    quando: "Ontem às 14:15",
    valor: 70,
  },
  {
    id: 6,
    secao: "Ontem",
    categoria: "tasks",
    lida: true,
    tom: "primary",
    icone: "task_alt",
    titulo: "Tarefa Finalizada",
    selo: "Concluído",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        {destaque("Carla T.")} marcou {destaque("“Check-in na casa do Airbnb”")} como concluída no grupo{" "}
        {destaque("Viagem Florianópolis")}. As instruções de entrada estão no chat do grupo.
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
    icone: "inventory_2",
    titulo: "Grupo Encerrado — Viagem Serra da Canastra",
    selo: "100% Liquidado",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        O grupo foi liquidado com total conformidade entre todos os 6 membros e movido para o arquivo de
        histórico. O balanço final de R$ 2.450,00 está fechado.
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
    icone: "security",
    titulo: "Segurança da Conta",
    selo: "Dispositivo",
    corSelo: SELO_NEUTRO,
    descricao: (
      <>
        Novo acesso autenticado detectado utilizando navegador {destaque("Chrome no macOS")} em{" "}
        {destaque("Florianópolis, SC")} (IP 177.136.**.**). Se você não reconhece esta sessão, revogue
        imediatamente o acesso nas configurações.
      </>
    ),
    quando: "Seg, 20 Mai",
  },
];

const FILTROS: { id: Categoria | "all"; nome: string }[] = [
  { id: "all", nome: "Todas" },
  { id: "invites", nome: "Convites" },
  { id: "payments", nome: "Cobranças & Pix" },
  { id: "tasks", nome: "Tarefas" },
  { id: "system", nome: "Sistema" },
];

const SECOES: Secao[] = ["Hoje", "Ontem", "Esta Semana"];
const NOME_SECAO: Record<Secao, string> = { Hoje: "Hoje", Ontem: "Ontem", "Esta Semana": "Esta semana" };

const CODIGO_PIX =
  "00020126580014br.gov.bcb.pix0136lucas.moura@racha.app520400005303986540585.005802BR5913Lucas Moura6009SAO PAULO62070503***6304E5F6";

const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function diasAtras(dias: number) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
}

function dataCurta(data: Date) {
  return data.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

// "22 de outubro" para Hoje/Ontem e "16 — 20 de outubro" para Esta semana
function dataDaSecao(indice: number) {
  if (indice < 2) return dataCurta(diasAtras(indice));
  const inicio = diasAtras(6);
  const fim = diasAtras(2);
  return inicio.getMonth() === fim.getMonth()
    ? `${inicio.getDate()} — ${dataCurta(fim)}`
    : `${dataCurta(inicio)} — ${dataCurta(fim)}`;
}

type Modal = "comprovante" | "pix" | "tarefa" | "configuracoes" | null;

export default function Notificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);
  const [filtro, setFiltro] = useState<Categoria | "all">("all");
  const [modal, setModal] = useState<Modal>(null);
  const [aviso, setAviso] = useState("");
  const [canais, setCanais] = useState({ push: true, whatsapp: true, email: true });

  // Busca da rota futura de notificações (se disponível no backend)
  useEffect(() => {
    futureModules.notificacoes.listar().catch(() => {});
  }, []);

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
  const movimentado = notificacoes.reduce((total, n) => total + (n.valor ?? 0), 0);

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
    if (mudancas.lida) {
      futureModules.notificacoes.marcarLida(id).catch(() => {});
    }
    setNotificacoes((anteriores) => anteriores.map((n) => (n.id === id ? { ...n, ...mudancas } : n)));
  }

  function marcarTodasComoLidas() {
    futureModules.notificacoes.marcarTodasLidas().catch(() => {});
    setNotificacoes((anteriores) => anteriores.map((n) => ({ ...n, lida: true })));
    setAviso("Todas as notificações foram marcadas como lidas.");
  }

  function confirmarRecebimento() {
    futureModules.pagamentos.confirmar("1").catch(() => {});
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
    futureModules.pagamentos.informar({ idTarefa: "4", idUser: "me" }).catch(() => {});
    atualizar(4, { lida: true, resolvida: "Pagamento informado a Lucas M." });
    setModal(null);
    setAviso("Lucas M. foi avisado do seu Pix.");
  }

  function alternarCanal(canal: keyof typeof canais) {
    setCanais((anteriores) => {
      const proximo = { ...anteriores, [canal]: !anteriores[canal] };
      futureModules.notificacoes.salvarPreferencias(proximo).catch(() => {});
      return proximo;
    });
  }

  return (
    <AppShell title="Notificações & Avisos" bare>
      <div className="flex w-full flex-col">
        <div className="mx-auto w-full max-w-5xl space-y-space-lg px-gutter-mobile py-space-md sm:px-gutter sm:py-space-xl">
          {/* 1. Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
            <Link to="/meus-grupos" className="flex items-center gap-1 transition-colors hover:text-primary">
              <Icon name="home" size={16} />
              <span>Início</span>
            </Link>
            <Icon name="chevron_right" size={14} className="text-outline-variant" />
            <span className="font-semibold text-on-surface">Notificações &amp; Alertas</span>
          </nav>

          {/* 2. Cabeçalho da Central */}
          <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
            <div className="space-y-space-xs">
              <div className="flex flex-wrap items-center gap-space-sm">
                <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight text-on-surface">
                  Central de Notificações
                </h1>
                {naoLidas > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-primary shadow-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
                  </span>
                )}
              </div>
              <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
                Fique por dentro das movimentações de rachas, convites de grupos, cobranças Pix e tarefas em andamento.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-space-sm self-start lg:self-center">
              <button
                type="button"
                onClick={marcarTodasComoLidas}
                disabled={naoLidas === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-3.5 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-container-high active:scale-95 disabled:pointer-events-none disabled:opacity-70"
              >
                {naoLidas === 0 ? (
                  <>
                    <Icon name="check" size={18} className="text-tertiary" />
                    <span>Todas marcadas</span>
                  </>
                ) : (
                  <>
                    <Icon name="done_all" size={18} className="text-primary" />
                    <span>Marcar todas como lidas</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setModal("configuracoes")}
                aria-label="Configurar alertas"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest p-2 font-label-md text-label-md text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-high hover:text-on-surface sm:px-3.5 sm:py-2"
              >
                <Icon name="tune" size={20} />
                <span className="hidden sm:inline">Configurar</span>
              </button>
            </div>
          </div>

          {/* 3. Filtros rápidos & resumo */}
          <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-1.5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 overflow-x-auto px-0.5 py-0.5">
              {FILTROS.map((item) => {
                const ativo = filtro === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setFiltro(item.id)}
                    className={`shrink-0 rounded-lg px-3.5 py-1.5 font-label-md text-label-md transition-all ${
                      ativo
                        ? "bg-inverse-surface font-semibold text-inverse-on-surface"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    {item.nome} <span className="ml-1 text-label-sm opacity-70">({contagem[item.id].total})</span>
                  </button>
                );
              })}
            </div>
            <div className="hidden shrink-0 items-center gap-space-sm pr-3 font-label-sm text-label-sm text-on-surface-variant lg:flex">
              <div className="flex items-center gap-1 text-on-surface">
                <Icon name="trending_up" size={16} className="text-primary" />
                <span className="font-semibold">Resumo:</span>
                <span>{moeda(movimentado)} movimentados</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <span className="flex items-center gap-1">
                <Icon name="sync" size={14} />
                Sincronizado há instantes
              </span>
            </div>
          </div>

          {/* 4. Feed cronológico */}
          <div className="space-y-space-xl">
            {SECOES.map((secao, indice) => {
              const itens = visiveis.filter((n) => n.secao === secao);
              if (itens.length === 0) return null;
              const novas = itens.filter((n) => !n.lida).length;
              return (
                <section key={secao} className="space-y-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <h2 className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
                        {NOME_SECAO[secao]}
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant ${
                          novas > 0 ? "bg-surface-container-high font-semibold" : "bg-surface-container"
                        }`}
                      >
                        {novas > 0
                          ? `${novas} ${novas === 1 ? "pendente" : "pendentes"}`
                          : `${itens.length} ${itens.length === 1 ? "alerta" : "alertas"}`}
                      </span>
                    </div>
                    <span className="hidden font-label-sm text-label-sm text-on-surface-variant sm:block">
                      {dataDaSecao(indice)}
                    </span>
                  </div>
                  <div className="space-y-space-sm">
                    {itens.map((n) => (
                      <CartaoNotificacao
                        key={n.id}
                        notificacao={n}
                        onAbrir={() => !n.lida && atualizar(n.id, { lida: true })}
                        onAlternarLida={() => atualizar(n.id, { lida: !n.lida })}
                      >
                        <AcoesNotificacao
                          notificacao={n}
                          onComprovante={() => setModal("comprovante")}
                          onConfirmar={confirmarRecebimento}
                          onConvite={responderConvite}
                          onTarefa={() => setModal("tarefa")}
                          onPix={() => setModal("pix")}
                          onRelatorio={() => setAviso("O relatório final ficará disponível no histórico do grupo.")}
                        />
                      </CartaoNotificacao>
                    ))}
                  </div>
                </section>
              );
            })}

            {visiveis.length === 0 && (
              <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                  <Icon name="notifications_off" size={24} />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Nenhuma notificação nesta categoria.</p>
              </div>
            )}
          </div>

          {/* 5. Rodapé da lista */}
          <div className="flex flex-col items-center justify-center space-y-space-sm pb-space-lg pt-space-md text-center">
            <div className="inline-flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <Icon name="history" size={18} />
              <span>Exibindo notificações dos últimos 30 dias</span>
            </div>
            <button
              type="button"
              onClick={() => setAviso("Não há notificações mais antigas no seu histórico.")}
              className="rounded-lg bg-surface-container-low px-4 py-2 font-label-md text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-container active:scale-95"
            >
              Carregar histórico mais antigo
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAIS
      ====================================================== */}

      {modal === "comprovante" && (
        <JanelaModal titulo="Comprovante de Pagamento" icone="receipt_long" onFechar={() => setModal(null)}>
          <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-space-md">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Instituição Bancária
              </span>
              <span className="font-label-md text-label-md font-bold text-primary">Banco Inter S.A.</span>
            </div>
            <div className="h-px bg-surface-container" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Valor transferido via Pix</span>
              <span className="font-numeric-stat text-numeric-stat text-on-surface">R$ 112,50</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block font-label-sm text-label-sm text-on-surface-variant">Pagador</span>
                <span className="font-label-md text-label-md text-on-surface">Mariana Silva</span>
              </div>
              <div>
                <span className="block font-label-sm text-label-sm text-on-surface-variant">Destinatário</span>
                <span className="font-label-md text-label-md text-on-surface">Você</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg bg-surface-container-lowest p-2.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Referente ao rateio:</span>
              <span className="font-body-sm text-body-sm font-medium text-on-surface">“Comprar bebidas, gelo e carvão”</span>
              <span className="font-label-sm text-label-sm text-primary">Grupo: Viagem Florianópolis</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span>ID Pix: E00416968202405241420x992</span>
              <span>24/05 • 14:18</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            {notificacoes.find((n) => n.id === 1)?.resolvida ? (
              <p className="flex flex-1 items-center gap-1.5 font-label-md text-label-md text-tertiary">
                <Icon name="check_circle" size={18} filled />
                Pagamento já confirmado.
              </p>
            ) : (
              <button
                type="button"
                onClick={confirmarRecebimento}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary active:scale-95"
              >
                <Icon name="verified" size={18} />
                Confirmar e Liquidar
              </button>
            )}
            <BotaoSecundario onClick={() => setModal(null)}>Fechar</BotaoSecundario>
          </div>
        </JanelaModal>
      )}

      {modal === "pix" && (
        <JanelaModal titulo="Pagar Cota via Pix" icone="qr_code_2" onFechar={() => setModal(null)}>
          <div className="text-center">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Você está pagando para {destaque("Lucas M.")}
            </span>
            <div className="mt-1 font-display text-display-mobile text-primary">R$ 85,00</div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Grupo: Apê 302 República • Internet Fibra
            </span>
          </div>
          <div className="mx-auto flex flex-col items-center rounded-xl bg-surface-container-low p-space-md">
            <Icon name="qr_code_2" size={176} className="text-on-surface" />
            <span className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
              Aponte a câmera do app do seu banco
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="codigo-pix" className="text-left font-label-sm text-label-sm font-semibold text-on-surface">
              Pix Copia e Cola:
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2">
              <input
                id="codigo-pix"
                readOnly
                value={CODIGO_PIX}
                onFocus={(event) => event.target.select()}
                className="w-full truncate bg-transparent font-label-sm text-label-sm text-on-surface-variant outline-none"
              />
              <button
                type="button"
                onClick={copiarPix}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-primary-container px-3 py-1.5 font-label-sm text-label-sm font-semibold text-on-primary transition-all hover:bg-primary"
              >
                <Icon name="content_copy" size={16} />
                Copiar
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={notificarPagamento}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container-high px-4 py-2.5 font-label-md text-label-md text-on-surface transition-all hover:bg-surface-container-highest"
          >
            <Icon name="send" size={18} />
            Já fiz o Pix • Notificar Lucas
          </button>
        </JanelaModal>
      )}

      {modal === "tarefa" && (
        <JanelaModal titulo="Alugar carro 7 lugares" icone="alarm" onFechar={() => setModal(null)}>
          <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-space-md font-body-sm text-body-sm">
            <p>
              <span className="text-on-surface-variant">Grupo: </span>
              <strong className="text-on-surface">Viagem Florianópolis</strong>
            </p>
            <p>
              <span className="text-on-surface-variant">Prazo: </span>
              <strong className="text-on-surface">Amanhã às 11:30</strong>
            </p>
            <p className="text-on-surface-variant">Após a reserva, anexe o comprovante com o valor total estimado.</p>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => navigate("/grupo")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary active:scale-95"
            >
              <Icon name="open_in_new" size={18} />
              Abrir no grupo
            </button>
            <BotaoSecundario onClick={() => setModal(null)}>Fechar</BotaoSecundario>
          </div>
        </JanelaModal>
      )}

      {modal === "configuracoes" && (
        <JanelaModal titulo="Configurar alertas" icone="tune" onFechar={() => setModal(null)}>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Escolha por onde quer receber cobranças, confirmações de Pix e lembretes de prazo.
          </p>
          <ListaCanais canais={canais} onAlternar={alternarCanal} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setModal(null);
                setAviso("Preferências de alerta atualizadas.");
              }}
              className="rounded-lg bg-primary-container px-6 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary active:scale-95"
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
          className="fixed bottom-6 right-6 z-[110] flex items-center gap-2 rounded-xl bg-inverse-surface px-4 py-2.5 font-label-md text-label-md text-inverse-on-surface shadow-xl"
        >
          <Icon name="check_circle" size={18} filled className="text-tertiary-fixed" />
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
  onAlternarLida,
  children,
}: {
  notificacao: Notificacao;
  onAbrir: () => void;
  onAlternarLida: () => void;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const tom = TONS[n.tom];
  const separador = n.titulo.indexOf(" — ");
  const rotulo = separador === -1 ? null : n.titulo.slice(0, separador);
  const assunto = separador === -1 ? n.titulo : n.titulo.slice(separador + 3);
  const corIcone = n.lida
    ? `bg-surface-container-high ${n.icone === "check_circle" ? "text-primary" : "text-on-surface-variant"}`
    : tom.icone;

  return (
    <article
      onClick={onAbrir}
      className="group relative rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all duration-200 hover:shadow-md sm:p-space-lg"
    >
      {!n.lida && (
        <>
          <div className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${tom.barra}`} />
          <span className="sr-only">Não lida.</span>
        </>
      )}
      <div className="flex flex-col items-start justify-between gap-space-md sm:flex-row">
        <div className="flex min-w-0 items-start gap-space-md">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${corIcone}`}>
            <Icon name={n.icone} size={24} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {rotulo && (
                <>
                  <span className={`font-label-sm text-label-sm font-bold uppercase tracking-wider ${n.lida ? "text-on-surface-variant" : tom.rotulo}`}>
                    {rotulo}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">•</span>
                </>
              )}
              <h3 className="font-label-md text-label-md font-bold text-on-surface">{assunto}</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{n.descricao}</p>
            <div className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <span className={`rounded-full px-2 py-0.5 font-medium ${n.corSelo}`}>{n.selo}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-on-surface-variant/80">
                <Icon name="schedule" size={14} />
                {n.quando}
              </span>
            </div>
            {children}
          </div>
        </div>
        <div className="relative self-start sm:self-center">
          <button
            type="button"
            title="Mais opções"
            aria-label="Mais opções"
            aria-haspopup="menu"
            aria-expanded={menu}
            onClick={(event) => {
              event.stopPropagation();
              setMenu(!menu);
            }}
            className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="more_vert" size={20} />
          </button>
          {menu && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden="true"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenu(false);
                }}
              />
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl bg-surface-container-lowest p-1 shadow-lg ring-1 ring-surface-container"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenu(false);
                    onAlternarLida();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  <Icon name={n.lida ? "mark_email_unread" : "drafts"} size={18} className="text-on-surface-variant" />
                  {n.lida ? "Marcar como não lida" : "Marcar como lida"}
                </button>
              </div>
            </>
          )}
        </div>
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
    <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-tertiary">
      <Icon name="check_circle" size={16} filled />
      {n.resolvida}
    </span>
  );

  switch (n.acao.tipo) {
    case "comprovante":
      return (
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2">
          <div className="flex flex-wrap items-center gap-space-sm">
            {!n.resolvida && (
              <BotaoPrimario onClick={onConfirmar} icone="check">
                Confirmar Recebimento
              </BotaoPrimario>
            )}
            <BotaoTexto onClick={onComprovante} icone="visibility">
              Ver Comprovante
            </BotaoTexto>
          </div>
          {resolvida || (
            <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
              Aguardando sua conferência
            </span>
          )}
        </div>
      );
    case "convite":
      return (
        <>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {[
                { t: "LM", c: "bg-primary-fixed text-on-primary-fixed" },
                { t: "AB", c: "bg-secondary-fixed text-on-secondary-fixed" },
                { t: "GS", c: "bg-tertiary-fixed text-on-tertiary-fixed" },
                { t: "+5", c: "bg-surface-container-highest text-on-surface" },
              ].map((a) => (
                <span
                  key={a.t}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-surface-container-lowest ${a.c}`}
                >
                  {a.t}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <Icon name="event" size={14} />
              Data do evento: 08/06 no Espaço Gourmet
            </span>
          </div>
          {resolvida ? (
            <div className="pt-2">{resolvida}</div>
          ) : (
            <div className="flex flex-wrap items-center gap-space-sm pt-2">
              <BotaoPrimario onClick={() => onConvite(true)} icone="check">
                Aceitar Convite
              </BotaoPrimario>
              <BotaoSecundario onClick={() => onConvite(false)}>Recusar</BotaoSecundario>
            </div>
          )}
        </>
      );
    case "tarefa":
      return (
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTarefa();
            }}
            className="inline-flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:text-primary"
          >
            <span>Detalhes da Tarefa</span>
            <Icon name="arrow_forward" size={16} />
          </button>
          <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary">
            <Icon name="event_upcoming" size={14} />
            Restam 21h para expirar
          </span>
        </div>
      );
    case "pix":
      return (
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2">
          {resolvida || (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPix();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-surface-container-high px-4 py-2 font-label-md text-label-md font-bold text-on-surface shadow-sm transition-all hover:bg-surface-container-highest active:scale-95"
            >
              <Icon name="qr_code_2" size={18} className="text-primary" />
              <span>Pagar via Pix</span>
            </button>
          )}
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
            <Icon name="info" size={16} className="text-tertiary" />
            Chave Pix cadastrada automaticamente
          </span>
        </div>
      );
    case "relatorio":
      return (
        <div className="pt-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRelatorio();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3.5 py-1.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon name="bar_chart" size={18} className="text-primary" />
            Ver Relatório Final
          </button>
        </div>
      );
  }
}

function BotaoPrimario({ onClick, icone, children }: { onClick: () => void; icone: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary active:scale-95"
    >
      <Icon name={icone} size={18} />
      <span>{children}</span>
    </button>
  );
}

function BotaoSecundario({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="rounded-lg bg-surface-container-low px-3.5 py-2 font-label-md text-label-md text-on-surface transition-all hover:bg-surface-container-high active:scale-95"
    >
      {children}
    </button>
  );
}

function BotaoTexto({ onClick, icone, children }: { onClick: () => void; icone: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="inline-flex items-center gap-1.5 font-label-md text-label-md font-semibold text-primary transition-colors hover:text-primary-container"
    >
      <Icon name={icone} size={18} />
      <span>{children}</span>
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
    { id: "push" as const, nome: "Push no Navegador", detalhe: "Alertas sonoros & desktop", icone: "notifications_active", cor: "text-primary" },
    { id: "whatsapp" as const, nome: "WhatsApp Instantâneo", detalhe: "Cobranças e Pix Copia & Cola", icone: "chat", cor: "text-tertiary" },
    { id: "email" as const, nome: "E-mail Diário / Resumo", detalhe: "Consolidação às 19:00", icone: "mail", cor: "text-on-surface-variant" },
  ];
  return (
    <div className="flex flex-col gap-space-sm">
      {itens.map((item) => {
        const ligado = canais[item.id];
        return (
          <label
            key={item.id}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface-container-low p-2.5 transition-colors hover:bg-surface-container"
          >
            <span className="flex items-center gap-3">
              <Icon name={item.icone} size={22} className={`shrink-0 ${item.cor}`} />
              <span className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface">{item.nome}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{item.detalhe}</span>
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
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary ${
                ligado ? "bg-primary-container" : "bg-surface-container-highest"
              }`}
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

function JanelaModal({
  titulo,
  icone,
  onFechar,
  children,
}: {
  titulo: string;
  icone: string;
  onFechar: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onFechar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-surface-container-lowest text-on-surface shadow-2xl"
      >
        <div className="flex items-center justify-between bg-surface-container-low px-space-lg py-space-md">
          <div className="flex items-center gap-2">
            <Icon name={icone} size={22} className="text-primary" />
            <span className="font-headline-sm text-headline-sm text-on-surface">{titulo}</span>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-space-md overflow-y-auto p-space-lg">{children}</div>
      </div>
    </div>
  );
}
