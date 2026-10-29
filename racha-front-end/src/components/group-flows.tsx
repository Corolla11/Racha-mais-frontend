import { initialGroupSettings, type GroupSettings } from "../lib/group-design";
import { ArrowLeft,ArrowRight,Check,CheckCircle2,Copy,FileText,History,LockKeyhole,Mail,ShieldCheck,Trash2,Upload,UserPlus,Users } from "lucide-react";
import { useImperativeHandle,useState,type Dispatch,type Ref,type SetStateAction } from "react";
import { canCloseGroup,money,paymentLabels,share,type Payment,type PaymentStatus } from "../lib/finance";
import type { DadosTarefa } from "../pages/editar-tarefa";
import Link from "./app-link";
import { GroupAudit, GroupEditForm, PaymentManagement } from "./group-panels";
import { Smartphone, UserMinus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Overlay from "./overlay";
import PixPreview from "./pix-preview";


type Member = { id: string; nome: string; admin: boolean; active: boolean };
export type Activity = { text: string; date: string };
export interface GroupFlowControl { openPayments: (taskId?: string) => void }
interface Props { taskEvents: Activity[]; tasks: DadosTarefa[]; name: string; onName: (name: string) => void; closed: boolean; onCloseGroup: () => void; memberMode: boolean; payments: Record<string, Payment>; setPayments: Dispatch<SetStateAction<Record<string, Payment>>>; ref?: Ref<GroupFlowControl> }

export default function GroupFlows({ taskEvents, tasks, name, onName, closed, onCloseGroup, memberMode, payments, setPayments, ref }: Props) {
  const [params] = useSearchParams();
  const initialPanel = params.get("painel");
  const [view, setView] = useState<"payments" | "members" | "edit" | "close" | "leave" | null>(initialPanel === "pix" || initialPanel === "payments" ? "payments" : initialPanel === "members" || initialPanel === "edit" || initialPanel === "close" ? initialPanel : null);
  const [tab, setTab] = useState("tasks");
  const [memberTab, setMemberTab] = useState("members");
  const [members, setMembers] = useState<Member[]>(() => (tasks[0]?.participantes ?? []).map(p => ({ id: p.id, nome: p.nome, admin: p.id === "1", active: true })));
  const [events, setEvents] = useState<Activity[]>([{ text: "Grupo criado · Rodrigo Martins", date: "2025-11-14T12:00:00.000Z" }]);
  const [selected, setSelected] = useState(initialPanel === "pix" ? "tarefa-02:1" : "");
  useImperativeHandle(ref, () => ({ openPayments(taskId) { setView("payments"); setSelected(taskId ? `${taskId}:1` : ""); } }), []);
  const [receipt, setReceipt] = useState<{ data: string; name: string } | null>(null);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<GroupSettings>(initialGroupSettings);
  const [remove, setRemove] = useState<Member | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [reason, setReason] = useState("");
  const [invite, setInvite] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [receiptView, setReceiptView] = useState<Payment | null>(null);
  const entries = tasks.flatMap(task => {
    const participants = task.participantes.filter(p => p.selecionado);
    return task.possuiDespesa ? participants.map((person, index) => {
      const key = `${task.id}:${person.id}`;
      const payment = payments[key] ?? { status: person.id === task.pagadorId ? "confirmado" : "pendente" };
      return { key, task, person, amount: share(task.valorTotal, participants.length, index), payment };
    }) : [];
  });
  const total = entries.reduce((sum, item) => sum + Math.round(item.amount * 100), 0) / 100;
  const paid = entries.filter(e => e.payment.status === "confirmado").reduce((sum, e) => sum + Math.round(e.amount * 100), 0) / 100;
  const pending = Math.round((total - paid) * 100) / 100;
  const active = entries.find(e => e.key === selected);
  const visibleEntries = memberMode ? entries.filter(e => e.person.id === "1") : entries;
  const canClose = canCloseGroup(tasks.map(t => t.concluida), entries);
  const myPending = entries.filter(e => e.person.id === "1" && e.payment.status !== "confirmado").reduce((sum, e) => sum + e.amount, 0);
  const onlyAdmin = !memberMode && members.filter(m => m.active && m.admin).length === 1;
  const activeMembers = members.filter(member => member.active);
  function log(text: string) { setEvents(old => [{ text, date: new Date().toISOString() }, ...old]); }
  function dismiss() { setView(null); setRemove(null); setConfirmClose(false); setMessage(""); }
  function updatePayment(key: string, status: PaymentStatus) {
    const entry = entries.find(e => e.key === key);
    if (!entry || closed) return;
    if (status === "confirmado" && (memberMode || entry.payment.status !== "informado")) return;
    if (status === "contestado" && (memberMode || !reason.trim())) { setMessage("Informe o motivo da contestação."); return; }
    setPayments(old => ({ ...old, [key]: { ...entry.payment, status, ...(status === "informado" ? { receipt: receipt?.data, receiptName: receipt?.name } : {}), ...(status === "contestado" ? { reason } : {}) } }));
    log(`${paymentLabels[status]} · ${entry.person.nome} · ${entry.task.titulo}`);
    setMessage(paymentLabels[status]); setReceipt(null); setReason("");
  }
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setMessage("Copiado."); }
    catch { setMessage("Não foi possível copiar. Selecione e copie o texto exibido."); }
  }
  function receiptFile(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type) || file.size > 5 * 1024 * 1024) { setMessage("Selecione JPG, PNG ou PDF de até 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setReceipt({ data: String(reader.result), name: file.name });
    reader.onerror = () => setMessage("Não foi possível ler o comprovante.");
    reader.readAsDataURL(file);
  }
  const canInform = active && !closed && (active.person.id === "1" || !memberMode) && ["pendente", "contestado"].includes(active.payment.status);
  return <section className="racha-flows">
    {view === "close" ? <GroupAudit name={name} tasks={tasks} memberCount={activeMembers.length} total={total} paid={paid} pending={pending} canClose={canClose} settings={settings} onBack={dismiss} onConfirm={() => setConfirmClose(true)}/> : view === "payments" && !active ? <PaymentManagement name={name} entries={visibleEntries} onBack={dismiss} onOpen={key => { setSelected(key); setMessage(""); }} onConfirm={key => updatePayment(key, "confirmado")} onExport={() => setMessage("A exporta\u00e7\u00e3o de comprovantes depende dos registros reais do grupo.")} message={message} memberMode={memberMode}/> : <>
      {closed && <div className="racha-success"><CheckCircle2/><div><h2>Grupo encerrado com sucesso</h2><p>Histórico preservado · somente leitura · todos os pagamentos confirmados.</p></div></div>}
      <div className="racha-flow-toolbar"><div className="racha-tabs"><button aria-pressed={tab === "tasks"} onClick={() => setTab("tasks")}>Visão geral</button><button aria-pressed={tab === "history"} onClick={() => setTab("history")}><History size={14}/>Histórico</button></div><div className="racha-actions wrap"><button className="racha-secondary" onClick={() => { setView("payments"); setSelected(""); }}>Pagamentos e comprovantes</button><button className="racha-secondary" onClick={() => setView("members")}><Users size={14}/>Membros</button>{!memberMode && !closed && <><button className="racha-secondary" onClick={() => setView("edit")}>Editar grupo</button><button className="racha-secondary" onClick={() => setView("close")}>Encerrar grupo</button></>}{!closed && <button className="racha-secondary" onClick={() => setView("leave")}>Sair do grupo</button>}</div></div>
      {(tab === "history" || closed) && <div className="racha-card"><div className="racha-card-heading"><h2>{closed ? "Resumo final e histórico" : "Histórico de atividades"}</h2><span className="racha-badge">{closed ? "100% Quitado" : "Todas as atividades"}</span></div>{closed && <div className="racha-stats"><div>Total de despesas<strong>{money(total)}</strong></div><div>Valores pagos<strong>{money(paid)}</strong></div><div>Tarefas realizadas<strong>{tasks.filter(t => t.concluida).length}/{tasks.length}</strong></div><div>Participantes<strong>{activeMembers.length}</strong></div></div>}<ol className="racha-timeline">{[...events, ...taskEvents].sort((a, b) => b.date.localeCompare(a.date)).map((event, index) => <li key={index}><span className="racha-soft-icon"><History size={15}/></span><div>{event.text}<small>{new Date(event.date).toLocaleString("pt-BR")}</small></div></li>)}</ol>{closed && <Link className="racha-primary" to="/meus-grupos">Voltar aos meus grupos</Link>}</div>}
    </>}
    {view && view !== "close" && !(view === "payments" && !active) && !receiptView && <Overlay
      title={view === "payments" ? active ? "Acertar Pagamento via Pix" : "Gerenciar Pagamentos e Comprovantes" : view === "members" ? "Membros & Convites" : view === "edit" ? "Editar Grupo" : "Sair do grupo"}
      eyebrow={view === "members" ? "PAINEL DO ADMINISTRADOR" : view === "edit" ? "ADMIN · ID: #FLN-2025" : view === "payments" && active ? "LIQUIDAÇÃO DIRETA · PARTICIPANTE" : undefined}
      description={view === "edit" ? "Atualize informações básicas, regras de rateio e capa do grupo" : view === "members" ? "Gerencie participantes, permissões e adicione novos amigos ao racha." : active ? "Transfira sua cota diretamente para o responsável da compra." : undefined}
      className={view === "members" ? "racha-members-modal" : view === "payments" ? active ? "racha-pix-modal" : "racha-payment-management" : ""}
      onClose={dismiss} drawer={view === "edit"}
      footer={view === "edit" ? <><button className="racha-secondary" onClick={dismiss}>Cancelar</button><button className="racha-primary" form="racha-edit-group-form" type="submit"><Check size={14}/>Salvar Alterações</button></> : view === "members" ? <><small><ShieldCheck size={12}/>Alterações salvas instantaneamente nesta prévia</small><button className="racha-secondary" onClick={dismiss}>Cancelar</button><button className="racha-primary" onClick={dismiss}><Check size={15}/>Concluir</button></> : active ? <><button className="racha-secondary" onClick={dismiss}>Cancelar / Fechar</button>{canInform ? <button className="racha-primary" onClick={() => updatePayment(active.key, "informado")}><ArrowRight size={15}/>Informar que realizei o Pagamento</button> : <button className="racha-primary" onClick={dismiss}>Concluir</button>}</> : undefined}>
      {message && <p className="racha-notice" role="status">{message}</p>}
      {view === "payments" && active && <>
        <div className="racha-pix-task"><div><span>{name}</span><span className={`racha-badge ${active.payment.status}`}>{paymentLabels[active.payment.status]}</span></div><h3>{active.task.titulo}</h3><div className="racha-pix-amounts"><div><span className="racha-soft-icon"><Users size={17}/></span><p><small>Valor total da despesa</small><strong>{money(active.task.valorTotal)}</strong><small>Dividido entre {active.task.participantes.filter(p => p.selecionado).length} pessoas</small></p></div><div><small>Sua cota a transferir</small><strong>{money(active.amount)}</strong></div></div><div className="racha-pix-recipient"><span className="racha-avatar">{active.task.participantes.find(p => p.id === active.task.pagadorId)?.nome.slice(0, 1)}</span><div><strong>{active.task.participantes.find(p => p.id === active.task.pagadorId)?.nome}</strong><span className="racha-plan-label">Responsável pela compra</span><small>Nu Pagamentos S.A. · conta ilustrativa</small></div><span><ShieldCheck size={11}/>Recebimento direto</span></div></div>
        <div className="racha-pix-code-grid"><div className="racha-pix-qr"><PixPreview size={148}/><small>Aponte a câmera no app do seu banco</small></div><div><label className="racha-copy-label">Chave Pix (Telefone / Celular)<span>DEMONSTRAÇÃO</span></label><div className="racha-key-copy"><SmartphoneIcon/><span>(11) 98765-4321</span><button onClick={() => copy("CHAVE-ILUSTRATIVA-SEM-VALOR-FINANCEIRO")}><Copy size={11}/>Copiar chave</button></div><label className="racha-copy-label">Código Pix Copia e Cola</label><div className="racha-code-block">PREVIA-RACHA-SEM-VALOR-FINANCEIRO<br/>Código ilustrativo para revisão da interface.</div><button className="racha-primary racha-copy-pix" onClick={() => copy("PREVIA-RACHA-SEM-VALOR-FINANCEIRO")}><Copy size={12}/>Copiar Código Pix Completo</button></div></div>
        {active.payment.reason && <p className="racha-warning" role="alert">Motivo da contestação: {active.payment.reason}</p>}
        {active.payment.receipt && <button className="racha-secondary" onClick={() => setReceiptView(active.payment)}><FileText size={14}/>Visualizar comprovante</button>}
        {canInform && <div className="racha-pix-upload"><h4><Upload size={13}/>Já realizou o pagamento? Anexe seu comprovante</h4><label><span className="racha-upload-symbol"><Upload size={21}/></span><strong>{receipt?.name || "Arraste ou clique para selecionar o comprovante"}</strong><small>Formatos aceitos: JPG, PNG ou PDF (até 5 MB)</small><input type="file" accept="image/png,image/jpeg,application/pdf" onChange={event => receiptFile(event.target.files?.[0])}/></label></div>}
        {!memberMode && !closed && active.payment.status === "informado" && <div className="racha-payment-review"><div className="racha-notice"><ShieldCheck size={16}/>Confira o comprovante e o recebimento antes de confirmar.</div><button className="racha-primary" onClick={() => updatePayment(active.key, "confirmado")}><Check size={14}/>Confirmar Recebimento</button><label className="racha-label">Motivo da contestação<textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={300}/></label><button className="racha-danger" onClick={() => updatePayment(active.key, "contestado")}>Contestar pagamento</button></div>}
        <details className="racha-payment-history"><summary>Histórico de pagamentos desta tarefa</summary>{events.some(event => event.text.includes(active.task.titulo)) ? events.filter(event => event.text.includes(active.task.titulo)).map((event, index) => <p key={index}>{event.text}<small>{new Date(event.date).toLocaleString("pt-BR")}</small></p>) : <p>Nenhum pagamento anterior registrado nesta tarefa.</p>}</details>
        <small className="racha-demo-caption">Pix ilustrativo · não realize uma transferência. Informar pagamento não confirma o recebimento.</small><button className="racha-back-link" onClick={() => setSelected("")}><ArrowLeft size={12}/>Voltar aos pagamentos</button>
      </>}
      {view === "edit" && <GroupEditForm name={name} settings={settings} onSave={(updatedName, updatedSettings) => { onName(updatedName); setSettings(updatedSettings); log("Informações do grupo atualizadas"); dismiss(); }}/ >}
      {view === "members" && <><div className="racha-member-tabs"><button aria-pressed={memberTab === "members"} onClick={() => setMemberTab("members")}><Users size={15}/>Membros Atuais<span>{activeMembers.length}</span></button>{!memberMode && !closed && <button aria-pressed={memberTab === "invite"} onClick={() => setMemberTab("invite")}><UserPlus size={15}/>Convidar Novos</button>}</div><div className="racha-member-rule"><ShieldCheck size={13}/>Apenas administradores podem gerenciar integrantes.<span>{activeMembers.length}/15 Membros</span></div>{memberTab === "members" ? <div className="racha-member-list">{members.map(member => <div className={`racha-member ${!member.active ? "inactive" : ""}`} key={member.id}><span className="racha-avatar">{member.nome.split(" ").map(part => part[0]).slice(0, 2).join("")}</span><div><strong>{member.nome}{member.id === "1" && <span className="racha-plan-label">Você</span>}</strong><small>{member.nome.toLowerCase().split(" ")[0]}@exemplo.com</small>{!member.active && <span className="racha-badge">Saiu do grupo</span>}</div>{member.id === "1" ? <><span className="racha-plan-label">♛ Admin · Criador</span><LockKeyhole size={14} className="racha-muted"/></> : !closed && !memberMode && member.active ? <><select aria-label={`Permissão de ${member.nome}`} value={member.admin ? "admin" : "member"} onChange={event => { setMembers(old => old.map(item => item.id === member.id ? { ...item, admin: event.target.value === "admin" } : item)); log(`Permissão atualizada · ${member.nome}`); }}><option value="member">Membro</option><option value="admin">Administrador</option></select><button className="racha-member-remove" aria-label={`Remover ${member.nome}`} onClick={() => setRemove(member)}><UserMinus size={15}/></button></> : <span className="racha-badge">{member.admin ? "Administrador" : "Membro"}</span>}</div>)}</div> : <form className="racha-invite-form" onSubmit={event => { event.preventDefault(); if (invites.includes(invite)) { setMessage("Já existe um convite para este e-mail."); return; } setInvites(old => [...old, invite]); log(`Convite preparado · ${invite}`); setInvite(""); setMessage("Convite preparado na demonstração. Nenhum e-mail foi enviado."); }}><span className="racha-soft-icon"><Mail size={21}/></span><h3>Chame seus amigos para o racha</h3><p>Compartilhe as tarefas e acompanhe cada acerto em um só lugar.</p><label className="racha-label">E-mail do participante<input type="email" required placeholder="amigo@exemplo.com" value={invite} onChange={event => setInvite(event.target.value)}/></label><button className="racha-primary"><UserPlus size={14}/>Preparar convite</button><Link className="racha-secondary" to="/convite/demo">Visualizar convite</Link>{invites.map(email => <p key={email}>{email} · aguardando aceite</p>)}</form>}{remove && <div className="racha-warning"><h3>Remover {remove.nome}?</h3><p>O acesso será revogado; as obrigações e o histórico financeiro serão preservados.</p><p>Pendências: {money(entries.filter(entry => entry.person.id === remove.id && entry.payment.status !== "confirmado").reduce((sum, entry) => sum + entry.amount, 0))}</p><div className="racha-actions"><button className="racha-secondary" onClick={() => setRemove(null)}>Cancelar</button><button className="racha-danger" onClick={() => { setMembers(old => old.map(member => member.id === remove.id ? { ...member, active: false } : member)); log(`Participante removido · ${remove.nome}`); setRemove(null); }}><Trash2 size={13}/>Confirmar remoção</button></div></div>}</>}
      {view === "leave" && <><h3>{name}</h3><p>Você perderá acesso às ações do grupo. Seu histórico financeiro será preservado.</p><p className="racha-warning">Suas pendências: {money(myPending)}.</p>{onlyAdmin && <p className="racha-warning" role="alert">Você é o único administrador. Promova outro participante em Membros antes de sair.</p>}<div className="racha-actions"><button className="racha-secondary" onClick={dismiss}>Cancelar</button>{!onlyAdmin && <Link className="racha-danger" to="/meus-grupos" onClick={() => log("Rodrigo Martins saiu do grupo")}>Confirmar saída</Link>}</div></>}
    </Overlay>}
    {confirmClose && <Overlay title="Confirmar encerramento do grupo?" description={name} onClose={() => setConfirmClose(false)} footer={<><button className="racha-secondary" onClick={() => setConfirmClose(false)}>Cancelar</button><button className="racha-primary" disabled={!canClose} onClick={() => { if (!canClose) return; onCloseGroup(); log("Grupo encerrado · todos os pagamentos confirmados"); dismiss(); }}><LockKeyhole size={13}/>Confirmar encerramento</button></>}><p>O grupo ficará disponível no histórico em modo somente leitura, com todas as tarefas e pagamentos preservados.</p></Overlay>}
    {receiptView && <Overlay title="Comprovante de pagamento" onClose={() => setReceiptView(null)}><p>{receiptView.receiptName}</p>{receiptView.receipt?.startsWith("data:image/") ? <img className="racha-receipt" src={receiptView.receipt} alt="Comprovante anexado pelo participante"/> : <a className="racha-primary" href={receiptView.receipt} download={receiptView.receiptName}>Baixar comprovante PDF</a>}</Overlay>}
    <small className="racha-demo-caption">Ambiente de demonstração · sem movimentações financeiras reais.</small>
  </section>;
}
function SmartphoneIcon() { return <Smartphone size={12}/>; }
