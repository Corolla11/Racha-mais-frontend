import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Lightbulb,
  Link2,
  Mail,
  MessageCircle,
  PartyPopper,
  Plus,
  QrCode,
  ReceiptText,
  Send,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import Aba from "../components/aba-perfil";

const linkConvite = "https://racha.plus/g/churrasco-2025-x9k2";

const mensagemWhatsApp = encodeURIComponent(
  `Galera, criei o grupo no Racha+ pra dividir as despesas do churrasco: ${linkConvite}`,
);

type StatusMembro = "pago" | "confirmado" | "aguardando";

interface Membro {
  id: number;
  nome: string;
  detalhe: string;
  iniciais: string;
  corIniciais: string;
  avatar?: string;
  organizador: boolean;
  status: StatusMembro;
  rotuloStatus: string;
}

const membros: Membro[] = [
  {
    id: 1,
    nome: "Mariana Silva",
    detalhe: "Organizadora",
    iniciais: "MS",
    corIniciais: "",
    avatar: "https://i.pravatar.cc/100?img=47",
    organizador: true,
    status: "pago",
    rotuloStatus: "Pago (R$ 65)",
  },
  {
    id: 2,
    nome: "Lucas Rodrigues",
    detalhe: "lucas.r@gmail.com",
    iniciais: "LR",
    corIniciais: "bg-blue-50 text-secondary",
    organizador: false,
    status: "confirmado",
    rotuloStatus: "Confirmado",
  },
  {
    id: 3,
    nome: "Beatriz Mendonça",
    detalhe: "beatriz@live.com",
    iniciais: "BM",
    corIniciais: "bg-primary/25 text-tertiary",
    organizador: false,
    status: "confirmado",
    rotuloStatus: "Confirmado",
  },
  {
    id: 4,
    nome: "Carlos Eduardo",
    detalhe: "cadu@outlook.com",
    iniciais: "CE",
    corIniciais: "bg-input text-text-secondary",
    organizador: false,
    status: "aguardando",
    rotuloStatus: "Aguardando link",
  },
];

const coresStatus: Record<StatusMembro, string> = {
  pago: "bg-input text-secondary",
  confirmado: "bg-blue-50 text-secondary",
  aguardando: "bg-input text-text-secondary",
};

const proximosPassos = [
  {
    numero: 1,
    titulo: "Convite aceito",
    descricao: "Os amigos acessam o link e confirmam a chave Pix própria.",
    cor: "bg-blue-50 text-secondary",
  },
  {
    numero: 2,
    titulo: "Pagamento Fácil",
    descricao: "Cada membro paga os R$ 65 via Copia e Cola instantâneo.",
    cor: "bg-blue-50 text-secondary",
  },
  {
    numero: 3,
    titulo: "Baixa Automática",
    descricao: "O comprovante é validado e o saldo do grupo é liquidado.",
    cor: "bg-primary/25 text-tertiary",
  },
];

