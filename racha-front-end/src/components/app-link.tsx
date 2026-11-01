import { Link, useLocation, type LinkProps } from "react-router-dom";
import { previewPath } from "../lib/navigation";
export default function AppLink({ to, ...props }: LinkProps) {
  const { pathname } = useLocation();
  const preview = pathname.startsWith("/previa") || pathname === "/revisao";
  return <Link to={typeof to === "string" ? previewPath(to, preview) : to} {...props}/>;
}
