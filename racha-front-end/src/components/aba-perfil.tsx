import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import Icon from "./icon";
import UserAvatar from "./user-avatar";

interface ProfileMenuProps {
  onClose?: () => void;
  /** Mantido por compatibilidade; o menu sempre abre abaixo do avatar do header. */
  placement?: "below" | "above";
}

/** TELA 12 — Menu de Perfil (Dropdown Aberto - Redesign Header). */
export default function Aba({ onClose }: ProfileMenuProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { user, signOut } = useAuth();
  const [erroLogout, setErroLogout] = useState("");
  const [saindo, setSaindo] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const name = user?.name || "Usuário";
  const handle = user?.email || "Minha conta";
  const activeTab = new URLSearchParams(search).get("aba");
  const inProfile = pathname.endsWith("/perfil");

  const items = [
    { label: "Meu Perfil", to: "/perfil", icon: "person", active: inProfile && !activeTab },
    { label: "Chaves Pix & Recebimentos", to: "/perfil?aba=pix", icon: "key", active: inProfile && activeTab === "pix" },
    { label: "Notificações & Alertas", to: "/notificacoes", icon: "notifications", active: pathname.endsWith("/notificacoes") },
    { label: "Segurança & Privacidade", to: "/perfil?aba=security", icon: "security", active: inProfile && activeTab === "security" },
    { label: "Planos & Assinaturas", to: "/assinatura", icon: "star", active: pathname.endsWith("/assinatura") || pathname.endsWith("/gerenciar-assinatura") },
    { label: "Ajuda & Suporte", to: "/faq", icon: "help_outline", active: pathname.endsWith("/faq") },
  ];

  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") { close.current?.(); trigger?.focus(); }
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger?.contains(event.target)) close.current?.();
    }
    document.addEventListener("keydown", keyboard);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);

  async function encerrarSessao() {
    setErroLogout("");
    setSaindo(true);
    try {
      await signOut();
      onClose?.();
      navigate("/login", { replace: true });
    } catch {
      setErroLogout("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 top-16 bg-inverse-surface/35 backdrop-blur-[3px] z-40" aria-hidden="true" onClick={onClose}/>
      <div
        ref={panel}
        role="region"
        aria-label="Opções da conta"
        className="fixed top-[68px] right-4 sm:right-6 lg:right-[calc((100vw-72rem)/2+1.5rem)] z-50 w-[92vw] max-w-[390px]"
      >
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_-10px_rgba(18,28,42,0.18),0_10px_20px_-5px_rgba(18,28,42,0.08)] overflow-hidden flex flex-col max-h-[calc(100vh-84px)] overflow-y-auto">
          <div className="p-space-lg bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-surface-container-lowest">
            <div className="flex items-start justify-between gap-space-sm mb-space-sm">
              <Link to="/perfil" onClick={onClose} className="relative shrink-0" aria-label="Abrir meu perfil">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md overflow-hidden ring-4 ring-surface-container-lowest">
                  <UserAvatar
                    userId={user?.id}
                    image={user?.image}
                    alt={`Foto de ${name}`}
                    fallback={<Icon name="person" size={32} className="text-on-primary" />}
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest" title="Disponível"/>
              </Link>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-bold tracking-wide">
                <Icon name="check_circle" size={14} filled/>
                <span>{user ? "AUTENTICADO" : "VISITANTE"}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight leading-snug">{name}</h2>
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span className="text-primary font-medium truncate">{handle}</span>
              </div>
            </div>
            <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-on-surface">
                  <Icon name="qr_code_2" size={18} className="text-primary"/>
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-outline">Chave Pix Principal</span>
                </div>
              </div>
              <Link to="/perfil?aba=pix" onClick={onClose} className="flex items-center justify-between bg-surface-container-lowest px-space-sm py-1.5 rounded-lg group hover:bg-surface-container-high transition-colors">
                <span className="font-label-md text-label-md text-on-surface font-semibold font-mono tracking-tight">Gerenciar chave Pix</span>
                <Icon name="chevron_right" size={18} className="text-outline group-hover:text-primary transition-colors"/>
              </Link>
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <Link to="/meus-grupos" onClick={onClose} className="bg-surface-container-lowest p-space-xs rounded-lg text-center">
                  <span className="block font-label-sm text-label-sm text-outline">Grupos Ativos</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">—</span>
                </Link>
                <div className="bg-surface-container-lowest p-space-xs rounded-lg text-center">
                  <span className="block font-label-sm text-label-sm text-outline">Pontualidade</span>
                  <span className="font-headline-sm text-headline-sm text-emerald-600 font-extrabold">—</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="p-space-sm space-y-0.5">
            {items.map(item => (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                aria-current={item.active ? "page" : undefined}
                className={`flex items-center justify-between px-space-md rounded-xl transition-colors group ${item.active ? "py-2.5 bg-primary-fixed/30 text-on-primary-fixed hover:bg-primary-fixed/45" : "py-2 text-on-surface hover:bg-surface-container-low"}`}
              >
                <div className="flex items-center gap-space-md">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.active ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary"}`}>
                    <Icon name={item.icon} size={18} filled={item.active}/>
                  </div>
                  <span className={`font-label-md text-label-md ${item.active ? "font-bold text-on-surface" : "font-medium"}`}>{item.label}</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <Icon name="chevron_right" size={18} className={`transition-transform group-hover:translate-x-0.5 ${item.active ? "text-primary" : "text-outline"}`}/>
                </div>
              </Link>
            ))}
            <div className="my-space-xs px-space-md py-1"><div className="w-full h-px bg-surface-variant"/></div>
            {erroLogout && <p role="alert" className="px-space-md py-1 font-label-sm text-label-sm text-error">{erroLogout}</p>}
            <button
              type="button"
              onClick={() => void encerrarSessao()}
              disabled={saindo}
              className="w-full flex items-center justify-between px-space-md py-2.5 rounded-xl text-secondary hover:bg-error-container/40 transition-all group text-left disabled:opacity-60"
            >
              <div className="flex items-center gap-space-md">
                <div className="w-8 h-8 rounded-lg bg-error-container/60 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <Icon name="logout" size={18}/>
                </div>
                <div>
                  <span className="font-label-md text-label-md font-bold block leading-tight">{saindo ? "Encerrando..." : "Encerrar Sessão"}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Desconectar deste navegador</span>
                </div>
              </div>
              <Icon name="exit_to_app" size={18} className="text-secondary opacity-70 group-hover:opacity-100 transition-opacity"/>
            </button>
          </nav>
          <div className="px-space-lg py-space-xs bg-surface-container-low flex items-center justify-between text-outline font-label-sm text-label-sm">
            <span>Racha+ (Web)</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600"/> Conexão Segura</span>
          </div>
        </div>
      </div>
    </>
  );
}