/* Simulação visual de um QR Code (o código real virá do backend) */
function QrCodeIlustrativo() {
  const pontos = [
    { x: 40, y: 12, tamanho: 6, destaque: true },
    { x: 52, y: 16, tamanho: 6, destaque: false },
    { x: 44, y: 24, tamanho: 6, destaque: false },
    { x: 12, y: 44, tamanho: 6, destaque: false },
    { x: 22, y: 48, tamanho: 6, destaque: true },
    { x: 38, y: 38, tamanho: 8, destaque: false },
    { x: 54, y: 40, tamanho: 6, destaque: false },
    { x: 42, y: 52, tamanho: 6, destaque: true },
    { x: 56, y: 58, tamanho: 6, destaque: false },
    { x: 72, y: 44, tamanho: 6, destaque: false },
    { x: 80, y: 52, tamanho: 6, destaque: true },
    { x: 42, y: 72, tamanho: 6, destaque: false },
    { x: 52, y: 78, tamanho: 6, destaque: false },
    { x: 70, y: 74, tamanho: 6, destaque: false },
    { x: 80, y: 80, tamanho: 6, destaque: true },
  ];

  const cantos = [
    { x: 10, y: 10 },
    { x: 66, y: 10 },
    { x: 10, y: 66 },
  ];

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32" aria-hidden="true">
      {cantos.map((canto) => (
        <g key={`${canto.x}-${canto.y}`}>
          <rect
            x={canto.x}
            y={canto.y}
            width="24"
            height="24"
            rx="3"
            className="fill-secondary"
          />

          <rect
            x={canto.x + 4}
            y={canto.y + 4}
            width="16"
            height="16"
            rx="2"
            className="fill-surface"
          />

          <rect
            x={canto.x + 8}
            y={canto.y + 8}
            width="8"
            height="8"
            className="fill-secondary"
          />
        </g>
      ))}

      {pontos.map((ponto) => (
        <rect
          key={`${ponto.x}-${ponto.y}`}
          x={ponto.x}
          y={ponto.y}
          width={ponto.tamanho}
          height={ponto.tamanho}
          className={ponto.destaque ? "fill-primary" : "fill-secondary"}
        />
      ))}
    </svg>
  );
}

