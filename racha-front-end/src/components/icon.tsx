import type { CSSProperties } from "react";

interface IconProps {
  /** Nome do ícone do Material Symbols Outlined (ex.: "pie_chart"). */
  name: string;
  /** Tamanho em px (padrão 24). */
  size?: number;
  /** Usa a variação preenchida (FILL 1). */
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** Ícone do Material Symbols, igual ao usado nas telas do Stitch. */
export default function Icon({ name, size, filled = false, className = "", style, title }: IconProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      title={title}
      className={`material-symbols-outlined ${filled ? "is-filled" : ""} ${className}`}
      style={{ ...(size ? { fontSize: size } : null), ...style }}
    >
      {name}
    </span>
  );
}
