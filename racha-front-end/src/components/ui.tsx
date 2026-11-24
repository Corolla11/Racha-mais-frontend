import type { ComponentProps, ReactNode } from "react";

/* Primitivas de UI no padrão visual do Stitch (tokens do tema em src/index.css). */

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary-container hover:bg-primary-container/90 text-on-primary shadow-[0_4px_14px_rgba(255,140,66,0.35)]",
  secondary: "bg-surface-container-low hover:bg-surface-container-high text-on-surface",
  danger: "bg-secondary hover:bg-secondary/90 text-on-secondary shadow-sm",
  ghost: "bg-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface",
};

const buttonSizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-space-md font-label-sm text-label-sm",
  md: "h-11 px-space-lg font-label-md text-label-md",
  lg: "h-12 px-space-xl font-label-lg text-label-lg",
};

export function Button({ variant = "primary", size = "md", fullWidth = false, className = "", type = "button", ...props }: ButtonProps) {
  return <button {...props} type={type} className={`inline-flex items-center justify-center gap-space-xs rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${buttonVariants[variant]} ${buttonSizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}/>;
}

const controlClass = "w-full px-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`${controlClass} h-11 ${className}`}/>;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select {...props} className={`${controlClass} h-11 cursor-pointer ${className}`}/>;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${controlClass} py-3 min-h-[6.5rem] resize-y ${className}`}/>;
}

interface FieldProps extends ComponentProps<"label"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}

export function Field({ label, hint, error, children, className = "", ...props }: FieldProps) {
  return (
    <label {...props} className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-label-md text-label-md text-on-surface">{label}</span>
      {children}
      {error
        ? <span className="font-label-sm text-label-sm text-error" role="alert">{error}</span>
        : hint && <span className="font-label-sm text-label-sm text-on-surface-variant">{hint}</span>}
    </label>
  );
}

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return <section {...props} className={`bg-surface-container-lowest rounded-xl p-space-lg shadow-sm ${className}`}/>;
}

interface PageHeadingProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  align?: "left" | "center";
  /** Selo opcional exibido acima do título (substitui o visual do `eyebrow`). */
  badge?: ReactNode;
}

export function PageHeading({ title, description, eyebrow, align = "left", badge }: PageHeadingProps) {
  const center = align === "center";
  return (
    <div className={center ? "text-center max-w-3xl mx-auto" : ""}>
      {badge}
      {!badge && eyebrow && (
        <div className={`flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold mb-1 ${center ? "justify-center" : ""}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container"/>
          {eyebrow}
        </div>
      )}
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">{title}</h1>
      {description && <p className={`font-body-md text-body-md text-on-surface-variant mt-1 ${center ? "" : "max-w-2xl"}`}>{description}</p>}
    </div>
  );
}
