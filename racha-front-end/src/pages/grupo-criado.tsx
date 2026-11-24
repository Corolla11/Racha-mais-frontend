import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AppShell from "../components/app-shell";
import Icon from "../components/icon";

const linkConvite = "https://racha.plus/g/churrasco-2025-x9k2";

const mensagemWhatsApp = encodeURIComponent(
  `Galera, criei o grupo no Racha+ pra dividir as despesas do churrasco: ${linkConvite}`,
);

const linkWhatsApp = `https://api.whatsapp.com/send?text=${mensagemWhatsApp}`;

// Dados demonstrativos do grupo recém-criado
const grupo = {
  nome: "Churrasco de Fim de Ano",
  emoji: "🥩",
  categoria: "Evento / Lazer",
  organizador: "Mariana Silva",
  participantes: 8,
  total: "R$ 520,00",
  cota: "R$ 65,00",
};

const membros = [
  { iniciais: "MS", cor: "bg-primary-container text-on-primary" },
  { iniciais: "LR", cor: "bg-surface-container-high text-primary" },
  { iniciais: "BM", cor: "bg-tertiary-fixed text-on-tertiary-fixed" },
  { iniciais: "CE", cor: "bg-secondary-fixed text-on-secondary-fixed-variant" },
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
    <svg viewBox="0 0 100 100" className="h-28 w-28" aria-hidden="true">
      {cantos.map((canto) => (
        <g key={`${canto.x}-${canto.y}`}>
          <rect x={canto.x} y={canto.y} width="24" height="24" rx="3" className="fill-on-surface" />
          <rect x={canto.x + 4} y={canto.y + 4} width="16" height="16" rx="2" className="fill-surface-container-lowest" />
          <rect x={canto.x + 8} y={canto.y + 8} width="8" height="8" className="fill-on-surface" />
        </g>
      ))}

      {pontos.map((ponto) => (
        <rect
          key={`${ponto.x}-${ponto.y}`}
          x={ponto.x}
          y={ponto.y}
          width={ponto.tamanho}
          height={ponto.tamanho}
          className={ponto.destaque ? "fill-primary-container" : "fill-on-surface"}
        />
      ))}
    </svg>
  );
}

