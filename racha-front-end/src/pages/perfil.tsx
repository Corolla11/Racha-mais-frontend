import { useEffect, useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth, type AuthUser } from "../auth/auth-context";
import AccountPanels, { SettingsBreadcrumb, SettingsTabs, StatusToast, ToggleRow } from "../components/account-panels";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import UserAvatar from "../components/user-avatar";
import { PageHeading } from "../components/ui";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS, type ChavePixApi, type TipoChavePix, type UserProfileApi } from "../lib/endpoints";
import { formatarChavePix } from "../lib/pix-format";

type Panel = "profile" | "notifications" | "security" | "pix";

const LABELS_PIX: Record<TipoChavePix, string> = {
  telefone: "Celular",
  email: "E-mail",
  cpf: "CPF",
  aleatoria: "Aleatória",
};

const panelInfo: Record<Panel, { crumb: string; width: string; eyebrow?: string; description: string }> = {
  profile: { crumb: "Meu Perfil", width: "max-w-6xl", description: "Gerencie seus dados pessoais, chave Pix para rateios e preferências de conta com transparência e controle total." },
  security: { crumb: "Segurança & Conta", width: "max-w-5xl", description: "Controle de acesso, credenciais e segurança da conta." },
  pix: { crumb: "Pagamentos & Pix", width: "max-w-4xl", eyebrow: "Preferências Financeiras", description: "Gerencie suas chaves Pix para recebimento e cartões cadastrados." },
  notifications: { crumb: "Notificações", width: "max-w-4xl", eyebrow: "Canais de Aviso", description: "Escolha como e quando o Racha+ avisa você sobre rateios, despesas e acertos." },
};

