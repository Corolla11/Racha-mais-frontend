import { Button } from "./ui";

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
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      fullWidth
      className={className}
    >
      {children}
    </Button>
  );
}