function GrupoCriado() {
  const navigate = useNavigate();

  const [abaAberta, setAbaAberta] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [qrDestacado, setQrDestacado] = useState(false);

  const blocoQr = useRef<HTMLDivElement>(null);

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkConvite);
    } catch {
      /* Área de transferência indisponível: o campo permite seleção manual */
    }

    setCopiado(true);

    setTimeout(() => setCopiado(false), 3000);
  }

  function mostrarQrCode() {
    blocoQr.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    setQrDestacado(true);

    setTimeout(() => setQrDestacado(false), 1200);
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-surface px-6">
        {/* Logo */}
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

        {/* Navegação */}
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

        {/* Ações do usuário */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/criar-grupo")}
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-text-primary transition hover:bg-tertiary hover:text-white sm:flex"
          >
            <Plus size={14} />
            Novo Grupo
          </button>

          <button type="button" className="relative text-gray-600">
            <Bell size={17} />

            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          </button>

          {/* Perfil */}
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

            {abaAberta && <Aba onLogout={() => navigate("/login")} />}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {/* CAMINHO */}
        <div className="mb-8 flex items-center justify-between gap-4 pb-6">
          <nav
            aria-label="Navegação estrutural"
            className="flex items-center gap-2 text-xs text-text-secondary"
          >
            <button
              type="button"
              onClick={() => navigate("/meus-grupos")}
              className="transition hover:text-secondary"
            >
              Grupos
            </button>

            <ChevronRight size={13} />

            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="transition hover:text-secondary"
            >
              Novo Grupo
            </button>

            <ChevronRight size={13} />

            <span className="font-semibold text-secondary">
              Sucesso &amp; Compartilhamento
            </span>
          </nav>

          <div className="hidden items-center gap-2 rounded-full bg-input px-3 py-1 text-[11px] font-semibold text-secondary md:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Grupo Ativo #GRP-2025-884
          </div>
        </div>

        {/* BANNER DE CELEBRAÇÃO */}
        <div className="relative mb-8 overflow-hidden rounded-xl bg-surface p-8 shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-primary/15 blur-2xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-5 md:items-center">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-text-primary shadow-md">
                <PartyPopper size={32} />

                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow-sm">
                  <Check size={14} className="text-secondary" strokeWidth={3} />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                    Processo concluído
                  </span>

                  <span className="text-[10px] text-text-secondary">
                    • Divisão por IA Validada
                  </span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-secondary">
                  Grupo criado com sucesso! 🎉
                </h1>

                <p className="mt-0.5 text-sm text-text-secondary">
                  O grupo{" "}
                  <span className="font-semibold text-text-primary">
                    Churrasco de Fim de Ano 🥩
                  </span>{" "}
                  está pronto. Agora é só convidar a galera para começar a
                  divisão sem atritos.
                </p>
              </div>
            </div>

            {/* Resumo rápido */}
            <div className="flex w-full shrink-0 items-center justify-between gap-4 rounded-xl bg-input px-5 py-3 md:w-auto md:justify-start">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary">
                  Valor Total
                </span>

                <span className="text-base font-semibold text-secondary">
                  R$ 520,00
                </span>
              </div>

              <div className="h-8 w-px bg-background" />

              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary">
                  Por Pessoa (8)
                </span>

                <span className="text-base font-bold text-tertiary">
                  R$ 65,00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* COLUNA ESQUERDA - COMPARTILHAMENTO */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* Painel de convite */}
            <div className="flex flex-col gap-6 rounded-xl bg-surface p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-input text-secondary">
                    <Send size={19} />
                  </div>

                  <div className="flex flex-col">
                    <h2 className="text-base font-semibold">
                      Compartilhar Convite
                    </h2>

                    <p className="text-xs text-text-secondary">
                      Convide os participantes por link direto, WhatsApp ou QR
                      Code
                    </p>
                  </div>
                </div>

                <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-secondary">
                  Expira em 7 dias
                </span>
              </div>

              {/* Campo do link */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="link-convite"
                    className="text-xs font-semibold"
                  >
                    Link Exclusivo de Acesso
                  </label>

                  <span className="text-[10px] text-text-secondary">
                    Acesso direto sem cadastro obrigatório
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                    />

                    <input
                      id="link-convite"
                      type="text"
                      readOnly
                      value={linkConvite}
                      className="h-11 w-full select-all rounded-xl bg-input pl-10 pr-4 text-sm font-medium text-secondary outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={copiarLink}
                    className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-input px-5 text-xs font-semibold text-secondary transition hover:bg-background active:scale-95"
                  >
                    {copiado ? <Check size={16} /> : <Copy size={16} />}
                    {copiado ? "Copiado!" : "Copiar Link"}
                  </button>
                </div>

                {copiado && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-secondary">
                    <Check size={12} />
                    Link copiado para a área de transferência!
                  </div>
                )}
              </div>

              {/* Ações de compartilhamento */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${mensagemWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 rounded-xl bg-secondary px-4 py-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-secondary/95 active:scale-[0.98]"
                >
                  <MessageCircle size={18} />
                  Enviar via WhatsApp
                </a>

                <button
                  type="button"
                  onClick={mostrarQrCode}
                  className="flex items-center justify-center gap-2 rounded-xl bg-input px-4 py-3.5 text-xs font-semibold text-text-primary transition hover:bg-background"
                >
                  <QrCode size={18} className="text-secondary" />
                  Mostrar QR Code Presencial
                </button>
              </div>

              {/* QR Code */}
              <div
                ref={blocoQr}
                className={`flex flex-col items-center gap-6 rounded-xl bg-background p-6 transition sm:flex-row ${
                  qrDestacado ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex shrink-0 flex-col items-center rounded-xl bg-surface p-3 shadow-sm">
                  <QrCodeIlustrativo />

                  <span className="mt-2 text-[10px] font-medium text-text-secondary">
                    Scan Racha+
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-center sm:text-left">
                  <span className="text-base font-semibold">
                    Escaneie no Churrasco
                  </span>

                  <p className="text-xs leading-relaxed text-text-secondary">
                    Mostre este código na tela ou imprima na entrada. Qualquer
                    amigo com a câmera do celular entra na hora e confirma a
                    presença no rateio.
                  </p>

                  <div className="flex items-center justify-center gap-4 pt-1 sm:justify-start">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-semibold text-secondary transition hover:underline"
                    >
                      <Download size={14} />
                      Baixar Imagem QR
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-text-secondary transition hover:text-text-primary"
                    >
                      <Mail size={14} />
                      Enviar por E-mail
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos passos */}
            <div className="flex flex-col gap-4 rounded-xl bg-input p-6">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-primary" />

                <span className="text-base font-semibold text-secondary">
                  O que acontece agora?
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {proximosPassos.map((passo) => (
                  <div
                    key={passo.numero}
                    className="flex flex-col gap-2 rounded-xl bg-surface p-4 shadow-sm"
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${passo.cor}`}
                    >
                      {passo.numero}
                    </div>

                    <span className="text-xs font-semibold">
                      {passo.titulo}
                    </span>

                    <p className="text-xs text-text-secondary">
                      {passo.descricao}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - RESUMO E PARTICIPANTES */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="flex flex-col gap-5 rounded-xl bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-input text-primary">
                    <ReceiptText size={19} />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-base font-semibold">
                      Resumo do Rateio
                    </span>

                    <span className="text-xs text-text-secondary">
                      Dados consolidados do grupo
                    </span>
                  </div>
                </div>

                <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-secondary">
                  Evento / Lazer
                </span>
              </div>

              {/* Destaques financeiros */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl bg-background p-3">
                  <span className="text-sm text-text-secondary">
                    Orçamento Previsto
                  </span>

                  <span className="text-base font-bold text-secondary">
                    R$ 520,00
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-background p-3">
                  <span className="text-sm text-text-secondary">
                    Cota Individual
                  </span>

                  <span className="text-base font-bold text-tertiary">
                    R$ 65,00{" "}
                    <span className="text-[10px] font-normal text-text-secondary">
                      / 8 pessoas
                    </span>
                  </span>
                </div>
              </div>

              {/* Pix de destino */}
              <div className="flex flex-col gap-3 rounded-xl bg-input p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                  <WalletCards size={16} />
                  Destino dos Pagamentos (Pix Central)
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl bg-surface p-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold">
                      pix@mariana.com.br
                    </span>

                    <span className="truncate text-xs text-text-secondary">
                      Mariana Silva (Organizadora)
                    </span>
                  </div>

                  <ShieldCheck size={18} className="shrink-0 text-secondary" />
                </div>

                <div className="flex items-start gap-2 text-[10px] text-text-secondary">
                  <Clock size={14} className="mt-0.5 shrink-0 text-primary" />
                  Lembrete automático: 24h antes do evento via WhatsApp
                  habilitado.
                </div>
              </div>

              {/* Participantes */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    Participantes (8)
                  </span>

                  <span className="text-[10px] text-text-secondary">
                    4 confirmados • 4 pendentes
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {membros.map((membro) => (
                    <div
                      key={membro.id}
                      className="flex items-center justify-between gap-2 rounded-xl p-2.5 transition hover:bg-background"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {membro.avatar ? (
                          <img
                            src={membro.avatar}
                            alt={membro.nome}
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${membro.corIniciais}`}
                          >
                            {membro.iniciais}
                          </div>
                        )}

                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-xs font-semibold">
                            {membro.nome}
                          </span>

                          <span
                            className={`truncate text-[10px] ${
                              membro.organizador
                                ? "text-primary"
                                : "text-text-secondary"
                            }`}
                          >
                            {membro.detalhe}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          coresStatus[membro.status]
                        }`}
                      >
                        {membro.rotuloStatus}
                      </span>
                    </div>
                  ))}

                  <div className="rounded-xl bg-background p-2 text-center">
                    <span className="text-[10px] text-text-secondary">
                      + 4 convites pendentes de aceite
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÕES FINAIS */}
        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <button
              type="button"
              onClick={() => navigate("/meus-grupos")}
              className="w-full rounded-xl bg-input px-6 py-3 text-center text-xs font-semibold text-secondary transition hover:bg-background sm:w-auto"
            >
              ← Ver Meus Outros Grupos
            </button>

            <button
              type="button"
              onClick={() => navigate("/criar-grupo")}
              className="hidden px-4 py-3 text-xs text-text-secondary transition hover:text-text-primary sm:inline-flex"
            >
              + Adicionar Outra Despesa
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/grupo")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-xs font-semibold text-text-primary shadow-md transition hover:bg-tertiary hover:text-white hover:shadow-lg active:scale-95 sm:w-auto"
          >
            Ir para o Painel do Grupo
            <ArrowRight size={16} />
          </button>
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

export default GrupoCriado;
