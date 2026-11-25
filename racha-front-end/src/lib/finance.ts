export type PaymentStatus = "pendente" | "informado" | "confirmado" | "contestado";
export interface Payment { status: PaymentStatus; receipt?: string; receiptKey?: string; receiptName?: string; reason?: string }
export const paymentLabels: Record<PaymentStatus, string> = { pendente: "Pagamento pendente", informado: "Aguardando confirmação", confirmado: "Pagamento confirmado", contestado: "Pagamento contestado" };
export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function initials(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
// Distribute integer cents so every share adds up to exactly the task total.
export function share(total: number, count: number, index: number) {
  if (count <= 0) return 0;
  const cents = Math.round(total * 100);
  return (Math.floor(cents / count) + (index < cents % count ? 1 : 0)) / 100;
}
export function canCloseGroup(completed: boolean[], payments: { payment: Payment }[]) {
  return completed.every(Boolean) && payments.every(entry => entry.payment.status === "confirmado");
}
