import { useState } from "react";
import { Link } from "react-router-dom";
import { money, type Payment, type PaymentStatus } from "../lib/finance";
import type { DadosTarefa } from "../pages/editar-tarefa";
import Icon from "./icon";

import { groupCover, type GroupSettings } from "../lib/group-design";

const statusStyle: Record<PaymentStatus, { label: string; icon: string; badge: string }> = {
  pendente: { label: "Pendente", icon: "warning", badge: "bg-error-container text-on-error-container" },
  informado: { label: "Informado / Aguardando Confirmação", icon: "hourglass_top", badge: "bg-tertiary-fixed text-on-tertiary-fixed" },
  confirmado: { label: "Confirmado", icon: "check_circle", badge: "bg-primary-fixed text-on-primary-fixed" },
  contestado: { label: "Contestado", icon: "cancel", badge: "bg-secondary-fixed text-on-secondary-fixed" },
};

/** Selo de status de pagamento no visual do Stitch. */
export function PaymentBadge({ status, label }: { status: PaymentStatus; label?: string }) {
  const style = statusStyle[status];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${style.badge}`}><Icon name={style.icon} size={14}/>{label ?? style.label}</span>;
}

const initials = (name: string) => name.split(" ").filter(Boolean).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "?";
const formatDate = (iso: string) => iso ? iso.split("-").reverse().join("/") : "—";

const categories = [{ label: "Viagem", icon: "flight_takeoff" }, { label: "Churrasco", icon: "outdoor_grill" }, { label: "Casa", icon: "home" }, { label: "Trabalho", icon: "work" }];
const categoryIcon = (category: string) => categories.find(item => item.label === category)?.icon ?? "category";

const field = "w-full rounded-lg bg-surface-container-low px-4 py-2.5 font-body-md text-body-md text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container";

function SectionTitle({ icon, children }: { icon: string; children: string }) {
  return <div className="flex items-center gap-space-xs"><Icon name={icon} size={20} className="text-primary"/><h3 className="font-label-lg text-label-lg text-on-surface">{children}</h3></div>;
}

export function GroupEditForm({ name, settings, onSave }: { name: string; settings: GroupSettings; onSave: (name: string, settings: GroupSettings) => void }) {
  const [draft, setDraft] = useState(name);
  const [data, setData] = useState(settings);
  const [error, setError] = useState("");
  function coverFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Escolha uma imagem JPG, PNG ou WebP de até 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setData(old => ({ ...old, cover: String(reader.result) })); setError(""); };
    reader.readAsDataURL(file);
  }
  const categoryOptions = categories.some(item => item.label === data.category) ? categories : [...categories, { label: data.category, icon: "category" }];
  return <form id="racha-edit-group-form" className="space-y-8" onSubmit={event => { event.preventDefault(); if (data.end < data.start) { setError("O término deve ser igual ou posterior ao início."); return; } onSave(draft.trim(), data); }}>
    <section className="space-y-space-md">
      <SectionTitle icon="badge">Identidade do Grupo</SectionTitle>
      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-space-md">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-fixed-dim/40 bg-cover bg-center shadow-sm" style={data.cover ? { backgroundImage: `url(${data.cover})` } : undefined}>
            {!data.cover && <Icon name={categoryIcon(data.category)} size={30} className="text-primary"/>}
          </div>
          <div><p className="font-label-md text-label-md text-on-surface">Foto / Capa do Grupo</p><p className="font-body-sm text-body-sm text-on-surface-variant">Recomendado: 1200×600 px (JPG, PNG ou WebP até 5 MB)</p></div>
        </div>
        <div className="flex items-center gap-space-xs">
          <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-lowest px-3 py-1.5 font-label-sm text-label-sm text-primary shadow-sm transition-colors hover:bg-surface-container-high focus-within:ring-2 focus-within:ring-primary-container"><Icon name="upload" size={16}/>Alterar foto<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" onChange={event => coverFile(event.target.files?.[0])}/></label>
          <button type="button" onClick={() => setData(old => ({ ...old, cover: "" }))} className="flex items-center gap-1 rounded-lg bg-surface-container-lowest px-3 py-1.5 font-label-sm text-label-sm text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"><Icon name="delete" size={16}/>Remover</button>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between"><label className="font-label-md text-label-md text-on-surface" htmlFor="edit-group-name">Nome do Grupo <span className="text-error">*</span></label><span className="font-label-sm text-label-sm text-outline">{draft.length}/50</span></div>
        <input id="edit-group-name" required maxLength={50} value={draft} onChange={event => setDraft(event.target.value)} className={field}/>
      </div>
      <div className="space-y-1.5">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="edit-group-category">Categoria</label>
        <div className="relative flex items-center">
          <Icon name={categoryIcon(data.category)} size={20} className="pointer-events-none absolute left-3.5 text-primary"/>
          <select id="edit-group-category" value={data.category} onChange={event => setData(old => ({ ...old, category: event.target.value }))} className={`${field} appearance-none pl-11 pr-10`}>{categoryOptions.map(item => <option key={item.label} value={item.label}>{item.label}</option>)}</select>
          <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 text-on-surface-variant"/>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Define os modelos de despesas e relatórios automáticos.</p>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between"><label className="font-label-md text-label-md text-on-surface" htmlFor="edit-group-description">Descrição e Regras Gerais</label><span className="font-label-sm text-label-sm text-outline">Markdown suportado</span></div>
        <textarea id="edit-group-description" rows={4} value={data.description} onChange={event => setData(old => ({ ...old, description: event.target.value }))} className={`${field} resize-none p-3 font-body-sm text-body-sm`}/>
      </div>
    </section>
    <section className="space-y-space-md pt-4">
      <SectionTitle icon="calendar_month">Período da Viagem</SectionTitle>
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <div className="space-y-1.5"><label className="font-label-md text-label-md text-on-surface" htmlFor="edit-group-start">Início</label><input id="edit-group-start" type="date" required value={data.start} onChange={event => setData(old => ({ ...old, start: event.target.value }))} className={field}/></div>
        <div className="space-y-1.5"><label className="font-label-md text-label-md text-on-surface" htmlFor="edit-group-end">Término</label><input id="edit-group-end" type="date" min={data.start} required value={data.end} onChange={event => setData(old => ({ ...old, end: event.target.value }))} className={field}/></div>
      </div>
      <p className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant"><Icon name="event" size={16}/>Organize as tarefas dentro do período combinado.</p>
    </section>
    <section className="space-y-space-md pt-4">
      <SectionTitle icon="account_balance_wallet">Configurações Financeiras</SectionTitle>
      <div className="flex items-start justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md">
        <div className="flex flex-col pr-2"><span className="font-label-md text-label-md text-on-surface">Regra Padrão de Rateio</span><span className="font-body-sm text-body-sm text-on-surface-variant">Divisão igualitária entre os participantes selecionados em cada tarefa.</span></div>
        <span className="shrink-0 rounded bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">Configuração Global</span>
      </div>
    </section>
    {error && <p className="flex items-start gap-2 rounded-xl bg-error-container/50 p-space-md font-body-sm text-body-sm text-on-error-container" role="alert"><Icon name="error" size={20} className="shrink-0 text-error"/>{error}</p>}
  </form>;
}

interface LedgerItem { key: string; task: DadosTarefa; person: { id: string; nome: string }; amount: number; payment: Payment }

export function GroupAudit({ name, tasks, memberCount, total, paid, pending, canClose, onBack, onConfirm, settings, entries = [] }: { name: string; tasks: DadosTarefa[]; memberCount: number; total: number; paid: number; pending: number; canClose: boolean; onBack: () => void; onConfirm: () => void; settings: GroupSettings; entries?: LedgerItem[] }) {
  const [agreed, setAgreed] = useState(false);
  const completed = tasks.filter(task => task.concluida).length;
  const expenses = tasks.filter(task => task.possuiDespesa).sort((a, b) => b.valorTotal - a.valorTotal);
  const paidPercent = total > 0 ? Math.round(paid / total * 100) : 100;
  const people = [...new Map(entries.map(entry => [entry.person.id, entry.person])).values()].map(person => {
    const own = entries.filter(entry => entry.person.id === person.id);
    const settled = own.filter(entry => entry.payment.status === "confirmado").reduce((sum, entry) => sum + Math.round(entry.amount * 100), 0) / 100;
    const open = own.filter(entry => entry.payment.status !== "confirmado").reduce((sum, entry) => sum + Math.round(entry.amount * 100), 0) / 100;
    return { ...person, settled, open };
  });
  const checks = [
    { title: "Tarefas e Atividades", ok: completed === tasks.length, value: `${tasks.length ? Math.round(completed / tasks.length * 100) : 100}% Executadas`, text: `${completed} de ${tasks.length} tarefas concluídas com sucesso.` },
    { title: "Liquidação dos Rateios", ok: pending === 0, value: pending === 0 ? "100% Rateado" : "Há valores em aberto", text: pending === 0 ? "Todos os acertos entre participantes foram conferidos." : "Ainda existem cotas aguardando confirmação de recebimento." },
    { title: "Pendências Financeiras", ok: canClose, value: `${money(pending)} Restante`, text: pending === 0 ? "Sem disputas em aberto ou valores a receber." : "Resolva os pagamentos antes de encerrar." },
  ];
  const approved = [completed === tasks.length, pending === 0, canClose].filter(Boolean).length;
  const avatarColors = ["bg-primary-container text-on-primary", "bg-surface-container-highest text-on-surface", "bg-tertiary-fixed text-on-tertiary-fixed", "bg-secondary-fixed text-on-secondary-fixed", "bg-primary-fixed text-on-primary-fixed", "bg-surface-dim text-on-surface"];
  const stats = [
    { label: "Total Movimentado", icon: "payments", iconBox: "bg-surface-container-high text-on-surface", value: money(total), valueColor: "text-on-surface", noteIcon: "receipt_long", noteColor: "text-tertiary", note: `${expenses.length} ${expenses.length === 1 ? "despesa vinculada" : "despesas vinculadas"} a tarefas`, bar: "bg-primary-container", width: 100 },
    { label: "Valores Quitados", icon: "verified", iconBox: "bg-primary-fixed text-primary", value: money(paid), valueColor: "text-primary", noteIcon: "check_circle", noteColor: "text-primary", note: `${paidPercent}% confirmado pelos responsáveis`, bar: "bg-primary", width: paidPercent },
    { label: "Saldo Pendente Global", icon: "lock_reset", iconBox: "bg-surface-container-high text-outline", value: money(pending), valueColor: "text-on-surface", noteIcon: "done_all", noteColor: "text-outline", note: pending === 0 ? "Tudo regularizado, zero pendências" : "Aguardando acerto", bar: "bg-outline", width: total > 0 ? Math.round(pending / total * 100) : 0 },
  ];
  return <div className="flex w-full flex-col">
    <div className="mb-space-lg flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
      <div className="flex flex-col gap-space-xs">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
          <Link to="/meus-grupos" className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-on-surface"><Icon name="groups" size={16}/><span>Meus Grupos</span></Link>
          <span className="font-label-sm text-[12px] text-outline-variant">/</span>
          <button type="button" onClick={onBack} className="font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-on-surface">{name}</button>
          <span className="font-label-sm text-[12px] text-outline-variant">/</span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary-container"/>Encerramento do Grupo</span>
        </nav>
        <div className="mt-1 flex flex-wrap items-center gap-space-sm">
          <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">Auditoria e Encerramento do Grupo</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-container shadow-sm"><span className="h-2 w-2 animate-pulse rounded-full bg-tertiary"/>{canClose ? "Auditoria de Fechamento" : "Aguardando Finalização"}</span>
        </div>
        <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">Verifique a conformidade de tarefas, despesas e liquidações antes de arquivar o grupo.</p>
      </div>
      <button type="button" onClick={() => window.print()} className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-surface-container-lowest px-4 py-2.5 text-on-surface shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98] lg:self-center"><Icon name="picture_as_pdf" size={20} className="text-primary"/><span className="font-label-md text-label-md">Exportar Extrato (PDF)</span></button>
    </div>

    <div className="mb-space-xl grid grid-cols-1 gap-space-md md:grid-cols-3">
      {stats.map(stat => <div key={stat.label} className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex items-center justify-between"><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{stat.label}</span><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBox}`}><Icon name={stat.icon} size={22} filled={stat.icon === "verified"}/></div></div>
        <div className="mt-4"><span className={`block font-numeric-stat text-numeric-stat tracking-tight ${stat.valueColor}`}>{stat.value}</span><div className="mt-1 flex items-center gap-1.5"><Icon name={stat.noteIcon} size={16} className={stat.noteColor}/><span className="font-body-sm text-body-sm text-on-surface-variant">{stat.note}</span></div></div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest"><div className={`h-full rounded-full ${stat.bar}`} style={{ width: `${stat.width}%` }}/></div>
      </div>)}
    </div>

    <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
      <div className="flex flex-col gap-space-lg lg:col-span-7">
        <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="relative flex h-32 items-end overflow-hidden bg-surface-container-high bg-cover bg-center p-space-md" style={{ backgroundImage: `url(${settings.cover || groupCover})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/85 via-on-background/40 to-transparent"/>
            <div className="relative z-10 flex w-full flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface backdrop-blur-md"><Icon name={categoryIcon(settings.category)} size={15} className="text-primary"/>{settings.category} {canClose ? "Concluída" : "em andamento"} • {formatDate(settings.start)} a {formatDate(settings.end)}</span>
              <span className="font-label-sm text-label-sm font-medium text-surface">Florianópolis, SC</span>
            </div>
          </div>
          <div className="flex flex-col gap-space-md p-space-lg">
            <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
              <div><h2 className="font-headline-md text-headline-md text-on-surface">{name}</h2><p className="mt-0.5 flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant"><Icon name="admin_panel_settings" size={16} className="text-primary"/>Administrador: <strong className="font-semibold text-on-surface">Rodrigo M. (Você)</strong></p></div>
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5">
                <div className="flex -space-x-2 overflow-hidden">{people.slice(0, 6).map((person, index) => <span key={person.id} className={`inline-block h-7 w-7 rounded-full text-center text-[11px] font-bold leading-7 shadow-sm ${avatarColors[index % avatarColors.length]}`}>{initials(person.nome)}</span>)}</div>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">{memberCount} {memberCount === 1 ? "integrante" : "integrantes"}</span>
              </div>
            </div>
            {people.length > 0 && <div className="mt-2 flex flex-col gap-space-xs overflow-x-auto">
              <div className="flex min-w-[28rem] items-center justify-between rounded-lg bg-surface-container-low px-3 py-2"><span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Participante</span><div className="flex items-center gap-space-lg"><span className="w-24 text-right font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Cota Paga</span><span className="w-24 text-right font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Saldo Final</span><span className="w-20 text-right font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Status</span></div></div>
              {people.map((person, index) => <div key={person.id} className="flex min-w-[28rem] items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container-low/50">
                <div className="flex items-center gap-2.5"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarColors[index % avatarColors.length]}`}>{initials(person.nome)}</span><div><span className="block font-label-md text-label-md leading-tight text-on-surface">{person.nome}</span>{person.id === "1" && <span className="font-label-sm text-[11px] text-primary">Você • Criador</span>}</div></div>
                <div className="flex items-center gap-space-lg"><span className="w-24 text-right font-body-sm text-body-sm text-on-surface">{money(person.settled)}</span><span className="w-24 text-right font-body-sm text-body-sm font-semibold text-on-surface">{money(person.open)}</span><span className="w-20 text-right"><span className={`inline-flex items-center rounded-md px-2 py-0.5 font-label-sm text-[11px] font-bold ${person.open === 0 ? "bg-surface-container text-primary" : "bg-error-container text-on-error-container"}`}>{person.open === 0 ? "Quitado" : "Pendente"}</span></span></div>
              </div>)}
            </div>}
          </div>
          <div className="flex items-start gap-3 bg-surface-container-low p-space-md"><Icon name="verified_user" size={20} className="mt-0.5 shrink-0 text-outline"/><p className="font-body-sm text-body-sm text-on-surface-variant"><strong className="font-semibold text-on-surface">Garantia de Integridade:</strong> Ao encerrar, o grupo ficará disponível para consulta em modo somente leitura. O histórico financeiro e as ações realizadas serão preservados.</p></div>
        </div>

        {expenses.length > 0 && <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Distribuição das Despesas do Grupo</h3>
          <div className="grid grid-cols-2 gap-space-sm pt-2 sm:grid-cols-4">{expenses.slice(0, 4).map((task, index) => <div key={task.id} className="flex min-w-0 flex-col rounded-lg bg-surface-container-low p-space-sm">
            <div className={`mb-1 flex items-center gap-1.5 ${["text-primary", "text-tertiary", "text-primary-container", "text-on-surface-variant"][index]}`}><Icon name="receipt_long" size={18}/><span className="truncate font-label-sm text-label-sm font-semibold">{task.titulo}</span></div>
            <span className="font-headline-sm text-headline-sm text-on-surface">{money(task.valorTotal)}</span>
            <span className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant">{total > 0 ? `${(task.valorTotal / total * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do total` : "—"}</span>
          </div>)}</div>
        </div>}
      </div>

      <div className="flex flex-col gap-space-lg lg:col-span-5">
        <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Icon name="task_alt" size={24} className="text-primary"/><h3 className="font-headline-sm text-headline-sm text-on-surface">Checklist de Conformidade</h3></div><span className="shrink-0 rounded-full bg-primary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-primary">{approved} de 3 Aprovados</span></div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Pré-requisitos para o arquivamento do grupo:</p>
          <div className="mt-1 flex flex-col gap-space-sm">{checks.map(check => <div key={check.title} className="flex items-start gap-3 rounded-xl bg-surface-container-low p-space-md">
            <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${check.ok ? "bg-primary text-on-primary" : "bg-surface-container-highest text-outline"}`}><Icon name={check.ok ? "check" : "schedule"} size={16}/></div>
            <div className="flex-1"><div className="flex items-center justify-between gap-2"><span className="font-label-md text-label-md font-semibold text-on-surface">{check.title}</span><span className={`rounded bg-surface-container-lowest px-2 py-0.5 font-label-sm text-[11px] font-bold ${check.ok ? "text-primary" : "text-secondary"}`}>{check.value}</span></div><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{check.text}</p></div>
          </div>)}</div>
        </div>

        <div className="relative flex flex-col gap-space-md overflow-hidden rounded-xl bg-primary-fixed/40 p-space-lg shadow-sm">
          <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary shadow-sm"><Icon name="lock" size={26}/></div><div><h3 className="font-headline-sm text-headline-sm text-on-surface">{canClose ? "Tudo pronto para o encerramento!" : "Ainda há pendências no grupo"}</h3><p className="mt-1 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{canClose ? "Nenhum acerto financeiro restante. O fechamento preserva o histórico para todos os integrantes." : "Conclua todas as tarefas e confirme os recebimentos para continuar."}</p></div></div>
          {canClose && <label className="mt-1 flex cursor-pointer select-none items-start gap-3 rounded-xl bg-surface-container-lowest p-3 transition-colors hover:bg-surface-container-low"><input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 cursor-pointer rounded accent-primary-container"/><span className="font-body-sm text-body-sm text-on-surface">Confirmo que revisei o extrato e que todos os membros concordaram com os saldos finais deste encerramento.</span></label>}
          <div className="mt-2 flex flex-col gap-space-xs">
            <button type="button" disabled={!canClose || !agreed} onClick={onConfirm} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-space-md py-3.5 font-label-lg text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"><Icon name="lock" size={20}/><span>Encerrar Grupo Agora</span></button>
            <button type="button" onClick={onBack} className="w-full rounded-xl px-space-md py-2.5 text-center font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-lowest hover:text-on-surface">Voltar para o Painel do Grupo</button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-space-md text-on-surface-variant"><div className="flex items-center gap-2"><Icon name="help_outline" size={18}/><span className="font-body-sm text-body-sm">Dúvidas sobre o fechamento?</span></div><Link to="/faq" className="font-label-sm text-label-sm font-semibold text-primary hover:underline">Consultar Guia</Link></div>
      </div>
    </div>
  </div>;
}

export function PaymentManagement({ name, entries, onBack, onOpen, onConfirm, onExport, message, memberMode }: { name: string; entries: LedgerItem[]; onBack: () => void; onOpen: (key: string) => void; onConfirm: (key: string) => void; onExport: () => void; message: string; memberMode: boolean }) {
  const tasks = [...new Map(entries.map(entry => [entry.task.id, entry.task])).values()];
  const [taskId, setTaskId] = useState(tasks.find(task => task.id === "tarefa-02")?.id ?? tasks[0]?.id ?? "");
  const [onlyPending, setOnlyPending] = useState(false);
  const task = tasks.find(item => item.id === taskId);
  const shares = entries.filter(entry => entry.task.id === taskId);
  const pendingShares = shares.filter(entry => entry.payment.status !== "confirmado");
  const visibleShares = onlyPending ? pendingShares : shares;
  const received = shares.filter(entry => entry.payment.status === "confirmado").reduce((sum, entry) => sum + entry.amount, 0);
  const due = pendingShares.reduce((sum, entry) => sum + entry.amount, 0);
  const progress = task?.valorTotal ? Math.round(received / task.valorTotal * 100) : 0;
  const inReview = shares.filter(entry => entry.payment.status === "informado").length;
  const headerButton = "inline-flex items-center gap-space-xs rounded-lg px-space-md py-space-sm font-label-md text-label-md transition-colors";
  return <div className="flex flex-col gap-space-lg">
    <div className="flex flex-wrap items-center justify-between gap-space-md">
      <div className="flex min-w-0 items-center gap-space-sm">
        <button type="button" aria-label="Voltar ao grupo" onClick={onBack} className="flex items-center justify-center rounded-lg bg-surface-container-low p-space-xs text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"><Icon name="arrow_back" size={20}/></button>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant"><span className="truncate">{name}</span><Icon name="chevron_right" size={14}/><span className="font-semibold text-tertiary">Despesas e Rateios</span></div>
          <h1 className="truncate font-headline-md text-headline-md font-bold tracking-tight text-on-surface">{memberMode ? "Meus Pagamentos e Comprovantes" : "Gerenciar Pagamentos e Comprovantes"}</h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-sm">
        <button type="button" onClick={onExport} className={`${headerButton} bg-surface-container-low text-on-surface shadow-sm hover:bg-surface-container`}><Icon name="download" size={18} className="text-tertiary"/><span>Exportar Comprovantes</span></button>
        <button type="button" onClick={onBack} className={`${headerButton} bg-primary-container text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] hover:opacity-95`}><Icon name="verified" size={18}/><span>Finalizar Auditoria</span></button>
      </div>
    </div>
    {message && <p className="flex items-start gap-2 rounded-xl bg-surface-container p-space-md font-body-sm text-body-sm text-on-surface" role="status"><Icon name="info" size={20} className="shrink-0 text-primary"/>{message}</p>}
    {task ? <>
      <div className="grid grid-cols-1 gap-space-md lg:grid-cols-12">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-7">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary-fixed/30 blur-2xl"/>
          <div className="relative z-10 flex flex-col gap-space-sm">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-space-sm py-0.5 font-label-sm text-label-sm text-tertiary"><Icon name="receipt_long" size={14} filled/>Tarefa e despesa vinculada</span>
              <div className="relative flex items-center">
                <select aria-label="Selecionar tarefa para conferência" value={taskId} onChange={event => setTaskId(event.target.value)} className="max-w-[16rem] appearance-none truncate rounded-lg bg-surface-container-low py-1.5 pl-3 pr-9 font-label-sm text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container">{tasks.map(item => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select>
                <Icon name="expand_more" size={18} className="pointer-events-none absolute right-2 text-on-surface-variant"/>
              </div>
            </div>
            <div className="mt-space-xs">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">{task.titulo}</h2>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{task.descricao || "Despesa com divisão igualitária entre os participantes selecionados."}</p>
              {task.dataLimite && <p className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant"><Icon name="event" size={16}/>Prazo: {formatDate(task.dataLimite)}</p>}
            </div>
          </div>
          <div className="relative z-10 mt-space-md flex flex-wrap items-center justify-between gap-space-sm rounded-lg bg-surface-container-low/70 p-space-md">
            <div className="flex items-center gap-space-md">
              <div><span className="block font-label-sm text-label-sm text-on-surface-variant">Valor Total Gasto</span><span className="font-numeric-stat text-numeric-stat font-extrabold text-on-surface">{money(task.valorTotal)}</span></div>
              <div className="h-8 w-px bg-surface-dim"/>
              <div><span className="block font-label-sm text-label-sm text-on-surface-variant">Cota por Pessoa</span><span className="font-numeric-stat text-numeric-stat font-bold text-tertiary">{money(shares[0]?.amount ?? 0)}</span></div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest px-space-sm py-1 font-label-sm text-label-sm text-on-surface shadow-sm"><Icon name="group" size={16} className="text-tertiary-container"/>{task.participantes.filter(person => person.selecionado).length} Participantes</span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-lg shadow-sm lg:col-span-5">
          <div className="mb-space-xs flex items-center justify-between gap-2">
            <div><span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Status do Rateio</span><h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Resumo de Arrecadação</h3></div>
            <span className="shrink-0 rounded-full bg-primary-fixed px-space-sm py-1 font-label-sm text-label-sm font-bold text-on-primary-fixed">{progress}% Concluído</span>
          </div>
          <div className="my-space-sm">
            <div className="mb-1.5 flex items-end justify-between gap-2"><span className="font-label-sm text-label-sm text-on-surface-variant">Progresso das Quitações</span><span className="font-label-md text-label-md font-bold text-on-surface">{money(received)} <span className="font-normal text-on-surface-variant">/ {money(task.valorTotal)}</span></span></div>
            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-surface-container-high p-0.5" role="progressbar" aria-label="Progresso das quitações" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary-container transition-all duration-500" style={{ width: `${progress}%` }}/><div className="h-full rounded-r-full bg-tertiary-container/40 transition-all duration-500" style={{ width: `${Math.max(100 - progress, 0)}%` }}/></div>
          </div>
          <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
            <div className="flex flex-col rounded-lg bg-surface-container-low p-space-sm"><div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface"><span className="h-2 w-2 rounded-full bg-primary-container"/><span>Total Arrecadado</span></div><span className="mt-1 font-numeric-stat text-numeric-stat font-extrabold text-on-surface">{money(received)}</span><span className="font-label-sm text-label-sm text-on-surface-variant">{shares.length - pendingShares.length} de {shares.length} cotas confirmadas</span></div>
            <div className="flex flex-col rounded-lg bg-surface-container-low p-space-sm"><div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface"><span className="h-2 w-2 rounded-full bg-secondary-container"/><span>Em Aberto / Análise</span></div><span className="mt-1 font-numeric-stat text-numeric-stat font-extrabold text-secondary">{money(due)}</span><span className="font-label-sm text-label-sm text-on-surface-variant">{pendingShares.length - inReview} pendente{pendingShares.length - inReview === 1 ? "" : "s"}, {inReview} em análise</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg">
          <div><h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Participantes e Estados de Pagamento</h3><p className="font-body-sm text-body-sm text-on-surface-variant">Confira os comprovantes e valide os recebimentos de cada cota.</p></div>
          <div className="flex items-center gap-space-xs">
            <button type="button" aria-pressed={!onlyPending} onClick={() => setOnlyPending(false)} className={`rounded-full px-space-md py-1.5 font-label-sm text-label-sm transition-colors ${!onlyPending ? "bg-inverse-surface text-inverse-on-surface shadow-sm" : "bg-surface-container-low text-on-surface hover:bg-surface-container"}`}>Todos ({shares.length})</button>
            <button type="button" aria-pressed={onlyPending} onClick={() => setOnlyPending(true)} className={`rounded-full px-space-md py-1.5 font-label-sm text-label-sm transition-colors ${onlyPending ? "bg-inverse-surface text-inverse-on-surface shadow-sm" : "bg-surface-container-low text-on-surface hover:bg-surface-container"}`}>Apenas Pendentes ({pendingShares.length})</button>
          </div>
        </div>
        <div className="flex flex-col">
          {visibleShares.length === 0 && <p className="px-space-lg pb-space-lg font-body-sm text-body-sm text-on-surface-variant">Nenhuma cota pendente nesta tarefa.</p>}
          {visibleShares.map((entry, index) => {
            const status = entry.payment.status;
            const buyer = entry.person.id === task.pagadorId;
            return <div key={entry.key}>
              {index > 0 && <div className="mx-space-lg h-px bg-surface-container-high"/>}
              <div className={`flex flex-col justify-between gap-space-md p-space-lg transition-colors md:flex-row md:items-center ${status === "informado" ? "bg-tertiary-fixed/20" : "bg-surface-container-lowest hover:bg-surface-bright"}`}>
                <div className="flex min-w-0 items-start gap-space-md md:items-center">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-label-lg text-label-lg font-bold shadow-sm ${buyer ? "bg-primary-fixed text-on-primary-fixed" : status === "informado" ? "bg-tertiary-container text-on-tertiary" : status === "confirmado" ? "bg-surface-container-high text-on-surface" : "bg-surface-container-low text-secondary"}`}>{initials(entry.person.nome)}</span>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-center gap-space-xs"><span className="font-label-lg text-label-lg font-bold text-on-surface">{entry.person.nome}</span>{buyer && <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm text-on-surface">Responsável pela compra</span>}<PaymentBadge status={status}/></div>
                    <span className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{status === "informado" ? "Pagamento informado. Aguarda conferência do recebimento." : status === "confirmado" ? "Recebimento confirmado e registrado na tarefa." : status === "contestado" ? `Pagamento contestado${entry.payment.reason ? `: ${entry.payment.reason}` : "."}` : "Consulte os detalhes da cota e o comprovante quando disponível."}{entry.payment.receipt && " • Comprovante anexado"}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-space-md md:justify-end">
                  <div className="text-right"><span className="block font-label-sm text-label-sm text-on-surface-variant">{status === "confirmado" ? "Valor Quitado" : status === "informado" ? "Valor a Auditar" : "Valor Devido"}</span><span className={`font-numeric-stat text-numeric-stat font-bold ${status === "confirmado" ? "text-on-surface" : status === "informado" ? "text-tertiary" : "text-secondary"}`}>{money(entry.amount)}</span></div>
                  <div className="flex items-center gap-space-xs">
                    <button type="button" onClick={() => onOpen(entry.key)} className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-space-md py-space-sm font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"><Icon name={entry.payment.receipt ? "visibility" : "description"} size={18} className="text-tertiary"/><span>{entry.payment.receipt ? "Ver Comprovante" : "Ver Detalhes"}</span></button>
                    {!memberMode && status === "informado" && <>
                      <button type="button" onClick={() => onConfirm(entry.key)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-space-md py-space-sm font-label-md text-label-md text-on-primary shadow-sm transition-all hover:opacity-95"><Icon name="done_all" size={18}/><span>Confirmar Recebimento</span></button>
                      <button type="button" aria-label={`Contestar pagamento de ${entry.person.nome}`} title="Contestar Pagamento" onClick={() => onOpen(entry.key)} className="rounded-lg bg-surface-container-lowest p-space-sm text-secondary transition-colors hover:bg-error-container hover:text-on-error-container"><Icon name="cancel" size={20}/></button>
                    </>}
                  </div>
                </div>
              </div>
            </div>;
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-space-md"><div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant"><Icon name="security" size={18} className="text-primary"/><span>Os valores são confirmados pelo responsável; informar um pagamento não quita a cota.</span></div></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-lg pt-space-xs">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"><Icon name="keyboard_backspace" size={18}/><span>Voltar para as Tarefas</span></button>
        <button type="button" onClick={onBack} className="inline-flex items-center gap-space-xs rounded-lg bg-primary-container px-space-md py-space-sm font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:opacity-95"><Icon name="done_all" size={18}/><span>Concluir Conferências</span></button>
      </div>
    </> : <section className="flex flex-col items-center gap-space-md rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name="receipt_long" size={24}/></div>
      <p className="font-body-md text-body-md text-on-surface-variant">Nenhuma despesa vinculada às tarefas para conferir.</p>
      <button type="button" onClick={onBack} className="rounded-lg bg-surface-container-high px-space-md py-space-sm font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-highest">Voltar ao grupo</button>
    </section>}
  </div>;
}
