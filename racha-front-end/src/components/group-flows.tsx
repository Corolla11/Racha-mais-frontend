import { initialGroupSettings, type GroupSettings } from "../lib/group-design";
import { useEffect, useImperativeHandle, useState, type Dispatch, type Ref, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";
import { ENDPOINTS } from "../lib/endpoints";
import { canCloseGroup, money, paymentLabels, share, type Payment, type PaymentStatus } from "../lib/finance";
import type { DadosTarefa } from "../pages/editar-tarefa";
import { GroupMembersModal, type Member } from "./group-members-modal";
import { GroupAudit, GroupEditForm, PaymentManagement } from "./group-panels";
import { GroupPaymentModal, type LocalReceipt } from "./group-payment-modal";
import Icon from "./icon";
import Overlay from "./overlay";

export type Activity = { text: string; date: string };
export interface GroupFlowControl {
  openPayments: (taskId?: string) => void;
}
interface Props {
  idGrupo?: string;
  currentUserId?: string;
  adminName?: string;
  parteIds?: Record<string, string>;
  taskEvents: Activity[];
  tasks: DadosTarefa[];
  name: string;
  onName: (name: string) => void;
  closed: boolean;
  onCloseGroup: () => void;
  memberMode: boolean;
  payments: Record<string, Payment>;
  setPayments: Dispatch<SetStateAction<Record<string, Payment>>>;
  ref?: Ref<GroupFlowControl>;
}

export default function GroupFlows({
  idGrupo,
  currentUserId = "",
  adminName,
  parteIds = {},
  taskEvents,
  tasks,
  name,
  onName,
  closed,
  onCloseGroup,
  memberMode,
  payments,
  setPayments,
  ref,
}: Props) {
  const navigate = useNavigate();
  const [view, setView] = useState<"payments" | "members" | "edit" | "close" | "leave" | null>(null);
  const [tab, setTab] = useState("tasks");
  const [members, setMembers] = useState<Member[]>(() =>
    (tasks[0]?.participantes ?? []).map((p) => ({
      id: p.id,
      nome: p.nome,
      admin: p.id === currentUserId,
      active: true,
    })),
  );
  const [events, setEvents] = useState<Activity[]>([]);
  const [selected, setSelected] = useState("");
  useImperativeHandle(
    ref,
    () => ({
      openPayments(taskId) {
        setView("payments");
        setSelected(taskId ? `${taskId}:${currentUserId}` : "");
      },
    }),
    [currentUserId],
  );
  const [receipt, setReceipt] = useState<LocalReceipt | null>(null);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<GroupSettings>(initialGroupSettings);
  const [confirmClose, setConfirmClose] = useState(false);
  const [reason, setReason] = useState("");
  const [receiptView, setReceiptView] = useState<{
    url: string;
    name: string;
    isImage: boolean;
  } | null>(null);

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

  const entries = tasks.flatMap((task) => {
    const participants = task.participantes.filter((p) => p.selecionado);
    return task.possuiDespesa
      ? participants.map((person, index) => {
          const key = `${task.id}:${person.id}`;
          const payment = payments[key] ?? {
            status: person.id === task.pagadorId ? "confirmado" : "pendente",
          };
          return {
            key,
            task,
            person,
            amount: share(task.valorTotal, participants.length, index),
            payment,
          };
        })
      : [];
  });
  const total = entries.reduce((sum, item) => sum + Math.round(item.amount * 100), 0) / 100;
  const paid =
    entries
      .filter((e) => e.payment.status === "confirmado")
      .reduce((sum, e) => sum + Math.round(e.amount * 100), 0) / 100;
  const pending = Math.round((total - paid) * 100) / 100;
  const active = entries.find((e) => e.key === selected);

  const visibleEntries = memberMode ? entries.filter((e) => e.person.id === currentUserId) : entries;
  const canClose = canCloseGroup(
    tasks.map((t) => t.concluida),
    entries,
  );
  const myPending = entries
    .filter((e) => e.person.id === currentUserId && e.payment.status !== "confirmado")
    .reduce((sum, e) => sum + e.amount, 0);
  const onlyAdmin = !memberMode && members.filter((m) => m.active && m.admin).length === 1;
  const activeMembers = members.filter((member) => member.active);

  function log(text: string) {
    setEvents((old) => [{ text, date: new Date().toISOString() }, ...old]);
  }
  function dismiss() {
    setView(null);
    setConfirmClose(false);
    setMessage("");
  }

  async function uploadComprovanteS3(idParte: string, local: LocalReceipt) {
    if (!local.file) return null;
    const presign = await apiRequest<{ uploadUrl: string; objectKey: string }>(
      ENDPOINTS.uploads.presign,
      {
        method: "POST",
        body: {
          tipo: "comprovante",
          idParte,
          contentType: local.file.type,
          sizeBytes: local.file.size,
        },
      },
    );
    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": local.file.type },
      body: local.file,
    });
    if (!putRes.ok) {
      throw new ApiError("Não foi possível enviar o comprovante ao armazenamento.", putRes.status);
    }
    return { key: presign.objectKey, name: local.name };
  }

  async function updatePayment(key: string, status: PaymentStatus) {
    const entry = entries.find((e) => e.key === key);
    if (!entry || closed) return;
    if (status === "confirmado" && (memberMode || entry.payment.status !== "informado")) return;
    if (status === "contestado" && (memberMode || !reason.trim())) {
      setMessage("Informe o motivo da contestação.");
      return;
    }

    const previousPayment = payments[key];
    const idParte = parteIds[key];

    let uploaded: { key: string; name: string } | null = null;
    if (status === "informado" && idGrupo && idParte && receipt?.file) {
      try {
        uploaded = await uploadComprovanteS3(idParte, receipt);
      } catch (err) {
        setMessage(
          err instanceof ApiError ? err.message : "Não foi possível enviar o comprovante.",
        );
        return;
      }
    }

    setPayments((old) => ({
      ...old,
      [key]: {
        ...entry.payment,
        status,
        ...(status === "informado"
          ? {
              receipt: receipt?.data,
              receiptKey: uploaded?.key ?? entry.payment.receiptKey,
              receiptName: uploaded?.name ?? receipt?.name ?? entry.payment.receiptName,
              reason: undefined,
            }
          : {}),
        ...(status === "confirmado" ? { reason: undefined } : {}),
        ...(status === "contestado" ? { reason: reason.trim() } : {}),
      },
    }));

    if (idGrupo && idParte) {
      const apiStatus =
        status === "confirmado" ? "FINALIZADA" : status === "informado" ? "EM_ANDAMENTO" : "AGENDADA";
      const body: Record<string, unknown> = { status: apiStatus };
      if (status === "informado") {
        body.motivoContestacao = null;
        if (uploaded) {
          body.comprovanteKey = uploaded.key;
          body.comprovanteNome = uploaded.name;
        }
      } else if (status === "confirmado") {
        body.motivoContestacao = null;
      } else if (status === "contestado") {
        body.motivoContestacao = reason.trim();
      }
      try {
        await apiRequest(ENDPOINTS.partes.byId(idParte), { method: "PATCH", body });
      } catch (err) {
        setPayments((old) => {
          const next = { ...old };
          if (previousPayment) next[key] = previousPayment;
          else delete next[key];
          return next;
        });
        setMessage(
          err instanceof ApiError ? err.message : "Não foi possível atualizar o pagamento.",
        );
        return;
      }
    }

    log(`${paymentLabels[status]} · ${entry.person.nome} · ${entry.task.titulo}`);
    setMessage(paymentLabels[status]);
    setReceipt(null);
    setReason("");
  }

  const canInform =
    active &&
    !closed &&
    (active.person.id === currentUserId || !memberMode) &&
    ["pendente", "contestado"].includes(active.payment.status);
  const expenses = tasks.filter((task) => task.possuiDespesa).sort((a, b) => b.valorTotal - a.valorTotal);
  const timeline = [...events, ...taskEvents].sort((a, b) => b.date.localeCompare(a.date));
  const toolbarButton =
    "inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-space-md py-2 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-low";

  return (
    <section className="flex flex-col gap-space-lg font-body-md text-body-md text-on-surface">
      {view === "close" ? (
        <GroupAudit
          name={name}
          tasks={tasks}
          memberCount={activeMembers.length}
          total={total}
          paid={paid}
          pending={pending}
          canClose={canClose}
          settings={settings}
          entries={entries}
          currentUserId={currentUserId}
          adminName={adminName}
          onBack={dismiss}
          onConfirm={() => setConfirmClose(true)}
        />
      ) : view === "payments" && !active ? (
        <PaymentManagement
          name={name}
          entries={visibleEntries}
          onBack={dismiss}
          onOpen={(key) => {
            setSelected(key);
            setMessage("");
          }}
          onConfirm={(key) => void updatePayment(key, "confirmado")}
          onExport={() => setMessage("A exportação de comprovantes depende dos registros reais do grupo.")}
          message={message}
          memberMode={memberMode}
        />
      ) : (
        <>
          {closed && (
            <div className="relative flex flex-col items-center justify-between gap-space-lg overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-md md:flex-row md:p-space-xl" role="status">
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary-container/10 blur-2xl" />
              <div className="relative flex items-center gap-space-lg">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed shadow-sm">
                  <Icon name="celebration" size={36} />
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Grupo encerrado com sucesso</h2>
                    <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-label-sm text-label-sm font-bold text-on-primary shadow-sm">
                      <Icon name="check_circle" size={14} />
                      100% Quitado &amp; Arquivado
                    </span>
                  </div>
                  <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                    Histórico preservado · somente leitura · todos os pagamentos confirmados.
                  </p>
                </div>
              </div>
              <Link className="relative inline-flex w-full shrink-0 items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-md py-space-sm font-label-md text-label-md text-on-primary transition-opacity hover:opacity-95 md:w-auto" to="/meus-grupos">
                <Icon name="grid_view" size={18} />
                Voltar aos meus grupos
              </Link>
            </div>
          )}

          <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
            <div className="flex w-fit items-center gap-1 rounded-xl bg-surface-container-low p-1" role="group" aria-label="Seções do grupo">
              {[
                { id: "tasks", label: "Visão geral", icon: "dashboard" },
                { id: "history", label: "Histórico", icon: "history" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-space-md py-1.5 font-label-md text-label-md transition-all ${tab === item.id ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <button type="button" className={toolbarButton} onClick={() => { setView("payments"); setSelected(""); }}>
                <Icon name="receipt_long" size={18} className="text-primary" />
                Pagamentos e comprovantes
              </button>
              <button type="button" className={toolbarButton} onClick={() => setView("members")}>
                <Icon name="group" size={18} className="text-primary" />
                Membros
              </button>
              {!memberMode && !closed && (
                <>
                  <button type="button" className={toolbarButton} onClick={() => setView("edit")}>
                    <Icon name="edit" size={18} className="text-primary" />
                    Editar grupo
                  </button>
                  <button type="button" className={toolbarButton} onClick={() => setView("close")}>
                    <Icon name="lock" size={18} className="text-primary" />
                    Encerrar grupo
                  </button>
                </>
              )}
              {!closed && (
                <button type="button" className={`${toolbarButton} text-error`} onClick={() => setView("leave")}>
                  <Icon name="logout" size={18} />
                  Sair do grupo
                </button>
              )}
            </div>
          </div>

          {(tab === "history" || closed) && (
            <div className={`grid grid-cols-1 gap-space-lg ${closed && expenses.length ? "lg:grid-cols-12" : ""}`}>
              {closed && expenses.length > 0 && (
                <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md lg:col-span-7">
                  <div className="flex items-center justify-between gap-space-sm pb-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <Icon name="pie_chart" size={24} className="text-primary" />
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Maiores Despesas do Grupo</h3>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Total: {money(total)}</span>
                  </div>
                  <div className="flex flex-col gap-space-md">
                    {expenses.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center justify-between rounded-lg p-space-sm transition-colors hover:bg-surface-container-low">
                        <div className="flex min-w-0 items-center gap-space-md">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                            <Icon name="receipt_long" />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-label-md text-label-md text-on-surface">{task.titulo}</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Pago por {task.participantes.find((p) => p.id === task.pagadorId)?.nome ?? "—"} • Dividido por {task.participantes.filter((p) => p.selecionado).length}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end pl-2">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">{money(task.valorTotal)}</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {total > 0 ? `${((task.valorTotal / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do total` : "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={`flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm ${closed && expenses.length ? "lg:col-span-5" : ""}`}>
                <div className="flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <Icon name="history" size={24} className="text-primary" />
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      {closed ? "Resumo final e histórico" : "Histórico de atividades"}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface">
                    {closed ? "100% Quitado" : "Todas as atividades"}
                  </span>
                </div>
                {closed && (
                  <div className="grid grid-cols-2 gap-space-sm">
                    {[
                      ["Total de despesas", money(total)],
                      ["Valores pagos", money(paid)],
                      ["Tarefas realizadas", `${tasks.filter((t) => t.concluida).length}/${tasks.length}`],
                      ["Participantes", String(activeMembers.length)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col rounded-lg bg-surface-container-low p-space-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
                        <strong className="font-label-lg text-label-lg font-bold text-on-surface">{value}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <ol className="flex flex-col gap-space-sm">
                  {timeline.map((event, index) => (
                    <li key={index} className="flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary">
                        <Icon name="history" size={16} />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-label-md text-label-md text-on-surface">{event.text}</span>
                        <small className="font-label-sm text-label-sm text-on-surface-variant">
                          {new Date(event.date).toLocaleString("pt-BR")}
                        </small>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </>
      )}

      {view && view !== "close" && !(view === "payments" && !active) && !receiptView && (
        <Overlay
          title={
            view === "payments"
              ? active
                ? "Acertar Pagamento via Pix"
                : "Gerenciar Pagamentos e Comprovantes"
              : view === "members"
                ? "Membros & Convites"
                : view === "edit"
                  ? "Editar Grupo"
                  : "Sair do grupo"
          }
          eyebrow={
            view === "members"
              ? "Painel do Administrador"
              : view === "edit"
                ? "Painel do Organizador"
                : view === "payments" && active
                  ? "Liquidação Direta · Pix"
                  : undefined
          }
          description={
            view === "edit"
              ? "Atualize informações básicas, regras de rateio e capa do grupo"
              : view === "members"
                ? "Gerencie participantes, permissões e adicione novos amigos ao racha."
                : active
                  ? "Transfira sua cota diretamente para o responsável da compra."
                  : undefined
          }
          onClose={dismiss}
          drawer={view === "edit"}
          footer={
            view === "edit" ? (
              <>
                <button type="button" className={btnSecondary} onClick={dismiss}>Cancelar</button>
                <button className={btnPrimary} form="racha-edit-group-form" type="submit">
                  <Icon name="check" size={18} />
                  Salvar Alterações
                </button>
              </>
            ) : view === "members" ? (
              <>
                <small className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant sm:mr-auto">
                  <Icon name="verified_user" size={16} className="text-primary" />
                  Alterações salvas automaticamente
                </small>
                <button type="button" className={btnSecondary} onClick={dismiss}>Cancelar</button>
                <button type="button" className={btnPrimary} onClick={dismiss}>
                  <Icon name="check" size={18} />
                  Concluir
                </button>
              </>
            ) : active ? (
              <>
                <button type="button" className={btnSecondary} onClick={dismiss}>Cancelar / Fechar</button>
                {canInform ? (
                  <button type="button" className={btnPrimary} onClick={() => void updatePayment(active.key, "informado")}>
                    <Icon name="send" size={20} />
                    Informar que realizei o Pagamento
                  </button>
                ) : (
                  <button type="button" className={btnPrimary} onClick={dismiss}>
                    <Icon name="check" size={18} />
                    Concluir
                  </button>
                )}
              </>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-space-lg">
            {message && (
              <p className="flex items-start gap-2 rounded-xl bg-surface-container p-space-md font-body-sm text-body-sm text-on-surface" role="status">
                <Icon name="info" size={20} className="shrink-0 text-primary" />
                {message}
              </p>
            )}
            {view === "payments" && active && (
              <GroupPaymentModal
                idGrupo={idGrupo}
                groupName={name}
                active={active}
                idParte={parteIds[active.key]}
                currentUserId={currentUserId}
                memberMode={memberMode}
                closed={closed}
                receipt={receipt}
                reason={reason}
                events={events}
                onReceiptChange={setReceipt}
                onReasonChange={setReason}
                onUpdatePayment={updatePayment}
                onBack={() => setSelected("")}
                onMessage={setMessage}
                onOpenReceipt={setReceiptView}
              />
            )}
            {view === "edit" && (
              <GroupEditForm
                name={name}
                settings={settings}
                onSave={async (updatedName, updatedSettings) => {
                  if (idGrupo) {
                    try {
                      await apiRequest(ENDPOINTS.grupos.byId(idGrupo), {
                        method: "PATCH",
                        body: { nome: updatedName, descricao: updatedSettings.description },
                      });
                    } catch (err) {
                      setMessage(err instanceof ApiError ? err.message : "Não foi possível atualizar o grupo.");
                      return;
                    }
                  }
                  onName(updatedName);
                  setSettings(updatedSettings);
                  log("Informações do grupo atualizadas");
                  dismiss();
                }}
              />
            )}
            {view === "members" && (
              <GroupMembersModal
                idGrupo={idGrupo}
                currentUserId={currentUserId}
                memberMode={memberMode}
                closed={closed}
                members={members}
                setMembers={setMembers}
                entries={entries}
                onLog={log}
                onMessage={setMessage}
              />
            )}
            {view === "leave" && (
              <>
                <div className="flex items-start gap-space-md rounded-xl bg-surface-container-low p-space-md">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
                    <Icon name="logout" size={24} />
                  </span>
                  <div className="flex flex-col">
                    <h3 className="font-label-lg text-label-lg font-bold text-on-surface">{name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Você perderá acesso às ações do grupo. Seu histórico financeiro será preservado.
                    </p>
                  </div>
                </div>
                <p className="flex items-center gap-2 rounded-xl bg-tertiary-fixed/40 p-space-md font-label-md text-label-md text-on-tertiary-fixed">
                  <Icon name="account_balance_wallet" size={20} className="text-tertiary" />
                  Suas pendências: {money(myPending)}.
                </p>
                {onlyAdmin && (
                  <p className="flex items-start gap-2 rounded-xl bg-error-container/50 p-space-md font-body-sm text-body-sm text-on-error-container" role="alert">
                    <Icon name="warning" size={20} className="shrink-0 text-error" />
                    Você é o único administrador. Promova outro participante em Membros antes de sair.
                  </p>
                )}
                <div className="flex flex-col-reverse gap-space-sm sm:flex-row sm:justify-end">
                  <button type="button" className={btnSecondary} onClick={dismiss}>Cancelar</button>
                  {!onlyAdmin && (
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={async () => {
                        if (idGrupo) {
                          try {
                            await apiRequest(ENDPOINTS.grupos.membroById(idGrupo, currentUserId), { method: "DELETE" });
                          } catch (err) {
                            setMessage(err instanceof ApiError ? err.message : "Não foi possível sair do grupo.");
                            return;
                          }
                        }
                        log("Saiu do grupo");
                        navigate("/meus-grupos", { replace: true });
                      }}
                    >
                      <Icon name="logout" size={18} />
                      Confirmar saída
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </Overlay>
      )}

      {confirmClose && (
        <Overlay
          title="Confirmar encerramento do grupo?"
          description={name}
          onClose={() => setConfirmClose(false)}
          footer={
            <>
              <button type="button" className={btnSecondary} onClick={() => setConfirmClose(false)}>
                Cancelar e Voltar
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-space-xs rounded-lg bg-secondary px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-secondary shadow-md transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canClose}
                onClick={async () => {
                  if (!canClose) return;
                  if (idGrupo) {
                    try {
                      await apiRequest(ENDPOINTS.grupos.encerrar(idGrupo), { method: "POST" });
                    } catch (err) {
                      setMessage(err instanceof ApiError ? err.message : "Não foi possível encerrar o grupo.");
                      setConfirmClose(false);
                      return;
                    }
                  }
                  onCloseGroup();
                  log("Grupo encerrado · todos os pagamentos confirmados");
                  dismiss();
                }}
              >
                <Icon name="lock" size={18} />
                Confirmar Encerramento Definitivo
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-space-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-fixed text-secondary shadow-sm">
              <Icon name="lock" size={32} />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              O grupo ficará disponível no <strong className="text-on-surface">histórico em modo somente leitura</strong>, com todas as tarefas e pagamentos preservados.
            </p>
            <div className="flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-md">
              <Icon name="verified" size={20} className="mt-0.5 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  {canClose ? "Tudo liquidado!" : "Ainda há pendências"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {canClose
                    ? `${money(total)} totalmente quitados entre ${activeMembers.length} participantes. Não há valores pendentes.`
                    : `${money(pending)} aguardando confirmação.`}
                </span>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {receiptView && (
        <Overlay title="Comprovante de pagamento" onClose={() => setReceiptView(null)}>
          <div className="flex flex-col gap-space-md">
            <p className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <Icon name="attach_file" size={16} />
              {receiptView.name}
            </p>
            {receiptView.isImage ? (
              <div className="overflow-hidden rounded-xl bg-surface-container-low p-space-sm">
                <img className="mx-auto max-h-[60vh] w-auto rounded-lg object-contain" src={receiptView.url} alt="Comprovante anexado pelo participante" />
              </div>
            ) : (
              <a className={`${btnPrimary} self-start`} href={receiptView.url} target="_blank" rel="noopener noreferrer" download={receiptView.name}>
                <Icon name="download" size={18} />
                Baixar comprovante PDF
              </a>
            )}
          </div>
        </Overlay>
      )}

      {import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === "true" && (
        <small className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
          <Icon name="info" size={14} />
          Ambiente de demonstração · sem movimentações financeiras reais.
        </small>
      )}
    </section>
  );
}

const btnPrimary =
  "inline-flex items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center gap-space-xs rounded-lg bg-surface-container-high px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-highest";
const btnDanger =
  "inline-flex items-center justify-center gap-space-xs rounded-lg bg-error px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-sm transition-colors hover:bg-error/90";
