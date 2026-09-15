interface OrangeButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

export default function OrangeButton({
  children,
  type = "button",
  onClick,
  className = "",
}: OrangeButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
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
        ${className}
      `}
    >
      {children}
    </button>
  );
}