function Perfil() {
  const [params, setParams] = useSearchParams();
  const { user, refreshSession } = useAuth();
  const initial = params.get("aba");
  const panel: Panel = initial === "pix" || initial === "security" || initial === "notifications" ? initial : "profile";
  function setPanel(value: "profile" | "notifications" | "security" | "pix") {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value === "profile") next.delete("aba"); else next.set("aba", value);
      return next;
    }, { replace: true });
  }
  const [notificarDespesas, setNotificarDespesas] = useState(true);
  const [salvandoPrefs, setSalvandoPrefs] = useState(false);
  const [perfil, setPerfil] = useState<UserProfileApi | null>(null);
  const [aviso, setAviso] = useState("");
  const info = panelInfo[panel];

  useEffect(() => {
    if (!user) return;
    let ativo = true;
    apiRequest<UserProfileApi>(ENDPOINTS.users.me)
      .then((dados) => {
        if (!ativo) return;
        setPerfil(dados);
        if (typeof dados.notificarDespesas === "boolean") {
          setNotificarDespesas(dados.notificarDespesas);
        }
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [user]);

  async function salvarPreferencias() {
    setAviso("");
    setSalvandoPrefs(true);
    try {
      const res = await apiRequest<{ notificarDespesas: boolean }>(
        ENDPOINTS.notificacoes.preferencias,
        { method: "PUT", body: { notificarDespesas } },
      );
      setNotificarDespesas(res.notificarDespesas);
      setPerfil((ant) => (ant ? { ...ant, notificarDespesas: res.notificarDespesas } : ant));
      setAviso("Preferências salvas com sucesso.");
    } catch (err) {
      setAviso(err instanceof ApiError ? err.message : "Não foi possível salvar as preferências.");
    } finally {
      setSalvandoPrefs(false);
    }
  }

  return (
    <AppShell title="Configurações da Conta" bare>
      <div className="relative w-full overflow-hidden">
        {panel === "pix" && <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-64 bg-gradient-to-b from-primary-container/10 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none"/>}
        <div className={`${info.width} mx-auto px-gutter-mobile sm:px-gutter py-space-lg md:py-space-xl relative`}>
          <SettingsBreadcrumb trail={[{ label: "Configurações", to: "/perfil" }, { label: info.crumb }]}/>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
            <PageHeading
              title="Configurações"
              description={info.description}
              eyebrow={info.eyebrow}
              badge={panel === "security" ? (
                <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mb-space-xs">
                  <Icon name="shield_with_heart" size={15} filled/><span>Central de Privacidade &amp; Integridade</span>
                </div>
              ) : undefined}
            />
          </div>
          <SettingsTabs active={panel} onSelect={setPanel}/>

          {(panel === "security" || panel === "pix") && <AccountPanels key={panel} panel={panel}/>}

          <div hidden={panel !== "profile"}>
            <ProfilePanel
              key={`${user?.id ?? "guest"}-${perfil?.id ?? "init"}`}
              user={user}
              perfil={perfil}
              chavePix={perfil?.chavesPix?.[0]}
              onSaved={(atualizado) => {
                setPerfil(atualizado);
                void refreshSession().catch(() => {});
              }}
              onManageKeys={() => setPanel("pix")}
            />
          </div>

          {panel === "notifications" && (
            <section className="space-y-space-md">
              <StatusToast message={aviso} onDone={() => setAviso("")}/>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs"><Icon name="notifications_active" size={22} className="text-primary"/><span>Notificações e Avisos</span></h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Defina quais avisos você quer receber no app.</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm">
                <ToggleRow icon="notifications" title="Novas tarefas e despesas" description="Avisos no app quando você for incluído em uma tarefa ou cobrança." checked={notificarDespesas} onChange={setNotificarDespesas}/>
              </div>
              <div className="flex justify-end">
                <button type="button" disabled={salvandoPrefs} className="min-h-11 px-space-xl py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs cursor-pointer disabled:opacity-60" onClick={() => void salvarPreferencias()}>
                  <Icon name="check" size={18}/><span>{salvandoPrefs ? "Salvando..." : "Salvar Preferências"}</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

type ProfileForm = { name: string; handle: string; bio: string; city: string; email: string; phone: string };

const emptyProfile: ProfileForm = { name: "", handle: "", bio: "", city: "", email: "", phone: "" };

const fieldClass = "w-full py-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all";
const labelClass = "font-label-md text-label-md text-on-surface font-medium flex items-center justify-between gap-space-sm";

function ProfilePanel({
  user,
  perfil,
  chavePix,
  onSaved,
  onManageKeys,
}: {
  user: AuthUser | null;
  perfil: UserProfileApi | null;
  chavePix?: ChavePixApi;
  onSaved: (atualizado: UserProfileApi) => void;
  onManageKeys: () => void;
}) {
  const ids = useId();
  const base: ProfileForm = perfil
    ? {
        name: perfil.name,
        handle: perfil.email.split("@")[0],
        bio: perfil.bio ?? "",
        city: perfil.cidade ?? "",
        email: perfil.email,
        phone: perfil.telefone ?? "",
      }
    : user
      ? { name: user.name, handle: user.email.split("@")[0], bio: "", city: "", email: user.email, phone: "" }
      : emptyProfile;
  const [saved, setSaved] = useState<ProfileForm>(base);
  const [form, setForm] = useState<ProfileForm>(base);
  const [salvando, setSalvando] = useState(false);
  const [message, setMessage] = useState("");
  const pixKey = chavePix ? formatarChavePix(chavePix.tipoChave, chavePix.chave) : "";
  const pixType = chavePix ? LABELS_PIX[chavePix.tipoChave] ?? chavePix.tipoChave : "Celular";
  const dirty = (Object.keys(form) as (keyof ProfileForm)[]).some(field => form[field] !== saved[field]);
  function update(field: keyof ProfileForm, value: string) { setForm(previous => ({ ...previous, [field]: value })); }

  async function salvarPerfil() {
    if (!form.name.trim()) {
      setMessage("Informe seu nome de exibição.");
      return;
    }
    setSalvando(true);
    setMessage("");
    try {
      const atualizado = await apiRequest<UserProfileApi>(ENDPOINTS.users.me, {
        method: "PATCH",
        body: {
          name: form.name.trim(),
          bio: form.bio.trim(),
          cidade: form.city.trim(),
          telefone: form.phone.trim(),
        },
      });
      const proximo: ProfileForm = {
        name: atualizado.name,
        handle: atualizado.email.split("@")[0],
        bio: atualizado.bio ?? "",
        city: atualizado.cidade ?? "",
        email: atualizado.email,
        phone: atualizado.telefone ?? "",
      };
      setSaved(proximo);
      setForm(proximo);
      onSaved(atualizado);
      setMessage("Alterações salvas com sucesso.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível salvar o perfil.");
    } finally {
      setSalvando(false);
    }
  }
  async function enviarAvatar(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("Selecione uma imagem JPG, PNG ou WebP de até 5 MB.");
      return;
    }
    setSalvando(true);
    setMessage("");
    try {
      const presign = await apiRequest<{ uploadUrl: string; objectKey: string }>(
        ENDPOINTS.uploads.presign,
        { method: "POST", body: { tipo: "avatar", contentType: file.type, sizeBytes: file.size } },
      );
      const putRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new ApiError("Não foi possível enviar a foto.", putRes.status);
      const atualizado = await apiRequest<UserProfileApi>(ENDPOINTS.users.me, {
        method: "PATCH",
        body: { image: presign.objectKey },
      });
      onSaved(atualizado);
      setMessage("Foto de perfil atualizada.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível atualizar a foto.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerAvatar() {
    setSalvando(true);
    setMessage("");
    try {
      const atualizado = await apiRequest<UserProfileApi>(ENDPOINTS.users.me, {
        method: "PATCH",
        body: { image: null },
      });
      onSaved(atualizado);
      setMessage("Foto de perfil removida.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Não foi possível remover a foto.");
    } finally {
      setSalvando(false);
    }
  }

  async function copyKey() {
    try { await navigator.clipboard.writeText(pixKey); setMessage("Chave Pix copiada."); } catch { setMessage("Selecione a chave exibida para copiar."); }
  }
  const subtitle = [saved.handle && `@${saved.handle}`, saved.city].filter(Boolean).join(" • ");

  return (
    <>
      <StatusToast message={message} onDone={() => setMessage("")}/>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          {/* Identidade */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-space-lg">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-md text-center sm:text-left">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-primary-container flex items-center justify-center">
                  <UserAvatar
                    userId={user?.id}
                    image={perfil?.image ?? user?.image}
                    alt={`Foto de ${saved.name}`}
                    fallback={<Icon name="person" size={48} className="text-on-primary" />}
                  />
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-surface-container-lowest flex items-center justify-center" title="Online no Racha+"><span className="w-1.5 h-1.5 rounded-full bg-white"/></span>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-space-xs">
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{saved.name || "Usuário"}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm"><Icon name="verified" size={14} filled/>Perfil Verificado</span>
                </div>
                {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center gap-space-xs shrink-0">
              <label className="relative flex items-center gap-space-xs px-space-md min-h-11 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
                <Icon name="photo_camera" size={18}/><span>Alterar Foto</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => void enviarAvatar(event.target.files?.[0])}/>
              </label>
              <button type="button" disabled={salvando || !(perfil?.image ?? user?.image)} className="px-space-md min-h-11 py-2 text-on-surface-variant hover:text-error font-label-sm text-label-sm transition-colors cursor-pointer disabled:opacity-40" onClick={() => void removerAvatar()}>Remover</button>
            </div>
          </div>

          {/* Dados pessoais & exibição */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-lg">
            <BlockTitle icon="badge" tone="bg-primary-fixed text-primary" title="Dados Pessoais & Exibição" description="Como os participantes veem você nos grupos e rateios."/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="space-y-1.5">
                <label htmlFor={`${ids}-name`} className={labelClass}><span>Nome de Exibição</span><span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Visível a todos</span></label>
                <input id={`${ids}-name`} type="text" autoComplete="name" value={form.name} onChange={event => update("name", event.target.value)} className={`${fieldClass} px-space-md`}/>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${ids}-handle`} className={labelClass}><span>Nome de Usuário (@handle)</span></label>
                <div className="relative flex items-center">
                  <span className="absolute left-space-md text-outline font-label-md" aria-hidden="true">@</span>
                  <input id={`${ids}-handle`} type="text" value={form.handle} onChange={event => update("handle", event.target.value.replace(/^@+/, ""))} className={`${fieldClass} pl-8 pr-space-md`}/>
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor={`${ids}-bio`} className={labelClass}><span>Recado / Bio nos rachas</span><span className="font-label-sm text-label-sm text-on-surface-variant font-normal">{form.bio.length}/120 caracteres</span></label>
                <input id={`${ids}-bio`} type="text" maxLength={120} placeholder="Ex.: Organizador dos churrascos da galera" value={form.bio} onChange={event => update("bio", event.target.value)} className={`${fieldClass} px-space-md`}/>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Uma frase descontraída para seus amigos te reconhecerem rapidamente.</p>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor={`${ids}-city`} className={labelClass}><span>Cidade Base</span></label>
                <div className="relative flex items-center">
                  <Icon name="location_on" size={20} className="absolute left-space-md text-outline pointer-events-none"/>
                  <input id={`${ids}-city`} type="text" autoComplete="address-level2" placeholder="Ex.: São Paulo, SP" value={form.city} onChange={event => update("city", event.target.value)} className={`${fieldClass} pl-11 pr-space-md`}/>
                </div>
              </div>
            </div>
          </div>

          {/* Contato & dados oficiais */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-lg">
            <BlockTitle icon="contact_mail" tone="bg-secondary-fixed text-secondary" title="Contato & Dados Oficiais" description="Informações confidenciais usadas para segurança e reconciliação bancária."/>
            <div className="space-y-space-md">
              <div className="space-y-1.5">
                <label htmlFor={`${ids}-email`} className={labelClass}>
                  <span>E-mail Cadastrado</span>
                  {Boolean((user as { emailVerified?: boolean } | null)?.emailVerified ?? true) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold">
                      <Icon name="check_circle" size={14}/><span>Verificado</span>
                    </span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <Icon name="mail" size={20} className="absolute left-space-md text-outline pointer-events-none"/>
                  <input id={`${ids}-email`} type="email" autoComplete="email" value={form.email} onChange={event => update("email", event.target.value)} className={`${fieldClass} pl-11 pr-space-md`}/>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${ids}-phone`} className={labelClass}><span>Telefone de contato</span></label>
                <div className="relative flex items-center">
                  <Icon name="phone_iphone" size={20} className="absolute left-space-md text-outline pointer-events-none"/>
                  <input id={`${ids}-phone`} type="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={form.phone} onChange={event => update("phone", event.target.value)} className={`${fieldClass} pl-11 pr-space-md`}/>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Informação opcional exibida apenas para referência de contato.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${ids}-cpf`} className="font-label-md text-label-md text-on-surface font-medium flex items-center gap-1.5"><span>CPF</span><Icon name="lock" size={16} className="text-tertiary"/></label>
                <div className="relative flex items-center">
                  <Icon name="shield" size={20} className="absolute left-space-md text-outline pointer-events-none"/>
                  <input id={`${ids}-cpf`} type="text" disabled value="" placeholder="Não informado" className="w-full pl-11 pr-24 py-3 rounded-lg bg-surface-container text-on-surface-variant placeholder:text-outline font-body-md text-body-md cursor-not-allowed"/>
                  <span className="absolute right-space-md font-label-sm text-label-sm text-outline font-medium">Protegido</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Para alterar dados fiscais cadastrados, solicite ao suporte.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase text-primary">Recebimentos</span>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed"><Icon name="currency_exchange" size={18}/></div>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Chave Pix Padrão</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Esta chave é exibida automaticamente quando amigos quitam despesas com você.</p>
            </div>
            <div className="p-space-md rounded-lg bg-surface-container-low space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Tipo da Chave</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">{pixKey ? pixType : "Não cadastrada"}</span>
              </div>
              <div className="flex items-center justify-between">
                {pixKey ? <>
                  <span className="font-label-md text-label-md font-bold text-on-surface select-all">{pixKey}</span>
                  <button type="button" className="min-w-11 min-h-11 flex items-center justify-center text-primary hover:text-on-surface transition-colors cursor-pointer" title="Copiar Chave" aria-label="Copiar chave Pix" onClick={copyKey}><Icon name="content_copy" size={20}/></button>
                </> : <span className="font-body-sm text-body-sm text-on-surface-variant">Cadastre uma chave para receber os rateios.</span>}
              </div>
            </div>
            <button type="button" className="w-full flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors" onClick={onManageKeys}>
              <Icon name="settings" size={18}/><span>Gerenciar Chaves</span>
            </button>
          </div>

          <div className="rounded-xl p-space-md bg-surface-container-high/60 flex items-start gap-space-sm">
            <Icon name="policy" size={20} className="text-on-surface-variant shrink-0 mt-0.5"/>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Seus dados nunca são compartilhados externamente ou com agências financeiras sem autorização expressa.</p>
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="mt-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <Icon name={dirty ? "edit_note" : "done_all"} size={18} className={dirty ? "text-primary" : "text-emerald-600"}/>
          <span className="font-body-sm text-body-sm">{dirty ? "Alterações pendentes detectadas no perfil" : "Nenhuma alteração pendente. Suas alterações valem para todos os seus grupos."}</span>
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          <button type="button" disabled={!dirty} className="w-full sm:w-auto px-space-lg py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => setForm(saved)}>Descartar</button>
          <button type="button" disabled={!dirty || salvando} className="w-full sm:w-auto px-space-xl py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-[0_4px_14px_rgba(255,140,66,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-xs disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer" onClick={() => void salvarPerfil()}>
            <Icon name="check" size={18}/><span>{salvando ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </div>
    </>
  );
}

function BlockTitle({ icon, tone, title, description }: { icon: string; tone: string; title: string; description: string }) {
  return (
    <div className="flex items-center gap-space-sm pb-space-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tone}`}><Icon name={icon} size={20}/></div>
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{title}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}

export default Perfil;
