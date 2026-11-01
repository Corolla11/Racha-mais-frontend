import { ArrowLeft,ArrowRight,BadgeCheck,Check,ChevronDown,Copy,CreditCard,Diamond,Clock3,Headphones,LockKeyhole,QrCode,ShieldCheck,WalletCards,Zap } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Link from "../components/app-link";
import AppShell from "../components/app-shell";
import Overlay from "../components/overlay";
import PixPreview from "../components/pix-preview";
import { money } from "../lib/finance";


const plans = [
  { name: "Grátis", month: 0, year: 0, description: "Ideal para quem quer dividir contas esporádicas com poucos amigos.", features: ["Até 2 grupos ativos simultâneos", "Até 10 membros por grupo", "Divisão igualitária de despesas", "Geração de QR Code Pix básico", "Comprovantes em baixa resolução"] },
  { name: "Pro", month: 12, year: 80, description: "Perfeito para viagens longas, repúblicas e turmas ativas de amigos.", features: ["+3 grupos adicionais (5 grupos no total)", "+5 membros adicionais (até 15 membros por grupo)", "Divisão por participantes selecionados", "Organização de tarefas e compras em equipe", "Comprovantes em alta resolução", "Lembretes automáticos de pagamento"] },
  { name: "Pro+", month: 20, year: 200, description: "Para quem organiza grandes eventos, múltiplos grupos e encontros frequentes.", features: ["+5 grupos adicionais (10 grupos ativos)", "Membros ilimitados por grupo", "Divisão por tarefa e participantes", "Relatórios financeiros e exportação em PDF e Excel", "Suporte prioritário", "Histórico e auditoria financeira completos"] },
];
type Plan = typeof plans[number];
type Subscription = { name: string; annual: boolean; value: number; renewal: string; renew: boolean };
const questions = [
  ["Como funciona a cobrança por Pix ou Cartão?", "Escolha a periodicidade e a forma de pagamento no checkout. Esta prévia permite revisar as etapas sem realizar uma cobrança real."],
  ["Posso cancelar a assinatura quando quiser?", "Sim. Você pode cancelar a renovação em Minha assinatura e manter os benefícios até o final do período contratado."],
  ["O que acontece se eu fizer upgrade no meio do mês?", "O checkout apresenta o valor da contratação antes da confirmação. Na demonstração, nenhum valor é debitado."],
  ["Todos os membros do grupo precisam ter o plano Pro?", "Os benefícios de organização se aplicam aos grupos elegíveis do assinante. Os demais participantes podem continuar usando o plano gratuito."],
];

