import { initialGroupSettings, type GroupSettings } from "../lib/group-design";
import { useEffect,useImperativeHandle,useState,type Dispatch,type Ref,type SetStateAction } from "react";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS, futureModules, type ChavePixApi } from "../lib/endpoints";
import { canCloseGroup,money,paymentLabels,share,type Payment,type PaymentStatus } from "../lib/finance";
import type { DadosTarefa } from "../pages/editar-tarefa";
import { Link } from "react-router-dom";
import { GroupAudit, GroupEditForm, PaymentBadge, PaymentManagement } from "./group-panels";
import Icon from "./icon";
import Overlay from "./overlay";
import PixPreview from "./pix-preview";

type Member = { id: string; nome: string; admin: boolean; active: boolean; email?: string };
export type Activity = { text: string; date: string };
export interface GroupFlowControl { openPayments: (taskId?: string) => void }
interface Props { idGrupo?: string; currentUserId?: string; parteIds?: Record<string, string>; taskEvents: Activity[]; tasks: DadosTarefa[]; name: string; onName: (name: string) => void; closed: boolean; onCloseGroup: () => void; memberMode: boolean; payments: Record<string, Payment>; setPayments: Dispatch<SetStateAction<Record<string, Payment>>>; ref?: Ref<GroupFlowControl> }

