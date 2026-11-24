import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/auth-context";
import { SettingsBreadcrumb, SettingsTabs, StatusToast } from "../components/account-panels";
import AppShell from "../components/app-shell";
import Icon from "../components/icon";
import Overlay from "../components/overlay";
import PixPreview from "../components/pix-preview";
import { PageHeading } from "../components/ui";
import { money } from "../lib/finance";


const plans = [
  { name: "Grátis", month: 0, year: 0, description: "Ideal para quem quer dividir contas esporádicas com poucos amigos.", features: ["Até 2 grupos ativos simultâneos", "Até 10 membros por grupo", "Divisão igualitária de despesas", "Geração de QR Code Pix básico", "Comprovantes em baixa resolução"] },
  { name: "Pro", month: 12, year: 80, description: "Perfeito para viagens longas, repúblicas e turmas ativas de amigos.", features: ["+3 grupos adicionais (5 grupos no total)", "+5 membros adicionais (até 15 membros por grupo)", "Divisão por participantes selecionados", "Organização de tarefas e compras em equipe", "Comprovantes em alta resolução", "Lembretes automáticos de pagamento"] },
  { name: "Pro+", month: 20, year: 200, description: "Para quem organiza grandes eventos, múltiplos grupos e encontros frequentes.", features: ["+5 grupos adicionais (10 grupos ativos)", "Membros ilimitados por grupo", "Divisão por tarefa e participantes", "Relatórios financeiros e exportação em PDF e Excel", "Suporte prioritário", "Histórico e auditoria financeira completos"] },
];
type Plan = typeof plans[number];
type Subscription = { name: string; annual: boolean; value: number; renewal: string; renew: boolean };
const questions = [
  { icon: "event_repeat", question: "Posso cancelar a assinatura quando quiser?", answer: "Sim. Você pode cancelar a renovação em Minha assinatura e manter os benefícios até o final do período contratado." },
  { icon: "groups_2", question: "Todos do meu grupo precisam assinar o plano Pro?", answer: "Não. Os benefícios de organização se aplicam aos grupos elegíveis do assinante. Os demais participantes podem continuar usando o plano gratuito." },
  { icon: "payments", question: "Quais são as formas de pagamento aceitas?", answer: "Escolha a periodicidade e a forma de pagamento (Pix ou Cartão de Crédito) no checkout. Esta prévia permite revisar as etapas sem realizar uma cobrança real." },
  { icon: "swap_vert", question: "O que acontece se eu fizer upgrade no meio do mês?", answer: "O checkout apresenta o valor da contratação antes da confirmação. Na demonstração, nenhum valor é debitado." },
];

const primaryCta = "bg-primary-container hover:bg-primary text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] active:scale-[0.98] transition-all";
const softButton = "bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors";

function renewalDate(annual: boolean) {
  const date = new Date();
  if (annual) date.setFullYear(date.getFullYear() + 1); else date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString("pt-BR");
}

