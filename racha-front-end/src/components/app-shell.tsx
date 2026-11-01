import { useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Bell, ChevronRight, CircleHelp, EllipsisVertical, Menu, Plus, Search, Settings, Users, X } from "lucide-react";
import Link from "./app-link";
import { previewPath } from "../lib/navigation";
import Aba from "./aba-perfil";

const navigation = [
  { path: "/meus-grupos", label: "Meus grupos", icon: Users },
  { path: "/notificacoes", label: "Notificações", icon: Bell },
  { path: "/perfil", label: "Configurações", icon: Settings },
];

export default function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { pathname } = useLocation();
  const preview = pathname.startsWith("/previa") || pathname.startsWith("/revisao");
  const [menu, setMenu] = useState(false);
  const [profile, setProfile] = useState(false);
  return (
    <div className="racha-app">
      <aside className={menu ? "is-open" : ""}>
        <Link to="/meus-grupos" className="racha-brand" aria-label="Racha+, meus grupos">
          <span className="racha-brand-symbol">R<span>+</span></span>
          <strong>Racha<span>+</span></strong>
        </Link>
        <button className="racha-mobile-close racha-icon" aria-label="Fechar menu" onClick={() => setMenu(false)}><X size={18}/></button>
        <nav aria-label="Navegação principal">
          {navigation.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={previewPath(path, preview)} onClick={() => setMenu(false)}><Icon size={16}/><span>{label}</span></NavLink>
          ))}
        </nav>
        <div className="racha-sidebar-bottom">
          <Link className="racha-help-link" to="/faq"><CircleHelp size={15}/>Ajuda e suporte</Link>
          <div className="racha-sidebar-profile">
            <Link to="/perfil" className="racha-avatar" aria-label="Abrir meu perfil"><Users size={16}/></Link>
            <div className="racha-sidebar-identity"><strong>Rodrigo M.</strong><small>rodrigo@exemplo.com</small></div>
            <button className="racha-icon" aria-label="Menu do perfil" aria-expanded={profile} onClick={() => setProfile(!profile)}><EllipsisVertical size={16}/></button>
            {profile && <Aba placement="above" onClose={() => setProfile(false)}/>}
          </div>
        </div>
      </aside>
      <div className="racha-main">
        <header className="racha-topbar">
          <button className="racha-icon racha-mobile-close" aria-label="Abrir menu" onClick={() => setMenu(true)}><Menu size={20}/></button>
          <div className="racha-breadcrumb"><Link to="/meus-grupos">Dashboard</Link><ChevronRight size={11}/><span>{title}</span></div>
          <div className="racha-actions">
            <Link className="racha-topbar-icon" aria-label="Buscar grupos" to="/meus-grupos"><Search size={17}/></Link>
            <Link className="racha-topbar-icon racha-unread" aria-label="Notificações" to="/notificacoes"><Bell size={17}/></Link>
            <Link className="racha-primary" to="/criar-grupo"><Plus size={15}/>Novo Racha</Link>
            <Link className="racha-header-avatar" aria-label="Configurações do perfil" to="/perfil"><Users size={15}/></Link>
          </div>
        </header>
        <main className="racha-content">{children}</main>
      </div>
    </div>
  );
}