export default function GroupFlows({ idGrupo, currentUserId = "1", parteIds = {}, taskEvents, tasks, name, onName, closed, onCloseGroup, memberMode, payments, setPayments, ref }: Props) {
  const [view, setView] = useState<"payments" | "members" | "edit" | "close" | "leave" | null>(null);
  const [tab, setTab] = useState("tasks");
  const [memberTab, setMemberTab] = useState("members");
  const [members, setMembers] = useState<Member[]>(() => (tasks[0]?.participantes ?? []).map(p => ({ id: p.id, nome: p.nome, admin: p.id === currentUserId, active: true })));
  const [events, setEvents] = useState<Activity[]>([{ text: "Grupo criado · Rodrigo Martins", date: "2025-11-14T12:00:00.000Z" }]);
  const [selected, setSelected] = useState("");
  useImperativeHandle(ref, () => ({ openPayments(taskId) { setView("payments"); setSelected(taskId ? `${taskId}:${currentUserId}` : ""); } }), [currentUserId]);
  const [receipt, setReceipt] = useState<{ data: string; name: string } | null>(null);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<GroupSettings>(initialGroupSettings);
  const [remove, setRemove] = useState<Member | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [reason, setReason] = useState("");
  const [invite, setInvite] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [receiptView, setReceiptView] = useState<Payment | null>(null);
  // Chave Pix do recebedor, guardada junto do id para não exibir a de outra tarefa
  const [recipientPixState, setRecipientPixState] = useState<{ idUser: string; chave: string | null } | null>(null);

  useEffect(() => {
    if (!idGrupo) return;
    let ativo = true;
    apiRequest<{ idUser: string; funcao: "dono" | "membro"; user: { id: string; name: string } }[]>(
      ENDPOINTS.grupos.membros(idGrupo),
    )
      .then((lista) => {
        if (!ativo || lista.length === 0) return;
        setMembers(
          lista.map((m) => ({
            id: m.idUser,
            nome: m.user.name,
            admin: m.funcao === "dono",
            active: true,
          })),
        );
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [idGrupo]);

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

  const payerId = active?.task.pagadorId;
  useEffect(() => {
    if (!idGrupo || !payerId) return;
    let ativo = true;
    apiRequest<ChavePixApi[]>(
      `${ENDPOINTS.chavesPix.base}?idUser=${encodeURIComponent(payerId)}`,
    )
      .then((chaves) => {
        if (ativo) setRecipientPixState({ idUser: payerId, chave: chaves[0]?.chave ?? null });
      })
      .catch(() => {
        if (ativo) setRecipientPixState({ idUser: payerId, chave: null });
      });
    return () => {
      ativo = false;
    };
  }, [idGrupo, payerId]);
  const recipientPix = idGrupo && payerId && recipientPixState?.idUser === payerId ? recipientPixState.chave : null;

  const visibleEntries = memberMode ? entries.filter(e => e.person.id === currentUserId) : entries;
  const canClose = canCloseGroup(tasks.map(t => t.concluida), entries);
  const myPending = entries.filter(e => e.person.id === currentUserId && e.payment.status !== "confirmado").reduce((sum, e) => sum + e.amount, 0);
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
    const idParte = parteIds[key];
    if (idGrupo && idParte) {
      const apiStatus = status === "confirmado" ? "FINALIZADA" : status === "informado" ? "EM_ANDAMENTO" : "AGENDADA";
      void apiRequest(ENDPOINTS.partes.byId(idParte), { method: "PATCH", body: { status: apiStatus } }).catch(() => {});
    }
    if (status === "informado") {
      void futureModules.pagamentos.informar({ idParte, idTarefa: entry.task.id, idUser: entry.person.id, comprovante: receipt?.data }).catch(() => {});
    } else if (status === "confirmado") {
      void futureModules.pagamentos.confirmar(idParte ?? key).catch(() => {});
    } else if (status === "contestado") {
      void futureModules.pagamentos.contestar(idParte ?? key, reason).catch(() => {});
    }
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
  const canInform = active && !closed && (active.person.id === currentUserId || !memberMode) && ["pendente", "contestado"].includes(active.payment.status);
  const pixDisplay = recipientPix || "(11) 98765-4321";
  const pixCopyValue = recipientPix || "CHAVE-ILUSTRATIVA-SEM-VALOR-FINANCEIRO";
  const payer = active?.task.participantes.find(p => p.id === active.task.pagadorId);
  const activeShares = active ? active.task.participantes.filter(p => p.selecionado).length : 0;
  const expenses = tasks.filter(task => task.possuiDespesa).sort((a, b) => b.valorTotal - a.valorTotal);
  const timeline = [...events, ...taskEvents].sort((a, b) => b.date.localeCompare(a.date));
  const toolbarButton = "inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-space-md py-2 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-low";
  return <section className="flex flex-col gap-space-lg font-body-md text-body-md text-on-surface">
    {view === "close" ? <GroupAudit name={name} tasks={tasks} memberCount={activeMembers.length} total={total} paid={paid} pending={pending} canClose={canClose} settings={settings} entries={entries} onBack={dismiss} onConfirm={() => setConfirmClose(true)}/> : view === "payments" && !active ? <PaymentManagement name={name} entries={visibleEntries} onBack={dismiss} onOpen={key => { setSelected(key); setMessage(""); }} onConfirm={key => updatePayment(key, "confirmado")} onExport={() => setMessage("A exportação de comprovantes depende dos registros reais do grupo.")} message={message} memberMode={memberMode}/> : <>
      {closed && <div className="relative flex flex-col items-center justify-between gap-space-lg overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-md md:flex-row md:p-space-xl" role="status">
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary-container/10 blur-2xl"/>
        <div className="relative flex items-center gap-space-lg">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed shadow-sm"><Icon name="celebration" size={36}/></div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-sm"><h2 className="font-headline-lg text-headline-lg text-on-surface">Grupo encerrado com sucesso</h2><span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-label-sm text-label-sm font-bold text-on-primary shadow-sm"><Icon name="check_circle" size={14}/>100% Quitado &amp; Arquivado</span></div>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">Histórico preservado · somente leitura · todos os pagamentos confirmados.</p>
          </div>
        </div>
        <Link className="relative inline-flex w-full shrink-0 items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-md py-space-sm font-label-md text-label-md text-on-primary transition-opacity hover:opacity-95 md:w-auto" to="/meus-grupos"><Icon name="grid_view" size={18}/>Voltar aos meus grupos</Link>
      </div>}
      <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
        <div className="flex w-fit items-center gap-1 rounded-xl bg-surface-container-low p-1" role="group" aria-label="Seções do grupo">
          {[{ id: "tasks", label: "Visão geral", icon: "dashboard" }, { id: "history", label: "Histórico", icon: "history" }].map(item => <button type="button" key={item.id} aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-space-md py-1.5 font-label-md text-label-md transition-all ${tab === item.id ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}><Icon name={item.icon} size={18}/>{item.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button type="button" className={toolbarButton} onClick={() => { setView("payments"); setSelected(""); }}><Icon name="receipt_long" size={18} className="text-primary"/>Pagamentos e comprovantes</button>
          <button type="button" className={toolbarButton} onClick={() => setView("members")}><Icon name="group" size={18} className="text-primary"/>Membros</button>
          {!memberMode && !closed && <>
            <button type="button" className={toolbarButton} onClick={() => setView("edit")}><Icon name="edit" size={18} className="text-primary"/>Editar grupo</button>
            <button type="button" className={toolbarButton} onClick={() => setView("close")}><Icon name="lock" size={18} className="text-primary"/>Encerrar grupo</button>
          </>}
          {!closed && <button type="button" className={`${toolbarButton} text-error`} onClick={() => setView("leave")}><Icon name="logout" size={18}/>Sair do grupo</button>}
        </div>
      </div>
      {(tab === "history" || closed) && <div className={`grid grid-cols-1 gap-space-lg ${closed && expenses.length ? "lg:grid-cols-12" : ""}`}>
        {closed && expenses.length > 0 && <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md lg:col-span-7">
          <div className="flex items-center justify-between gap-space-sm pb-space-sm"><div className="flex items-center gap-space-sm"><Icon name="pie_chart" size={24} className="text-primary"/><h3 className="font-headline-sm text-headline-sm text-on-surface">Maiores Despesas do Grupo</h3></div><span className="font-label-sm text-label-sm text-on-surface-variant">Total: {money(total)}</span></div>
          <div className="flex flex-col gap-space-md">{expenses.slice(0, 4).map(task => <div key={task.id} className="flex items-center justify-between rounded-lg p-space-sm transition-colors hover:bg-surface-container-low">
            <div className="flex min-w-0 items-center gap-space-md"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary"><Icon name="receipt_long"/></div><div className="flex min-w-0 flex-col"><span className="truncate font-label-md text-label-md text-on-surface">{task.titulo}</span><span className="font-body-sm text-body-sm text-on-surface-variant">Pago por {task.participantes.find(p => p.id === task.pagadorId)?.nome ?? "—"} • Dividido por {task.participantes.filter(p => p.selecionado).length}</span></div></div>
            <div className="flex shrink-0 flex-col items-end pl-2"><span className="font-label-lg text-label-lg font-bold text-on-surface">{money(task.valorTotal)}</span><span className="font-label-sm text-label-sm text-on-surface-variant">{total > 0 ? `${(task.valorTotal / total * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do total` : "—"}</span></div>
          </div>)}</div>
        </div>}
        <div className={`flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm ${closed && expenses.length ? "lg:col-span-5" : ""}`}>
          <div className="flex items-center justify-between gap-space-sm"><div className="flex items-center gap-space-sm"><Icon name="history" size={24} className="text-primary"/><h2 className="font-headline-sm text-headline-sm text-on-surface">{closed ? "Resumo final e histórico" : "Histórico de atividades"}</h2></div><span className="shrink-0 rounded-full bg-surface-container px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface">{closed ? "100% Quitado" : "Todas as atividades"}</span></div>
          {closed && <div className="grid grid-cols-2 gap-space-sm">{[["Total de despesas", money(total)], ["Valores pagos", money(paid)], ["Tarefas realizadas", `${tasks.filter(t => t.concluida).length}/${tasks.length}`], ["Participantes", String(activeMembers.length)]].map(([label, value]) => <div key={label} className="flex flex-col rounded-lg bg-surface-container-low p-space-sm"><span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span><strong className="font-label-lg text-label-lg font-bold text-on-surface">{value}</strong></div>)}</div>}
          <ol className="flex flex-col gap-space-sm">{timeline.map((event, index) => <li key={index} className="flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-sm"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary"><Icon name="history" size={16}/></span><div className="flex min-w-0 flex-col"><span className="font-label-md text-label-md text-on-surface">{event.text}</span><small className="font-label-sm text-label-sm text-on-surface-variant">{new Date(event.date).toLocaleString("pt-BR")}</small></div></li>)}</ol>
        </div>
      </div>}
    </>}
    {view && view !== "close" && !(view === "payments" && !active) && !receiptView && <Overlay
      title={view === "payments" ? active ? "Acertar Pagamento via Pix" : "Gerenciar Pagamentos e Comprovantes" : view === "members" ? "Membros & Convites" : view === "edit" ? "Editar Grupo" : "Sair do grupo"}
      eyebrow={view === "members" ? "Painel do Administrador" : view === "edit" ? "Painel do Organizador · ID: #FLN-2025" : view === "payments" && active ? "Liquidação Direta · Pix Instantâneo" : undefined}
      description={view === "edit" ? "Atualize informações básicas, regras de rateio e capa do grupo" : view === "members" ? "Gerencie participantes, permissões e adicione novos amigos ao racha." : active ? "Transfira sua cota diretamente para o responsável da compra." : undefined}
      onClose={dismiss} drawer={view === "edit"}
      footer={view === "edit" ? <><button type="button" className={btnSecondary} onClick={dismiss}>Cancelar</button><button className={btnPrimary} form="racha-edit-group-form" type="submit"><Icon name="check" size={18}/>Salvar Alterações</button></> : view === "members" ? <><small className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant sm:mr-auto"><Icon name="verified_user" size={16} className="text-primary"/>Alterações salvas instantaneamente nesta prévia</small><button type="button" className={btnSecondary} onClick={dismiss}>Cancelar</button><button type="button" className={btnPrimary} onClick={dismiss}><Icon name="check" size={18}/>Concluir</button></> : active ? <><button type="button" className={btnSecondary} onClick={dismiss}>Cancelar / Fechar</button>{canInform ? <button type="button" className={btnPrimary} onClick={() => updatePayment(active.key, "informado")}><Icon name="send" size={20}/>Informar que realizei o Pagamento</button> : <button type="button" className={btnPrimary} onClick={dismiss}><Icon name="check" size={18}/>Concluir</button>}</> : undefined}>
      <div className="flex flex-col gap-space-lg">
      {message && <p className="flex items-start gap-2 rounded-xl bg-surface-container p-space-md font-body-sm text-body-sm text-on-surface" role="status"><Icon name="info" size={20} className="shrink-0 text-primary"/>{message}</p>}
      {view === "payments" && active && <>
        <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm">
          <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-col"><span className="font-label-sm text-label-sm font-semibold text-primary">{name}</span><h3 className="font-label-lg text-label-lg font-bold text-on-surface">{active.task.titulo}</h3></div>
            <div className="self-start sm:self-auto"><PaymentBadge status={active.payment.status} label={paymentLabels[active.payment.status]}/></div>
          </div>
          <div className="grid grid-cols-1 gap-space-md rounded-lg bg-surface-container-lowest p-space-md sm:grid-cols-2">
            <div className="flex items-center gap-space-sm"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container"><Icon name="shopping_cart" size={20} className="text-on-surface-variant"/></div><div className="flex flex-col"><span className="font-label-sm text-label-sm text-on-surface-variant">Valor total da despesa</span><span className="font-body-md text-body-md font-semibold text-on-surface">{money(active.task.valorTotal)} <span className="font-label-sm text-label-sm font-normal text-on-surface-variant">(dividido entre {activeShares} {activeShares === 1 ? "pessoa" : "pessoas"})</span></span></div></div>
            <div className="flex items-center gap-space-sm sm:justify-end"><div className="flex flex-col text-left sm:text-right"><span className="font-label-sm text-label-sm text-on-surface-variant">Sua cota a transferir</span><span className="font-numeric-stat text-numeric-stat font-extrabold tracking-tight text-primary">{money(active.amount)}</span></div></div>
          </div>
          <div className="flex items-center justify-between gap-space-sm pt-space-xs">
            <div className="flex min-w-0 items-center gap-space-sm">
              <div className="relative shrink-0"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-label-md text-label-md font-bold text-on-primary-fixed shadow-sm">{payer?.nome.slice(0, 1)}</span><span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-sm"><Icon name="verified" size={10} filled/></span></div>
              <div className="flex min-w-0 flex-col"><div className="flex flex-wrap items-center gap-1"><span className="truncate font-label-md text-label-md font-bold text-on-surface">{payer?.nome}</span><span className="rounded bg-surface-container px-1.5 text-[11px] font-semibold text-on-surface-variant">Responsável pela compra</span></div><span className="truncate font-label-sm text-label-sm text-on-surface-variant">Nu Pagamentos S.A. · conta ilustrativa</span></div>
            </div>
            <div className="hidden shrink-0 items-center gap-1 font-label-sm text-label-sm text-on-surface-variant sm:flex"><Icon name="bolt" size={16} className="text-tertiary"/><span>Recebimento direto</span></div>
          </div>
        </div>
        <div className="grid grid-cols-1 items-center gap-space-lg md:grid-cols-12">
          <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-space-md shadow-sm md:col-span-5">
            <div className="relative flex flex-col items-center rounded-lg bg-surface-container-lowest p-space-sm shadow-sm"><PixPreview size={148}/></div>
            <span className="mt-space-sm flex items-center gap-1 text-center font-label-sm text-label-sm font-medium text-on-surface-variant"><Icon name="photo_camera" size={16} className="text-primary"/>Aponte a câmera no app do seu banco</span>
          </div>
          <div className="flex flex-col gap-space-md md:col-span-7">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pix-key" className="flex items-center justify-between font-label-sm text-label-sm font-semibold text-on-surface"><span>Chave Pix (Telefone Celular)</span><span className="text-[11px] font-bold uppercase text-tertiary">{recipientPix ? "Cadastrada" : "Demonstração"}</span></label>
              <div className="flex items-center gap-space-xs rounded-lg bg-surface-container p-1">
                <div className="flex min-w-0 grow items-center gap-space-xs px-space-sm py-1.5"><Icon name="smartphone" size={20} className="shrink-0 text-on-surface-variant"/><input id="pix-key" readOnly value={pixDisplay} className="w-full bg-transparent font-label-md text-label-md font-semibold text-on-surface focus:outline-none"/></div>
                <button type="button" onClick={() => copy(pixCopyValue)} className="flex shrink-0 items-center gap-1 rounded-md bg-surface-container-lowest px-space-md py-1.5 font-label-sm text-label-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-high active:scale-95"><Icon name="content_copy" size={16}/>Copiar Chave</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between font-label-sm text-label-sm font-semibold text-on-surface"><span>Código Pix Copia e Cola</span><span className="text-[12px] font-normal text-on-surface-variant">Ilustrativo</span></span>
              <div className="flex flex-col gap-space-xs">
                <div className="max-h-16 select-all overflow-y-auto break-all rounded-lg bg-surface-container-low p-space-sm font-mono text-[11px] leading-relaxed text-on-surface-variant">PREVIA-RACHA-SEM-VALOR-FINANCEIRO<br/>Código ilustrativo para revisão da interface.</div>
                <button type="button" onClick={() => copy("PREVIA-RACHA-SEM-VALOR-FINANCEIRO")} className="flex w-full items-center justify-center gap-space-xs rounded-lg bg-primary px-space-md py-2.5 font-label-md text-label-md font-bold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"><Icon name="copy_all" size={18}/>Copiar Código Pix Completo</button>
              </div>
            </div>
          </div>
        </div>
        {active.payment.reason && <p className="flex items-start gap-2 rounded-xl bg-error-container/50 p-space-md font-body-sm text-body-sm text-on-error-container" role="alert"><Icon name="report" size={20} className="shrink-0 text-error"/>Motivo da contestação: {active.payment.reason}</p>}
        {active.payment.receipt && <button type="button" className={`${btnSecondary} self-start`} onClick={() => setReceiptView(active.payment)}><Icon name="description" size={18}/>Visualizar comprovante</button>}
        {canInform && <div className="flex flex-col gap-space-xs">
          <span className="flex items-center gap-space-xs font-label-md text-label-md font-bold text-on-surface"><Icon name="receipt_long" size={20} className="text-primary"/>Já realizou o pagamento? Anexe seu comprovante</span>
          {receipt ? <div className="flex w-full items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-sm">
            <div className="flex min-w-0 items-center gap-space-sm"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary-fixed text-tertiary"><Icon name="description" size={22}/></div><div className="flex min-w-0 flex-col text-left"><span className="truncate font-label-md text-label-md font-bold text-on-surface">{receipt.name}</span><span className="font-label-sm text-label-sm text-on-surface-variant">Pronto para envio</span></div></div>
            <button type="button" aria-label="Remover comprovante" onClick={() => setReceipt(null)} className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"><Icon name="delete" size={20}/></button>
          </div> : <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl bg-surface-container-low p-space-md text-center transition-all hover:bg-surface-container focus-within:ring-2 focus-within:ring-primary-container">
            <input type="file" accept="image/png,image/jpeg,application/pdf" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" onChange={event => receiptFile(event.target.files?.[0])}/>
            <span className="flex flex-col items-center gap-space-xs py-space-xs"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-primary transition-transform group-hover:scale-105"><Icon name="cloud_upload" size={24}/></span><span className="font-label-md text-label-md font-semibold text-on-surface">Arraste ou clique para selecionar o comprovante</span><span className="font-label-sm text-label-sm text-on-surface-variant">Formatos aceitos: JPG, PNG ou PDF (até 5 MB)</span></span>
          </label>}
        </div>}
        {!memberMode && !closed && active.payment.status === "informado" && <div className="flex flex-col gap-space-sm rounded-xl bg-tertiary-fixed/30 p-space-md">
          <div className="flex items-start gap-space-sm"><Icon name="info" size={22} className="shrink-0 text-tertiary"/><div className="flex flex-col font-body-sm text-body-sm text-on-surface"><span className="font-bold">Aguardando sua validação manual</span><span>Confira o comprovante e o recebimento antes de confirmar.</span></div></div>
          <button type="button" className={btnPrimary} onClick={() => updatePayment(active.key, "confirmado")}><Icon name="check_circle" size={20}/>Confirmar Recebimento</button>
          <div className="flex flex-col gap-1"><label htmlFor="contest-reason" className="font-label-sm text-label-sm font-semibold text-on-surface">Motivo da contestação</label><textarea id="contest-reason" rows={2} value={reason} onChange={event => setReason(event.target.value)} maxLength={300} placeholder="Ex.: o comprovante não exibe o valor completo..." className="w-full resize-none rounded-lg bg-surface-container-lowest p-space-sm font-body-sm text-body-sm text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary-container"/></div>
          <button type="button" className="inline-flex items-center justify-center gap-1 rounded-lg bg-error-container px-space-md py-space-sm font-label-md text-label-md text-on-error-container transition-colors hover:opacity-90" onClick={() => updatePayment(active.key, "contestado")}><Icon name="block" size={18}/>Contestar pagamento</button>
        </div>}
        <div className="flex items-start gap-space-sm rounded-xl bg-surface-container p-space-md"><Icon name="verified_user" size={20} className="mt-0.5 shrink-0 text-primary"/><div className="flex flex-col"><span className="font-label-sm text-label-sm font-bold text-on-surface">Auditoria e confirmação colaborativa</span><p className="font-body-sm text-body-sm leading-snug text-on-surface-variant">Informar o pagamento não quita a cota. O status só será marcado como <strong className="font-semibold text-on-surface">Confirmado</strong> após {payer?.nome ?? "o responsável"} verificar o crédito e validar o comprovante.</p></div></div>
        <details className="group rounded-xl bg-surface-container-low p-space-md"><summary className="flex cursor-pointer list-none items-center justify-between font-label-md text-label-md text-on-surface"><span className="flex items-center gap-space-xs"><Icon name="history" size={18} className="text-primary"/>Histórico de pagamentos desta tarefa</span><Icon name="expand_more" size={20} className="text-on-surface-variant transition-transform group-open:rotate-180"/></summary><div className="mt-space-sm flex flex-col gap-space-xs">{events.some(event => event.text.includes(active.task.titulo)) ? events.filter(event => event.text.includes(active.task.titulo)).map((event, index) => <p key={index} className="flex flex-col font-body-sm text-body-sm text-on-surface">{event.text}<small className="font-label-sm text-label-sm text-on-surface-variant">{new Date(event.date).toLocaleString("pt-BR")}</small></p>) : <p className="font-body-sm text-body-sm text-on-surface-variant">Nenhum pagamento anterior registrado nesta tarefa.</p>}</div></details>
        <div className="flex flex-wrap items-center justify-between gap-space-sm"><small className="flex items-center gap-1 font-label-sm text-label-sm text-outline"><Icon name="lock" size={15} className="text-tertiary"/>Pix ilustrativo · não realize uma transferência.</small><button type="button" className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:underline" onClick={() => setSelected("")}><Icon name="arrow_back" size={14}/>Voltar aos pagamentos</button></div>
      </>}
      {view === "edit" && <GroupEditForm name={name} settings={settings} onSave={(updatedName, updatedSettings) => { onName(updatedName); setSettings(updatedSettings); if (idGrupo) { void apiRequest(ENDPOINTS.grupos.byId(idGrupo), { method: "PATCH", body: { nome: updatedName, descricao: updatedSettings.description } }).catch(() => {}); } log("Informações do grupo atualizadas"); dismiss(); }}/>}
      {view === "members" && <>
        <div className="flex w-fit items-center gap-1 rounded-xl bg-surface-container-low p-1" role="group" aria-label="Seções de membros">
          <button type="button" aria-pressed={memberTab === "members"} onClick={() => setMemberTab("members")} className={`inline-flex items-center gap-1.5 rounded-lg px-space-md py-1.5 font-label-md text-label-md transition-all ${memberTab === "members" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}><Icon name="group" size={18}/>Membros Atuais<span className="rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm">{activeMembers.length}</span></button>
          {!memberMode && !closed && <button type="button" aria-pressed={memberTab === "invite"} onClick={() => setMemberTab("invite")} className={`inline-flex items-center gap-1.5 rounded-lg px-space-md py-1.5 font-label-md text-label-md transition-all ${memberTab === "invite" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}><Icon name="person_add" size={18}/>Convidar Novos</button>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-sm font-label-sm text-label-sm text-on-surface-variant"><span className="flex items-center gap-1.5"><Icon name="shield_person" size={16} className="text-primary"/>Apenas administradores podem gerenciar integrantes.</span><span className="font-semibold text-on-surface">{activeMembers.length}/15 Membros</span></div>
        {memberTab === "members" ? <div className="flex flex-col divide-y divide-surface-container-low overflow-hidden rounded-xl bg-surface-container-lowest">{members.map(member => <div key={member.id} className={`flex flex-col items-start justify-between gap-space-sm py-space-md sm:flex-row sm:items-center ${!member.active ? "opacity-60" : ""}`}>
          <div className="flex min-w-0 items-center gap-space-md">
            <div className="relative shrink-0"><span className={`flex h-12 w-12 items-center justify-center rounded-full font-label-lg text-label-lg font-bold shadow-sm ${member.admin ? "bg-primary-fixed text-on-primary-fixed-variant ring-2 ring-primary-container" : "bg-secondary-container text-on-secondary"}`}>{member.nome.split(" ").map(part => part[0]).slice(0, 2).join("")}</span>{member.admin && <span className="absolute -bottom-1 -right-1 rounded-full bg-primary p-0.5 text-on-primary" title="Administrador"><Icon name="shield_person" size={14} className="block"/></span>}</div>
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-2"><span className="font-label-lg text-label-lg font-bold text-on-surface">{member.nome}</span>{member.id === currentUserId && <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">Você</span>}{!member.active && <span className="rounded-full bg-error-container px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-error-container">Saiu do grupo</span>}</div>
              <span className="truncate font-body-sm text-body-sm text-on-surface-variant">{member.email || `${member.nome.toLowerCase().split(" ")[0]}@exemplo.com`}</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm self-end sm:self-auto">{member.id === currentUserId ? <><span className="rounded-full bg-primary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-primary-fixed-variant">Admin · Criador</span><Icon name="lock" size={18} className="text-outline" title="Permissão fixa"/></> : !closed && !memberMode && member.active ? <>
            <div className="relative flex items-center"><select aria-label={`Permissão de ${member.nome}`} value={member.admin ? "admin" : "member"} onChange={event => { const isAdmin = event.target.value === "admin"; setMembers(old => old.map(item => item.id === member.id ? { ...item, admin: isAdmin } : item)); if (idGrupo) { void apiRequest(ENDPOINTS.grupos.membroById(idGrupo, member.id), { method: "PATCH", body: { funcao: isAdmin ? "dono" : "membro" } }).catch(() => {}); } log(`Permissão atualizada · ${member.nome}`); }} className="appearance-none rounded-lg bg-surface-container-low py-2 pl-3 pr-9 font-label-sm text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"><option value="member">Membro</option><option value="admin">Administrador</option></select><Icon name="expand_more" size={18} className="pointer-events-none absolute right-2 text-on-surface-variant"/></div>
            <button type="button" aria-label={`Remover ${member.nome}`} onClick={() => setRemove(member)} className="flex h-9 w-9 items-center justify-center rounded-lg text-error transition-colors hover:bg-error-container/30"><Icon name="person_remove" size={20}/></button>
          </> : <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">{member.admin ? "Administrador" : "Membro"}</span>}</div>
        </div>)}</div> : <form className="flex flex-col items-center gap-space-md rounded-xl bg-surface-container-low p-space-lg text-center" onSubmit={async event => { event.preventDefault(); if (invites.includes(invite)) { setMessage("Já existe um convite para este e-mail."); return; } if (idGrupo) { try { const novo = await apiRequest<{ idUser: string; funcao: "dono" | "membro"; user?: { name?: string } }>(ENDPOINTS.grupos.membros(idGrupo), { method: "POST", body: { email: invite } }); setMembers(old => [...old, { id: novo.idUser, nome: novo.user?.name || invite.split("@")[0], admin: novo.funcao === "dono", active: true, email: invite }]); log(`Membro adicionado · ${invite}`); setInvite(""); setMessage("Participante adicionado ao grupo."); return; } catch (err) { if (err instanceof ApiError && err.status !== 404) { setMessage(err.message); return; } } } setInvites(old => [...old, invite]); log(`Convite preparado · ${invite}`); setInvite(""); setMessage("Convite preparado na demonstração. Nenhum e-mail foi enviado."); }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary"><Icon name="mail" size={24}/></span>
          <div><h3 className="font-headline-sm text-headline-sm text-on-surface">Chame seus amigos para o racha</h3><p className="font-body-sm text-body-sm text-on-surface-variant">Compartilhe as tarefas e acompanhe cada acerto em um só lugar.</p></div>
          <div className="flex w-full flex-col gap-1.5 text-left"><label htmlFor="invite-email" className="font-label-md text-label-md text-on-surface">E-mail do participante</label><div className="relative flex items-center"><Icon name="alternate_email" size={18} className="pointer-events-none absolute left-3 text-outline"/><input id="invite-email" type="email" required placeholder="amigo@exemplo.com" value={invite} onChange={event => setInvite(event.target.value)} className="w-full rounded-lg bg-surface-container-lowest py-2.5 pl-10 pr-4 font-body-md text-body-md text-on-surface shadow-sm outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/20"/></div></div>
          <div className="flex w-full flex-col gap-space-sm sm:flex-row sm:justify-center"><button type="submit" className={btnPrimary}><Icon name="person_add" size={18}/>Preparar convite</button></div>
          {invites.length > 0 && <ul className="flex w-full flex-col gap-space-xs text-left">{invites.map(email => <li key={email} className="flex items-center justify-between gap-space-sm rounded-lg bg-surface-container-lowest px-space-md py-space-sm font-body-sm text-body-sm text-on-surface"><span className="truncate">{email}</span><span className="shrink-0 font-label-sm text-label-sm text-tertiary">aguardando aceite</span></li>)}</ul>}
        </form>}
        {remove && <div className="flex flex-col gap-space-sm rounded-xl bg-error-container/30 p-space-md" role="alertdialog" aria-label={`Remover ${remove.nome}`}>
          <div className="flex items-center gap-space-xs text-error"><Icon name="warning" size={20}/><h3 className="font-label-lg text-label-lg font-bold">Remover {remove.nome}?</h3></div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">O acesso será revogado; as obrigações e o histórico financeiro serão preservados.</p>
          <p className="font-label-md text-label-md text-on-error-container">Pendências: {money(entries.filter(entry => entry.person.id === remove.id && entry.payment.status !== "confirmado").reduce((sum, entry) => sum + entry.amount, 0))}</p>
          <div className="flex flex-wrap items-center gap-space-sm pt-1"><button type="button" className="rounded-lg bg-surface-container-lowest px-3.5 py-2 font-label-sm text-label-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container" onClick={() => setRemove(null)}>Cancelar</button><button type="button" className="flex items-center gap-1.5 rounded-lg bg-error px-3.5 py-2 font-label-sm text-label-sm text-on-error shadow-sm transition-colors hover:bg-error/90" onClick={() => { if (idGrupo) { void apiRequest(ENDPOINTS.grupos.membroById(idGrupo, remove.id), { method: "DELETE" }).catch(() => {}); } setMembers(old => old.map(member => member.id === remove.id ? { ...member, active: false } : member)); log(`Participante removido · ${remove.nome}`); setRemove(null); }}><Icon name="delete_forever" size={16}/>Confirmar remoção</button></div>
        </div>}
      </>}
      {view === "leave" && <>
        <div className="flex items-start gap-space-md rounded-xl bg-surface-container-low p-space-md"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary"><Icon name="logout" size={24}/></span><div className="flex flex-col"><h3 className="font-label-lg text-label-lg font-bold text-on-surface">{name}</h3><p className="font-body-sm text-body-sm text-on-surface-variant">Você perderá acesso às ações do grupo. Seu histórico financeiro será preservado.</p></div></div>
        <p className="flex items-center gap-2 rounded-xl bg-tertiary-fixed/40 p-space-md font-label-md text-label-md text-on-tertiary-fixed"><Icon name="account_balance_wallet" size={20} className="text-tertiary"/>Suas pendências: {money(myPending)}.</p>
        {onlyAdmin && <p className="flex items-start gap-2 rounded-xl bg-error-container/50 p-space-md font-body-sm text-body-sm text-on-error-container" role="alert"><Icon name="warning" size={20} className="shrink-0 text-error"/>Você é o único administrador. Promova outro participante em Membros antes de sair.</p>}
        <div className="flex flex-col-reverse gap-space-sm sm:flex-row sm:justify-end"><button type="button" className={btnSecondary} onClick={dismiss}>Cancelar</button>{!onlyAdmin && <Link className={btnDanger} to="/meus-grupos" onClick={() => { if (idGrupo) { void apiRequest(ENDPOINTS.grupos.membroById(idGrupo, currentUserId), { method: "DELETE" }).catch(() => {}); } log("Saiu do grupo"); }}><Icon name="logout" size={18}/>Confirmar saída</Link>}</div>
      </>}
      </div>
    </Overlay>}
    {confirmClose && <Overlay title="Confirmar encerramento do grupo?" description={name} onClose={() => setConfirmClose(false)} footer={<><button type="button" className={btnSecondary} onClick={() => setConfirmClose(false)}>Cancelar e Voltar</button><button type="button" className="inline-flex items-center justify-center gap-space-xs rounded-lg bg-secondary px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-secondary shadow-md transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canClose} onClick={() => { if (!canClose) return; onCloseGroup(); log("Grupo encerrado · todos os pagamentos confirmados"); dismiss(); }}><Icon name="lock" size={18}/>Confirmar Encerramento Definitivo</button></>}>
      <div className="flex flex-col gap-space-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-fixed text-secondary shadow-sm"><Icon name="lock" size={32}/></div>
        <p className="font-body-md text-body-md text-on-surface-variant">O grupo ficará disponível no <strong className="text-on-surface">histórico em modo somente leitura</strong>, com todas as tarefas e pagamentos preservados.</p>
        <div className="flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-md"><Icon name="verified" size={20} className="mt-0.5 shrink-0 text-primary"/><div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-on-surface">{canClose ? "Tudo liquidado!" : "Ainda há pendências"}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{canClose ? `${money(total)} totalmente quitados entre ${activeMembers.length} participantes. Não há valores pendentes.` : `${money(pending)} aguardando confirmação.`}</span></div></div>
      </div>
    </Overlay>}
    {receiptView && <Overlay title="Comprovante de pagamento" onClose={() => setReceiptView(null)}>
      <div className="flex flex-col gap-space-md">
        <p className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant"><Icon name="attach_file" size={16}/>{receiptView.receiptName}</p>
        {receiptView.receipt?.startsWith("data:image/") ? <div className="overflow-hidden rounded-xl bg-surface-container-low p-space-sm"><img className="mx-auto max-h-[60vh] w-auto rounded-lg object-contain" src={receiptView.receipt} alt="Comprovante anexado pelo participante"/></div> : <a className={`${btnPrimary} self-start`} href={receiptView.receipt} download={receiptView.receiptName}><Icon name="download" size={18}/>Baixar comprovante PDF</a>}
      </div>
    </Overlay>}
    <small className="flex items-center gap-1 font-label-sm text-label-sm text-outline"><Icon name="info" size={14}/>Ambiente de demonstração · sem movimentações financeiras reais.</small>
  </section>;
}

const btnPrimary = "inline-flex items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondary = "inline-flex items-center justify-center gap-space-xs rounded-lg bg-surface-container-high px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-highest";
const btnDanger = "inline-flex items-center justify-center gap-space-xs rounded-lg bg-error px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-sm transition-colors hover:bg-error/90";