export default function Assinatura({ manage = false }: { manage?: boolean }) {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    try { return JSON.parse(sessionStorage.getItem("racha-demo-subscription") ?? "null"); } catch { return null; }
  });
  const [cancel, setCancel] = useState(false);
  const [message, setMessage] = useState("");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  function save(value: Subscription) {
    setSubscription(value);
    sessionStorage.setItem("racha-demo-subscription", JSON.stringify(value));
  }
  return (
    <AppShell title={selected ? "Finalizar assinatura" : manage ? "Configurações da conta" : "Visão Geral"} bare>
      {selected ? <Checkout plan={selected} annual={annual} onBack={() => setSelected(null)} onApprove={() => {
        save({ name: selected.name, annual, value: annual ? selected.year : selected.month, renewal: renewalDate(annual), renew: true });
      }}/> : manage ? (
        <div className="max-w-5xl mx-auto px-gutter-mobile sm:px-gutter py-space-lg md:py-space-xl">
          <SettingsBreadcrumb trail={[{ label: "Configurações", to: "/perfil" }, { label: "Planos & Assinaturas" }]}/>
          <div className="mb-space-xl">
            <PageHeading title="Configurações" eyebrow="Sua assinatura" description="Seu plano, próxima renovação e histórico de cobranças em um só lugar."/>
          </div>
          <SettingsTabs active="plans"/>
          <StatusToast message={message} onDone={() => setMessage("")}/>
          <div className="flex flex-col gap-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md mb-space-lg">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed shadow-sm"><Icon name="workspace_premium" size={24}/></div>
                    <div>
                      <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase text-primary">Sua Assinatura</span>
                      <h2 className="font-headline-md text-headline-md text-on-surface">Plano {subscription?.name ?? "Grátis"}</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Mais organização para dividir bons momentos.</p>
                    </div>
                  </div>
                  <span className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap ${subscription && !subscription.renew ? "bg-surface-container-high text-on-surface-variant" : "bg-primary-fixed text-on-primary-fixed"}`}>
                    <span className={`w-2 h-2 rounded-full ${subscription && !subscription.renew ? "bg-outline" : "bg-primary-container"}`}/>
                    {subscription ? subscription.renew ? "Ativa" : "Renovação cancelada" : "Plano atual"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  {[
                    ["Valor da assinatura", money(subscription?.value ?? 0)],
                    ["Periodicidade", subscription ? subscription.annual ? "Anual" : "Mensal" : "Sem cobrança"],
                    [subscription?.renew ? "Próxima renovação" : "Disponível até", subscription?.renewal ?? "Sem prazo"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-space-md rounded-lg bg-surface-container-low">
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
                      <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-space-sm mt-space-lg">
                  <Link to="/assinatura" className={`inline-flex items-center justify-center gap-space-xs px-space-lg h-11 rounded-lg font-label-md text-label-md ${primaryCta}`}>Trocar plano <Icon name="arrow_forward" size={18}/></Link>
                  {subscription && <button type="button" className="inline-flex items-center justify-center gap-space-xs px-space-lg h-11 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed" disabled={!subscription.renew} onClick={() => setCancel(true)}><Icon name="event_busy" size={18}/>Cancelar renovação</button>}
                </div>
              </section>
              <section className="lg:col-span-4 bg-surface-container-low rounded-xl p-space-lg shadow-sm space-y-space-sm">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container"><Icon name="verified_user" size={28}/></div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Você tem o controle</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Cancele a renovação quando quiser. Seus grupos e o histórico financeiro serão preservados.</p>
                <Link to="/faq" className="inline-flex items-center gap-1 text-primary font-label-md text-label-md hover:underline">Entenda como funcionam os planos <Icon name="arrow_outward" size={16}/></Link>
              </section>
            </div>
            <section className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm">
              <div className="flex items-center justify-between gap-space-sm mb-space-md">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-space-xs"><Icon name="receipt_long" size={22} className="text-primary"/>Histórico de cobranças</h2>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{subscription ? "1 registro" : "Nenhum registro"}</span>
              </div>
              {subscription ? (
                <div className="p-space-md rounded-xl bg-surface-container-low/60 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0"><Icon name="credit_card" size={24}/></div>
                    <div>
                      <h3 className="font-label-lg text-label-lg font-bold text-on-surface">Assinatura {subscription.name}</h3>
                      <p className="font-body-sm text-body-sm text-outline">{subscription.annual ? "Plano anual" : "Plano mensal"} · cobrança de demonstração</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-md self-end sm:self-auto">
                    <strong className="font-label-lg text-label-lg text-on-surface">{money(subscription.value)}</strong>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold"><Icon name="check_circle" size={14}/>Aprovado</span>
                  </div>
                </div>
              ) : <p className="p-space-md rounded-xl bg-surface-container-low/60 font-body-sm text-body-sm text-on-surface-variant text-center">Você está no plano gratuito. Nenhuma cobrança registrada.</p>}
            </section>
            <p className="font-label-sm text-label-sm text-outline text-center">Prévia de assinatura · os dados desta sessão são demonstrativos.</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-primary-fixed/30 via-tertiary-fixed/15 to-transparent blur-3xl pointer-events-none"/>
          <div aria-hidden="true" className="absolute top-96 right-10 w-80 h-80 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"/>
          <div className="relative max-w-7xl mx-auto px-gutter-mobile sm:px-gutter py-space-lg md:py-space-xl">
            <SettingsBreadcrumb trail={[{ label: "Configurações", to: "/perfil" }, { label: "Planos e Assinaturas" }]}/>
            <div className="text-center max-w-3xl mx-auto mb-space-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm shadow-sm mb-space-sm"><Icon name="verified" size={16}/><span>Transparência total sem letras miúdas</span></div>
              <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-surface tracking-tight mb-space-sm">Planos e Assinaturas</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">Escolha o melhor plano para organizar suas despesas em grupo, de viagens com amigos a despesas da república. Cancele ou altere quando quiser.</p>
              <div className="inline-flex items-center justify-center mt-space-lg p-1.5 rounded-full bg-surface-container-lowest shadow-sm gap-2" role="group" aria-label="Periodicidade da cobrança">
                <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full font-label-md text-label-md transition-all duration-200 ${!annual ? "text-on-primary bg-primary-container shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>Mensal</button>
                <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full font-label-md text-label-md transition-all duration-200 flex items-center gap-2 ${annual ? "text-on-primary bg-primary-container shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <span>Anual</span><span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm">Até 44% off</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch max-w-6xl mx-auto mb-space-xl pt-space-sm">
              {plans.map((plan, index) => {
                const featured = index === 1;
                const price = annual ? plan.year / 12 : plan.month;
                return (
                  <section key={plan.name} className={`relative bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between transition-all duration-300 ${featured ? "shadow-xl lg:-translate-y-2 hover:shadow-2xl" : "shadow-sm hover:shadow-md"}`}>
                    {featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="px-4 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm shadow-md flex items-center gap-1.5 whitespace-nowrap"><Icon name="star" size={16} filled/><span>Mais Escolhido pelos Grupos</span></span>
                      </div>
                    )}
                    <div>
                      <div className={`flex items-center justify-between gap-2 mb-space-md ${featured ? "pt-space-xs" : ""}`}>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1.5">
                          <span>{index === 0 ? plan.name : `Racha+ ${plan.name}`}</span>
                          {featured && <Icon name="bolt" size={20} filled className="text-primary-container"/>}
                          {index === 2 && <Icon name="diamond" size={20} filled className="text-tertiary"/>}
                        </h2>
                        {index === 0 && <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">Seu Plano Atual</span>}
                        {featured && <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">Recomendado</span>}
                        {index === 2 && <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-tertiary font-label-sm text-label-sm font-semibold whitespace-nowrap">Sem Limites</span>}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md min-h-[40px]">{plan.description}</p>
                      <div className="py-space-md mb-space-md">
                        <div className="flex items-baseline gap-1">
                          <span className={`font-numeric-stat text-numeric-stat ${featured ? "text-primary-container font-extrabold" : "text-on-surface"}`}>{money(price)}</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">/ mês</span>
                        </div>
                        <p className="font-label-sm text-label-sm text-outline mt-0.5">{index === 0 ? "Sem taxas ocultas" : annual ? `Faturado anualmente (${money(plan.year)}/ano)` : "Cobrança mensal flexível"}</p>
                      </div>
                      <div className={`h-px w-full mb-space-md ${featured ? "bg-primary-fixed/40" : "bg-surface-container"}`}/>
                      <p className={`font-label-sm text-label-sm font-bold uppercase tracking-wider mb-space-sm ${featured ? "text-on-primary-container" : "text-on-surface"}`}>{index === 0 ? "Incluso no plano:" : featured ? "Tudo do Grátis, mais:" : "Tudo do Pro, com potência total:"}</p>
                      <ul className={`space-y-3 font-body-sm text-body-sm mb-space-lg ${featured ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {plan.features.map(feature => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <Icon name="check_circle" size={18} filled={featured} className={`shrink-0 ${featured ? "text-primary-container" : index === 2 ? "text-tertiary" : "text-outline"}`}/>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {index === 0
                      ? <button type="button" disabled className="w-full py-3 px-4 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md cursor-not-allowed opacity-80 flex items-center justify-center gap-1.5"><Icon name="lock_clock" size={18}/><span>Plano em Uso</span></button>
                      : featured
                        ? <button type="button" onClick={() => setSelected(plan)} className="w-full py-3.5 px-5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"><span>Fazer Upgrade Agora</span><Icon name="arrow_forward" size={18}/></button>
                        : <button type="button" onClick={() => setSelected(plan)} className="w-full py-3 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"><span>Escolher {plan.name}</span><Icon name="diamond" size={18}/></button>}
                  </section>
                );
              })}
            </div>

            <div className="max-w-4xl mx-auto rounded-xl bg-surface-container-low p-space-md md:p-space-lg mb-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container shrink-0"><Icon name="verified_user" size={28}/></div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Garantia Incondicional de 7 Dias</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Teste todos os recursos do Pro. Se não amar a praticidade, o reembolso é previsto em até 7 dias.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-space-md shrink-0">
                <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant"><Icon name="lock" size={20} className="text-primary-container"/><span>Ambiente 100% Criptografado</span></div>
                <div className="flex items-center gap-1 text-primary-container font-label-sm text-label-sm font-bold bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm"><Icon name="qr_code_2" size={18}/><span>Ativação Instantânea</span></div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto mb-space-xl">
              <div className="text-center mb-space-lg">
                <div className="inline-flex items-center gap-1.5 text-primary-container font-label-sm text-label-sm font-bold mb-1"><Icon name="help" size={18}/><span>Tire suas dúvidas</span></div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Perguntas Frequentes</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Tudo o que você precisa saber antes de fazer seu upgrade.</p>
              </div>
              <div className="space-y-space-sm">
                {questions.map(({ icon, question, answer }, index) => {
                  const open = openQuestion === index;
                  return (
                    <div key={question} className="rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 overflow-hidden">
                      <button type="button" aria-expanded={open} aria-controls={`faq-plano-${index}`} onClick={() => setOpenQuestion(open ? null : index)} className="w-full p-space-md flex items-center justify-between gap-space-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded-xl">
                        <span className="font-headline-sm text-[18px] leading-6 text-on-surface flex items-center gap-2"><Icon name={icon} size={20} className="text-primary-container shrink-0"/><span>{question}</span></span>
                        <Icon name="expand_more" className={`text-on-surface-variant transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}/>
                      </button>
                      <div id={`faq-plano-${index}`} hidden={!open} className="px-space-md pb-space-md text-on-surface-variant font-body-sm text-body-sm leading-relaxed"><p>{answer}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pb-space-lg space-y-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ainda ficou com alguma dúvida sobre o plano ideal para você?
                <Link to="/faq" className="text-primary font-semibold hover:underline inline-flex items-center gap-1 ml-1"><span>Fale com nosso time de atendimento</span><Icon name="arrow_outward" size={16}/></Link>
              </p>
              <p className="font-label-sm text-label-sm text-outline">
                Prévia visual · sem cobrança real. <Link to="/gerenciar-assinatura" className="text-primary font-semibold hover:underline">Gerenciar minha assinatura →</Link>
              </p>
            </div>
          </div>
        </div>
      )}
      {cancel && <Overlay title="Cancelar renovação?" onClose={() => setCancel(false)} description="Revise sua assinatura antes de continuar." footer={<>
        <button type="button" className="px-space-md h-10 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors" onClick={() => setCancel(false)}>Manter assinatura</button>
        <button type="button" className="px-space-md h-10 rounded-lg bg-primary-container hover:bg-primary-container/90 text-on-primary font-label-md text-label-md transition-colors" onClick={() => { if (subscription) save({ ...subscription, renew: false }); setCancel(false); setMessage("Renovação cancelada na demonstração."); }}>Confirmar cancelamento</button>
      </>}><p className="font-body-sm text-body-sm text-on-surface-variant">Os benefícios continuam disponíveis até {subscription?.renewal}. Depois, sua conta retorna ao plano Grátis e seus registros permanecem preservados.</p></Overlay>}
    </AppShell>
  );
}

const fieldClass = "w-full bg-surface-container-low px-4 py-2.5 rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container";
const labelClass = "text-label-sm font-label-sm text-on-surface";
const pixCode = "PREVIA-RACHA-SEM-VALOR-FINANCEIRO";

function Checkout({ plan, annual, onBack, onApprove }: { plan: Plan; annual: boolean; onBack: () => void; onApprove: () => void }) {
  const [method, setMethod] = useState("pix");
  const [stage, setStage] = useState<"checkout" | "pending" | "approved" | "declined">("checkout");
  const [copied, setCopied] = useState(false);
  const ids = useId();
  const value = annual ? plan.year : plan.month;
  const period = annual ? "/ano" : "/mês";
  async function copy() {
    try { await navigator.clipboard.writeText(pixCode); setCopied(true); } catch { setCopied(false); }
  }
  if (stage === "approved") return <Approved plan={plan} annual={annual} value={value} method={method} onBack={onBack}/>;
  return (
    <div className="max-w-7xl mx-auto w-full px-gutter-mobile md:px-gutter py-space-md lg:py-space-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-sm mb-space-lg [&>nav]:mb-0">
        <SettingsBreadcrumb trail={[{ label: "Planos e Assinaturas", onClick: onBack }, { label: "Checkout Seguro" }]}/>
        <div className="inline-flex items-center gap-space-xs bg-surface-container px-3 py-1.5 rounded-full self-start md:self-auto">
          <Icon name="lock" size={16} className="text-tertiary"/><span className="font-label-sm text-label-sm text-on-surface font-medium">Ambiente Criptografado SSL 256-bit</span>
        </div>
      </div>
      <div className="mb-space-xl">
        <div className="flex flex-wrap items-center gap-space-sm mb-space-xs">
          <h1 className="text-headline-md lg:text-headline-lg font-headline-md lg:font-headline-lg text-on-surface">Finalizar Assinatura — Racha+ {plan.name}</h1>
          <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold">Sem carência</span>
        </div>
        <p className="text-body-md font-body-md text-on-surface-variant max-w-3xl">Complete seus dados de pagamento para ativar instantaneamente os recursos do plano {plan.name}: mais grupos, mais participantes e organização completa dos rateios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-space-xl items-start">
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md lg:p-space-lg">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="text-headline-sm font-headline-sm text-on-surface">Método de Pagamento</h2>
              <span className="text-label-sm font-label-sm text-on-surface-variant">Passo 1 de 2</span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs bg-surface-container-low p-1.5 rounded-xl mb-space-lg" role="group" aria-label="Forma de pagamento">
              {[["pix", "bolt", "Pix Instantâneo"], ["card", "credit_card", "Cartão de Crédito"]].map(([id, icon, label]) => (
                <button key={id} type="button" aria-pressed={method === id} onClick={() => setMethod(id)} className={`flex items-center justify-center gap-space-xs py-3 px-space-sm rounded-lg font-label-md text-label-md transition-all ${method === id ? "bg-surface-container-lowest text-primary-container shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <Icon name={icon} size={20}/><span>{label}</span>
                </button>
              ))}
            </div>
            {method === "pix" ? (
              <div className="flex flex-col gap-space-lg">
                <div className="bg-surface-container-low rounded-xl p-space-md">
                  <h3 className="text-label-md font-label-md text-on-surface mb-space-sm flex items-center gap-space-xs"><Icon name="verified" size={18} className="text-primary"/>Como pagar com Pix em 3 passos:</h3>
                  <ol className="flex flex-col gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
                    {["Abra o app do seu banco ou internet banking e escolha pagar via Pix.", "Aponte a câmera para o QR Code abaixo ou utilize o código Copia e Cola.", `Confirmação imediata: o plano ${plan.name} é ativado em sua conta logo após o pagamento.`].map((step, index) => (
                      <li key={step} className="flex items-start gap-space-sm">
                        <span className="w-5 h-5 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm shrink-0 mt-0.5">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-space-lg bg-surface-container-lowest p-space-md rounded-xl">
                  <div className="relative bg-surface-container-lowest p-4 rounded-xl shadow-md flex flex-col items-center justify-center shrink-0">
                    <PixPreview size={144}/>
                    <span className="mt-2 text-label-sm font-label-sm text-outline">QR Code ilustrativo · prévia</span>
                  </div>
                  <div className="flex-1 w-full flex flex-col gap-space-sm">
                    <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage === "pending" ? "bg-tertiary-container animate-pulse" : stage === "declined" ? "bg-secondary" : "bg-outline-variant"}`}/>
                      <span className="font-medium text-on-surface">{stage === "pending" ? "Aguardando confirmação do pagamento..." : stage === "declined" ? "Pagamento não confirmado." : "Confirme o pedido para iniciar o pagamento."}</span>
                    </div>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Se preferir, copie a chave de pagamento Pix Copia e Cola e cole no internet banking:</p>
                    <label htmlFor={`${ids}-pix`} className="sr-only">Código Pix Copia e Cola</label>
                    <div className="relative flex items-center">
                      <input id={`${ids}-pix`} readOnly type="text" value={pixCode} onFocus={event => event.currentTarget.select()} className="w-full bg-surface-container-low px-3 py-2.5 rounded-lg text-body-sm font-body-sm text-on-surface-variant pr-28 focus:outline-none"/>
                      <button type="button" onClick={copy} className={`absolute right-1.5 font-label-sm text-label-sm px-3 py-1.5 rounded-md shadow-sm transition-colors flex items-center gap-1 ${copied ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-lowest text-primary hover:bg-surface-container"}`}>
                        <Icon name={copied ? "done" : "content_copy"} size={16}/><span>{copied ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-space-xs text-label-sm font-label-sm text-on-surface-variant mt-1"><Icon name="check_circle" size={16} className="text-tertiary"/><span>Sem taxas adicionais • Liberação imediata em toda a sua conta</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-space-md">
                <p className="flex items-start gap-space-xs p-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface-variant"><Icon name="info" size={18} className="text-primary shrink-0"/>Dados ilustrativos para revisão do layout. Não informe um cartão real.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label htmlFor={`${ids}-number`} className={labelClass}>Número do Cartão</label>
                    <div className="relative flex items-center">
                      <input id={`${ids}-number`} placeholder="0000 0000 0000 0000" inputMode="numeric" maxLength={19} className={`${fieldClass} pr-11`}/>
                      <Icon name="credit_card" size={20} className="absolute right-3 text-outline pointer-events-none"/>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label htmlFor={`${ids}-holder`} className={labelClass}>Nome impresso no Cartão</label>
                    <input id={`${ids}-holder`} placeholder="Como aparece no cartão" autoComplete="off" className={fieldClass}/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`${ids}-expiry`} className={labelClass}>Validade</label>
                    <input id={`${ids}-expiry`} placeholder="MM/AA" maxLength={5} className={fieldClass}/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`${ids}-cvv`} className={labelClass}>Código CVV</label>
                    <div className="relative flex items-center">
                      <input id={`${ids}-cvv`} placeholder="000" inputMode="numeric" maxLength={4} type="password" autoComplete="off" className={`${fieldClass} pr-11`}/>
                      <Icon name="help_outline" size={20} className="absolute right-3 text-outline pointer-events-none"/>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label htmlFor={`${ids}-installments`} className={labelClass}>Opções de Parcelamento</label>
                    <select id={`${ids}-installments`} className={`${fieldClass} cursor-pointer`}>
                      {[1, 2, 3].map(count => <option key={count} value={count}>{count}x de {money(value / count)} (Sem juros){count === 1 ? " — Recomendado" : ""}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md lg:p-space-lg">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="text-headline-sm font-headline-sm text-on-surface">Dados do Titular da Conta</h2>
              <span className="text-label-sm font-label-sm text-on-surface-variant">Passo 2 de 2</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label htmlFor={`${ids}-name`} className={labelClass}>Nome Completo</label>
                <input id={`${ids}-name`} placeholder="Rodrigo Martins de Almeida" autoComplete="name" className={fieldClass}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${ids}-cpf`} className={labelClass}>CPF (para emissão de Nota Fiscal)</label>
                <input id={`${ids}-cpf`} placeholder="000.000.000-00" inputMode="numeric" className={fieldClass}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${ids}-email`} className={labelClass}>E-mail para comprovante</label>
                <input id={`${ids}-email`} type="email" placeholder="rodrigo@exemplo.com" autoComplete="email" className={fieldClass}/>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm"><Icon name="support_agent" size={28}/></div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">Dúvidas sobre o processo de adesão?</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Nossa equipe pode ajudar você na ativação do seu plano. <Link to="/faq" className="text-primary font-semibold hover:underline">Fale com o suporte</Link></p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
          <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md lg:p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-sm">
              <h2 className="text-headline-sm font-headline-sm text-on-surface">Resumo do Plano</h2>
              <span className="bg-surface-container-high text-primary font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">{annual ? "Economia no anual" : "Recomendado"}</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
              <div className="flex items-center justify-between gap-space-sm">
                <span className="font-label-lg text-label-lg text-on-surface">Racha+ {plan.name} ({annual ? "Anual" : "Mensal Flexível"})</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold whitespace-nowrap">{money(value)}<span className="font-body-sm text-body-sm font-normal text-on-surface-variant">{period}</span></span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Renovação automática. Cancele quando quiser diretamente no painel, sem fidelidade ou multas rescisórias.</p>
            </div>
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">O que está liberado hoje:</span>
              {plan.features.slice(0, 5).map(feature => (
                <div key={feature} className="flex items-center gap-space-xs text-body-sm font-body-sm text-on-surface"><Icon name="check_circle" size={18} className="text-primary shrink-0"/><span>{feature}</span></div>
              ))}
            </div>
            <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs mt-space-xs">
              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant"><span>Subtotal</span><span>{money(value)}</span></div>
              <div className="flex items-center justify-between text-body-sm font-body-sm text-tertiary font-medium"><span>Taxas adicionais</span><span>{money(0)}</span></div>
              <div className="w-full h-px bg-surface-variant my-1"/>
              <div className="flex items-center justify-between gap-space-sm">
                <span className="font-label-lg text-label-lg text-on-surface">Total a Pagar Hoje</span>
                <span className="font-numeric-stat text-numeric-stat text-primary-container font-extrabold">{money(value)}</span>
              </div>
            </div>
            {stage === "checkout" && (
              <button type="button" onClick={() => setStage("pending")} className={`w-full py-3.5 px-space-md rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-xs ${primaryCta}`}>
                <Icon name="lock" size={20}/><span>Confirmar e Pagar {money(value)}</span>
              </button>
            )}
            {stage === "pending" && (
              <div className="flex flex-col gap-space-sm">
                <p className="flex items-center gap-space-xs p-space-sm rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md" role="status"><span className="w-2.5 h-2.5 rounded-full bg-tertiary-container animate-pulse"/>Aguardando pagamento · demonstração.</p>
                <button type="button" onClick={() => { onApprove(); setStage("approved"); }} className={`w-full py-3.5 px-space-md rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-xs ${primaryCta}`}><Icon name="task_alt" size={20}/>Simular aprovação</button>
                <button type="button" onClick={() => setStage("declined")} className={`w-full py-3 px-space-md rounded-xl font-label-md text-label-md flex items-center justify-center gap-space-xs ${softButton}`}><Icon name="block" size={18}/>Simular recusa</button>
              </div>
            )}
            {stage === "declined" && (
              <div className="flex flex-col gap-space-sm">
                <p className="flex items-center gap-space-xs p-space-sm rounded-lg bg-error-container text-on-error-container font-label-md text-label-md" role="alert"><Icon name="error" size={18}/>Pagamento recusado. Tente novamente.</p>
                <button type="button" onClick={() => setStage("checkout")} className={`w-full py-3.5 px-space-md rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-xs ${primaryCta}`}><Icon name="refresh" size={20}/>Tentar novamente</button>
              </div>
            )}
            <div className="bg-surface-container-high rounded-xl p-space-md flex items-start gap-space-sm">
              <Icon name="verified_user" size={24} className="text-primary shrink-0"/>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface">Garantia Incondicional de 7 Dias</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Experimente todos os recursos do plano. Se não amar a experiência, o reembolso é previsto em até 7 dias.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-xs text-on-surface-variant">
              <div className="flex items-center gap-1 text-label-sm font-label-sm"><Icon name="shield" size={16} className="text-tertiary"/><span>SSL 256-Bits</span></div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1 text-label-sm font-label-sm"><Icon name="account_balance" size={16} className="text-tertiary"/><span>Protocolo Pix</span></div>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1 text-label-sm font-label-sm"><Icon name="enhanced_encryption" size={16} className="text-tertiary"/><span>Ponta a Ponta</span></div>
            </div>
            <p className="flex items-start justify-center gap-1 text-center font-label-sm text-label-sm text-outline"><Icon name="info" size={14} className="shrink-0 mt-px"/>Nenhuma cobrança é realizada nesta prévia. O código exibido é ilustrativo.</p>
            <div className="text-center pt-space-xs">
              <button type="button" onClick={onBack} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"><Icon name="arrow_back" size={14}/><span>Voltar para a tabela comparativa de planos</span></button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const unlockedIcons = [
  ["diversity_3", "bg-primary-container"],
  ["group_add", "bg-primary"],
  ["call_split", "bg-tertiary-container"],
  ["table_view", "bg-secondary"],
];

function Approved({ plan, annual, value, method, onBack }: { plan: Plan; annual: boolean; value: number; method: string; onBack: () => void }) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState("");
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const renewal = renewalDate(annual);
  const now = new Date();
  const paidAt = `Hoje, ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • ${now.toLocaleDateString("pt-BR")}`;
  const rows: [string, string][] = [
    ["Data & Hora", paidAt],
    ["Plano Contratado", `Racha+ ${plan.name} (${annual ? "Anual" : "Mensal"})`],
    ["Método de Pagamento", method === "pix" ? "Pix Instantâneo" : "Cartão de Crédito"],
    ...(user?.name ? [["Titular Cadastrado", user.name] as [string, string]] : []),
    ...(user?.email ? [["Recibo enviado para", user.email] as [string, string]] : []),
  ];
  return (
    <div className="relative w-full max-w-7xl mx-auto px-gutter-mobile sm:px-gutter py-space-lg overflow-hidden">
      <div aria-hidden="true" className="absolute -top-24 right-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"/>
      <div aria-hidden="true" className="absolute top-1/3 -left-20 w-80 h-80 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"/>
      <div className="relative">
        <SettingsBreadcrumb trail={[{ label: "Planos e Assinaturas", onClick: onBack }, { label: "Pagamento Confirmado" }]}/>

        <section className="relative bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md mb-space-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-container via-tertiary-container to-primary"/>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
            <div className="flex items-start gap-space-lg">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-fixed flex items-center justify-center shadow-lg shadow-primary-container/20"><Icon name="verified" filled size={40} className="text-primary"/></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm"><Icon name="bolt" filled size={16} className="text-tertiary"/></div>
              </div>
              <div className="space-y-space-xs max-w-2xl">
                <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface text-label-sm font-label-sm">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"/>
                  <span className="font-semibold text-primary">Plano Racha+ {plan.name} Ativado</span>
                  <span className="text-outline">•</span>
                  <span className="text-on-surface-variant">{annual ? "Plano Anual" : "Mensalidade Flexível"}</span>
                </div>
                <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">{firstName ? `Parabéns, ${firstName}! ` : "Parabéns! "}Sua assinatura Racha+ {plan.name} está ativa 🎉</h1>
                <p className="text-body-md font-body-md text-on-surface-variant">Pagamento aprovado na prévia. Todos os recursos do plano {plan.name} já foram liberados para a sua conta.</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-lg p-space-md flex flex-wrap md:flex-col items-center justify-center gap-space-xs min-w-[200px] w-full md:w-auto shadow-sm">
              <div className="flex items-center gap-1.5 text-primary font-label-md text-label-md"><Icon name="workspace_premium" size={18}/><span>STATUS DA CONTA</span></div>
              <span className="px-3 py-1 bg-surface-container-lowest text-primary font-label-sm text-label-sm font-bold rounded-full shadow-sm uppercase">{plan.name} / {annual ? "Anual" : "Mensal"}</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant text-center">Próxima renovação em {renewal}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <section className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between gap-space-sm mb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg py-4">
                <div className="flex items-center gap-space-xs"><Icon name="receipt_long" size={24} className="text-primary-container"/><h2 className="font-headline-sm text-headline-sm text-on-surface">Comprovante {method === "pix" ? "Pix" : "do Cartão"}</h2></div>
                <span className="text-label-sm font-label-sm px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold whitespace-nowrap">Quitado com Sucesso</span>
              </div>
              <div className="space-y-space-md text-body-sm font-body-sm">
                <div className="p-space-md bg-surface-container-low rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Valor Líquido</p>
                    <p className="text-numeric-stat font-numeric-stat text-on-surface">{money(value)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm"><Icon name={method === "pix" ? "qr_code_2" : "credit_card"} size={20}/></div>
                </div>
                {rows.map(([label, text]) => (
                  <div key={label} className="flex justify-between items-start gap-space-md py-1">
                    <span className="text-on-surface-variant shrink-0">{label}</span>
                    <span className="font-medium text-on-surface text-right break-all">{text}</span>
                  </div>
                ))}
                <div className="p-space-sm bg-surface-container-high/40 rounded-lg text-label-sm font-label-sm text-on-surface-variant flex items-center gap-2">
                  <Icon name="event_repeat" size={18} className="text-primary"/><span>Próxima cobrança: <strong>{renewal}</strong> (sem fidelidade)</span>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md flex flex-col sm:flex-row gap-space-sm">
                <button type="button" onClick={() => setFeedback("Comprovante ilustrativo: nenhum PDF real é gerado nesta prévia.")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-label-md text-label-md shadow-sm ${softButton}`}><Icon name="download" size={18}/><span>Baixar PDF</span></button>
                <button type="button" onClick={() => setFeedback("Comprovante ilustrativo: nenhum e-mail real é enviado nesta prévia.")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-label-md text-label-md shadow-sm ${softButton}`}><Icon name="mail" size={18}/><span>Reenviar E-mail</span></button>
              </div>
              {feedback && <p className="mt-2 text-center text-label-sm font-label-sm text-primary font-semibold" role="status">{feedback}</p>}
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0"><Icon name="enhanced_encryption" size={20}/></div>
              <div className="flex-1">
                <h3 className="font-label-md text-label-md text-on-surface">Transação 100% Criptografada</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Nenhuma cobrança real foi realizada nesta prévia.</p>
              </div>
            </div>
          </section>

          <section className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md">
              <div className="flex items-center justify-between gap-space-sm mb-space-md">
                <div>
                  <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold">Tudo Desbloqueado</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">O que você já pode fazer agora no Racha+ {plan.name}:</h2>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-tertiary font-label-sm text-label-sm bg-tertiary-fixed px-3 py-1 rounded-full whitespace-nowrap"><Icon name="stars" size={16}/><span>{plan.name === "Pro+" ? "Nível Máximo" : "Nível Pro"}</span></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <div key={feature} className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group">
                    <div className={`w-10 h-10 rounded-lg text-surface-container-lowest flex items-center justify-center mb-space-sm shadow-sm group-hover:scale-105 transition-transform ${unlockedIcons[index][1]}`}><Icon name={unlockedIcons[index][0]} size={22}/></div>
                    <h3 className="font-label-lg text-label-lg text-on-surface">{feature}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Pronto para colocar em prática?</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Acesse seus rachas em andamento ou inicialize um novo grupo com os recursos do plano {plan.name}.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-space-md">
                <Link to="/meus-grupos" className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-space-xs py-3.5 px-space-lg rounded-lg font-label-lg text-label-lg text-center ${primaryCta}`}><span>Ir para Meus Grupos</span><Icon name="arrow_forward" size={20}/></Link>
                <Link to="/criar-grupo" className="w-full sm:w-auto flex items-center justify-center gap-space-xs bg-surface-container-low hover:bg-surface-container text-on-surface py-3.5 px-space-lg rounded-lg font-label-lg text-label-lg transition-all"><Icon name="add_circle" size={20} className="text-primary"/><span>Criar Novo Grupo</span></Link>
              </div>
              <div className="pt-space-xs flex justify-between items-center gap-space-sm text-label-sm font-label-sm text-on-surface-variant">
                <Link to="/gerenciar-assinatura" className="hover:text-primary transition-colors flex items-center gap-1"><Icon name="tune" size={16}/>Gerenciar Assinatura em Configurações</Link>
                <span className="hidden sm:inline">Cancelamento online sem burocracia</span>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-space-xl bg-surface-container-low rounded-xl p-space-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg items-center">
            <div className="flex items-start gap-space-md">
              <div className="w-12 h-12 rounded-full bg-primary-container text-surface-container-lowest flex items-center justify-center shrink-0 shadow-sm"><Icon name="support_agent" size={24}/></div>
              <div className="space-y-1">
                <h4 className="font-label-lg text-label-lg text-on-surface">Atendimento Racha+</h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Conte com nosso time para tirar dúvidas sobre a sua assinatura ou resolver qualquer conciliação.</p>
                <Link to="/faq" className="inline-flex items-center gap-1 text-primary font-label-md text-label-md hover:underline pt-1"><span>Fale com o suporte</span><Icon name="arrow_outward" size={16}/></Link>
              </div>
            </div>
            <div className="flex items-start gap-space-md border-t border-surface-variant md:border-t-0 pt-space-md md:pt-0">
              <div className="w-12 h-12 rounded-full bg-surface-container-high text-tertiary flex items-center justify-center shrink-0 shadow-sm"><Icon name="verified_user" size={24}/></div>
              <div className="space-y-1">
                <h4 className="font-label-lg text-label-lg text-on-surface">Tranquilidade Garantida por 7 Dias</h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Teste sem restrições. Se achar que o Racha+ {plan.name} não simplificou a sua divisão de despesas, o reembolso é previsto em até 7 dias.</p>
                <span className="inline-block text-label-sm font-label-sm text-outline pt-1">Código de proteção ao consumidor (Art. 49) respeitado à risca.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
