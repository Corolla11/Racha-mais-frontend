import { useEffect, useState } from "react";
import { ApiError, apiRequest } from "../lib/api";
import { gerarBrCode } from "../lib/brcode";
import { ENDPOINTS, type ChavePixApi, type TipoChavePix } from "../lib/endpoints";
import { money, paymentLabels, type Payment, type PaymentStatus } from "../lib/finance";
import { formatarChavePix } from "../lib/pix-format";
import type { DadosTarefa } from "../pages/editar-tarefa";
import { PaymentBadge } from "./group-panels";
import Icon from "./icon";
import PixPreview from "./pix-preview";

export type LocalReceipt = {
  file?: File;
  data?: string;
  name: string;
};

export interface PaymentEntry {
  key: string;
  task: DadosTarefa;
  person: { id: string; nome: string };
  amount: number;
  payment: Payment;
}

export function GroupPaymentModal({
  idGrupo,
  groupName,
  active,
  idParte,
  currentUserId,
  memberMode,
  closed,
  receipt,
  reason,
  events,
  onReceiptChange,
  onReasonChange,
  onUpdatePayment,
  onBack,
  onMessage,
  onOpenReceipt,
}: {
  idGrupo?: string;
  groupName: string;
  active: PaymentEntry;
  idParte?: string;
  currentUserId: string;
  memberMode: boolean;
  closed: boolean;
  receipt: LocalReceipt | null;
  reason: string;
  events: { text: string; date: string }[];
  onReceiptChange: (next: LocalReceipt | null) => void;
  onReasonChange: (next: string) => void;
  onUpdatePayment: (key: string, status: PaymentStatus) => Promise<void> | void;
  onBack: () => void;
  onMessage: (msg: string) => void;
  onOpenReceipt: (view: { url: string; name: string; isImage: boolean }) => void;
}) {
  const [recipientPixState, setRecipientPixState] = useState<{
    idUser: string;
    chave: string | null;
    tipoChave?: TipoChavePix;
  } | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const payerId = active.task.pagadorId;
  useEffect(() => {
    if (!idGrupo || !payerId) return;
    let ativo = true;
    apiRequest<ChavePixApi[]>(
      `${ENDPOINTS.chavesPix.base}?idUser=${encodeURIComponent(payerId)}`,
    )
      .then((chaves) => {
        if (ativo) {
          setRecipientPixState({
            idUser: payerId,
            chave: chaves[0]?.chave ?? null,
            tipoChave: chaves[0]?.tipoChave,
          });
        }
      })
      .catch(() => {
        if (ativo) setRecipientPixState({ idUser: payerId, chave: null });
      });
    return () => {
      ativo = false;
    };
  }, [idGrupo, payerId]);

  const recipientPix =
    idGrupo && payerId && recipientPixState?.idUser === payerId
      ? recipientPixState
      : null;

  const canInform =
    !closed &&
    (active.person.id === currentUserId || !memberMode) &&
    ["pendente", "contestado"].includes(active.payment.status);
  const payer = active.task.participantes.find((p) => p.id === active.task.pagadorId);
  const pixDisplay =
    recipientPix?.chave && recipientPix.tipoChave
      ? formatarChavePix(recipientPix.tipoChave, recipientPix.chave)
      : recipientPix?.chave || "";
  const pixCopyValue = recipientPix?.chave || "";
  const brCode = recipientPix?.chave
    ? gerarBrCode({
        chave: recipientPix.chave,
        tipoChave: recipientPix.tipoChave,
        nomeRecebedor: payer?.nome ?? "Recebedor",
        valor: active.amount,
        txid: active.task.id,
      })
    : "";
  const activeShares = active.task.participantes.filter((p) => p.selecionado).length;
  const hasSavedReceipt = Boolean(active.payment.receipt || active.payment.receiptKey);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      onMessage("Copiado.");
    } catch {
      onMessage("Não foi possível copiar. Selecione e copie o texto exibido.");
    }
  }

  function handleFileSelect(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "application/pdf"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      onMessage("Selecione JPG, PNG ou PDF de até 5 MB.");
      return;
    }
    if (idGrupo && idParte) {
      onReceiptChange({ file, name: file.name });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onReceiptChange({ file, data: String(reader.result), name: file.name });
    reader.onerror = () => onMessage("Não foi possível ler o comprovante.");
    reader.readAsDataURL(file);
  }

  async function viewSavedReceipt() {
    if (active.payment.receipt) {
      onOpenReceipt({
        url: active.payment.receipt,
        name: active.payment.receiptName || "Comprovante",
        isImage: active.payment.receipt.startsWith("data:image/"),
      });
      return;
    }
    if (!idParte || !active.payment.receiptKey) return;
    setLoadingReceipt(true);
    try {
      const res = await apiRequest<{ url: string; nome: string | null }>(
        ENDPOINTS.partes.comprovante(idParte),
      );
      const nome = res.nome || active.payment.receiptName || "comprovante";
      const isImage = /\.(png|jpe?g|webp)$/i.test(nome) || /\.(png|jpe?g|webp)(\?|$)/i.test(res.url);
      onOpenReceipt({ url: res.url, name: nome, isImage });
    } catch (err) {
      onMessage(
        err instanceof ApiError ? err.message : "Não foi possível carregar o comprovante.",
      );
    } finally {
      setLoadingReceipt(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm">
        <div className="flex flex-col justify-between gap-space-sm sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-col">
            <span className="font-label-sm text-label-sm font-semibold text-primary">{groupName}</span>
            <h3 className="font-label-lg text-label-lg font-bold text-on-surface">{active.task.titulo}</h3>
          </div>
          <div className="self-start sm:self-auto">
            <PaymentBadge status={active.payment.status} label={paymentLabels[active.payment.status]} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-space-md rounded-lg bg-surface-container-lowest p-space-md sm:grid-cols-2">
          <div className="flex items-center gap-space-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container">
              <Icon name="shopping_cart" size={20} className="text-on-surface-variant" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Valor total da despesa</span>
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                {money(active.task.valorTotal)}{" "}
                <span className="font-label-sm text-label-sm font-normal text-on-surface-variant">
                  (dividido entre {activeShares} {activeShares === 1 ? "pessoa" : "pessoas"})
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm sm:justify-end">
            <div className="flex flex-col text-left sm:text-right">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Sua cota a transferir</span>
              <span className="font-numeric-stat text-numeric-stat font-extrabold tracking-tight text-primary">
                {money(active.amount)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-space-sm pt-space-xs">
          <div className="flex min-w-0 items-center gap-space-sm">
            <div className="relative shrink-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-label-md text-label-md font-bold text-on-primary-fixed shadow-sm">
                {payer?.nome.slice(0, 1)}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-sm">
                <Icon name="verified" size={10} filled />
              </span>
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-1">
                <span className="truncate font-label-md text-label-md font-bold text-on-surface">
                  {payer?.nome ?? "Responsável"}
                </span>
                <span className="rounded bg-surface-container px-1.5 text-[11px] font-semibold text-on-surface-variant">
                  Responsável pela compra
                </span>
              </div>
              <span className="truncate font-label-sm text-label-sm text-on-surface-variant">
                {recipientPix?.chave ? "Chave Pix cadastrada pelo responsável" : "Sem chave Pix cadastrada"}
              </span>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-1 font-label-sm text-label-sm text-on-surface-variant sm:flex">
            <Icon name="bolt" size={16} className="text-tertiary" />
            <span>Recebimento direto</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-space-lg md:grid-cols-12">
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-space-md shadow-sm md:col-span-5">
          <div className="relative flex flex-col items-center rounded-lg bg-white p-space-xs shadow-sm">
            <PixPreview size={148} payload={brCode} label={`QR Code Pix para ${payer?.nome ?? "recebedor"}`} />
          </div>
          <span className="mt-space-sm flex items-center gap-1 text-center font-label-sm text-label-sm font-medium text-on-surface-variant">
            <Icon name="qr_code_2" size={16} className="text-primary" />
            {brCode ? "QR Code Pix (BR Code)" : "Sem chave Pix"}
          </span>
        </div>
        <div className="flex flex-col gap-space-md md:col-span-7">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pix-key" className="flex items-center justify-between font-label-sm text-label-sm font-semibold text-on-surface">
              <span>Chave Pix</span>
              <span className="text-[11px] font-bold uppercase text-tertiary">
                {recipientPix?.chave ? "Cadastrada" : "Indisponível"}
              </span>
            </label>
            <div className="flex items-center gap-space-xs rounded-lg bg-surface-container p-1">
              <div className="flex min-w-0 grow items-center gap-space-xs px-space-sm py-1.5">
                <Icon name="smartphone" size={20} className="shrink-0 text-on-surface-variant" />
                <input
                  id="pix-key"
                  readOnly
                  value={pixDisplay || "Nenhuma chave cadastrada"}
                  className="w-full bg-transparent font-label-md text-label-md font-semibold text-on-surface focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled={!pixCopyValue}
                onClick={() => void copy(pixCopyValue)}
                className="flex shrink-0 items-center gap-1 rounded-md bg-surface-container-lowest px-space-md py-1.5 font-label-sm text-label-sm font-semibold text-on-surface shadow-sm transition-all hover:bg-surface-container-high active:scale-95 disabled:opacity-50"
              >
                <Icon name="content_copy" size={16} />
                Copiar Chave
              </button>
            </div>
          </div>
          {brCode && (
            <button
              type="button"
              onClick={() => void copy(brCode)}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary-fixed px-space-md py-2 font-label-md text-label-md text-on-primary-fixed transition-colors hover:bg-primary-fixed-dim"
            >
              <Icon name="qr_code" size={18} />
              <span>Copiar Pix Copia e Cola ({money(active.amount)})</span>
            </button>
          )}
        </div>
      </div>

      {active.payment.reason && (
        <p className="flex items-start gap-2 rounded-xl bg-error-container/50 p-space-md font-body-sm text-body-sm text-on-error-container" role="alert">
          <Icon name="report" size={20} className="shrink-0 text-error" />
          Motivo da contestação: {active.payment.reason}
        </p>
      )}
      {hasSavedReceipt && (
        <button
          type="button"
          disabled={loadingReceipt}
          className="inline-flex items-center justify-center gap-space-xs self-start rounded-lg bg-surface-container-high px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-highest disabled:opacity-50"
          onClick={() => void viewSavedReceipt()}
        >
          <Icon name="description" size={18} />
          {loadingReceipt ? "Abrindo comprovante..." : "Visualizar comprovante"}
        </button>
      )}

      {canInform && (
        <div className="flex flex-col gap-space-xs">
          <span className="flex items-center gap-space-xs font-label-md text-label-md font-bold text-on-surface">
            <Icon name="receipt_long" size={20} className="text-primary" />
            Já realizou o pagamento? Anexe seu comprovante
          </span>
          {receipt ? (
            <div className="flex w-full items-center justify-between gap-space-md rounded-xl bg-surface-container-low p-space-sm">
              <div className="flex min-w-0 items-center gap-space-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary-fixed text-tertiary">
                  <Icon name="description" size={22} />
                </div>
                <div className="flex min-w-0 flex-col text-left">
                  <span className="truncate font-label-md text-label-md font-bold text-on-surface">{receipt.name}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Pronto para envio</span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Remover comprovante"
                onClick={() => onReceiptChange(null)}
                className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error"
              >
                <Icon name="delete" size={20} />
              </button>
            </div>
          ) : (
            <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl bg-surface-container-low p-space-md text-center transition-all hover:bg-surface-container focus-within:ring-2 focus-within:ring-primary-container">
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => handleFileSelect(event.target.files?.[0])}
              />
              <span className="flex flex-col items-center gap-space-xs py-space-xs">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-primary transition-transform group-hover:scale-105">
                  <Icon name="cloud_upload" size={24} />
                </span>
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Arraste ou clique para selecionar o comprovante
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Formatos aceitos: JPG, PNG ou PDF (até 5 MB)
                </span>
              </span>
            </label>
          )}
        </div>
      )}

      {!memberMode && !closed && active.payment.status === "informado" && (
        <div className="flex flex-col gap-space-sm rounded-xl bg-tertiary-fixed/30 p-space-md">
          <div className="flex items-start gap-space-sm">
            <Icon name="info" size={22} className="shrink-0 text-tertiary" />
            <div className="flex flex-col font-body-sm text-body-sm text-on-surface">
              <span className="font-bold">Aguardando sua validação manual</span>
              <span>Confira o comprovante e o recebimento antes de confirmar.</span>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-lg py-2.5 font-label-md text-label-md font-bold text-on-primary shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] transition-all hover:opacity-95 active:scale-[0.98]"
            onClick={() => void onUpdatePayment(active.key, "confirmado")}
          >
            <Icon name="check_circle" size={20} />
            Confirmar Recebimento
          </button>
          <div className="flex flex-col gap-1">
            <label htmlFor="contest-reason" className="font-label-sm text-label-sm font-semibold text-on-surface">
              Motivo da contestação
            </label>
            <textarea
              id="contest-reason"
              rows={2}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              maxLength={300}
              placeholder="Ex.: o comprovante não exibe o valor completo..."
              className="w-full resize-none rounded-lg bg-surface-container-lowest p-space-sm font-body-sm text-body-sm text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-error-container px-space-md py-space-sm font-label-md text-label-md text-on-error-container transition-colors hover:opacity-90"
            onClick={() => void onUpdatePayment(active.key, "contestado")}
          >
            <Icon name="block" size={18} />
            Contestar pagamento
          </button>
        </div>
      )}

      <div className="flex items-start gap-space-sm rounded-xl bg-surface-container p-space-md">
        <Icon name="verified_user" size={20} className="mt-0.5 shrink-0 text-primary" />
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm font-bold text-on-surface">
            Auditoria e confirmação colaborativa
          </span>
          <p className="font-body-sm text-body-sm leading-snug text-on-surface-variant">
            Informar o pagamento não quita a cota. O status só será marcado como{" "}
            <strong className="font-semibold text-on-surface">Confirmado</strong> após{" "}
            {payer?.nome ?? "o responsável"} verificar o crédito e validar o comprovante.
          </p>
        </div>
      </div>

      <details className="group rounded-xl bg-surface-container-low p-space-md">
        <summary className="flex cursor-pointer list-none items-center justify-between font-label-md text-label-md text-on-surface">
          <span className="flex items-center gap-space-xs">
            <Icon name="history" size={18} className="text-primary" />
            Histórico de pagamentos desta tarefa
          </span>
          <Icon name="expand_more" size={20} className="text-on-surface-variant transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-space-sm flex flex-col gap-space-xs">
          {events.some((event) => event.text.includes(active.task.titulo)) ? (
            events
              .filter((event) => event.text.includes(active.task.titulo))
              .map((event, index) => (
                <p key={index} className="flex flex-col font-body-sm text-body-sm text-on-surface">
                  {event.text}
                  <small className="font-label-sm text-label-sm text-on-surface-variant">
                    {new Date(event.date).toLocaleString("pt-BR")}
                  </small>
                </p>
              ))
          ) : (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Nenhum pagamento anterior registrado nesta tarefa.
            </p>
          )}
        </div>
      </details>

      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <small className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
          <Icon name="lock" size={15} className="text-tertiary" />
          {brCode ? "Transferência direta via Pix no app do seu banco." : "Solicite ao responsável que cadastre uma chave Pix."}
        </small>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:underline"
          onClick={onBack}
        >
          <Icon name="arrow_back" size={14} />
          Voltar aos pagamentos
        </button>
      </div>
    </>
  );
}