export default function Assinatura({ manage = false }: { manage?: boolean }) {
  const [params] = useSearchParams();
  const [annual, setAnnual] = useState(params.get("periodo") === "anual");
  const [selected, setSelected] = useState<Plan | null>(params.get("checkout") === "pro" ? plans[1] : params.get("checkout") === "proplus" ? plans[2] : null);
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    try { return JSON.parse(sessionStorage.getItem("racha-demo-subscription") ?? "null"); } catch { return null; }
  });
  const [cancel, setCancel] = useState(false);
  const [message, setMessage] = useState("");
  function save(value: Subscription) {
    setSubscription(value);
    sessionStorage.setItem("racha-demo-subscription", JSON.stringify(value));
  }
  return (
    <AppShell title={selected ? "Finalizar assinatura" : manage ? "Configurações da conta" : "Visão Geral"}>
      {selected ? <Checkout plan={selected} annual={annual} onBack={() => setSelected(null)} onApprove={() => {
        const date = new Date();
        if (annual) date.setFullYear(date.getFullYear() + 1); else date.setMonth(date.getMonth() + 1);
        save({ name: selected.name, annual, value: annual ? selected.year : selected.month, renewal: date.toLocaleDateString("pt-BR"), renew: true });
      }}/> : manage ? (
        <div className="racha-settings-page">
          <div className="racha-section-heading"><span className="racha-eyebrow">PAINEL DO USUÁRIO</span><h1>Gerenciar assinatura</h1><p>Seu plano, próxima renovação e histórico de cobranças em um só lugar.</p></div>
          <div className="racha-settings-tabs"><Link to="/perfil">Perfil</Link><Link to="/perfil">Segurança e conta</Link><span className="active"><CreditCard size={13}/>Assinatura</span></div>
          {message && <p className="racha-success" role="status">{message}</p>}
          <div className="racha-account-columns">
            <section className="racha-card"><div className="racha-card-heading"><div><span className="racha-eyebrow">SUA ASSINATURA</span><h2>Plano {subscription?.name ?? "Grátis"}</h2></div><span className="racha-badge confirmado">{subscription ? subscription.renew ? "Ativa" : "Renovação cancelada" : "Plano atual"}</span></div><p className="racha-muted">Mais organização para dividir bons momentos.</p><div className="racha-stats"><div>Valor da assinatura<strong>{money(subscription?.value ?? 0)}</strong></div><div>Periodicidade<strong>{subscription ? subscription.annual ? "Anual" : "Mensal" : "Sem cobrança"}</strong></div><div>{subscription?.renew ? "Próxima renovação" : "Disponível até"}<strong>{subscription?.renewal ?? "Sem prazo"}</strong></div></div><div className="racha-actions wrap"><Link className="racha-primary" to="/assinatura">Trocar plano <ArrowRight size={14}/></Link>{subscription && <button className="racha-secondary" disabled={!subscription.renew} onClick={() => setCancel(true)}>Cancelar renovação</button>}</div></section>
            <section className="racha-card racha-benefits"><ShieldCheck size={24}/><h2>Você tem o controle</h2><p>Cancele a renovação quando quiser. Seus grupos e o histórico financeiro serão preservados.</p><Link to="/faq">Entenda como funcionam os planos →</Link></section>
          </div>
          <section className="racha-card"><div className="racha-card-heading"><h2>Histórico de cobranças</h2><span className="racha-badge">{subscription ? "1 registro" : "Nenhum registro"}</span></div>{subscription ? <div className="racha-invoice-row"><span className="racha-soft-icon"><CreditCard size={18}/></span><div><strong>Assinatura {subscription.name}</strong><small>{subscription.annual ? "Plano anual" : "Plano mensal"} · cobrança de demonstração</small></div><strong>{money(subscription.value)}</strong><span className="racha-badge confirmado">Aprovado</span></div> : <p className="racha-empty">Você está no plano gratuito. Nenhuma cobrança registrada.</p>}</section>
          <p className="racha-demo-caption">Prévia de assinatura · os dados desta sessão são demonstrativos.</p>
        </div>
      ) : (
        <div className="racha-pricing-page">
          <div className="racha-page-heading"><span className="racha-heading-pill">Planos Flexíveis & Transparência Total</span><h1>Escolha o plano ideal para suas rachas</h1><p>Gerencie viagens com amigos, despesas da república ou eventos sem dor de cabeça.<br/>Cancele ou altere quando quiser.</p></div>
          <div className="racha-center"><div className="racha-billing-toggle"><button aria-pressed={!annual} onClick={() => setAnnual(false)}>Cobrança Mensal</button><button aria-pressed={annual} onClick={() => setAnnual(true)}>Cobrança Anual <span>ATÉ 44% OFF</span></button></div></div>
          <div className="racha-plans">{plans.map((plan, index) => (
            <section className={`racha-card racha-plan ${index === 1 ? "recommended" : ""}`} key={plan.name}>
              {index === 1 && <span className="racha-recommended"><Zap size={10}/>MAIS POPULAR</span>}
              <div className="racha-plan-title"><h2>{plan.name}</h2>{index === 1 && <span className="racha-plan-label">Recomendado</span>}{index === 2 && <span className="racha-plan-label">SEM LIMITES</span>}<span className="racha-plan-mark">{index === 0 ? <UsersIcon/> : index === 1 ? <Zap size={16}/> : <Diamond size={16}/>}</span></div>
              <p className="racha-plan-description">{plan.description}</p>
              <p className="racha-price">{money(annual ? plan.year : plan.month)}<small>/{annual ? "ano" : "mês"}</small></p>
              <p className="racha-price-caption">{index === 0 ? "Sem taxas ocultas" : annual ? "Faturamento anual" : "Faturamento mensal recorrente"}</p>
              <hr/><span className="racha-feature-label">{index === 0 ? "O QUE INCLUI:" : index === 1 ? "TUDO DO GRÁTIS, MAIS:" : "TUDO DO PRO, COM POTÊNCIA TOTAL:"}</span>
              <ul>{plan.features.map(feature => <li key={feature}><Check size={12}/><span>{feature}</span></li>)}</ul>
              <button className={index === 0 ? "racha-secondary" : index === 2 ? "racha-primary racha-dark-button" : "racha-primary"} disabled={index === 0} onClick={() => setSelected(plan)}>{index === 0 ? <><ShieldCheck size={13}/>Seu plano atual</> : <>Assinar Plano {plan.name}{index === 2 ? <Diamond size={13}/> : <ArrowRight size={14}/>}</>}</button>
            </section>
          ))}</div>
          <div className="racha-value-strip"><span className="racha-value-icon"><WalletCards size={22}/></span><div><h3>Divisão sem atrito para qualquer momento</h3><p>Organize viagens, churrascos e despesas de moradia.</p></div><div><strong>100%</strong><small>Segurança via Pix</small></div><div><strong>Zero</strong><small>Taxas sobre o rateio</small></div></div>
          <section className="racha-pricing-faq"><span className="racha-eyebrow">TIRE SUAS DÚVIDAS</span><h2>Perguntas Frequentes</h2>{questions.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={14}/></summary><p>{answer}</p></details>)}</section>
          <div className="racha-pricing-footer"><span className="racha-demo-caption">Prévia visual · sem cobrança real.</span><Link to="/gerenciar-assinatura">Gerenciar minha assinatura →</Link></div>
        </div>
      )}
      {cancel && <Overlay title="Cancelar renovação?" onClose={() => setCancel(false)} description="Revise sua assinatura antes de continuar." footer={<><button className="racha-secondary" onClick={() => setCancel(false)}>Manter assinatura</button><button className="racha-primary" onClick={() => { if (subscription) save({ ...subscription, renew: false }); setCancel(false); setMessage("Renovação cancelada na demonstração."); }}>Confirmar cancelamento</button></>}><p>Os benefícios continuam disponíveis até {subscription?.renewal}. Depois, sua conta retorna ao plano Grátis e seus registros permanecem preservados.</p></Overlay>}
    </AppShell>
  );
}

