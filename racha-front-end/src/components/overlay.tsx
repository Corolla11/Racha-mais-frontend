import { useEffect, useId, useRef, type ReactNode } from "react";
import Icon from "./icon";

interface OverlayProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
  eyebrow?: string;
  description?: string;
  className?: string;
  footer?: ReactNode;
}

export default function Overlay({ title, children, onClose, drawer = false, eyebrow, description, className = "", footer }: OverlayProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") close.current();
      if (event.key !== "Tab") return;
      const elements = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keyboard);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", keyboard); previous?.focus(); };
  }, []);

  const wrapper = drawer
    ? "fixed inset-0 top-16 z-[60] flex justify-end bg-on-surface/50 backdrop-blur-[2px]"
    : "fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-inverse-surface/35 p-space-sm backdrop-blur-sm sm:p-space-md";
  const dialog = drawer
    ? "flex h-full w-full max-w-[540px] flex-col bg-surface-container-lowest shadow-[-12px_0_36px_rgba(18,28,42,0.18)] outline-none"
    : "relative my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_24px_48px_-12px_rgba(18,28,42,0.22)] outline-none";

  return <div className={`${wrapper} font-body-md text-body-md text-on-surface ${className}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className={dialog}>
      {!drawer && <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-primary via-primary-container to-tertiary-container" aria-hidden="true"/>}
      <header className={`flex shrink-0 items-start justify-between gap-space-md p-space-lg ${drawer ? "shadow-[0_1px_0_rgba(217,227,246,0.5)]" : "pb-space-sm"}`}>
        <div className="flex min-w-0 flex-col">
          {eyebrow && <div className="mb-1 flex items-center gap-space-xs"><span className="h-2 w-2 rounded-full bg-primary-container"/><span className="font-label-sm text-label-sm uppercase tracking-wide text-primary">{eyebrow}</span></div>}
          <h2 id={titleId} className={`${drawer ? "font-headline-md text-headline-md" : "font-headline-sm text-headline-sm font-extrabold"} tracking-tight text-on-surface`}>{title}</h2>
          {description && <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{description}</p>}
        </div>
        <button type="button" aria-label="Fechar" onClick={onClose} className="shrink-0 rounded-xl p-2 text-outline transition-all hover:bg-surface-container hover:text-on-surface"><Icon name="close" size={22}/></button>
      </header>
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${drawer ? "p-space-lg" : "p-space-lg pt-space-xs"}`}>{children}</div>
      {footer && <footer className={`flex shrink-0 flex-col-reverse items-stretch justify-end gap-space-sm bg-surface-container-lowest p-space-lg sm:flex-row sm:items-center ${drawer ? "shadow-[0_-4px_16px_rgba(18,28,42,0.06)]" : "pt-space-md"}`}>{footer}</footer>}
    </div>
  </div>;
}
