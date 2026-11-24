import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError } from "../lib/api";
import { authClient } from "../lib/auth-client";
import {
  AuthContext,
  type AuthUser,
} from "./auth-context";

function lancarErroAuth(error: { message?: string; status?: number } | null | undefined, padrao: string): never {
  throw new ApiError(error?.message || padrao, error?.status ?? 400);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setSessionError(null);
    const { data, error } = await authClient.getSession();
    if (error) {
      const msg = error.message || "Não foi possível verificar sua sessão.";
      setSessionError(msg);
      throw new ApiError(msg, error.status ?? 401);
    }
    const usuario = (data?.user as AuthUser | undefined) ?? null;
    setUser(usuario);
    return usuario;
  }, []);

  useEffect(() => {
    let ativo = true;

    authClient
      .getSession()
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) {
          setUser(null);
          setSessionError(error.message || "Não foi possível verificar sua sessão.");
          return;
        }
        setUser((data?.user as AuthUser | undefined) ?? null);
        setSessionError(null);
      })
      .catch(() => {
        if (!ativo) return;
        setUser(null);
        setSessionError("Não foi possível verificar sua sessão.");
      })
      .finally(() => {
        if (ativo) setIsLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const { error } = await authClient.signIn.email({ email, password, rememberMe });
      if (error) lancarErroAuth(error, "Falha ao realizar login.");
      const usuario = await refreshSession();
      if (!usuario) {
        throw new ApiError(
          "O login foi aceito, mas não foi possível confirmar a sessão.",
          401,
        );
      }
    },
    [refreshSession],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) lancarErroAuth(error, "Falha ao criar conta.");
      const usuario = await refreshSession();
      if (!usuario) {
        throw new ApiError(
          "A conta foi criada, mas não foi possível iniciar a sessão. Faça login para continuar.",
          401,
        );
      }
    },
    [refreshSession],
  );

  const signOut = useCallback(async () => {
    const { error } = await authClient.signOut();
    if (error) lancarErroAuth(error, "Não foi possível encerrar a sessão.");
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    if (error) lancarErroAuth(error, "Não foi possível alterar a senha.");
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) lancarErroAuth(error, "Não foi possível solicitar a recuperação de senha.");
  }, []);

  const resetPassword = useCallback(async (newPassword: string, token: string) => {
    const { error } = await authClient.resetPassword({ newPassword, token });
    if (error) lancarErroAuth(error, "Não foi possível redefinir a senha.");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      sessionError,
      refreshSession,
      signIn,
      signUp,
      signOut,
      changePassword,
      requestPasswordReset,
      resetPassword,
    }),
    [
      user,
      isLoading,
      sessionError,
      refreshSession,
      signIn,
      signUp,
      signOut,
      changePassword,
      requestPasswordReset,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
