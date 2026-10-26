interface OrangeButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

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
      className={`
        group
        flex
        h-12
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-primary
        px-6
        text-sm
        font-bold
        text-text-primary
        shadow-sm
        transition
        duration-200
        hover:bg-tertiary
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className}
      `}
    >
      {children}
    </button>
  );
}