function UsersIcon() { return <BadgeCheck size={16}/>; }

function Checkout({ plan, annual, onBack, onApprove }: { plan: Plan; annual: boolean; onBack: () => void; onApprove: () => void }) {
  const [method, setMethod] = useState("pix");
  const [stage, setStage] = useState<"checkout" | "pending" | "approved" | "declined">("checkout");
  const [copied, setCopied] = useState(false);
  const value = annual ? plan.year : plan.month;
  async function copy() {
    try { await navigator.clipboard.writeText("PREVIA-RACHA-SEM-VALOR-FINANCEIRO"); setCopied(true); } catch { setCopied(false); }
  }
  return <div className="racha-checkout-page">
    <div className="racha-checkout-top"><button className="racha-back-link" onClick={onBack}><ArrowLeft size={13}/>Voltar aos planos</button><span><LockKeyhole size={12}/>Ambiente de pagamento seguro</span></div>
    <div className="racha-checkout-grid">
      <div className="racha-checkout-main">
        <section className="racha-card racha-checkout-heading"><span className="racha-eyebrow">PASSO 2 DE 2 · PAGAMENTO</span><h1>Finalizar Assinatura</h1><p>Escolha como prefere pagar sua assinatura do Racha+ e ative instantaneamente seus recursos.</p></section>
        <section className="racha-card"><span className="racha-feature-label">FORMA DE PAGAMENTO</span><div className="racha-payment-methods"><button aria-pressed={method === "pix"} onClick={() => setMethod("pix")}><span className="racha-method-icon"><QrCode size={19}/></span><div><strong>Pix</strong><small>Instantâneo</small></div><span className="racha-method-badge">Recomendado</span></button><button aria-pressed={method === "card"} onClick={() => setMethod("card")}><CreditCard size={22}/><div><strong>Cartão de Crédito</strong><small>Revisar pagamento</small></div></button></div>
          {method === "pix" ? <><div className="racha-expiry"><span><ClockIcon/>O código expira em:</span><strong>14:24 <small>minutos</small></strong></div><div className="racha-checkout-pix"><div className="racha-checkout-qr"><PixPreview size={156}/><small>QR Code ilustrativo · prévia</small></div><div className="racha-pix-steps"><strong>Como pagar com Pix:</strong>{["Abra o app do seu banco", "Aponte a câmera ou use o código", "Confirme os dados e finalize"].map((step, index) => <div key={step}><span>{index + 1}</span><p><strong>{step}</strong><small>{["Acesse a seção de pagamentos e vá em Pix.", "Escolha Ler QR Code ou a opção Copia e Cola.", "Confira o valor e o recebedor antes de confirmar."][index]}</small></p></div>)}</div></div><label className="racha-copy-label">Código Pix Copia e Cola</label><div className="racha-copy-field"><code>PREVIA-RACHA-SEM-VALOR-FINANCEIRO</code><button className="racha-primary" onClick={copy}><Copy size={12}/>{copied ? "Copiado" : "Copiar código Pix"}</button></div></> : <div className="racha-card-form"><div className="racha-notice"><CreditCard size={16}/>Dados ilustrativos para revisão do layout. Não informe um cartão real.</div><label className="racha-label">Número do cartão<input placeholder="0000 0000 0000 0000" inputMode="numeric" maxLength={19} className="ui-control"/></label><div className="racha-two-col"><label className="racha-label">Validade<input placeholder="MM/AA" maxLength={5} className="ui-control"/></label><label className="racha-label">CVV<input placeholder="000" inputMode="numeric" maxLength={4} className="ui-control"/></label></div></div>}
        </section>
        <section className="racha-card"><div className="racha-card-heading"><h2><LockKeyhole size={15}/>Dados de Faturamento & Nota Fiscal</h2></div><p className="racha-muted">Utilizados apenas para emissão legal da nota fiscal e envio do comprovante.</p><label className="racha-label">Nome completo<input placeholder="Rodrigo Martins de Almeida" autoComplete="name" className="ui-control"/></label><div className="racha-two-col"><label className="racha-label">CPF (na Nota Fiscal)<input placeholder="000.000.000-00" inputMode="numeric" className="ui-control"/></label><label className="racha-label">E-mail para recibo<input type="email" placeholder="rodrigo@exemplo.com" autoComplete="email" className="ui-control"/></label></div></section>
        <div className="racha-checkout-trust">{[[ShieldCheck, "SSL 256-Bits", "Dados protegidos"], [LockKeyhole, "Pagamento Seguro", "Protocolo Pix"], [BadgeCheck, "Garantia 7 Dias", "Reembolso previsto"]].map(([Icon, title, text]) => <div key={String(title)}><Icon size={22}/><p><strong>{String(title)}</strong><small>{String(text)}</small></p></div>)}</div>
      </div>
      <aside className="racha-checkout-summary racha-card"><div className="racha-card-heading"><span className="racha-feature-label">RESUMO DO PEDIDO</span><span className="racha-plan-label">{annual ? "Economia no anual" : "Plano mensal"}</span></div><h2>Plano {plan.name}<br/>— {annual ? "Anual" : "Mensal"}</h2><span className="racha-feature-label">RECURSOS INCLUÍDOS</span><ul>{plan.features.slice(0, 4).map(feature => <li key={feature}><Check size={13}/>{feature}</li>)}</ul><hr/><div className="racha-order-line"><span>Preço {annual ? "anual" : "mensal"}</span><strong>{money(value)}</strong></div><div className="racha-order-line"><span>Taxas adicionais</span><strong>R$ 0,00</strong></div><div className="racha-order-total"><span>Total a pagar<br/><small>{annual ? "Hoje, plano anual" : "Hoje, plano mensal"}</small></span><strong>{money(value)}</strong></div>{stage === "checkout" && <button className="racha-primary" onClick={() => setStage("pending")}><LockKeyhole size={14}/>Confirmar Pagamento</button>}{stage === "pending" && <><p className="racha-warning" role="status">Aguardando pagamento · demonstração.</p><button className="racha-primary" onClick={() => { onApprove(); setStage("approved"); }}>Simular aprovação</button><button className="racha-secondary" onClick={() => setStage("declined")}>Simular recusa</button></>}{stage === "approved" && <><p className="racha-success" role="status">Pagamento aprovado na prévia.</p><Link className="racha-primary" to="/gerenciar-assinatura">Gerenciar assinatura</Link></>}{stage === "declined" && <><p className="racha-warning" role="alert">Pagamento recusado. Tente novamente.</p><button className="racha-primary" onClick={() => setStage("checkout")}>Tentar novamente</button></>}<p className="racha-checkout-caption"><ShieldCheck size={12}/>Nenhuma cobrança é realizada nesta prévia. O código exibido é ilustrativo.</p><div className="racha-checkout-testimonial"><span className="racha-avatar">MS</span><p>“Muito mais fácil dividir as contas sem perder nenhum detalhe.”<small>Mariana S. · Usuária Racha+</small></p></div><Link className="racha-checkout-support" to="/faq"><Headphones size={14}/>Dúvidas com o pagamento? <strong>Fale com o suporte</strong></Link></aside>
    </div>
  </div>;
}
function ClockIcon() { return <Clock3 size={12}/>; }
