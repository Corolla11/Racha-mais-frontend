import { useEffect, useRef, useState } from "react";
import { Award, BadgeCheck, Bell, CircleHelp, KeyRound, LogOut, Shield, UserRound, WalletCards } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { useAppNavigate } from "../lib/navigation";
import Link from "./app-link";
import "./profile-menu.css";

interface ProfileMenuProps {
  onClose?: () => void;
  placement?: "below" | "above";
}

export default function Aba({ onClose, placement = "below" }: ProfileMenuProps) {
  const navigate = useAppNavigate();
  const { pathname, search } = useLocation();
  const { user, signOut } = useAuth();
  const [erroLogout, setErroLogout] = useState("");
  const [saindo, setSaindo] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const preview = pathname.startsWith("/previa") || pathname.startsWith("/revisao");
  const demo = preview && !user;
  const name = user?.name || (demo ? "Rodrigo Mendes" : "Usuário");
  const handle = user?.email || (demo ? "@rodrigo.m" : "Minha conta");
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const activeTab = new URLSearchParams(search).get("aba");
  const inProfile = pathname.endsWith("/perfil");
  const items = [
    { label: "Meu Perfil", to: "/perfil", icon: UserRound, active: inProfile && !activeTab },
    { label: "Chaves Pix & Recebimentos", to: "/perfil?aba=pix", icon: WalletCards, active: inProfile && activeTab === "pix" },
    { label: "Notificações & Alertas", to: "/notificacoes", icon: Bell, active: pathname.endsWith("/notificacoes"), badge: demo ? "3 novas" : undefined, badgeClass: "notifications" },
    { label: "Segurança & Privacidade", to: "/perfil?aba=security", icon: Shield, active: inProfile && activeTab === "security" },
    { label: "Planos & Vantagens", to: "/assinatura", icon: Award, active: pathname.endsWith("/assinatura") || pathname.endsWith("/gerenciar-assinatura"), badge: demo ? "Plano Pro" : undefined, badgeClass: "plan" },
    { label: "Ajuda & Suporte", to: "/faq", icon: CircleHelp, active: pathname.endsWith("/faq") },
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
      if (!demo) await signOut();
      onClose?.();
      navigate("/login", { replace: true });
    } catch {
      setErroLogout("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  return (
    <div ref={panel} className={`profile-menu profile-menu--${placement}`} role="region" aria-label="Opções da conta">
      <div className="profile-menu__header">
        <Link to="/perfil" className="profile-menu__avatar" aria-label="Abrir meu perfil" onClick={onClose}>
          {user?.image ? <img src={user.image} alt={`Foto de ${name}`}/> : <span>{initials}</span>}
          <i aria-hidden="true"/>
        </Link>
        <div className="profile-menu__identity"><strong className="profile-menu__name">{name}</strong><span className="profile-menu__handle">{handle}</span></div>
        <span className="profile-menu__session">{user ? "AUTENTICADO" : demo ? "PRÉVIA" : "VISITANTE"}</span>
      </div>

      <Link to="/perfil?aba=pix" className="profile-menu__pix" onClick={onClose}>
        <div><span className="profile-menu__pix-label"><KeyRound size={10}/>CHAVE PIX PRINCIPAL</span><span className="profile-menu__verified">{demo ? "Verificada" : "Gerenciar"}</span></div>
        <span className="profile-menu__pix-value">{demo ? "rodrigo.alencar@pix.me" : "Consultar chave de recebimento"}</span>
      </Link>

      <div className="profile-menu__metrics">
        <Link to="/meus-grupos" onClick={onClose}><span className="profile-menu__metric-label">Grupos Ativos</span><strong className="profile-menu__metric-value">{demo ? "7" : "—"}</strong></Link>
        <div><span className="profile-menu__metric-label">Pontualidade</span><strong className="profile-menu__metric-value profile-menu__metric-value--green">{demo ? "99.4%" : "—"}{demo && <BadgeCheck size={12}/>}</strong></div>
      </div>

      <div className="profile-menu__links">
        {items.map(({ label, to, icon: Icon, active, badge, badgeClass }) => (
          <Link key={label} to={to} onClick={onClose} className={`profile-menu__item ${active ? "profile-menu__item--active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon size={13}/><span>{label}</span>{badge && <span className={`profile-menu__badge profile-menu__badge--${badgeClass}`}>{badge}</span>}{active && <i aria-hidden="true"/>}
          </Link>
        ))}
      </div>
      <div className="profile-menu__footer">
        {erroLogout && <p role="alert" className="profile-menu__error">{erroLogout}</p>}
        <button type="button" onClick={() => void encerrarSessao()} disabled={saindo}><LogOut size={13}/>{saindo ? "Encerrando..." : "Encerrar Sessão"}</button>
      </div>
    </div>
  );
}
