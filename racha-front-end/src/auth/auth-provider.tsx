import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "../lib/api";
import {
  AuthContext,
  type AuthSessionResponse,
  type AuthUser,
} from "./auth-context";

function extrairUsuario(sessao: AuthSessionResponse): AuthUser | null {
  return sessao?.user ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setSessionError(null);
    try {
      const sessao = await apiRequest<AuthSessionResponse>(
        "/api/auth/get-session",
      );
      const usuario = extrairUsuario(sessao);
      setUser(usuario);
      return usuario;
    } catch (error) {
      setSessionError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível verificar sua sessão.",
      );
      throw error;
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    apiRequest<AuthSessionResponse>("/api/auth/get-session")
      .then((sessao) => {
        if (ativo) {
          setUser(extrairUsuario(sessao));
          setSessionError(null);
        }
      })
      .catch((error: unknown) => {
        if (!ativo) return;
        setUser(null);
        setSessionError(
          error instanceof ApiError
            ? error.message
            : "Não foi possível verificar sua sessão.",
        );
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
      await apiRequest("/api/auth/sign-in/email", {
        method: "POST",
        body: { email, password, rememberMe },
      });
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
      await apiRequest("/api/auth/sign-up/email", {
        method: "POST",
        body: { name, email, password },
      });
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
    await apiRequest("/api/auth/sign-out", { method: "POST" });
    setUser(null);
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
    }),
    [user, isLoading, sessionError, refreshSession, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
