import { Fragment, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS, type ChavePixApi, type TipoChavePix } from "../lib/endpoints";
import Icon from "./icon";
import Overlay from "./overlay";
import PixPreview from "./pix-preview";

/* ------------------------------------------------------------------ */
/* Peças compartilhadas das telas de Configurações (perfil/assinatura) */
/* ------------------------------------------------------------------ */

export type SettingsTab = "profile" | "pix" | "security" | "notifications" | "plans";

const settingsTabs: { value: SettingsTab; label: string; icon: string; to: string }[] = [
  { value: "profile", label: "Perfil", icon: "person", to: "/perfil" },
  { value: "pix", label: "Pagamentos & Pix", icon: "payments", to: "/perfil?aba=pix" },
  { value: "security", label: "Segurança & Conta", icon: "lock", to: "/perfil?aba=security" },
  { value: "notifications", label: "Notificações", icon: "notifications", to: "/perfil?aba=notifications" },
  { value: "plans", label: "Planos & Assinaturas", icon: "workspace_premium", to: "/gerenciar-assinatura" },
];

/** Barra de abas das Configurações. Com `onSelect`, as abas do perfil viram botões; "Planos" é sempre link. */
export function SettingsTabs({ active, onSelect }: { active: SettingsTab; onSelect?: (tab: Exclude<SettingsTab, "plans">) => void }) {
  return (
    <div className="w-full overflow-x-auto [scrollbar-width:none] mb-space-xl">
      <div className="flex items-center gap-2 p-1.5 bg-surface-container-low rounded-xl w-max min-w-full md:min-w-0">
        {settingsTabs.map(tab => {
          const current = tab.value === active;
          const className = `px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 whitespace-nowrap ${current ? "bg-surface-container-lowest text-primary font-bold shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/60"}`;
          const content = <><Icon name={tab.icon} size={18} filled={current}/><span>{tab.label}</span></>;
          if (onSelect && tab.value !== "plans") {
            const value = tab.value;
            return <button key={tab.value} type="button" aria-current={current ? "page" : undefined} className={className} onClick={() => onSelect(value)}>{content}</button>;
          }
          return <Link key={tab.value} to={tab.to} aria-current={current ? "page" : undefined} className={className}>{content}</Link>;
        })}
      </div>
    </div>
  );
}

export interface Crumb { label: string; to?: string; onClick?: () => void }

