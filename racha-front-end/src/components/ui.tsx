import type { ComponentProps, ReactNode } from "react";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({ variant = "primary", size = "md", fullWidth = false, className = "", type = "button", ...props }: ButtonProps) {
  return <button {...props} type={type} className={`ui-button ui-button--${variant} ui-button--${size} ${fullWidth ? "ui-button--full" : ""} ${className}`}/>;
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`ui-control ${className}`}/>;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select {...props} className={`ui-control ${className}`}/>;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={`ui-control ${className}`}/>;
}

interface FieldProps extends ComponentProps<"label"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}

export function Field({ label, hint, error, children, className = "", ...props }: FieldProps) {
  return <label {...props} className={`racha-label ui-field ${className}`}><span>{label}</span>{children}{error ? <span className="ui-field__error" role="alert">{error}</span> : hint && <span className="ui-field__hint">{hint}</span>}</label>;
}

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return <section {...props} className={`racha-card ${className}`}/>;
}

export function PageHeading({ title, description, eyebrow, align = "left" }: { title: string; description?: ReactNode; eyebrow?: string; align?: "left" | "center" }) {
  return <div className={align === "center" ? "racha-page-heading" : "racha-section-heading"}>{eyebrow && <span className="racha-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>;
}
