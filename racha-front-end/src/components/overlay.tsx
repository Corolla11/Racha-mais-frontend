import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

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
  return <div className={`racha-overlay ${drawer ? "racha-drawer" : ""} ${className}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className="racha-dialog">
      <header><div>{eyebrow && <span className="racha-eyebrow">{eyebrow}</span>}<h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div><button className="racha-icon" aria-label="Fechar" onClick={onClose}><X size={18}/></button></header>
      <div className="racha-dialog-body">{children}</div>
      {footer && <footer className="racha-dialog-footer">{footer}</footer>}
    </div>
  </div>;
}
