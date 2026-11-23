import type { ReactNode } from "react";

interface OrangeButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/** Botão primário do redesign (Stitch): laranja `primary-container` com texto `on-primary`. */
export default function OrangeButton({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
}: OrangeButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-[0_8px_20px_-4px_rgba(255,140,66,0.35)] hover:bg-primary active:scale-[0.98] transition-all whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-primary-container disabled:active:scale-100 ${className}`}
    >
      {children}
    </button>
  );
}