/** Breadcrumb "Início › ... › atual" usado nas telas de configurações e planos. */
export function SettingsBreadcrumb({ trail }: { trail: Crumb[] }) {
  const linkClass = "hover:text-primary transition-colors";
  return (
    <nav aria-label="Navegação estrutural" className="flex flex-wrap items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant mb-space-md">
      <Link to="/meus-grupos" className={`${linkClass} flex items-center gap-1`}><Icon name="home" size={16}/><span>Início</span></Link>
      {trail.map((crumb, index) => {
        const last = index === trail.length - 1;
        return (
          <Fragment key={crumb.label}>
            <Icon name="chevron_right" size={14} className="text-outline"/>
            {last ? <span className="text-on-surface font-semibold" aria-current="page">{crumb.label}</span>
              : crumb.onClick ? <button type="button" className={linkClass} onClick={crumb.onClick}>{crumb.label}</button>
              : <Link to={crumb.to ?? "/perfil"} className={linkClass}>{crumb.label}</Link>}
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Aviso flutuante (toast) do Stitch; some sozinho após alguns segundos. */
export function StatusToast({ message, onDone, tone = "info" }: { message: string; onDone: () => void; tone?: "info" | "error" }) {
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; }, [onDone]);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => done.current(), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);
  if (!message) return null;
  return (
    <div role={tone === "error" ? "alert" : "status"} className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-center gap-space-sm px-space-md py-space-sm rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl font-label-md text-label-md sm:max-w-md">
      <Icon name={tone === "error" ? "error" : "task_alt"} size={20} className={tone === "error" ? "text-secondary-fixed-dim" : "text-primary-container"}/>
      <span className="flex-1">{message}</span>
      <button type="button" aria-label="Fechar aviso" className="text-inverse-on-surface/70 hover:text-inverse-on-surface" onClick={() => done.current()}><Icon name="close" size={18}/></button>
    </div>
  );
}

/** Interruptor (switch) no estilo do Stitch, acessível como checkbox. */
export function ToggleRow({ icon, title, description, checked, onChange }: { icon: string; title: string; description: ReactNode; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-space-md cursor-pointer group">
      <div className="flex items-start gap-space-md">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface mt-0.5"><Icon name={icon} size={20}/></div>
        <div>
          <span className="font-label-lg text-label-lg text-on-surface block group-hover:text-primary transition-colors">{title}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">{description}</span>
        </div>
      </div>
      <div className="relative shrink-0 mt-1">
        <input type="checkbox" role="switch" className="sr-only peer" checked={checked} onChange={event => onChange(event.target.checked)}/>
        <div className="w-12 h-6 bg-surface-container-highest rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container peer-focus-visible:ring-offset-2 peer-checked:bg-primary-container transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:after:translate-x-6"/>
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Painéis "Pagamentos & Pix" e "Segurança & Conta"                    */
/* ------------------------------------------------------------------ */

const keyTypes: Record<TipoChavePix, { label: string; icon: string }> = {
  telefone: { label: "Celular", icon: "smartphone" },
  email: { label: "E-mail", icon: "mail" },
  cpf: { label: "CPF", icon: "badge" },
  aleatoria: { label: "Aleatória", icon: "key" },
};

const smallButton = "inline-flex items-center gap-1 px-space-md py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors";
const primaryButton = "inline-flex items-center justify-center gap-space-xs px-space-lg h-11 rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary font-label-md text-label-md shadow-[0_4px_14px_rgba(255,140,66,0.35)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryButton = "inline-flex items-center justify-center gap-space-xs px-space-lg h-11 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors";
const inputClass = "w-full h-11 px-4 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all";

function SectionTitle({ icon, title, description, action }: { icon: string; title: string; description: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs"><Icon name={icon} size={22} className="text-primary"/><span>{title}</span></h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      </div>
      {action}
    </div>
  );
}

function strength(value: string) {
  if (value.length === 0) return { label: "Vazia", bars: 0, color: "" };
  if (value.length < 6) return { label: "Fraca", bars: 1, color: "bg-secondary-container" };
  if (value.length < 10) return { label: "Moderada", bars: 3, color: "bg-primary-container" };
  return { label: "Forte", bars: 4, color: "bg-primary" };
}

function PasswordInput({ id, name, label, placeholder, show, onToggle, onChange }: { id: string; name: string; label: string; placeholder: string; show: boolean; onToggle: () => void; onChange?: (value: string) => void }) {
  return (
    <div>
      <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor={id}>{label}</label>
      <div className="relative flex items-center">
        <input id={id} name={name} type={show ? "text" : "password"} required minLength={name === "old" ? undefined : 8} autoComplete="off" placeholder={placeholder} onChange={onChange && (event => onChange(event.target.value))} className="w-full h-11 px-4 pr-11 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md shadow-sm ring-1 ring-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"/>
        <button type="button" aria-label={`${show ? "Ocultar" : "Revelar"} ${label.toLowerCase()}`} className="absolute right-3 text-outline hover:text-on-surface p-1 rounded transition-colors" onClick={onToggle}>
          <Icon name={show ? "visibility_off" : "visibility"} size={20}/>
        </button>
      </div>
    </div>
  );
}

export default function AccountPanels({ panel }: { panel: "pix" | "security" }) {
  const { user, changePassword } = useAuth();
  const [message, setMessage] = useState("");
  const [chaves, setChaves] = useState<ChavePixApi[]>([]);
  const [key, setKey] = useState("(11) 98765-4321");
  const [keyType, setKeyType] = useState<TipoChavePix>("telefone");
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [suggestPix, setSuggestPix] = useState(true);
  const [whatsappReminders, setWhatsappReminders] = useState(true);
  const [savedPrefs, setSavedPrefs] = useState({ suggestPix: true, whatsappReminders: true });
  const [newPassword, setNewPassword] = useState("");
  const [visible, setVisible] = useState({ old: false, new: false, confirm: false });
  const ids = useId();

  const principal = chaves[0];
  const saved = principal?.chave ?? "(11) 98765-4321";
  const titular = user?.name || "Rodrigo M.";

  useEffect(() => {
    if (panel !== "pix" || !user) return;
    let ativo = true;
    apiRequest<ChavePixApi[]>(`${ENDPOINTS.chavesPix.base}?idUser=${encodeURIComponent(user.id)}`)
      .then((lista) => {
        if (!ativo) return;
        setChaves(lista);
        if (lista[0]) {
          setKey(lista[0].chave);
          setKeyType(lista[0].tipoChave);
        }
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [panel, user]);

  async function salvarChave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!user) {
      setEditing(false);
      setMessage("Chave atualizada na demonstração.");
      return;
    }
    try {
      const alvoId = editingId ?? principal?.id;
      if (alvoId) {
        const atualizada = await apiRequest<ChavePixApi>(ENDPOINTS.chavesPix.byId(alvoId), {
          method: "PATCH",
          body: { tipoChave: keyType, chave: key.trim() },
        });
        setChaves((ant) => ant.map((c) => (c.id === atualizada.id ? atualizada : c)));
      } else {
        const criada = await apiRequest<ChavePixApi>(ENDPOINTS.chavesPix.base, {
          method: "POST",
          body: { tipoChave: keyType, chave: key.trim() },
        });
        setChaves((ant) => [criada, ...ant]);
      }
      setEditing(false);
      setEditingId(null);
      setMessage("Chave Pix salva com sucesso.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível salvar a chave Pix.");
    }
  }

  async function excluirChave(id: string) {
    setMessage("");
    try {
      await apiRequest<void>(ENDPOINTS.chavesPix.byId(id), { method: "DELETE" });
      setChaves((ant) => ant.filter((c) => c.id !== id));
      setMessage("Chave Pix removida.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível remover a chave Pix.");
    }
  }

  async function salvarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const oldPass = String(data.get("old") ?? "");
    const newPass = String(data.get("new") ?? "");
    const confirmPass = String(data.get("confirm") ?? "");
    if (newPass !== confirmPass) {
      setMessage("As novas senhas devem ser iguais.");
      return;
    }
    if (!user) {
      setMessage("Alteração de senha simulada. Nenhuma credencial real foi modificada.");
      form.reset();
      setNewPassword("");
      return;
    }
    try {
      await changePassword(oldPass, newPass);
      setMessage("Senha atualizada com sucesso.");
      form.reset();
      setNewPassword("");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível alterar a senha.");
    }
  }

  function abrirEdicao(alvo?: ChavePixApi) {
    setEditingId(alvo?.id ?? null);
    setKey(alvo?.chave ?? "");
    setKeyType(alvo?.tipoChave ?? "telefone");
    setEditing(true);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(saved); setMessage("Chave copiada."); } catch { setMessage("Selecione a chave exibida para copiar."); }
  }
  const savedKey = keyTypes[principal?.tipoChave ?? "telefone"];
  const meter = strength(newPassword);
  const toast = <StatusToast message={message} onDone={() => setMessage("")}/>;

  if (panel === "pix") return (
    <div className="space-y-space-xl">
      {toast}
      {/* Chaves Pix */}
      <section className="space-y-space-md">
        <SectionTitle icon="account_balance_wallet" title="Chaves Pix para Receber Rachas" description="Defina para qual conta bancária os valores arrecadados em seus grupos serão transferidos." action={
          <button type="button" className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container/90 active:scale-[0.98] transition-all whitespace-nowrap self-start sm:self-auto" aria-expanded={editing} onClick={() => { if (editing) { setEditing(false); setEditingId(null); } else abrirEdicao(); }}>
            <Icon name={editing ? "close" : "add_circle"} size={18}/><span>{editing ? "Fechar edição" : "Adicionar Nova Chave"}</span>
          </button>
        }/>
        <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-start md:items-center gap-space-md min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed"><Icon name={savedKey.icon} size={26}/></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs mb-1">
                <span className="font-label-lg text-label-lg text-on-surface truncate">{savedKey.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"/>{principal ? "Padrão Ativa" : "Exemplo"}</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1"><Icon name="verified" size={14} className="text-primary"/>Chave Principal</span>
              </div>
              <div className="font-numeric-stat text-[18px] leading-6 font-bold text-on-surface tracking-normal truncate select-all">{saved}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant flex flex-wrap items-center gap-x-2 mt-0.5">
                <span className="font-semibold text-on-surface">Nu Pagamentos S.A.</span><span>•</span><span>Conta Corrente</span><span>•</span><span>Titular: {titular}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 self-end md:self-center">
            <button type="button" className={smallButton} title="Copiar Chave Pix" onClick={copy}><Icon name="content_copy" size={16}/><span>Copiar</span></button>
            <button type="button" className={smallButton} title={principal ? "Editar chave Pix" : "Cadastrar chave Pix"} aria-expanded={editing} onClick={() => { if (editing) { setEditing(false); setEditingId(null); } else abrirEdicao(principal); }}><Icon name="edit" size={16}/><span>{principal ? "Editar" : "Cadastrar"}</span></button>
            {principal && <button type="button" className={smallButton} title="Remover chave Pix" onClick={() => void excluirChave(principal.id)}><Icon name="delete" size={16}/><span>Remover</span></button>}
          </div>
        </div>
        {editing && (
          <form className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm grid grid-cols-1 md:grid-cols-[200px_1fr] gap-space-md" onSubmit={salvarChave}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${ids}-type`} className="font-label-md text-label-md text-on-surface">Tipo de chave</label>
              <select id={`${ids}-type`} value={keyType} onChange={event => setKeyType(event.target.value as TipoChavePix)} className={`${inputClass} cursor-pointer`}>
                <option value="telefone">Celular</option><option value="email">E-mail</option><option value="cpf">CPF</option><option value="aleatoria">Aleatória</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${ids}-key`} className="font-label-md text-label-md text-on-surface">Chave para recebimento</label>
              <input id={`${ids}-key`} type={keyType === "email" ? "email" : "text"} required minLength={3} value={key} onChange={event => setKey(event.target.value)} className={inputClass}/>
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-space-sm">
              <button type="button" className={secondaryButton} onClick={() => { setEditing(false); setEditingId(null); }}>Cancelar</button>
              <button type="submit" className={primaryButton}><Icon name="check" size={18}/>Salvar chave</button>
            </div>
          </form>
        )}
      </section>

      {/* Preferências de recebimento */}
      <section className="space-y-space-md">
        <SectionTitle icon="tune" title="Preferências de Recebimento & Liquidação" description="Automatize cobranças e facilite a quitação das despesas para todos os participantes."/>
        <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm space-y-space-lg">
          <ToggleRow icon="qr_code_2" title="Sugerir minha chave Pix padrão em todas as despesas que eu pagar no caixa" description="Gera automaticamente o payload Pix Copia e Cola nos comprovantes do grupo, acelerando seu reembolso imediato." checked={suggestPix} onChange={setSuggestPix}/>
          <div className="flex flex-col sm:flex-row items-center gap-space-lg p-space-md rounded-xl bg-surface-container-low">
            <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm shrink-0"><PixPreview size={132}/></div>
            <div className="flex-1 space-y-space-xs text-center sm:text-left">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Prévia do QR Code de Cobrança</span>
              <p className="font-label-lg text-label-lg text-on-surface">Racha Fácil · {titular}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Este código é anexado a qualquer cobrança que você disparar via WhatsApp ou link direto.</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-space-xs pt-space-xs">
                <button type="button" className={`${smallButton} bg-surface-container-lowest`} onClick={() => setMessage("QR Code ilustrativo. Não há um código de pagamento real para baixar.")}><Icon name="download" size={16}/><span>Baixar Placa QR</span></button>
                <button type="button" className={`${smallButton} bg-surface-container-lowest`} onClick={copy}><Icon name="content_copy" size={16}/><span>Copiar chave</span></button>
              </div>
              <p className="font-label-sm text-label-sm text-outline">QR Code demonstrativo, sem valor financeiro.</p>
            </div>
          </div>
          <div className="w-full h-px bg-surface-container-low"/>
          <ToggleRow icon="chat" title="Lembretes automáticos amigáveis via WhatsApp quando faltar 24h para o rateio" description="O Racha+ envia uma notificação cortês no WhatsApp dos participantes pendentes sem constrangimentos." checked={whatsappReminders} onChange={setWhatsappReminders}/>
        </div>
      </section>

      {/* Formas de pagamento */}
      <section className="space-y-space-md">
        <div className="flex items-center justify-between gap-space-sm">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs"><Icon name="credit_card" size={22} className="text-primary"/><span>Formas de Pagamento para Assinatura</span></h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Para assinaturas do Racha+ Pro e cobranças automáticas de cotas.</p>
          </div>
          <span className="px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold hidden sm:inline-block whitespace-nowrap">Exemplo visual</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-16 h-11 rounded-lg bg-gradient-to-tr from-inverse-surface to-on-surface flex flex-col justify-between p-2 shadow-sm shrink-0" aria-hidden="true">
              <div className="flex justify-between items-center">
                <Icon name="contactless" size={14} className="text-on-primary"/>
                <div className="flex -space-x-1.5"><div className="w-3.5 h-3.5 rounded-full bg-secondary-container opacity-90"/><div className="w-3.5 h-3.5 rounded-full bg-tertiary-container opacity-90"/></div>
              </div>
              <div className="font-numeric-stat text-[11px] leading-none text-surface font-semibold tracking-wider">•••• 4821</div>
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-lg text-label-lg text-on-surface">Mastercard Black</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">Principal</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Final 4821 • Expira em 08/29 • Rodrigo M.</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-1"><Icon name="lock" size={14} className="text-primary"/><span>Cartão ilustrativo para revisão do layout.</span></div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 self-end md:self-center">
            <button type="button" className={smallButton} onClick={() => setMessage("O cadastro real de cartões será disponibilizado com a integração de pagamentos.")}><Icon name="credit_card_heart" size={16}/><span>Alterar Cartão</span></button>
          </div>
        </div>
      </section>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-lowest/90 backdrop-blur-md p-space-md rounded-xl shadow-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0"><Icon name="verified_user" size={18} className="text-on-primary-fixed"/></div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            O Pix é destinado diretamente ao recebedor. A prévia não realiza movimentações financeiras. <Link to="/faq" className="text-primary font-semibold hover:underline whitespace-nowrap">Termos de uso e segurança</Link>
          </p>
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto">
          <button type="button" className="w-1/2 sm:w-auto px-space-lg py-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors" onClick={() => { setSuggestPix(savedPrefs.suggestPix); setWhatsappReminders(savedPrefs.whatsappReminders); }}>Descartar</button>
          <button type="button" className="w-1/2 sm:w-auto px-space-xl py-space-sm rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary font-label-md text-label-md shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs" onClick={() => { setSavedPrefs({ suggestPix, whatsappReminders }); setMessage("Preferências salvas nesta demonstração."); }}>
            <Icon name="check" size={18}/><span>Salvar Preferências</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-space-xl">
      {toast}
      {/* Alteração de senha */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md mb-space-lg bg-surface-container-low/40 -mx-space-lg md:-mx-space-xl -mt-space-lg md:-mt-space-xl p-space-lg md:p-space-xl rounded-t-xl">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed shadow-sm"><Icon name="key" size={24}/></div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Alteração de Senha</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Recomendamos senhas exclusivas com ao menos 10 caracteres, combinando números e símbolos.</p>
            </div>
          </div>
          {!user && <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-primary-container"/>Formulário de demonstração</span>}
        </div>
        <form className="space-y-space-md max-w-2xl" onSubmit={salvarSenha}>
          <PasswordInput id={`${ids}-old`} name="old" label="Senha atual" placeholder="Digite sua senha atual" show={visible.old} onToggle={() => setVisible(value => ({ ...value, old: !value.old }))}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
            <div>
              <PasswordInput id={`${ids}-new`} name="new" label="Nova senha" placeholder="Mínimo 8 caracteres" show={visible.new} onToggle={() => setVisible(value => ({ ...value, new: !value.new }))} onChange={setNewPassword}/>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-outline">Força:</span>
                  <span className="font-semibold text-primary" aria-live="polite">{meter.label}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden flex gap-1" aria-hidden="true">
                  {[0, 1, 2, 3].map(index => <div key={index} className={`h-full w-1/4 rounded-full transition-all duration-300 ${index < meter.bars ? meter.color : "bg-surface-container-high"}`}/>)}
                </div>
              </div>
            </div>
            <div>
              <PasswordInput id={`${ids}-confirm`} name="confirm" label="Confirmar nova senha" placeholder="Repita a nova senha" show={visible.confirm} onToggle={() => setVisible(value => ({ ...value, confirm: !value.confirm }))}/>
              <p className="font-label-sm text-label-sm text-outline mt-2.5">Ambas as senhas precisam coincidir exatamente.</p>
            </div>
          </div>
          <div className="pt-space-sm flex flex-wrap items-center gap-space-md">
            <button type="submit" className={primaryButton}><Icon name="check" size={20}/><span>Atualizar Senha</span></button>
            {!user && <span className="font-label-sm text-label-sm text-outline">Não utilize senhas reais nesta demonstração.</span>}
          </div>
        </form>
      </section>

      {/* Conta & assinatura */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
          <div className="flex items-start gap-space-md max-w-2xl">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary shadow-sm"><Icon name="verified_user" size={24}/></div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Sua conta em segurança</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">Escolha uma senha exclusiva e confira suas informações pessoais com frequência.</p>
            </div>
          </div>
          <Link to="/gerenciar-assinatura" className="px-space-md h-10 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 self-start md:self-auto">
            <Icon name="workspace_premium" size={18}/><span>Gerenciar assinatura</span>
          </Link>
        </div>
      </section>

      {/* Zona de perigo */}
      <section className="rounded-xl p-space-lg md:p-space-xl bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-2 text-secondary mb-space-sm"><Icon name="warning" size={22}/><h2 className="font-headline-sm text-headline-sm font-bold">Zona de Perigo</h2></div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg max-w-2xl">Ações permanentes ou de longo prazo relacionadas à sua conta Racha+. Certifique-se de quitar rachas e pendências com seus grupos antes de prosseguir.</p>
        <div className="p-space-md rounded-xl bg-error-container/30 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div>
            <h3 className="font-label-lg text-label-lg font-bold text-secondary">Encerrar Conta Permanentemente</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Transfira a administração dos grupos e resolva suas pendências antes de solicitar a exclusão.</p>
          </div>
          <button type="button" className="px-space-md h-10 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md transition-colors self-start sm:self-auto flex items-center gap-2 shadow-sm shrink-0" onClick={() => { setRemove(true); setRemoved(false); }}>
            <Icon name="delete_forever" size={18}/><span>Encerrar Definitivamente</span>
          </button>
        </div>
      </section>

      {remove && (
        <Overlay title={removed ? "Conta excluída · prévia" : "Confirmar exclusão definitiva?"} onClose={() => setRemove(false)} footer={!removed && <>
          <button type="button" className="px-space-md h-10 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors" onClick={() => setRemove(false)}>Cancelar</button>
          <button type="button" className="px-space-md h-10 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={confirmation !== "EXCLUIR"} onClick={() => setRemoved(true)}>
            <Icon name="delete" size={18}/><span>Confirmar e Encerrar</span>
          </button>
        </>}>
          {removed
            ? <p className="flex items-start gap-space-xs p-space-md rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface" role="status"><Icon name="task_alt" size={18} className="text-primary shrink-0"/>Estado de sucesso da demonstração. Nenhuma conta real foi excluída.</p>
            : <>
              <p className="font-body-sm text-body-sm text-on-surface-variant">O histórico financeiro compartilhado será preservado. Para revisar esta confirmação, digite a palavra <strong>EXCLUIR</strong> abaixo:</p>
              <label htmlFor={`${ids}-confirmation`} className="sr-only">Confirmação</label>
              <input id={`${ids}-confirmation`} value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Digite EXCLUIR" className="mt-space-md w-full h-11 px-4 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary transition-all"/>
            </>}
        </Overlay>
      )}
    </div>
  );
}
