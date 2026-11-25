import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";

type GrupoCriadoState = {
  id: string;
  nome: string;
  categoria?: string;
  participantes?: number;
  total?: string;
  cota?: string;
};

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
  const { user } = useAuth();
  const state = useLocation().state as GrupoCriadoState | null;

  const [copiado, setCopiado] = useState(false);
  const [qrVisivel, setQrVisivel] = useState(false);
  const [qrDestacado, setQrDestacado] = useState(false);
  const blocoQr = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!copiado) return;
    const t = window.setTimeout(() => setCopiado(false), 3000);
    return () => window.clearTimeout(t);
  }, [copiado]);

  if (!state?.id || !state?.nome) {
    return <Navigate to="/meus-grupos" replace />;
  }

  const linkGrupo = `${window.location.origin}/grupo/${encodeURIComponent(state.id)}`;
  const linkWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Criei o grupo "${state.nome}" no Racha+: ${linkGrupo}`,
  )}`;
  const destinoGrupo = `/grupo/${encodeURIComponent(state.id)}`;

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkGrupo);
    } catch {
      /* Campo permite seleção manual */
    }
    setCopiado(true);
  }

  function mostrarQrCode() {
    setQrVisivel(true);
    window.requestAnimationFrame(() => {
      blocoQr.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setQrDestacado(true);
    window.setTimeout(() => setQrDestacado(false), 1200);
  }

  return (
    <AppShell title="Grupo criado">
      <div className="relative isolate mx-auto w-full max-w-2xl py-space-md sm:py-space-lg">
        <nav aria-label="Navegação estrutural" className="mb-space-lg flex flex-wrap items-center justify-center gap-space-xs text-center font-label-sm text-label-sm text-on-surface-variant">
          <Link to="/meus-grupos" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Icon name="groups" size={16} />
            <span>Meus Grupos</span>
          </Link>
          <Icon name="chevron_right" size={16} className="text-outline-variant" />
          <Link to="/criar-grupo" className="transition-colors hover:text-primary">
            Criar Novo Grupo
          </Link>
          <Icon name="chevron_right" size={16} className="text-outline-variant" />
          <span className="font-semibold text-on-surface" aria-current="page">
            Grupo Criado
          </span>
        </nav>

        <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-space-md text-center shadow-xl shadow-on-surface/5 sm:p-space-xl">
          <div className="mb-space-md flex h-16 w-16 items-center justify-center rounded-full bg-primary-container shadow-md">
            <Icon name="check" size={34} filled className="text-on-primary" />
          </div>

          <h1 className="mb-space-xs max-w-lg font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface sm:font-headline-lg sm:text-headline-lg">
            Tudo pronto! Seu grupo foi criado com sucesso!
          </h1>
          <p className="mx-auto mb-space-lg max-w-md font-body-md text-body-md text-on-surface-variant">
            O grupo <span className="font-semibold text-on-surface">“{state.nome}”</span> está ativo e pronto para receber tarefas e despesas.
          </p>

          <div className="mb-space-lg w-full rounded-xl bg-surface-container-low p-space-md text-left shadow-sm sm:p-space-lg">
            <div className="flex flex-col gap-space-xs pb-space-md">
              <div className="flex flex-wrap items-center gap-space-xs">
                {state.categoria && (
                  <span className="rounded-full bg-surface-container-highest px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                    {state.categoria}
                  </span>
                )}
                <span className="rounded-full bg-surface-container-lowest px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                  Ativo
                </span>
              </div>
              <h2 className="truncate font-headline-sm text-headline-sm text-on-surface">{state.nome}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Criado por <strong className="font-semibold text-on-surface">{user?.name || "Você"}</strong>
                {state.participantes ? ` • ${state.participantes} participantes` : ""}
              </p>
            </div>

            {(state.total || state.cota) && (
              <div className="mb-space-md grid grid-cols-2 gap-space-sm">
                {state.total && (
                  <div className="rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                    <span className="block font-label-sm text-label-sm text-outline">Valor Total</span>
                    <span className="font-label-lg text-label-lg font-semibold text-on-surface">{state.total}</span>
                  </div>
                )}
                {state.cota && (
                  <div className="rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                    <span className="block font-label-sm text-label-sm text-outline">Por Pessoa</span>
                    <span className="font-label-lg text-label-lg font-bold text-primary">{state.cota}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm shadow-sm sm:p-space-md">
              <label htmlFor="link-convite" className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <Icon name="link" size={16} className="text-primary" />
                Link do grupo
              </label>
              <div className="flex flex-col items-stretch gap-space-xs sm:flex-row sm:items-center">
                <input
                  id="link-convite"
                  type="text"
                  readOnly
                  value={linkGrupo}
                  onFocus={(event) => event.currentTarget.select()}
                  className="min-w-0 flex-1 truncate rounded-lg bg-surface-container-low px-space-md py-2 font-mono text-[13px] text-on-surface focus:outline-none"
                />
                <div className="flex shrink-0 items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={copiarLink}
                    className="flex h-10 items-center justify-center gap-1 rounded-lg bg-surface-container-high px-space-md font-label-md text-label-md text-on-surface hover:bg-surface-variant"
                  >
                    <Icon name={copiado ? "check" : "content_copy"} size={18} />
                    <span>{copiado ? "Copiado!" : "Copiar Link"}</span>
                  </button>
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-space-md font-label-md text-label-md text-on-surface hover:bg-surface-variant"
                  >
                    <Icon name="chat" size={18} className="text-primary" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={mostrarQrCode}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-space-md font-label-md text-label-md text-on-surface hover:bg-surface-variant"
                  >
                    <Icon name="qr_code_2" size={18} className="text-primary" />
                    <span className="hidden sm:inline">QR Code</span>
                  </button>
                </div>
              </div>
              {qrVisivel && (
                <div
                  ref={blocoQr}
                  className={`mt-space-xs flex flex-col items-center gap-space-md rounded-lg bg-surface-container-low p-space-md sm:flex-row ${
                    qrDestacado ? "ring-2 ring-primary-container" : ""
                  }`}
                >
                  <div className="flex shrink-0 flex-col items-center rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                    <QrCodeIlustrativo />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    QR Code para compartilhar o acesso ao grupo presencialmente.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-space-sm sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(destinoGrupo, { state: { nomeGrupo: state.nome } })}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-xl font-label-lg text-label-lg text-on-primary shadow-lg shadow-primary-container/30 transition-all hover:bg-primary-container/90 sm:w-auto"
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
      </div>
    </AppShell>
  );
}

export default GrupoCriado;
