export type PaymentStatus = "pendente" | "informado" | "confirmado" | "contestado";
export interface Payment { status: PaymentStatus; receipt?: string; receiptName?: string; reason?: string }
export const paymentLabels: Record<PaymentStatus, string> = { pendente: "Pagamento pendente", informado: "Aguardando confirmação", confirmado: "Pagamento confirmado", contestado: "Pagamento contestado" };
export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
// Distribute integer cents so every share adds up to exactly the task total.
export function share(total: number, count: number, index: number) {
  if (count <= 0) return 0;
  const cents = Math.round(total * 100);
  return (Math.floor(cents / count) + (index < cents % count ? 1 : 0)) / 100;
}
export function canCloseGroup(completed: boolean[], payments: { payment: Payment }[]) {
  return completed.every(Boolean) && payments.every(entry => entry.payment.status === "confirmado");
}
