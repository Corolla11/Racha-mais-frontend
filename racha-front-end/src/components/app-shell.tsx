import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { apiRequest } from "../lib/api";
import { ENDPOINTS, type NotificacoesResponseApi } from "../lib/endpoints";
import Aba from "./aba-perfil";
import { BrandMark } from "./brand-logo";
import Icon from "./icon";

const navigation = [
  { path: "/meus-grupos", label: "Meus Grupos", match: ["/meus-grupos", "/grupo", "/criar-grupo", "/tarefas", "/convite", "/grupos"] },
  { path: "/perfil", label: "Configurações", match: ["/perfil", "/assinatura", "/gerenciar-assinatura"] },
];

function isActive(pathname: string, match: string[]) {
  return match.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}-`));
}

/** Logo do Racha+ usado no header do redesign. */
export function RachaLogo({ to = "/meus-grupos" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-space-sm min-h-11 group" aria-label="Racha+, meus grupos">
      <BrandMark size={36} className="transition-transform group-hover:scale-105" />
      <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight">Racha<span className="text-primary">+</span></span>
    </Link>
  );
}

/** Rodapé padrão das telas do redesign. */
export function AppFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_4px_rgba(0,0,0,0.02)] py-space-lg mt-auto">
      <div className="max-w-6xl mx-auto px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-md text-center sm:text-left">
        <div className="flex items-center gap-space-sm flex-wrap justify-center">
          <div className="w-6 h-6 rounded-md bg-primary-container flex items-center justify-center text-on-primary"><Icon name="payments" size={14}/></div>
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Racha+ © {new Date().getFullYear()}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">• Gestão colaborativa simplificada</span>
        </div>
        <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <Link className="inline-flex items-center min-h-11 px-2 hover:text-primary transition-colors" to="/faq#termos">Termos</Link>
          <Link className="inline-flex items-center min-h-11 px-2 hover:text-primary transition-colors" to="/faq#privacidade">Privacidade</Link>
          <Link className="inline-flex items-center min-h-11 px-2 hover:text-primary transition-colors" to="/faq">Ajuda</Link>
        </div>
      </div>
    </footer>
  );
}

/**
 * Estrutura das telas autenticadas — "Redesign Header" do Stitch:
 * header fixo (logo, navegação, busca, notificações, Novo Grupo, avatar),
 * conteúdo e rodapé.
 *
 * `title` vira o título da aba do navegador. Por padrão o conteúdo é
 * centralizado em `max-w-6xl`; use `bare` para controlar a largura na página.
 */
export default function AppShell({ title, children, bare = false }: { title: string; children: ReactNode; bare?: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(false);
  const [menu, setMenu] = useState(false);
  const [busca, setBusca] = useState("");
  const [naoLidas, setNaoLidas] = useState(0);
  const { user } = useAuth();
  const name = user?.name || "Usuário";
  const shortName = name.trim().split(/\s+/).slice(0, 2).map((part, index) => index === 0 ? part : `${part[0]}.`).join(" ");

  useEffect(() => { document.title = `${title} | Racha+`; }, [title]);
  useEffect(() => {
    if (!user) return;
    let ativo = true;
    apiRequest<NotificacoesResponseApi>(`${ENDPOINTS.notificacoes.base}?limite=1`)
      .then((res) => { if (ativo) setNaoLidas(res.naoLidas ?? 0); })
      .catch(() => { if (ativo) setNaoLidas(0); });
    return () => { ativo = false; };
  }, [user, pathname]);
  // Fecha os menus ao trocar de rota (ajuste de estado durante o render, sem efeito).
  const [rotaAnterior, setRotaAnterior] = useState(pathname);
  if (rotaAnterior !== pathname) {
    setRotaAnterior(pathname);
    setProfile(false);
    setMenu(false);
  }

  function buscar(event: FormEvent) {
    event.preventDefault();
    const termo = busca.trim();
    navigate(termo ? `/meus-grupos?busca=${encodeURIComponent(termo)}` : "/meus-grupos");
  }

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-6xl mx-auto px-gutter-mobile sm:px-gutter flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg shrink-0">
            <button type="button" className="md:hidden min-w-11 min-h-11 -ml-2 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high" aria-label="Abrir menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              <Icon name={menu ? "close" : "menu"} size={22}/>
            </button>
            <RachaLogo/>
            <nav className="hidden md:flex items-center gap-space-xs" aria-label="Navegação principal">
              {navigation.map(({ path, label, match }) => {
                const active = isActive(pathname, match);
                return (
                  <NavLink
                    key={path}
                    to={path}
                    aria-current={active ? "page" : undefined}
                    className={() => active
                      ? "px-space-md min-h-11 inline-flex items-center transition-colors bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg"
                      : "px-space-md min-h-11 inline-flex items-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors rounded-lg"}
                  >
                    {label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <form className="flex-1 max-w-md hidden sm:block" role="search" onSubmit={buscar}>
            <label className="relative flex items-center w-full">
              <span className="sr-only">Buscar</span>
              <Icon name="search" size={20} className="absolute left-space-md text-outline pointer-events-none"/>
              <input
                value={busca}
                onChange={event => setBusca(event.target.value)}
                className="w-full pl-11 pr-space-md py-space-xs h-11 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                placeholder="Buscar despesas, grupos ou pessoas"
                type="search"
              />
            </label>
          </form>
          <div className="flex items-center gap-space-xs sm:gap-space-md shrink-0">
            <Link to="/notificacoes" aria-label={naoLidas > 0 ? `Notificações (${naoLidas} não lidas)` : "Notificações"} className={`relative min-w-11 min-h-11 rounded-full flex items-center justify-center transition-colors ${pathname.endsWith("/notificacoes") ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}>
              <Icon name="notifications" size={22}/>
              {naoLidas > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface"/>}
            </Link>
            <Link to="/criar-grupo" className="hidden sm:inline-flex items-center gap-space-xs px-space-md min-h-11 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-[0_4px_14px_rgba(194,65,12,0.3)] active:scale-[0.98] transition-all">
              <Icon name="add" size={20}/><span>Novo Grupo</span>
            </Link>
            <button type="button" className="flex items-center gap-space-sm min-h-11 px-1.5 group cursor-pointer" aria-label="Menu do perfil" aria-expanded={profile} onClick={() => setProfile(!profile)}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                {user?.image ? <img src={user.image} alt="" className="w-full h-full object-cover"/> : <Icon name="person" size={18} className="text-on-primary"/>}
              </div>
              <span className="hidden lg:block font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{shortName}</span>
              <Icon name="expand_more" size={18} className={`text-on-surface-variant group-hover:text-on-surface transition-transform ${profile ? "rotate-180" : ""}`}/>
            </button>
          </div>
        </div>
        {menu && (
          <nav className="md:hidden border-t border-surface-variant bg-surface-container-lowest px-gutter-mobile py-space-sm space-y-1" aria-label="Navegação principal">
            {[...navigation, { path: "/notificacoes", label: "Notificações", match: ["/notificacoes"] }, { path: "/criar-grupo", label: "Novo Grupo", match: [] as string[] }].map(({ path, label, match }) => (
              <NavLink key={path} to={path} className={`block px-space-md py-space-sm rounded-lg font-label-md text-label-md ${isActive(pathname, match) ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant"}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      {profile && <Aba onClose={() => setProfile(false)}/>}
      <main className="w-full pt-16 bg-surface flex-1">
        {bare ? children : <div className="max-w-6xl mx-auto px-gutter-mobile sm:px-gutter py-space-xl">{children}</div>}
      </main>
      <AppFooter/>
    </div>
  );
}
