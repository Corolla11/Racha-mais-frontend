/* =====================================================
   Classes compartilhadas pelo fluxo de recuperação de senha
   (tela "2.1 Recuperação de Senha" do Stitch). As cores vêm
   do tema Tailwind (src/index.css).
====================================================== */

export const CR = {
  /** Título de cada etapa. */
  titulo: "font-display text-headline-md text-on-surface font-bold tracking-tight",
  /** Texto de apoio abaixo do título. */
  descricao: "font-body-md text-on-surface-variant text-sm",
  /** Rótulo dos campos. */
  rotulo: "block font-label-md text-xs font-bold text-on-surface",
  /** Campo de texto (adicione pl/pr conforme os ícones). */
  campo:
    "w-full py-3 bg-surface-container-low rounded-xl font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container-lowest focus:outline-none focus:shadow-md focus:ring-2 transition-all duration-200",
  /** Ícone à esquerda dos campos. */
  iconeCampo: "absolute left-3.5 text-on-surface-variant/60 pointer-events-none",
  /** Botão/link principal laranja. */
  botaoPrimario:
    "w-full py-3.5 px-6 rounded-xl bg-primary-container hover:bg-primary font-label-lg text-label-lg text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-wait disabled:opacity-80",
  /** Aviso de modo prévia. */
  aviso:
    "flex items-start gap-2 rounded-xl bg-primary-fixed/60 px-3 py-2 text-left font-body-sm text-xs text-on-primary-fixed",
} as const;