function GrupoCriado() {
  const navigate = useNavigate();

  const [copiado, setCopiado] = useState(false);
  const [qrVisivel, setQrVisivel] = useState(false);
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
    setQrVisivel(true);

    // Espera o bloco ser exibido antes de rolar até ele
    window.requestAnimationFrame(() => {
      blocoQr.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    setQrDestacado(true);

    setTimeout(() => setQrDestacado(false), 1200);
  }

  return (
    <AppShell title="Grupo criado">
      <div className="relative isolate mx-auto w-full max-w-2xl py-space-md sm:py-space-lg">
        <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-fixed-dim/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-1/2 -z-10 h-64 w-64 rounded-full bg-secondary-fixed/30 blur-3xl" />

        {/* Caminho */}
        <nav aria-label="Navegação estrutural" className="mb-space-lg flex flex-wrap items-center justify-center gap-space-xs text-center">
          <Link to="/meus-grupos" className="font-label-sm text-label-sm text-outline transition-colors hover:text-on-surface">
            Meus Grupos
          </Link>
          <Icon name="chevron_right" size={16} className="text-outline-variant" />
          <Link to="/criar-grupo" className="font-label-sm text-label-sm text-outline transition-colors hover:text-on-surface">
            Criar Novo Grupo
          </Link>
          <Icon name="chevron_right" size={16} className="text-outline-variant" />
          <span className="font-label-sm text-label-sm font-semibold text-primary" aria-current="page">
            Grupo Criado
          </span>
        </nav>

        {/* Cartão de sucesso */}
        <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-space-md text-center shadow-xl shadow-on-surface/5 sm:p-space-xl">
          <div className="relative mb-space-md flex items-center justify-center">
            <Icon
              name="auto_awesome"
              size={20}
              className="absolute -left-5 -top-3 animate-bounce text-tertiary-container [animation-duration:2.4s]"
            />
            <Icon name="celebration" size={22} className="absolute -bottom-1 -right-5 animate-pulse text-secondary-container" />
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed shadow-lg shadow-primary-container/20 sm:h-24 sm:w-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container shadow-md sm:h-16 sm:w-16">
                <Icon name="check" size={34} filled className="text-on-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }} />
              </div>
            </div>
          </div>

          <h1 className="mb-space-xs max-w-lg font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
            Tudo pronto! Seu grupo foi criado com sucesso!
          </h1>
          <p className="mx-auto mb-space-lg max-w-md font-body-md text-body-md text-on-surface-variant">
            O grupo{" "}
            <span className="font-semibold text-on-surface">“{grupo.nome} {grupo.emoji}”</span>{" "}
            está ativo e pronto para receber tarefas, despesas e comprovantes.
          </p>

          {/* Resumo do grupo */}
          <div className="mb-space-lg w-full rounded-xl bg-surface-container-low p-space-md text-left shadow-sm sm:p-space-lg">
            <div className="flex flex-col gap-space-md pb-space-md sm:flex-row sm:items-center">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-secondary-container to-primary-container text-3xl shadow-sm">
                <span aria-hidden="true">{grupo.emoji}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <Icon name="outdoor_grill" size={18} filled className="absolute bottom-1 right-1 text-surface-container-lowest" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-space-xs">
                  <span className="rounded-full bg-surface-container-highest px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                    {grupo.categoria}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-surface-container-lowest px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-container opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-container" />
                    </span>
                    Ativo
                  </span>
                </div>
                <h2 className="truncate font-headline-sm text-headline-sm text-on-surface">{grupo.nome}</h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  <span>
                    Criado por <strong className="font-semibold text-on-surface">{grupo.organizador}</strong>
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="flex items-center gap-1">
                    <Icon name="group" size={16} className="text-outline" />
                    {grupo.participantes} membros convidados
                  </span>
                </div>
              </div>
            </div>

            {/* Valores e participantes */}
            <div className="mb-space-md grid grid-cols-2 gap-space-sm sm:grid-cols-3">
              <div className="rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                <span className="block font-label-sm text-label-sm text-outline">Valor Total</span>
                <span className="font-label-lg text-label-lg font-semibold text-on-surface">{grupo.total}</span>
              </div>
              <div className="rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                <span className="block font-label-sm text-label-sm text-outline">Por Pessoa ({grupo.participantes})</span>
                <span className="font-label-lg text-label-lg font-bold text-primary">{grupo.cota}</span>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm shadow-sm sm:col-span-1">
                <div className="flex items-center -space-x-2" aria-label={`${grupo.participantes} participantes`}>
                  {membros.map((membro) => (
                    <span
                      key={membro.iniciais}
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-label-sm text-label-sm font-bold shadow-sm ring-2 ring-surface-container-lowest ${membro.cor}`}
                    >
                      {membro.iniciais}
                    </span>
                  ))}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest font-label-sm text-label-sm font-medium text-on-surface shadow-sm ring-2 ring-surface-container-lowest">
                    +{grupo.participantes - membros.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Link de convite */}
            <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm shadow-sm sm:p-space-md">
              <div className="flex items-center justify-between gap-space-sm">
                <label htmlFor="link-convite" className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                  <Icon name="link" size={16} className="text-primary" />
                  Link seguro de convite
                </label>
                <span className="font-label-sm text-label-sm text-outline">Acesso instantâneo via link</span>
              </div>
              <div className="flex flex-col items-stretch gap-space-xs sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center justify-between rounded-lg bg-surface-container-low px-space-md py-2">
                  <input
                    id="link-convite"
                    type="text"
                    readOnly
                    value={linkConvite}
                    onFocus={(event) => event.currentTarget.select()}
                    className="min-w-0 flex-1 truncate bg-transparent font-mono text-[13px] text-on-surface focus:outline-none"
                  />
                  <Icon name="lock" size={18} className="ml-2 shrink-0 text-outline" />
                </div>
                <div className="flex shrink-0 items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={copiarLink}
                    className={`flex h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg px-space-md font-label-md text-label-md transition-all active:scale-[0.98] sm:flex-none ${
                      copiado ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
                    }`}
                  >
                    <Icon name={copiado ? "check" : "content_copy"} size={18} />
                    <span>{copiado ? "Copiado!" : "Copiar Link"}</span>
                  </button>
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Compartilhar no WhatsApp"
                    className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-space-md font-label-md text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-variant active:scale-[0.98]"
                  >
                    <Icon name="chat" size={18} className="text-primary" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={mostrarQrCode}
                    aria-label="Mostrar QR Code presencial"
                    title="Mostrar QR Code presencial"
                    className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-surface-container px-space-md font-label-md text-label-md text-on-surface shadow-sm transition-all hover:bg-surface-variant active:scale-[0.98]"
                  >
                    <Icon name="qr_code_2" size={18} className="text-primary" />
                    <span className="hidden sm:inline">QR Code</span>
                  </button>
                </div>
              </div>
              {copiado && (
                <p role="status" className="flex items-center gap-1 font-label-sm text-label-sm text-primary">
                  <Icon name="check_circle" size={14} />
                  Link copiado para a área de transferência!
                </p>
              )}

              {qrVisivel && (
                <div
                  ref={blocoQr}
                  className={`mt-space-xs flex flex-col items-center gap-space-md rounded-lg bg-surface-container-low p-space-md transition-shadow sm:flex-row ${
                    qrDestacado ? "ring-2 ring-primary-container" : ""
                  }`}
                >
                  <div className="flex shrink-0 flex-col items-center rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                    <QrCodeIlustrativo />
                    <span className="mt-1 font-label-sm text-label-sm text-outline">Scan Racha+</span>
                  </div>
                  <div className="flex flex-col gap-space-xs text-center sm:text-left">
                    <span className="font-label-md text-label-md text-on-surface">Escaneie no Churrasco</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Mostre este código na tela ou imprima na entrada. Qualquer
                      amigo com a câmera do celular entra na hora e confirma a
                      presença no rateio.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Próximos passos */}
          <div className="mb-space-lg w-full text-left">
            <h3 className="mb-space-sm pl-1 font-label-md text-label-md uppercase tracking-wider text-outline">
              Próximos Passos
            </h3>
            <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/grupo")}
                className="group flex cursor-pointer items-start gap-space-sm rounded-xl bg-surface-container-low p-space-md text-left shadow-sm transition-all hover:bg-surface-container hover:shadow-md"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed transition-transform group-hover:scale-105">
                  <Icon name="add_card" size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-label-md text-label-md font-semibold text-on-surface transition-colors group-hover:text-primary">
                    Lançar 1ª despesa ou tarefa
                  </span>
                  <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                    Divida adiantamentos como carnes, bebidas ou o aluguel do espaço.
                  </p>
                </div>
                <Icon name="chevron_right" size={18} className="text-outline-variant transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm transition-all hover:bg-surface-container hover:shadow-md"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high transition-transform group-hover:scale-105">
                  <Icon name="send" size={20} className="text-tertiary" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-label-md text-label-md font-semibold text-on-surface transition-colors group-hover:text-primary">
                    Avisar amigos no WhatsApp
                  </span>
                  <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
                    Envie o link para todos acompanharem o saldo em tempo real.
                  </p>
                </div>
                <Icon name="chevron_right" size={18} className="text-outline-variant transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Ações */}
          <div className="flex w-full flex-col items-center justify-center gap-space-sm pt-space-xs sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/grupo")}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-xl font-label-lg text-label-lg text-on-primary shadow-lg shadow-primary-container/30 transition-all hover:bg-primary-container/90 active:scale-[0.98] sm:w-auto"
            >
              <span>Ir para o Painel do Grupo</span>
              <Icon name="arrow_forward" size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/meus-grupos")}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-surface-container-high px-space-lg font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-variant sm:w-auto"
            >
              <span>Voltar para Meus Grupos</span>
            </button>
          </div>
        </div>

        <div className="mt-space-md flex items-center justify-center gap-space-xs text-center font-label-sm text-label-sm text-outline">
          <Icon name="shield_lock" size={16} />
          <span>Criptografia ponta a ponta e cálculo automático de dívidas mínimas</span>
        </div>
      </div>
    </AppShell>
  );
}

export default GrupoCriado;
