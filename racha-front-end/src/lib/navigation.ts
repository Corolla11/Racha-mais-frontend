import { useCallback } from "react";
import { useLocation, useNavigate, type NavigateFunction, type NavigateOptions, type To } from "react-router-dom";
const previewPaths = new Set(["/home", "/grupo", "/meus-grupos", "/meus-grupos-vazio", "/criar-grupo", "/criar-grupo/manual", "/grupo-criado", "/notificacoes", "/perfil", "/faq", "/assinatura", "/gerenciar-assinatura"]);
export function previewPath(path: string, preview: boolean) {
  const suffixIndex = path.search(/[?#]/);
  const pathname = suffixIndex === -1 ? path : path.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : path.slice(suffixIndex);
  if (!preview || !previewPaths.has(pathname)) return path;
  if (pathname === "/home") return `/revisao${suffix}`;
  if (pathname === "/meus-grupos") return `/previa/grupos${suffix}`;
  if (pathname === "/meus-grupos-vazio") return `/previa/grupos-vazio${suffix}`;
  return `/previa${pathname}${suffix}`;
}
export function useAppNavigate(): NavigateFunction {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const preview = pathname.startsWith("/previa") || pathname === "/revisao";
  const appNavigate = useCallback((to: To | number, options?: NavigateOptions) => {
    if (typeof to === "number") return navigate(to);
    return navigate(typeof to === "string" ? previewPath(to, preview) : to, options);
  }, [navigate, preview]);
  return appNavigate as NavigateFunction;
}
